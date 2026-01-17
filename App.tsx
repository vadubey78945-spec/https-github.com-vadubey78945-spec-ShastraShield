
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  IoTDevice, ThreatEvent, SecurityStatus, DeviceType, 
  FirewallRule, Recommendation, IntelligenceState, 
  ProtectionMode, MitigationRecord 
} from './types';
import { INITIAL_DEVICES, CRITICALITY_MAP } from './constants';
import Layout from './components/Layout';
import DeviceCard from './components/DeviceCard';
import ThreatAnalytics from './components/ThreatAnalytics';
import PostAttackReport from './components/PostAttackReport';
import DeceptionOps from './components/DeceptionOps';
import MitigationCenter from './components/MitigationCenter';
import FirewallManager from './components/FirewallManager';
import NetworkMap from './components/NetworkMap';
import SafetyCenter from './components/SafetyCenter';
import IntelligenceCenter from './components/IntelligenceCenter';
import LoginPage from './components/LoginPage';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import DeviceModal from './components/DeviceModal';
import DeviceDetailModal from './components/DeviceDetailModal';
import { getThreatExplanation, generatePostAttackReport } from './services/geminiService';
import { discoverShadowDevice, fingerprintDevice } from './services/discoveryService';
import { analyzeBehavior, getInitialBaseline, updateDriftBaseline } from './services/anomalyService';
import { generateRiskProfile, calculateNormalizedVulnerability } from './services/riskService';
import { deceptionService } from './services/deceptionService';
import { correlationService } from './services/correlationService';
import { mitigationService } from './services/mitigationService';
import { firewallService } from './services/firewallService';
import { emailService } from './services/emailService';
import { db } from './services/db';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ identity: string; fullName: string; profileImage?: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [threatHistory, setThreatHistory] = useState<ThreatEvent[]>([]);
  const [mitigationHistory, setMitigationHistory] = useState<MitigationRecord[]>([]);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAttackActive, setIsAttackActive] = useState(false);
  const [isUpdatingModel, setIsUpdatingModel] = useState(false);
  const [attackReportSummary, setAttackReportSummary] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [settings, setSettings] = useState(db.settings.get());

  const [intelligence, setIntelligence] = useState<IntelligenceState>({
    globalModelVersion: '2.4.1-Lts',
    localPatternsLearned: 342,
    federatedSharingActive: settings.anonymizedCloudUpdates,
    lastUpdateTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    immunityScore: 88,
    evolutionStage: 'Adaptive'
  });

  useEffect(() => {
    const sessionUser = db.session.get();
    if (sessionUser) {
      setUser(sessionUser);
      setIsAuthenticated(true);
    }

    const savedDevices = db.devices.get();
    let initialDevices: IoTDevice[] = [];
    if (savedDevices.length === 0) {
      const router = INITIAL_DEVICES.find(d => d.type === DeviceType.ROUTER);
      initialDevices = INITIAL_DEVICES.map(d => {
        const riskProfile = generateRiskProfile(d);
        const withBaseline = { 
          ...d, 
          parentId: d.type !== DeviceType.ROUTER ? router?.id : undefined,
          behaviorBaseline: getInitialBaseline(d.type),
          vulnerabilityProfile: riskProfile,
          vulnerabilityScore: calculateNormalizedVulnerability(riskProfile),
          isSafeMode: false
        };
        return withBaseline;
      });
      db.devices.set(initialDevices);
      setDevices(initialDevices);
    } else {
      initialDevices = savedDevices;
      setDevices(savedDevices);
    }

    const contextRules = initialDevices.flatMap(d => firewallService.generateContextRules(d));
    setFirewallRules(contextRules);
    
    const rawThreats = db.threats.get();
    const currentSettings = db.settings.get();
    const filteredThreats = applyRetention(rawThreats, currentSettings.retentionPeriod);
    setThreatHistory(filteredThreats);
    db.threats.set(filteredThreats);

    setMitigationHistory(db.mitigationHistory.get());
    
    generateRecommendations(initialDevices);
  }, []);

  useEffect(() => {
    setIntelligence(prev => ({ ...prev, federatedSharingActive: settings.anonymizedCloudUpdates }));
    db.settings.set(settings);
  }, [settings]);

  const applyRetention = (threats: ThreatEvent[], period: string) => {
    if (period === 'Forever') return threats;
    const now = Date.now();
    let limitMs = 0;
    switch (period) {
      case '24h': limitMs = 24 * 60 * 60 * 1000; break;
      case '7d': limitMs = 7 * 24 * 60 * 60 * 1000; break;
      case '30d': limitMs = 30 * 24 * 60 * 60 * 1000; break;
      case '90d': limitMs = 90 * 24 * 60 * 60 * 1000; break;
      default: return threats;
    }
    return threats.filter(t => (now - new Date(t.timestamp).getTime()) < limitMs);
  };

  const generateRecommendations = (allDevices: IoTDevice[]) => {
    const recs: Recommendation[] = [];
    allDevices.forEach(d => {
      if (d.vulnerabilityProfile && d.vulnerabilityProfile.firmwareAgeDays > 365) {
        recs.push({
          id: `rec-${d.id}-firmware`,
          deviceId: d.id,
          title: `Update ${d.name} Firmware`,
          description: `Firmware is ${d.vulnerabilityProfile.firmwareAgeDays} days old and contains known security exploits.`,
          actionLabel: 'Perform Secure Update',
          severity: 'Medium',
          type: 'UPDATE'
        });
      }
      if (d.vulnerabilityScore > 0.8) {
        recs.push({
          id: `rec-${d.id}-replace`,
          deviceId: d.id,
          title: `Consider Replacing ${d.name}`,
          description: `This device has severe unpatchable hardware flaws. We recommend a safer model.`,
          actionLabel: 'View Replacement Options',
          severity: 'High',
          type: 'REPLACE'
        });
      }
    });
    setRecommendations(recs);
  };

  const handleUpdateModel = async () => {
    setIsUpdatingModel(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIntelligence(prev => ({
      ...prev,
      globalModelVersion: '2.4.5-Hotfix',
      lastUpdateTimestamp: new Date().toISOString(),
      immunityScore: Math.min(100, prev.immunityScore + 2)
    }));
    setIsUpdatingModel(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFirewallRules(prev => prev.filter(rule => {
        if (!rule.expiresAt) return true;
        return new Date(rule.expiresAt) > new Date();
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (devices.length > 0) db.devices.set(devices);
  }, [devices]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const activeDecoys = useMemo(() => devices.filter(d => d.isDecoy), [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter(d => 
      !d.isDecoy && 
      (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       d.ip.includes(searchQuery) ||
       d.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [devices, searchQuery]);

  const handleLogin = (userData: { identity: string; fullName: string }) => {
    const sessionUser = { ...userData };
    setUser(sessionUser);
    setIsAuthenticated(true);
    db.session.set(sessionUser);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    db.session.clear();
  };

  const handleRollbackAction = (record: MitigationRecord) => {
    setDevices(prev => prev.map(d => d.id === record.deviceId ? { ...d, status: record.previousStatus } : d));
    setMitigationHistory(prev => prev.map(r => r.id === record.id ? { ...r, wasRolledBack: true } : r));
    db.mitigationHistory.update(record.id, { wasRolledBack: true });
    
    // Add success toast/log or just UI update
  };

  const applyAutomatedMitigation = (device: IoTDevice, threat: ThreatEvent) => {
    // Fail-safe check: Don't mitigate if in Learning Mode
    if (settings.protectionMode === ProtectionMode.LEARNING) {
      console.log(`[LEARNING] Skipping automated mitigation for ${device.name} due to Learning mode.`);
      return;
    }

    const previousStatus = device.status;
    const autonomousStatus = mitigationService.determineAction(threat, device);

    if (autonomousStatus !== previousStatus) {
      const record: MitigationRecord = {
        id: `mit-${Date.now()}`,
        deviceId: device.id,
        deviceName: device.name,
        timestamp: new Date().toISOString(),
        action: autonomousStatus,
        previousStatus: previousStatus,
        reason: threat.type,
        wasRolledBack: false
      };

      setDevices(prev => prev.map(d => d.id === device.id ? { ...d, status: autonomousStatus } : d));
      setMitigationHistory(prev => [record, ...prev]);
      db.mitigationHistory.add(record);
      
      const strictRule = firewallService.tightenPolicy(device, threat.severity === 'Critical' ? 0.95 : 0.6);
      setFirewallRules(prev => [...prev, strictRule]);
    }
  };

  const triggerManualAttack = async () => {
    if (isAttackActive || devices.length === 0) return;
    setIsAttackActive(true);
    
    const sourceIp = `103.14.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const targets = devices.filter(d => !d.isDecoy).sort(() => Math.random() - 0.5).slice(0, 2);
    const target = targets[0];
    
    setDevices(prev => prev.map(d => d.id === target.id ? { ...d, status: SecurityStatus.MONITORING, anomalyScore: 0.3 } : d));
    setFirewallRules(prev => [...prev, firewallService.tightenPolicy(target, 0.4)]);

    setTimeout(() => {
      const decoy = deceptionService.generateDecoy(DeviceType.NAS);
      setDevices(prev => [decoy, ...prev.map(d => d.id === target.id ? { ...d, status: SecurityStatus.DECEPTION_ACTIVE, anomalyScore: 0.6 } : d)]);
      
      const scanThreat: ThreatEvent = {
        id: 'threat-' + Date.now(),
        timestamp: new Date().toISOString(),
        sourceIp,
        targetDeviceId: target.id,
        type: 'Port Scan',
        severity: 'Medium',
        status: 'Detected',
        confidence: 0.85,
        isCorrelated: false,
        mitigationAction: 'Deception Matrix Engaged + Dynamic Throttling.',
        aiReasoning: 'Observed recon probe. Enforced context-aware rate limiting while diverting scan to shadow proxy.'
      };
      setThreatHistory(prev => [scanThreat, ...prev]);

      // Learn from deception
      const intel = deceptionService.extractIntelligence(scanThreat);
      setIntelligence(prev => ({ 
        ...prev, 
        localPatternsLearned: prev.localPatternsLearned + 1,
        immunityScore: Math.min(100, prev.immunityScore + 0.5)
      }));

    }, 1500);

    setTimeout(() => {
      const exploitThreat: ThreatEvent = {
        id: 'threat-ex-' + Date.now(),
        timestamp: new Date().toISOString(),
        sourceIp,
        targetDeviceId: target.id,
        type: 'Lateral Movement',
        severity: 'Critical',
        status: 'Neutralized',
        confidence: 0.98,
        isCorrelated: true,
        mitigationAction: 'Autonomous Graduated Response + Strict Policy Block.',
        aiReasoning: 'Adversary bypassed deception layer. Enforced temporary Strict-Deny policy to sever lateral path.'
      };

      // Apply fail-safe automated mitigation
      applyAutomatedMitigation(target, exploitThreat);
      
      setThreatHistory(prev => [exploitThreat, ...prev]);
      db.threats.add(exploitThreat);
      
      setRecommendations(prev => [{
        id: `rec-${target.id}-post-attack`,
        deviceId: target.id,
        title: `Audit ${target.name} Permissions`,
        description: `This device was recently targeted in an attack. We recommend a full security audit of its local storage.`,
        actionLabel: 'Initiate Forensic Audit',
        severity: 'High',
        type: 'AUDIT'
      }, ...prev]);
    }, 4000);

    setTimeout(() => {
      setIsAttackActive(false);
      generatePostAttackReport(threatHistory.slice(0, 2)).then(setAttackReportSummary);
    }, 7000);
  };

  const handleRecAction = (rec: Recommendation) => {
    if (rec.type === 'ISOLATE' || rec.type === 'AUDIT') {
      const device = devices.find(d => d.id === rec.deviceId);
      if (device) setSelectedDevice(device);
    } else {
      alert(`Initiating ${rec.type}: ${rec.title}... This may take several minutes.`);
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
    }
  };

  const handleToggleSafeMode = (id: string, isSafe: boolean) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, isSafeMode: isSafe } : d));
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  return (
    <Layout 
      activeTab={activeTab} setActiveTab={setActiveTab} isAttackActive={isAttackActive}
      onSettingsClick={() => setIsSettingsOpen(true)}
      onProfileClick={() => setIsProfileOpen(true)}
      onLogout={handleLogout}
      onAddDeviceClick={() => setIsDeviceModalOpen(true)}
      user={user} deviceCount={devices.filter(d => !d.isDecoy).length}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2 dark:text-white text-slate-900 uppercase">Safety Hub</h2>
              <div className="flex items-center gap-4">
                <p className="text-slate-500 font-medium italic">Understandable security for your connected home.</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                   <i className="fas fa-microchip text-[10px] text-emerald-500"></i>
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Edge-Only Inference</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={triggerManualAttack} disabled={isAttackActive}
                className="glass-btn px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10 dark:text-white text-slate-800 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <i className="fas fa-biohazard text-cyan-500"></i> {isAttackActive ? 'Defending...' : 'Test Home Protection'}
              </button>
            </div>
          </header>
          
          <SafetyCenter 
            devices={devices} 
            threats={threatHistory} 
            recommendations={recommendations} 
            onAction={handleRecAction}
            protectionMode={settings.protectionMode as ProtectionMode}
            onToggleProtectionMode={(mode) => setSettings({ ...settings, protectionMode: mode })}
          />

          <NetworkMap devices={devices} onDeviceClick={setSelectedDevice} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-12 border-t border-white/5">
            <div className="col-span-full mb-4">
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                <i className="fas fa-microchip text-xs"></i> Device List
              </h3>
            </div>
            {devices.filter(d => !d.isDecoy).slice(0, 4).map(d => (
              <DeviceCard key={d.id} device={d} onClick={setSelectedDevice} parentName={devices.find(p => p.id === d.parentId)?.name} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'intelligence' && (
        <IntelligenceCenter state={intelligence} onUpdateModel={handleUpdateModel} isUpdating={isUpdatingModel} />
      )}

      {activeTab === 'deception' && <DeceptionOps decoys={activeDecoys} />}
      {activeTab === 'mitigation' && (
        <MitigationCenter 
          devices={devices} 
          mitigationHistory={mitigationHistory}
          onRelease={(id) => setDevices(prev => prev.map(d => d.id === id ? { ...d, status: SecurityStatus.SECURE, anomalyScore: 0.05 } : d))} 
          onRollback={handleRollbackAction}
        />
      )}
      {activeTab === 'firewall' && <FirewallManager devices={devices} rules={firewallRules} onRemoveRule={(id) => setFirewallRules(prev => prev.filter(r => r.id !== id))} />}
      {activeTab === 'devices' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black dark:text-white text-slate-900 uppercase">IoT Inventory</h2>
              <div className="glass-input p-2 rounded-2xl flex items-center gap-3 px-6 h-12">
                <i className="fas fa-search text-slate-500"></i>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Query nodes..." className="bg-transparent border-none outline-none text-xs font-bold w-48 text-slate-700 dark:text-slate-200 uppercase tracking-widest" />
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDevices.map(device => (
                <DeviceCard key={device.id} device={device} onClick={setSelectedDevice} parentName={devices.find(p => p.id === device.parentId)?.name} />
              ))}
              <button onClick={() => setIsDeviceModalOpen(true)} className="glass border-dashed border-slate-300 dark:border-white/20 p-8 rounded-3xl flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer group h-[260px]">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-cyan-500 transition-all">
                  <i className="fas fa-plus text-2xl"></i>
                </div>
                <span className="font-black uppercase text-[10px] tracking-[0.2em]">Provision Node</span>
              </button>
           </div>
        </div>
      )}
      {activeTab === 'analytics' && <ThreatAnalytics anomalyTrend={[]} riskDistribution={[]} threats={threatHistory} devices={devices} />}
      {activeTab === 'reports' && <PostAttackReport threats={threatHistory} devices={devices} summary={attackReportSummary} />}
      
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} setSettings={setSettings} />}
      {isProfileOpen && user && <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onUpdate={(u) => setUser({...user, ...u})} />}
      {isDeviceModalOpen && <DeviceModal isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} onAdd={(d) => setDevices(prev => [...prev, d])} existingDevices={devices} />}
      {selectedDevice && (
        <DeviceDetailModal 
          isOpen={!!selectedDevice} onClose={() => setSelectedDevice(null)} 
          device={selectedDevice} 
          parentName={devices.find(p => p.id === selectedDevice.parentId)?.name}
          onUpdateStatus={(id, status) => setDevices(prev => prev.map(d => d.id === id ? { ...d, status } : d))}
          onToggleSafeMode={handleToggleSafeMode}
        />
      )}
    </Layout>
  );
};

export default App;
