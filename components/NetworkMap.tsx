
import React from 'react';
import { IoTDevice, DeviceType, SecurityStatus } from '../types';
import { DEVICE_ICONS } from '../constants';

interface NetworkMapProps {
  devices: IoTDevice[];
  onDeviceClick: (device: IoTDevice) => void;
}

const NetworkMap: React.FC<NetworkMapProps> = ({ devices, onDeviceClick }) => {
  const router = devices.find(d => d.type === DeviceType.ROUTER);
  const otherDevices = devices.filter(d => d.type !== DeviceType.ROUTER && !d.isDecoy);
  const decoys = devices.filter(d => d.isDecoy);

  const getStatusColor = (status: SecurityStatus, anomalyScore: number) => {
    if (status === SecurityStatus.ISOLATING || status === SecurityStatus.BLOCKED || anomalyScore > 0.7) return '#f43f5e'; // Red
    if (status === SecurityStatus.MONITORING || status === SecurityStatus.QUARANTINED || anomalyScore > 0.3) return '#f97316'; // Orange
    if (status === SecurityStatus.DECEPTION_ACTIVE) return '#fb923c'; // Lighter Orange
    return '#10b981'; // Green
  };

  const center = { x: 400, y: 300 };
  const radius = 220;

  return (
    <div className="glass p-8 rounded-[3.5rem] border-white/5 relative h-[650px] flex items-center justify-center overflow-hidden hover:border-orange-500/10">
      <div className="absolute top-10 left-10">
        <h3 className="text-xl font-black uppercase dark:text-white text-slate-900 flex items-center gap-3 tracking-tight">
          <i className="fas fa-project-diagram text-orange-500"></i>
          Live Network Topology
        </h3>
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mt-2">Neural Mesh Visualization</p>
      </div>

      <div className="absolute bottom-10 right-10 flex flex-col gap-3">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div> Healthy
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
          <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"></div> Anomaly
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"></div> Critical
        </div>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
          <div className="w-3 h-3 rounded-full bg-orange-300 border border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]"></div> Decoy
        </div>
      </div>

      <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-full max-w-[800px] drop-shadow-2xl">
        {/* Background Grids/Radials */}
        <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke="rgba(249,115,22,0.05)" strokeWidth="1" strokeDasharray="10 10" />
        <circle cx={center.x} cy={center.y} r={radius * 0.6} fill="none" stroke="rgba(249,115,22,0.02)" strokeWidth="1" />
        
        {/* Connection Lines */}
        {otherDevices.map((device, idx) => {
          const angle = (idx / otherDevices.length) * 2 * Math.PI;
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);
          const color = getStatusColor(device.status, device.anomalyScore);
          
          return (
            <g key={`line-${device.id}`} className="group/line">
              <line 
                x1={center.x} y1={center.y} x2={x} y2={y} 
                stroke={color} strokeWidth="1.5" strokeOpacity="0.1"
                className="transition-all duration-1000 group-hover/line:stroke-opacity-40"
              />
              <circle cx={x} cy={y} r="3" fill={color} className="animate-pulse opacity-40" />
            </g>
          );
        })}

        {/* Hub / Router */}
        {router && (
          <g className="cursor-pointer group" onClick={() => onDeviceClick(router)}>
            <circle cx={center.x} cy={center.y} r="45" fill="#0f172a" stroke="#f97316" strokeWidth="3" />
            <circle cx={center.x} cy={center.y} r="55" fill="none" stroke="#f97316" strokeWidth="1" strokeOpacity="0.1" className="animate-ping" />
            <foreignObject x={center.x - 20} y={center.y - 20} width="40" height="40">
              <div className="w-full h-full flex items-center justify-center text-orange-400 text-2xl group-hover:scale-110 transition-transform">
                <i className="fas fa-network-wired"></i>
              </div>
            </foreignObject>
            <text x={center.x} y={center.y + 75} textAnchor="middle" className="fill-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Root Core</text>
          </g>
        )}

        {/* Outer Orbit Nodes */}
        {otherDevices.map((device, idx) => {
          const angle = (idx / otherDevices.length) * 2 * Math.PI;
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);
          const color = getStatusColor(device.status, device.anomalyScore);
          
          return (
            <g key={device.id} className="cursor-pointer group" onClick={() => onDeviceClick(device)}>
              {/* Node Glow */}
              <circle cx={x} cy={y} r="28" fill={color} fillOpacity="0.05" className="group-hover:fill-opacity-15 transition-all" />
              <circle cx={x} cy={y} r="22" fill="#0f172a" stroke={color} strokeWidth="2.5" className="group-hover:scale-110 transition-all duration-300 shadow-xl" />
              
              <foreignObject x={x - 12} y={y - 12} width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>
                  {DEVICE_ICONS[device.type]}
                </div>
              </foreignObject>
              
              <text x={x} y={y + 45} textAnchor="middle" className="fill-white text-[10px] font-black uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {device.name}
              </text>
            </g>
          );
        })}

        {/* Decoys Orbit (Inner) */}
        {decoys.map((decoy, idx) => {
          const innerRadius = radius * 0.55;
          const angle = (idx / decoys.length) * 2 * Math.PI + 0.5;
          const x = center.x + innerRadius * Math.cos(angle);
          const y = center.y + innerRadius * Math.sin(angle);
          
          return (
            <g key={decoy.id} className="cursor-pointer group" onClick={() => onDeviceClick(decoy)}>
              <circle cx={x} cy={y} r="18" fill="#f9731605" stroke="#f9731630" strokeWidth="1" strokeDasharray="4 2" />
              <foreignObject x={x - 10} y={y - 10} width="20" height="20">
                <div className="w-full h-full flex items-center justify-center text-xs text-orange-400/40 group-hover:text-orange-400 group-hover:scale-110 transition-all">
                  <i className="fas fa-ghost"></i>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default NetworkMap;
