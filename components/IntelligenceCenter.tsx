
import React, { useState, useEffect, useMemo } from 'react';
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

  const logEntries = useMemo(() => {
    const now = new Date();
    
    const getRelativeTime = (minutesOffset: number) => {
      const date = new Date(now.getTime() - minutesOffset * 60000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return [
      { time: getRelativeTime(15), action: 'Threat Model Update', desc: 'Fetched 12 new IoT-specific Brute Force signatures from global hub.', type: 'SYNC' },
      { time: getRelativeTime(160), action: 'Neural Reinforcement', desc: 'Core Gateway baseline solidified after 48h of consistent traffic.', type: 'LEARN' },
      { time: getRelativeTime(312), action: 'Deception Insight', desc: 'Source IP 103.1.2.4 blacklisted across mesh after decoy Telnet probe.', type: 'DECEPTION' },
      { time: 'Last Night', action: 'Pattern Mutation', desc: 'Identified variant of Mirai botnet C2 heartbeat in encrypted tunnel.', type: 'MUTATE' }
    ];
  }, []);

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
            className="px-6 py-3 rounded-2xl bg-orange-500 text-slate-900 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-orange-400 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-orange-500/10"
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
            <i className="fas fa-brain text-8xl text-orange-500"></i>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-3xl text-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <i className="fas fa-dna animate-pulse"></i>
              </div>
              <div>
                <h3 className="text-3xl font-black dark:text-white text-slate-900 uppercase tracking-tight">{state.evolutionStage} Logic</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-[0.3em] font-bold">Mesh Immunity Score: {state.immunityScore}%</p>
              </div>
            </div>

            <div className="space-y-5">
               <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                  <span>Local Neural Maturity</span>
                  <span className="text-orange-400">{state.localPatternsLearned} / 500 Patterns</span>
               </div>
               <div className="w-full h-5 bg-slate-950/50 rounded-full border border-white/5 p-1 relative overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                    style={{ width: `${evolutionProgress}%` }}
                  ></div>
                  {/* Decorative shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  ShastraShield is currently learning from {state.localPatternsLearned} unique traffic flows to refine its Zero-Day detection capabilities.
               </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-12">
             <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all group">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Model Version</p>
                <p className="text-xl font-black text-white font-mono group-hover:text-orange-400 transition-colors">{state.globalModelVersion}</p>
             </div>
             <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all group">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Last Sync</p>
                <p className="text-xl font-black text-white font-mono truncate group-hover:text-orange-400 transition-colors">{new Date(state.lastUpdateTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
             </div>
             <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 hidden md:block group hover:bg-emerald-500/10 transition-all">
                <p className="text-[9px] font-black text-emerald-500 uppercase mb-2 tracking-widest">Immunity Delta</p>
                <p className="text-xl font-black text-emerald-500">+4.2% Today</p>
             </div>
          </div>
        </div>

        {/* Federated Learning Panel */}
        <div className="space-y-6 h-full">
           <div className={`glass p-10 rounded-[3rem] border-orange-500/20 h-full flex flex-col transition-all duration-500 ${state.federatedSharingActive ? 'bg-orange-500/5' : 'bg-slate-900/40'}`}>
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Federated Hub</h3>
                 <div className={`w-2.5 h-2.5 rounded-full ${state.federatedSharingActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
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
                    <div className="p-5 rounded-[1.5rem] bg-slate-950/40 border border-white/5 flex gap-4 hover:border-orange-500/20 transition-all group">
                       <i className="fas fa-microchip text-orange-400 mt-1 group-hover:scale-110 transition-transform"></i>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-normal italic">
                         "Learned new MQTT flood pattern from Backyard Camera decoy interaction. Global policy updated."
                       </p>
                    </div>
                    <div className="p-5 rounded-[1.5rem] bg-slate-950/40 border border-white/5 flex gap-4 hover:border-emerald-500/20 transition-all group">
                       <i className="fas fa-shield-halved text-emerald-400 mt-1 group-hover:scale-110 transition-transform"></i>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-normal italic">
                         "Updated HomeKit signature following firmware drift detection on Smart Lock."
                       </p>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">Collaborative Defense</p>
                       <p className="text-[9px] text-slate-500 font-mono">2.4k nodes sharing patterns</p>
                    </div>
                    <div className="flex -space-x-2">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] text-orange-400 shadow-sm transition-transform hover:translate-y-[-2px] cursor-pointer">
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
      <div className="glass p-12 rounded-[3.5rem] border-white/5">
         <h3 className="text-2xl font-black uppercase dark:text-white text-slate-900 mb-10 flex items-center gap-4">
            <i className="fas fa-history text-slate-500"></i>
            Adaptation Log
         </h3>
         
         <div className="space-y-4 relative">
            {/* Vertical Line */}
            <div className="absolute left-[92px] top-6 bottom-6 w-0.5 bg-slate-800"></div>

            {logEntries.map((log, i) => (
               <div key={i} className="flex items-start gap-12 p-6 rounded-[2rem] hover:bg-white/5 transition-all group cursor-default">
                  <div className="text-[10px] font-mono text-slate-500 font-black uppercase mt-1 w-20 text-right">{log.time}</div>
                  <div className={`w-3 h-3 rounded-full mt-2 z-10 border-4 border-[#020617] ring-2 transition-all group-hover:scale-125 ${
                     log.type === 'SYNC' ? 'bg-orange-500 ring-orange-500/20' :
                     log.type === 'LEARN' ? 'bg-emerald-500 ring-emerald-500/20' :
                     log.type === 'DECEPTION' ? 'bg-rose-500 ring-rose-500/20' : 'bg-purple-500 ring-purple-500/20'
                  }`}></div>
                  <div className="flex-1">
                     <p className="text-sm font-black dark:text-white text-slate-900 uppercase tracking-widest group-hover:text-orange-400 transition-colors">{log.action}</p>
                     <p className="text-xs text-slate-500 mt-1 leading-relaxed font-bold uppercase tracking-tight opacity-80">{log.desc}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default IntelligenceCenter;
