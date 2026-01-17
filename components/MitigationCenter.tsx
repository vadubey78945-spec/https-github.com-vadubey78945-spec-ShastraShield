
import React from 'react';
import { IoTDevice, SecurityStatus, MitigationRecord } from '../types';
import { DEVICE_ICONS } from '../constants';

interface MitigationCenterProps {
  devices: IoTDevice[];
  mitigationHistory: MitigationRecord[];
  onRelease: (deviceId: string) => void;
  onRollback: (record: MitigationRecord) => void;
}

const MitigationCenter: React.FC<MitigationCenterProps> = ({ 
  devices, 
  mitigationHistory, 
  onRelease, 
  onRollback 
}) => {
  const activeMitigations = devices.filter(d => 
    [SecurityStatus.ISOLATING, SecurityStatus.QUARANTINED, SecurityStatus.RATE_LIMITED, SecurityStatus.BLOCKED].includes(d.status)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 dark:text-white text-slate-900 uppercase">Mitigation Center</h2>
          <p className="text-slate-500 font-medium italic">Autonomous Active Enforcement & Fail-Safe Rollbacks.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <i className="fas fa-shield-check text-emerald-500"></i>
            <div>
               <p className="text-[9px] text-slate-500 uppercase font-black">Defense Mode</p>
               <p className="text-xs font-black text-emerald-500 uppercase">Silent Mitigation Active</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Enforcements List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden hover:border-orange-500/10">
              <h3 className="text-xl font-black dark:text-white text-slate-900 mb-8 uppercase flex items-center gap-3">
                <i className="fas fa-gavel text-rose-500"></i>
                Active Enforcements
              </h3>
              
              {activeMitigations.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                   <i className="fas fa-hand-holding-heart text-6xl mb-4"></i>
                   <p className="text-xs font-black uppercase tracking-widest">No nodes currently restricted</p>
                </div>
              ) : (
                <div className="space-y-4">
                   {activeMitigations.map(device => (
                     <div key={device.id} className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 flex items-center justify-between hover:border-orange-500/20 transition-all group">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-orange-400">
                              {DEVICE_ICONS[device.type]}
                           </div>
                           <div>
                              <h4 className="font-bold text-white uppercase text-sm leading-none">{device.name}</h4>
                              <div className="flex items-center gap-2 mt-2">
                                 <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                    device.status === SecurityStatus.ISOLATING ? 'bg-rose-500 text-white' :
                                    device.status === SecurityStatus.QUARANTINED ? 'bg-purple-500 text-white' :
                                    'bg-orange-500 text-white'
                                 }`}>
                                    {device.status}
                                 </span>
                                 <span className="text-[9px] font-mono text-slate-500">{device.ip}</span>
                              </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => onRelease(device.id)}
                          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-sm"
                        >
                           Release Node
                        </button>
                     </div>
                   ))}
                </div>
              )}
           </div>

           {/* Automated Action History with Rollback */}
           <div className="glass p-8 rounded-[2.5rem] border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black dark:text-white text-slate-900 uppercase flex items-center gap-3">
                  <i className="fas fa-clock-rotate-left text-orange-400"></i>
                  Action History
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Fail-Safe Log</span>
              </div>
              
              <div className="space-y-4">
                {mitigationHistory.length === 0 ? (
                  <p className="text-center py-10 text-slate-500 text-xs uppercase font-bold tracking-widest opacity-40 italic">No automated actions logged.</p>
                ) : (
                  mitigationHistory.map(record => (
                    <div key={record.id} className={`p-4 rounded-2xl border transition-all ${record.wasRolledBack ? 'bg-slate-900/20 border-white/5 opacity-50' : 'bg-slate-900/60 border-white/5 hover:border-orange-500/20'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${record.wasRolledBack ? 'bg-slate-800 text-slate-600' : 'bg-orange-500/10 text-orange-500'}`}>
                            <i className={`fas ${record.wasRolledBack ? 'fa-undo' : 'fa-robot'}`}></i>
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase leading-none">{record.deviceName}</p>
                            <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono">{record.action} applied for {record.reason.toLowerCase()}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <span className="text-[8px] font-mono text-slate-600 uppercase">{new Date(record.timestamp).toLocaleTimeString()}</span>
                          {!record.wasRolledBack && (
                            <button 
                              onClick={() => onRollback(record)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
                            >
                              Rollback
                            </button>
                          )}
                          {record.wasRolledBack && (
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Rolled Back</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>

        {/* Graduated Model Overview */}
        <div className="space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-orange-500/20 bg-orange-500/5 h-full relative overflow-hidden">
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-8">
                 Defense Methodology
              </h3>
              <div className="space-y-12 relative">
                 <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-orange-500 via-orange-500 to-rose-500 opacity-20"></div>
                 
                 {[
                   { step: '01', title: 'Observe', desc: 'Agent monitors behavioral drifts against baseline.', color: 'text-orange-400', icon: 'fa-eye' },
                   { step: '02', title: 'Deceive', desc: 'Deploy shadow proxies to mislead recon.', color: 'text-orange-500', icon: 'fa-mask' },
                   { step: '03', title: 'Contain', desc: 'Rate-limit traffic or segment to VLan-Z.', color: 'text-orange-600', icon: 'fa-box-open' },
                   { step: '04', title: 'Isolate', desc: 'Full node severance for critical threats.', color: 'text-rose-500', icon: 'fa-biohazard' }
                 ].map(phase => (
                   <div key={phase.step} className="flex gap-6 relative z-10 group cursor-default">
                      <div className={`w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-black ${phase.color} group-hover:scale-110 transition-transform`}>
                         {phase.step}
                      </div>
                      <div>
                         <h4 className="font-bold text-white uppercase text-sm flex items-center gap-2 group-hover:text-orange-400 transition-colors">
                           <i className={`fas ${phase.icon} ${phase.color}`}></i>
                           {phase.title}
                         </h4>
                         <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">{phase.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-6 rounded-3xl bg-slate-900/60 border border-white/5 group hover:border-orange-500/20 transition-all">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mitigation Latency</p>
                 <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white group-hover:text-orange-400 transition-colors">12.4</span>
                    <span className="text-xs font-bold text-emerald-500 mb-1">ms avg</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MitigationCenter;
