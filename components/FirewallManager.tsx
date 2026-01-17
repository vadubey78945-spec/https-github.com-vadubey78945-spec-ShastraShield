
import React from 'react';
import { FirewallRule, IoTDevice, SecurityStatus } from '../types';
import { DEVICE_ICONS } from '../constants';

interface FirewallManagerProps {
  devices: IoTDevice[];
  rules: FirewallRule[];
  onRemoveRule: (id: string) => void;
}

const FirewallManager: React.FC<FirewallManagerProps> = ({ devices, rules, onRemoveRule }) => {
  const getDeviceName = (id: string) => devices.find(d => d.id === id)?.name || 'Unknown';

  const isExpired = (rule: FirewallRule) => {
    if (!rule.expiresAt) return false;
    return new Date(rule.expiresAt) < new Date();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 dark:text-white text-slate-900 uppercase">Adaptive Firewall</h2>
          <p className="text-slate-500 font-medium italic">Context-Aware Micro-Segmentation & Dynamic Policy Tightening.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3">
            <i className="fas fa-microchip text-orange-500"></i>
            <div>
               <p className="text-[9px] text-slate-500 uppercase font-black">Segment Status</p>
               <p className="text-xs font-black text-orange-500 uppercase">Zero Trust Enforced</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Active Rules List */}
        <div className="xl:col-span-2 space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
              <h3 className="text-xl font-black dark:text-white text-slate-900 mb-8 uppercase flex items-center gap-3">
                <i className="fas fa-list-check text-orange-400"></i>
                Active Firewall Rules
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                      <th className="px-4 pb-2">Target Node</th>
                      <th className="px-4 pb-2">Action</th>
                      <th className="px-4 pb-2">Context Path</th>
                      <th className="px-4 pb-2">Reason</th>
                      <th className="px-4 pb-2">TTL</th>
                      <th className="px-4 pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.filter(r => !isExpired(r)).map(rule => (
                      <tr key={rule.id} className="bg-slate-900/40 border border-white/5 group hover:border-orange-500/20 transition-all">
                        <td className="px-4 py-4 rounded-l-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-500 group-hover:text-orange-400">
                               {DEVICE_ICONS[devices.find(d => d.id === rule.deviceId)?.type || 'Unknown' as any]}
                            </div>
                            <span className="text-xs font-bold text-white truncate w-24">{getDeviceName(rule.deviceId)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                             rule.action === 'BLOCK' ? 'bg-rose-500 text-white' : 
                             rule.action === 'THROTTLE' ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                           }`}>
                             {rule.action}
                           </span>
                        </td>
                        <td className="px-4 py-4">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-mono text-orange-500 uppercase">{rule.direction}</span>
                              <span className="text-[10px] font-bold text-slate-300">{rule.target}</span>
                           </div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                           <p className="text-[9px] text-slate-500 leading-tight italic truncate group-hover:whitespace-normal transition-all">{rule.reason}</p>
                        </td>
                        <td className="px-4 py-4">
                           {rule.expiresAt ? (
                             <span className="text-[9px] font-mono text-rose-500 animate-pulse uppercase">Temporary</span>
                           ) : (
                             <span className="text-[9px] font-mono text-slate-600 uppercase">Static</span>
                           )}
                        </td>
                        <td className="px-4 py-4 rounded-r-2xl text-right">
                           <button onClick={() => onRemoveRule(rule.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                              <i className="fas fa-trash-alt text-xs"></i>
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        {/* Adaptive Intelligence Summary */}
        <div className="space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-orange-500/20 bg-orange-500/5 h-full">
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-[0.2em] mb-8">
                 Context IQ Engine
              </h3>
              
              <div className="space-y-6">
                 <div className="p-5 rounded-3xl bg-slate-950/40 border border-white/5 hover:border-orange-500/30 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Rule Generation Ratio</p>
                    <div className="flex items-end justify-between">
                       <div className="flex flex-col">
                          <span className="text-3xl font-black text-white">82%</span>
                          <span className="text-[9px] font-bold text-orange-500 uppercase mt-1">AI-Authored Rules</span>
                       </div>
                       <i className="fas fa-robot text-orange-500/30 text-4xl"></i>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Autonomous Pathfinding</p>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all">
                       <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <i className="fas fa-check-double text-xs"></i>
                       </div>
                       <p className="text-[10px] text-slate-300 font-medium">Auto-tightened 4 policies in the last 60 minutes due to C2 heartbeat drift.</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all">
                       <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <i className="fas fa-shield text-xs"></i>
                       </div>
                       <p className="text-[10px] text-slate-300 font-medium">Expired 12 temporary throttling rules after device reboot and successful re-auth.</p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 p-6 rounded-3xl bg-slate-900/60 border border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Segmentation Health</p>
                 <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-[10px] font-black text-white">94%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FirewallManager;
