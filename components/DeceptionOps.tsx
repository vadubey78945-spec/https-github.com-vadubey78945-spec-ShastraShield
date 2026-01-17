
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
          <div className="px-5 py-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3 shadow-lg shadow-orange-500/5">
            <i className="fas fa-ghost text-orange-500"></i>
            <div>
               <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Agent State</p>
               <p className="text-xs font-black text-orange-500 uppercase mt-1">Aggressive Deception</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Decoy Fleet Control */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 scale-125">
               <i className="fas fa-microchip text-8xl text-orange-500"></i>
             </div>
             <h3 className="text-xl font-black dark:text-white text-slate-900 mb-10 uppercase flex items-center gap-4 tracking-tight">
               <i className="fas fa-server text-orange-500"></i>
               Virtualized Decoy Fleet
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {configs.map(config => (
                 <div key={config.id} className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-orange-500/30 transition-all group cursor-default">
                   <div className="flex justify-between items-start mb-5">
                     <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                       <i className="fas fa-terminal text-lg"></i>
                     </div>
                     <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.active ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-700 text-slate-400'}`}>
                        {config.active ? 'Deployed' : 'Standby'}
                     </div>
                   </div>
                   <h4 className="font-black text-white uppercase text-sm mb-1 tracking-tight group-hover:text-orange-400 transition-colors">{config.name}</h4>
                   <p className="text-[10px] text-slate-500 font-mono uppercase mb-6">Target: {config.vulnerabilityTarget}</p>
                   <div className="flex items-center justify-between pt-5 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Interactions</span>
                        <span className="text-sm font-black text-white">{config.hits} Hits</span>
                      </div>
                      <button 
                        onClick={() => setConfigs(prev => prev.map(c => c.id === config.id ? {...c, active: !c.active} : c))} 
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${config.active ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-slate-900' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                      >
                        Toggle Node
                      </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="glass p-10 rounded-[3rem] border-white/5">
             <h3 className="text-xl font-black dark:text-white text-slate-900 mb-10 uppercase flex items-center gap-4 tracking-tight">
               <i className="fas fa-key text-orange-500"></i>
               Honeytoken Vault
             </h3>
             <div className="space-y-4">
               {tokens.map(token => (
                 <div key={token.id} className="flex items-center justify-between p-5 rounded-[2rem] bg-white/5 border border-white/5 group hover:border-orange-500/30 transition-all cursor-help">
                   <div className="flex items-center gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-orange-400 transition-colors">
                        <i className={`fas ${token.type === 'Credential' ? 'fa-user-secret text-lg' : 'fa-code text-lg'}`}></i>
                     </div>
                     <div>
                       <p className="text-xs font-black text-white uppercase tracking-widest leading-none">{token.name}</p>
                       <p className="text-[9px] text-slate-500 mt-2 uppercase font-mono font-bold">{token.location}</p>
                     </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Integrity</p>
                      <p className={`text-[10px] font-black tracking-widest ${token.triggeredCount > 0 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
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
           <div className="glass p-10 rounded-[3rem] border-orange-500/20 bg-orange-500/5 h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
                <i className="fas fa-radar text-orange-500"></i>
              </div>
              <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] mb-10 flex items-center gap-3 relative z-10">
                 <i className="fas fa-radar animate-spin-slow"></i>
                 Active Mesh Proxies
              </h3>
              <div className="space-y-5 relative z-10">
                 {decoys.length === 0 ? (
                   <div className="text-center py-20 opacity-30">
                      <i className="fas fa-ghost text-5xl mb-6"></i>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Active Decoys</p>
                   </div>
                 ) : (
                   decoys.map(decoy => (
                     <div key={decoy.id} className="p-5 rounded-[1.5rem] bg-slate-950/60 border border-orange-500/20 relative group overflow-hidden hover:scale-105 transition-all cursor-pointer">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 group-hover:opacity-40 transition-all">
                           <i className="fas fa-mask text-2xl text-orange-400"></i>
                        </div>
                        <div className="flex items-center gap-4 mb-3">
                           <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm">
                              <i className="fas fa-video"></i>
                           </div>
                           <p className="text-xs font-black text-white uppercase tracking-tight truncate w-32">{decoy.name}</p>
                        </div>
                        <div className="flex items-center justify-between mt-6">
                           <span className="text-[9px] font-mono text-orange-500/60 uppercase tracking-widest font-bold">{decoy.ip}</span>
                           <span className="text-[9px] font-black text-emerald-500 uppercase animate-pulse tracking-widest">Luring...</span>
                        </div>
                     </div>
                   ))
                 )}
              </div>
              
              <div className="mt-12 p-8 rounded-[2rem] bg-slate-900/60 border border-white/5 relative z-10">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Deception IQ Score</p>
                 <div className="space-y-5">
                    <div className="flex justify-between items-center text-[10px] font-black text-white uppercase tracking-widest">
                       <span>Adversary Dwell Time</span>
                       <span className="text-orange-400 font-mono">14m 22s</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-orange-500 w-[78%] shadow-[0_0_10px_rgba(249,115,22,0.4)]"></div>
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
