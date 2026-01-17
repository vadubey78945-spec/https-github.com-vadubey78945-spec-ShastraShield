
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell
} from 'recharts';
import { ThreatEvent, IoTDevice } from '../types';
import { DEVICE_ICONS } from '../constants';

interface ThreatAnalyticsProps {
  anomalyTrend: any[];
  riskDistribution: any[];
  threats: ThreatEvent[];
  devices: IoTDevice[];
}

const ThreatAnalytics: React.FC<ThreatAnalyticsProps> = ({ anomalyTrend, riskDistribution, threats, devices }) => {
  // Take the last 3 threats for the timeline visualization
  const recentThreats = threats.slice(0, 3);

  const calculateRiskScore = (device: IoTDevice) => {
    // Risk Score = Device Criticality × Vulnerability Score × Anomaly Severity
    return (device.criticality * device.vulnerabilityScore * (device.anomalyScore * 10)) / 10;
  };

  const getHeatColor = (score: number) => {
    if (score < 1) return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400';
    if (score < 3) return 'bg-amber-500/20 border-amber-500/40 text-amber-400';
    return 'bg-rose-500/40 border-rose-500/60 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Trend */}
        <div className="glass p-6 rounded-3xl h-[400px] flex flex-col hover:border-orange-500/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2 uppercase tracking-tight">
              <i className="fas fa-chart-line text-orange-500"></i>
              Anomaly Severity Trend
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Live Window: 24h</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={anomalyTrend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Risk Map */}
        <div className="glass p-6 rounded-3xl h-[400px] flex flex-col hover:border-orange-500/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl flex items-center gap-2 uppercase tracking-tight">
              <i className="fas fa-shield-halved text-orange-500"></i>
              Attack Vector Distribution
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Top Vectors</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="threats" radius={[6, 6, 0, 0]} animationDuration={1000}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.threats > 5 ? '#f43f5e' : '#f97316'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Device Risk Heatmap */}
      <div className="glass p-8 rounded-[3rem] border-white/5 hover:border-orange-500/20">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-xl flex items-center gap-3 uppercase tracking-tight">
            <i className="fas fa-th text-orange-500"></i>
            Real-Time Device Risk Heatmap
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono tracking-widest">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40"></div> Low
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono tracking-widest">
              <div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/40"></div> Mid
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono tracking-widest">
              <div className="w-3 h-3 rounded-sm bg-rose-500/40 border border-rose-500/60"></div> High
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {devices.map((device) => {
            const score = calculateRiskScore(device);
            return (
              <div 
                key={device.id} 
                className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center gap-2 text-center group cursor-help hover:scale-105 ${getHeatColor(score)}`}
              >
                <div className="text-xl mb-1 opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-6">
                  {DEVICE_ICONS[device.type]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-tight truncate w-24">{device.name}</span>
                  <span className="text-[14px] font-mono font-bold">{score.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 bg-black/20 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-current opacity-60 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, score * 10)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-[10px] text-slate-500 font-mono text-center uppercase tracking-[0.3em] font-bold">
          Risk Score = Criticality × Vulnerability × Anomaly (Normalized 0-10)
        </p>
      </div>

      {/* Attack Path Timeline Graph */}
      <div className="glass p-8 rounded-[3rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
            <i className="fas fa-route text-orange-500"></i>
        </div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="font-bold text-xl flex items-center gap-3 uppercase tracking-tight">
            <i className="fas fa-route text-orange-500"></i>
            Autonomous Attack Path Visualization
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono font-bold">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div> Deception
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-mono font-bold">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div> Threat
            </div>
          </div>
        </div>

        {recentThreats.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-[2rem]">
            <i className="fas fa-radar text-4xl mb-4 opacity-10 animate-pulse"></i>
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting network anomalies to visualize paths...</p>
          </div>
        ) : (
          <div className="space-y-12 relative z-10">
            {recentThreats.map((threat) => (
              <div key={threat.id} className="relative group">
                {/* Horizontal Path Line */}
                <div className="absolute top-6 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent -z-10 group-hover:via-orange-500/20 transition-all duration-500"></div>
                
                <div className="grid grid-cols-4 gap-4">
                  {/* Step 1: Discovery */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center mb-3 group-hover:border-orange-500/30 transition-all">
                      <i className="fas fa-search text-slate-400 group-hover:text-orange-400 transition-colors"></i>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">Step 1</span>
                    <p className="text-xs font-black uppercase mt-1">Scanning</p>
                    <p className="text-[9px] text-slate-600 font-mono mt-1">{threat.sourceIp}</p>
                  </div>

                  {/* Step 2: Lateral Movement Attempt */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center mb-3">
                      <i className="fas fa-arrows-left-right text-rose-500"></i>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">Step 2</span>
                    <p className="text-xs font-black uppercase mt-1">{threat.type}</p>
                    <p className="text-[9px] text-slate-600 uppercase font-bold mt-1">Lateral Attempt</p>
                  </div>

                  {/* Step 3: Deception Trigger */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center justify-center mb-3 animate-pulse">
                      <i className="fas fa-ghost text-orange-400"></i>
                    </div>
                    <span className="text-[10px] font-mono text-orange-500 uppercase font-black tracking-widest">Step 3</span>
                    <p className="text-xs font-black uppercase mt-1">Honeypot</p>
                    <p className="text-[9px] text-orange-600 uppercase font-bold mt-1">{threat.honeypotTriggered}</p>
                  </div>

                  {/* Step 4: Mitigation */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-3">
                      <i className="fas fa-ban text-emerald-500"></i>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase font-black tracking-widest">Step 4</span>
                    <p className="text-xs font-black uppercase mt-1">Neutralized</p>
                    <p className="text-[9px] text-emerald-600 uppercase font-bold mt-1">IP Blocked &lt;10ms</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Risk Heatmap Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Anomaly', val: '12.4%', color: 'text-emerald-400', icon: 'fa-microscope' },
          { label: 'Blocked IPs', val: threats.length.toString(), color: 'text-rose-400', icon: 'fa-ban' },
          { label: 'Deception Rate', val: '98%', color: 'text-orange-400', icon: 'fa-mask' },
          { label: 'Defense Latency', val: '< 15ms', color: 'text-emerald-400', icon: 'fa-bolt' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-[2rem] border-white/5 flex items-center gap-4 hover:border-orange-500/20 group">
            <div className={`w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatAnalytics;
