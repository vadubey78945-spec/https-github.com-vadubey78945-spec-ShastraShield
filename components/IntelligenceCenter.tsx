
import React, { useState, useEffect } from 'react';
import { IntelligenceState } from '../types';

interface IntelligenceCenterProps {
  state: IntelligenceState;
  onUpdateModel: () => void;
  isUpdating: boolean;
}

const IntelligenceCenter: React.FC<IntelligenceCenterProps> = ({ state, onUpdateModel, isUpdating }) => {
  const [evolutionProgress, setEvolutionProgress] = useState(0);

  useEffect(() => {
    setEvolutionProgress(Math.min(100, (state.localPatternsLearned / 500) * 100));
  }, [state.localPatternsLearned]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 dark:text-white text-slate-900 uppercase">Neural Evolution</h2>
          <p className="text-slate-500 font-medium italic">Autonomous adaptation to evolving IoT threat landscapes.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onUpdateModel}
            disabled={isUpdating}
            className="px-6 py-3 rounded-2xl bg-cyan-500 text-slate-900 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-cyan-400 transition-all disabled:opacity-50"
          >
            {isUpdating ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-cloud-download"></i>}
            {isUpdating ? 'Synchronizing Intelligence' : 'Force Model Update'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Intelligence Card */}
        <div className="lg:col-span-2 glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
            <i className="fas fa-brain text-8xl text-cyan-500"></i>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl text-cyan-400 shadow-2xl">
                <i className="fas fa-dna animate-pulse"></i>
              </div>
              <div>
                <h3 className="text-3xl font-black dark:text-white text-slate-900 uppercase">{state.evolutionStage} Logic</h3>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Mesh Immunity Score: {state.immunityScore}%</p>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                  <span>Local Neural Maturity</span>
                  <span className="text-cyan-400">{state.localPatternsLearned} / 500 Patterns</span>
               </div>
               <div className="w-full h-4 bg-slate-950/50 rounded-full border border-white/5 p-1">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    style={{ width: `${evolutionProgress}%` }}
                  ></div>
               </div>
               <p className="text-[10px] text-slate-500 italic">ShastraShield is currently learning from {state.localPatternsLearned} unique traffic flows to refine its Zero-Day detection.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-12">
             <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Model Version</p>
                <p className="text-xl font-black text-white font-mono">{state.globalModelVersion}</p>
             </div>
             <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Last Sync</p>
                <p className="text-xl font-black text-white font-mono truncate">{new Date(state.lastUpdateTimestamp).toLocaleTimeString()}</p>
             </div>
             <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 hidden md:block">
                <p className="text-[9px] font-black text-emerald-500 uppercase mb-2">Immunity Delta</p>
                <p className="text-xl font-black text-emerald-500">+4.2% Today</p>
             </div>
          </div>
        </div>

        {/* Federated Learning Panel */}
        <div className="space-y-6 h-full">
           <div className={`glass p-8 rounded-[3rem] border-cyan-500/20 h-full flex flex-col ${state.federatedSharingActive ? 'bg-cyan-500/5' : 'bg-slate-900/40'}`}>
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-cyan-500 uppercase tracking-[0.2em]">Federated Hub</h3>
                 <div className={`w-2 h-2 rounded-full ${state.federatedSharingActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
              </div>

              <div className="flex-1 space-y-8">
                 <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-bold tracking-tight">
                    {state.federatedSharingActive 
                      ? "Cloud-assisted learning active. Your node is contributing anonymized behavioral metadata to the global IoT immunity ledger."
                      : "Privacy Mode active. Intelligence restricted to local edge hardware. Global updates disabled."
                    }
                 </p>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Adaptation</p>
                    <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 flex gap-4">
                       <i className="fas fa-microchip text-cyan-400 mt-1"></i>
                       <p className="text-[10px] text-slate-300 font-medium leading-normal italic">
                         "Learned new MQTT flood pattern from Backyard Camera decoy interaction. Global policy updated."
                       </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 flex gap-4">
                       <i className="fas fa-shield-halved text-emerald-400 mt-1"></i>
                       <p className="text-[10px] text-slate-300 font-medium leading-normal italic">
                         "Updated HomeKit signature following firmware drift detection on Smart Lock."
                       </p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-white uppercase">Collaborative Defense</p>
                       <p className="text-[9px] text-slate-500">2.4k nodes sharing patterns</p>
                    </div>
                    <div className="flex -space-x-2">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] text-cyan-400">
                            <i className="fas fa-robot"></i>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Intelligence Timeline */}
      <div className="glass p-10 rounded-[3rem] border-white/5">
         <h3 className="text-2xl font-black uppercase dark:text-white text-slate-900 mb-10 flex items-center gap-3">
            <i className="fas fa-history text-slate-500"></i>
            Adaptation Log
         </h3>
         
         <div className="space-y-4">
            {[
               { time: '14:45', action: 'Threat Model Update', desc: 'Fetched 12 new IoT-specific Brute Force signatures from global hub.', type: 'SYNC' },
               { time: '12:10', action: 'Neural Reinforcement', desc: 'Core Gateway baseline solidified after 48h of consistent traffic.', type: 'LEARN' },
               { time: '09:33', action: 'Deception Insight', desc: 'Source IP 103.1.2.4 blacklisted across mesh after decoy Telnet probe.', type: 'DECEPTION' },
               { time: 'Yesterday', action: 'Pattern Mutation', desc: 'Identified variant of Mirai botnet C2 heartbeat in encrypted tunnel.', type: 'MUTATE' }
            ].map((log, i) => (
               <div key={i} className="flex items-start gap-6 p-6 rounded-3xl hover:bg-white/5 transition-all group">
                  <div className="text-[10px] font-mono text-slate-600 font-black uppercase mt-1 w-20">{log.time}</div>
                  <div className={`w-2 h-2 rounded-full mt-2.5 ${
                     log.type === 'SYNC' ? 'bg-cyan-500' :
                     log.type === 'LEARN' ? 'bg-emerald-500' :
                     log.type === 'DECEPTION' ? 'bg-rose-500' : 'bg-purple-500'
                  }`}></div>
                  <div>
                     <p className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{log.action}</p>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed italic">{log.desc}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default IntelligenceCenter;
