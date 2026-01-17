
import React from 'react';
import { IoTDevice, Recommendation, SecurityStatus, ThreatEvent, ProtectionMode } from '../types';

interface SafetyCenterProps {
  devices: IoTDevice[];
  threats: ThreatEvent[];
  recommendations: Recommendation[];
  onAction: (rec: Recommendation) => void;
  protectionMode: ProtectionMode;
  onToggleProtectionMode: (mode: ProtectionMode) => void;
}

const SafetyCenter: React.FC<SafetyCenterProps> = ({ 
  devices, 
  threats, 
  recommendations, 
  onAction,
  protectionMode,
  onToggleProtectionMode
}) => {
  const atRiskCount = devices.filter(d => d.anomalyScore > 0.3 || d.status !== SecurityStatus.SECURE).length;
  const overallScore = Math.max(0, 100 - (atRiskCount * 15) - (threats.length * 5));

  const getStatusColor = (score: number) => {
    if (score > 80) return 'text-emerald-500';
    if (score > 50) return 'text-orange-500';
    return 'text-rose-500';
  };

  const getStatusBg = (score: number) => {
    if (score > 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score > 50) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Global Defense Switch */}
      <div className="glass p-6 rounded-[2rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${
            protectionMode === ProtectionMode.PROTECTION ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
          }`}>
            <i className={`fas ${protectionMode === ProtectionMode.PROTECTION ? 'fa-shield-halved' : 'fa-graduation-cap'}`}></i>
          </div>
          <div>
            <h4 className="text-lg font-black uppercase dark:text-white text-slate-900 leading-none">
              {protectionMode === ProtectionMode.PROTECTION ? 'Protection Active' : 'Learning Mode'}
            </h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
              {protectionMode === ProtectionMode.PROTECTION 
                ? 'Autonomous mitigation engine is live' 
                : 'Observing patterns without interference'}
            </p>
          </div>
        </div>
        
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
           <button 
             onClick={() => onToggleProtectionMode(ProtectionMode.LEARNING)}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               protectionMode === ProtectionMode.LEARNING ? 'bg-orange-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
             }`}
           >
             Learning
           </button>
           <button 
             onClick={() => onToggleProtectionMode(ProtectionMode.PROTECTION)}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               protectionMode === ProtectionMode.PROTECTION ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
             }`}
           >
             Protection
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Status Card - Diagram removed as per user request */}
        <div className="glass p-10 rounded-[3rem] border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-orange-500/5 to-transparent min-h-[300px]">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fas fa-house-shield text-9xl"></i>
          </div>
          
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mb-8 border transition-all duration-700 ${getStatusBg(overallScore)} ${getStatusColor(overallScore)} shadow-xl`}>
             <i className={`fas ${overallScore > 90 ? 'fa-check-double' : overallScore > 70 ? 'fa-circle-exclamation' : 'fa-triangle-exclamation'}`}></i>
          </div>

          <h3 className={`text-2xl font-black dark:text-white text-slate-900 uppercase tracking-tight leading-tight ${getStatusColor(overallScore)}`}>
            {overallScore > 90 ? 'Network Fully Protected' : overallScore > 70 ? 'Action Recommended' : 'Security Warning'}
          </h3>
          
          <div className="mt-4 px-6 py-1.5 rounded-full bg-slate-900/40 border border-white/5 inline-block">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
               Integrity: <span className={getStatusColor(overallScore)}>{overallScore}%</span>
             </span>
          </div>

          <p className="text-slate-500 text-sm mt-6 max-w-[280px] font-medium leading-relaxed">
            {atRiskCount === 0 
              ? 'All mesh nodes are operating within established behavioral parameters and hardware baselines.' 
              : `ShastraShield has identified ${atRiskCount} anomalies requiring manual audit and potential node isolation.`}
          </p>
        </div>

        {/* Simple Alerts Feed */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass p-8 rounded-[3rem] border-white/5 h-full flex flex-col">
              <h3 className="text-xl font-black uppercase dark:text-white text-slate-900 mb-8 flex items-center gap-3">
                <i className="fas fa-bell text-rose-500"></i>
                Simple Alerts
              </h3>

              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                 {threats.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-40 py-12">
                      <i className="fas fa-shield-check text-4xl mb-4"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">No recent alerts</p>
                   </div>
                 ) : (
                   threats.slice(0, 3).map(threat => {
                     const device = devices.find(d => d.id === threat.targetDeviceId);
                     return (
                       <div key={threat.id} className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 flex items-start gap-5 hover:border-rose-500/20 transition-all group">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                            threat.severity === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            <i className="fas fa-circle-exclamation"></i>
                          </div>
                          <div>
                             <h4 className="font-bold text-white uppercase text-sm">
                                {threat.type === 'Brute Force' ? `Someone tried to break into your ${device?.name}` :
                                 threat.type === 'Port Scan' ? `Network scan blocked near ${device?.name}` :
                                 `Unusual activity detected on ${device?.name}`}
                             </h4>
                             <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                ShastraShield successfully {threat.status.toLowerCase()} this attempt from an unknown server ({threat.sourceIp}).
                             </p>
                             <div className="flex items-center gap-4 mt-3">
                                <span className="text-[9px] font-mono text-slate-600 uppercase">{new Date(threat.timestamp).toLocaleTimeString()}</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Handled Automatically</span>
                             </div>
                          </div>
                       </div>
                     );
                   })
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="glass p-10 rounded-[3rem] border-white/5">
         <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black uppercase dark:text-white text-slate-900 flex items-center gap-3">
                <i className="fas fa-clipboard-list text-orange-400"></i>
                Security To-Do List
              </h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Recommended actions to harden your home</p>
            </div>
            <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-black text-slate-400 uppercase tracking-widest">
               {recommendations.length} Tasks
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-8 rounded-[2rem] dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-200 flex flex-col h-full hover:border-orange-500/30 transition-all relative group">
                {rec.severity === 'High' && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 ${
                  rec.type === 'UPDATE' ? 'bg-orange-500/10 text-orange-400' :
                  rec.type === 'ISOLATE' ? 'bg-rose-500/10 text-rose-500' :
                  'bg-orange-500/10 text-orange-500'
                }`}>
                  <i className={`fas ${
                    rec.type === 'UPDATE' ? 'fa-arrow-up-from-bracket' :
                    rec.type === 'ISOLATE' ? 'fa-biohazard' :
                    rec.type === 'REPLACE' ? 'fa-recycle' : 'fa-magnifying-glass-shield'
                  }`}></i>
                </div>

                <h4 className="text-lg font-black dark:text-white text-slate-900 uppercase leading-tight mb-3">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-8 flex-1 uppercase font-bold tracking-tight">
                  {rec.description}
                </p>

                <button 
                  onClick={() => onAction(rec)}
                  className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-orange-500 hover:text-slate-950 group-hover:scale-[1.02] active:scale-95 shadow-xl"
                >
                  {rec.actionLabel}
                </button>
              </div>
            ))}
            
            {recommendations.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] text-slate-500">
                <i className="fas fa-check-double text-4xl mb-4 text-emerald-500 opacity-20"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">Your security profile is currently optimal</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default SafetyCenter;
