
import React, { useState, useEffect } from 'react';
import { deceptionService } from '../services/deceptionService';
import { Honeytoken, DecoyConfig, IoTDevice } from '../types';

interface DeceptionOpsProps {
  decoys: IoTDevice[];
}

const DeceptionOps: React.FC<DeceptionOpsProps> = ({ decoys }) => {
  const [tokens] = useState<Honeytoken[]>(deceptionService.getHoneytokens());
  const [configs, setConfigs] = useState<DecoyConfig[]>(deceptionService.getDecoyConfigs());

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 dark:text-white text-slate-900 uppercase">Deception Operations</h2>
          <p className="text-slate-500 font-medium italic">Misleading adversaries via virtualized hardware & honeytokens.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-3">
            <i className="fas fa-ghost text-cyan-400"></i>
            <div>
               <p className="text-[9px] text-slate-500 uppercase font-black">Agent State</p>
               <p className="text-xs font-black text-cyan-500 uppercase">Aggressive Deception</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Decoy Fleet Control */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <i className="fas fa-microchip text-8xl text-cyan-500"></i>
             </div>
             <h3 className="text-xl font-black dark:text-white text-slate-900 mb-8 uppercase flex items-center gap-3">
               <i className="fas fa-server text-cyan-400"></i>
               Virtualized Decoy Fleet
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {configs.map(config => (
                 <div key={config.id} className="p-5 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                       <i className="fas fa-terminal"></i>
                     </div>
                     <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${config.active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-700 text-slate-400'}`}>
                        {config.active ? 'Deployed' : 'Standby'}
                     </div>
                   </div>
                   <h4 className="font-bold text-white uppercase text-sm mb-1">{config.name}</h4>
                   <p className="text-[10px] text-slate-500 font-mono uppercase mb-4">Target: {config.vulnerabilityTarget}</p>
                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase font-black">Interactions</span>
                        <span className="text-xs font-black text-white">{config.hits} Hits</span>
                      </div>
                      <button onClick={() => setConfigs(prev => prev.map(c => c.id === config.id ? {...c, active: !c.active} : c))} className="text-[9px] font-black uppercase tracking-widest text-cyan-500 hover:text-white transition-colors">
                        Toggle Node
                      </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] border-white/5">
             <h3 className="text-xl font-black dark:text-white text-slate-900 mb-8 uppercase flex items-center gap-3">
               <i className="fas fa-key text-cyan-400"></i>
               Honeytoken Vault
             </h3>
             <div className="space-y-4">
               {tokens.map(token => (
                 <div key={token.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-cyan-500/20 transition-all">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                        <i className={`fas ${token.type === 'Credential' ? 'fa-user-secret' : 'fa-code'}`}></i>
                     </div>
                     <div>
                       <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{token.name}</p>
                       <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono">{token.location}</p>
                     </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] text-slate-500 uppercase font-black">Integrity</p>
                      <p className={`text-[10px] font-black ${token.triggeredCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {token.triggeredCount > 0 ? 'COMPROMISED' : 'TOUCHLESS'}
                      </p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Live Active Decoys */}
        <div className="space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border-cyan-500/20 bg-cyan-500/5 h-full">
              <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                 <i className="fas fa-radar animate-spin-slow"></i>
                 Active Mesh Proxies
              </h3>
              <div className="space-y-4">
                 {decoys.length === 0 ? (
                   <div className="text-center py-12 opacity-40">
                      <i className="fas fa-ghost text-4xl mb-4"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">No Active Decoys Deployed</p>
                   </div>
                 ) : (
                   decoys.map(decoy => (
                     <div key={decoy.id} className="p-4 rounded-2xl bg-slate-950/40 border border-cyan-500/20 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-125 transition-transform">
                           <i className="fas fa-mask text-2xl text-cyan-400"></i>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
                              <i className="fas fa-video"></i>
                           </div>
                           <p className="text-xs font-black text-white uppercase truncate w-32">{decoy.name}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                           <span className="text-[9px] font-mono text-cyan-500/60 uppercase tracking-widest">{decoy.ip}</span>
                           <span className="text-[9px] font-black text-emerald-500 uppercase animate-pulse">Luring...</span>
                        </div>
                     </div>
                   ))
                 )}
              </div>
              
              <div className="mt-12 p-6 rounded-3xl bg-slate-900/60 border border-white/5">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Deception Effectiveness</p>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-white uppercase">
                       <span>Adversary Dwell Time</span>
                       <span className="text-cyan-400">14m 22s</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-cyan-500 w-[78%]"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DeceptionOps;
