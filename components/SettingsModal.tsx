
import React, { useState } from 'react';
import { emailService } from '../services/emailService';
import { db } from '../services/db';
import { RetentionPeriod } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  setSettings: (settings: any) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    appearance: true,
    aiLogic: true,
    network: true,
    notifications: true,
    privacy: false
  });
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleTestAlert = async () => {
    if (!settings.alertEmail) return;
    setIsTestingAlert(true);
    setTestResult('');
    
    try {
      const threats = db.threats.get();
      const result = await emailService.sendSecurityAlert(settings.alertEmail, threats);
      if (result.success) {
        setTestResult('Success: Security digest routed to SMTP relay.');
        setTimeout(() => setTestResult(''), 3000);
      }
    } catch (e) {
      setTestResult('Error: Failed to establish SMTP link.');
    } finally {
      setIsTestingAlert(false);
    }
  };

  const handlePurgeLogs = () => {
    if (window.confirm("CRITICAL: This will permanently delete all local threat logs and forensic data. This action cannot be undone. Proceed?")) {
      setIsPurging(true);
      db.threats.purge();
      setTimeout(() => {
        setIsPurging(false);
        alert("Local intelligence vault purged successfully.");
      }, 1000);
    }
  };

  const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-2">
      <i className="fas fa-circle-info text-slate-500 hover:text-cyan-400 cursor-help text-[10px]"></i>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in duration-200">
        <p className="text-[9px] leading-tight text-slate-300 font-normal normal-case tracking-normal">
          {text}
        </p>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative glass w-full max-w-2xl dark:bg-[#0f172a] bg-white rounded-[2.5rem] border dark:border-white/10 border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b dark:border-white/5 border-slate-100 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 text-xl shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <i className="fas fa-sliders-h"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Control Center</h2>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Hardware & AI Calibration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all active:scale-90"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-4 overflow-y-auto max-h-[65vh] custom-scrollbar">
          
          {/* Privacy & Trust Section */}
          <div className="border border-cyan-500/20 rounded-[2rem] overflow-hidden transition-all bg-cyan-500/5">
            <button 
              onClick={() => toggleSection('privacy')}
              className="w-full flex items-center justify-between p-6 hover:bg-cyan-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <i className={`fas fa-user-shield text-sm ${openSections.privacy ? 'text-cyan-400' : 'text-slate-500'}`}></i>
                <span className="text-xs font-black uppercase tracking-widest dark:text-slate-200 text-slate-700">Trust & Compliance</span>
              </div>
              <i className={`fas fa-chevron-down text-[10px] text-slate-500 transition-transform duration-300 ${openSections.privacy ? 'rotate-180' : ''}`}></i>
            </button>
            
            {openSections.privacy && (
              <div className="p-6 bg-transparent space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <i className="fas fa-microchip"></i>
                       Edge Inference Only
                    </p>
                    <p className="text-[9px] text-slate-500">All security patterns are analyzed locally on your gateway hardware. No private data ever leaves your mesh.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <i className="fas fa-mask"></i>
                       Metadata Focus
                    </p>
                    <p className="text-[9px] text-slate-500">Our engine only inspects L3/L4 headers. We never decrypt or analyze your private communication payloads.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-xs">Anonymized Cloud Updates</p>
                    <p className="text-[10px] text-slate-500">Share scrubbed threat signatures to improve global immunity.</p>
                  </div>
                  <button 
                    onClick={() => updateSetting('anonymizedCloudUpdates', !settings.anonymizedCloudUpdates)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${settings.anonymizedCloudUpdates ? 'bg-cyan-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.anonymizedCloudUpdates ? 'right-0.5' : 'left-0.5'}`}></div>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black dark:text-white text-slate-800 uppercase tracking-widest">Local Data Retention</p>
                    <span className="text-[10px] font-mono text-cyan-500 font-bold">{settings.retentionPeriod}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {['24h', '7d', '30d', '90d', 'Forever'].map((p) => (
                      <button
                        key={p}
                        onClick={() => updateSetting('retentionPeriod', p as RetentionPeriod)}
                        className={`py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${
                          settings.retentionPeriod === p
                            ? 'bg-cyan-500 text-slate-900 border-cyan-500'
                            : 'dark:bg-slate-800 bg-white dark:text-slate-400 text-slate-500 border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handlePurgeLogs}
                    className="w-full py-3 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-500 font-black text-[9px] uppercase tracking-widest hover:bg-rose-500/10 transition-all"
                  >
                    {isPurging ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-trash-alt mr-2"></i>}
                    Purge All Local Intelligence Logs
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Logic Section */}
          <div className="border dark:border-white/5 border-slate-100 rounded-[2rem] overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection('aiLogic')}
              className="w-full flex items-center justify-between p-6 dark:bg-slate-900/40 bg-slate-50/80 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <i className={`fas fa-brain text-sm ${openSections.aiLogic ? 'text-cyan-400' : 'text-slate-500'}`}></i>
                <span className="text-xs font-black uppercase tracking-widest dark:text-slate-200 text-slate-700">AI Detection Logic</span>
              </div>
              <i className={`fas fa-chevron-down text-[10px] text-slate-500 transition-transform duration-300 ${openSections.aiLogic ? 'rotate-180' : ''}`}></i>
            </button>
            
            {openSections.aiLogic && (
              <div className="p-6 bg-transparent space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white flex items-center text-xs">
                        Autonomous Mitigation
                        <Tooltip text="When active, the AI agent will automatically block detected threats and isolate compromised devices without requiring human confirmation." />
                      </p>
                      <p className="text-[10px] text-slate-500">Enable edge-level reactive defense</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => updateSetting('autonomousDefense', !settings.autonomousDefense)}
                    className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${settings.autonomousDefense ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${settings.autonomousDefense ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-black dark:text-white text-slate-800 uppercase tracking-widest">
                      Anomaly Sensitivity
                      <Tooltip text="Adjusts the threshold for behavioral deviations. 'High' will flag subtle patterns but may increase false positives. 'Low' ignores minor drifts." />
                    </p>
                    <span className="text-[10px] font-mono text-cyan-500 font-bold uppercase">{settings.sensitivity}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Low', 'Medium', 'High'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => updateSetting('sensitivity', lvl)}
                        className={`py-2.5 rounded-xl text-[9px] font-black uppercase border transition-all ${
                          settings.sensitivity === lvl
                            ? 'bg-cyan-500 text-slate-900 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                            : 'dark:bg-slate-800 bg-white dark:text-slate-400 text-slate-500 border-slate-200 dark:border-white/10 hover:border-cyan-500/30'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Section */}
          <div className="border dark:border-white/5 border-slate-100 rounded-[2rem] overflow-hidden transition-all">
            <button 
              onClick={() => toggleSection('notifications')}
              className="w-full flex items-center justify-between p-6 dark:bg-slate-900/40 bg-slate-50/80 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <i className={`fas fa-bell text-sm ${openSections.notifications ? 'text-cyan-400' : 'text-slate-500'}`}></i>
                <span className="text-xs font-black uppercase tracking-widest dark:text-slate-200 text-slate-700">Alert Dispatch Routing</span>
              </div>
              <i className={`fas fa-chevron-down text-[10px] text-slate-500 transition-transform duration-300 ${openSections.notifications ? 'rotate-180' : ''}`}></i>
            </button>
            
            {openSections.notifications && (
              <div className="p-6 bg-transparent space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Target Alert Email</label>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                      <i className="fas fa-paper-plane text-xs"></i>
                    </div>
                    <input 
                      type="email" 
                      placeholder="alerts@yourdomain.com" 
                      value={settings.alertEmail}
                      onChange={(e) => updateSetting('alertEmail', e.target.value)}
                      className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-cyan-500/40 text-sm font-mono text-cyan-400 placeholder:text-slate-700 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button 
                    disabled={isTestingAlert || !settings.alertEmail}
                    onClick={handleTestAlert}
                    className="px-4 py-2 bg-slate-900 dark:bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-50"
                  >
                    {isTestingAlert ? 'Tunneling...' : 'Dispatch Test Alert'}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Enable Email alerts</span>
                    <button 
                      onClick={() => updateSetting('notifications', !settings.notifications)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${settings.notifications ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'right-0.5' : 'left-0.5'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 border-t dark:border-white/5 border-slate-100 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <i className="fas fa-circle text-[6px] text-emerald-500 animate-pulse"></i>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Configuration Sync Status: OK</span>
          </div>
          <button 
            onClick={onClose}
            className="group relative px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:bg-cyan-400 dark:hover:bg-cyan-400 hover:text-slate-950 active:scale-95 flex items-center gap-2"
          >
            Commit Changes
            <i className="fas fa-arrow-right text-[8px] group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
