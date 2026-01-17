
import React from 'react';
import { ThreatEvent, IoTDevice } from '../types';

interface PostAttackReportProps {
  threats: ThreatEvent[];
  devices: IoTDevice[];
  summary: string;
}

const PostAttackReport: React.FC<PostAttackReportProps> = ({ threats, devices, summary }) => {
  const handleDownload = () => {
    if (threats.length === 0) {
      alert("No threat data available for download.");
      return;
    }
    const reportText = `SHASTRA SHIELD - FORENSIC REPORT\n\nSummary:\n${summary}\n\nThreats Neutralized: ${threats.length}\n\n` + 
      threats.map(t => `[${t.timestamp}] ${t.type} from ${t.sourceIp} - Confidence: ${(t.confidence * 100).toFixed(1)}% - Status: ${t.status}`).join('\n');
    
    const element = document.createElement("a");
    const file = new Blob([reportText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "ShastraShield_Forensic_Report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`Security Report: ${summary.slice(0, 50)}... Access here: ${url}`);
    alert("Report link copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        {/* Decorative background icons removed per user request */}
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-2xl">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Post-Attack Summary</h2>
            <p className="text-slate-500 text-sm">Campaign Signal Correlation Active</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl mb-8 font-serif italic text-lg text-slate-300 leading-relaxed">
          {summary ? `"${summary}"` : '"Network baseline is currently stable. Autonomous correlation engines are tracking low-level ambient probes. Integrity maintained."'}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleDownload}
            className="bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 active:scale-95"
          >
            <i className="fas fa-download"></i>
            Download Forensic Log
          </button>
          <button 
            onClick={handleShare}
            className="bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/10 active:scale-95"
          >
            Share with Network Admin
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-list-check text-orange-400"></i>
          Correlated Event Timeline
        </h3>
        
        {threats.length === 0 ? (
          <div className="glass p-10 rounded-2xl border-white/5 text-center text-slate-500">
            <i className="fas fa-shield-check text-4xl mb-4 opacity-20"></i>
            <p>No neutralized threats to report.</p>
          </div>
        ) : (
          threats.map((threat) => {
            const device = devices.find(d => d.id === threat.targetDeviceId);
            
            return (
              <div key={threat.id} className="glass p-5 rounded-2xl border-white/10 hover:border-orange-500/30 transition-all relative overflow-hidden">
                {threat.isCorrelated && (
                  <div className="absolute top-0 right-0 p-2">
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-xl tracking-widest animate-pulse">
                      Correlated Signal
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      threat.severity === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      <i className={`fas ${threat.type === 'Botnet C2' ? 'fa-satellite-dish' : 'fa-triangle-exclamation'}`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold">{threat.type} Attack</h4>
                      <p className="text-xs text-slate-500">{new Date(threat.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Confidence:</span>
                      <span className={`text-[10px] font-black font-mono ${threat.confidence > 0.8 ? 'text-orange-400' : 'text-orange-500'}`}>
                        {(threat.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {threat.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Target Node</p>
                    <p className="text-sm font-semibold">{device?.name || 'Unknown'}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Threat Origin</p>
                    <p className="text-sm font-semibold mono">{threat.sourceIp}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border bg-orange-500/5 border-orange-500/10`}>
                  <p className={`text-[10px] font-mono uppercase mb-2 text-orange-500`}>
                    Agent Analysis Report
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {threat.aiReasoning || "Loading agentic forensic trace..."}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostAttackReport;
