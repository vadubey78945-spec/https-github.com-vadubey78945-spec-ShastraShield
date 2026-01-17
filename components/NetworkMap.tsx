
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
    if (status === SecurityStatus.MONITORING || status === SecurityStatus.QUARANTINED || anomalyScore > 0.3) return '#f59e0b'; // Amber
    if (status === SecurityStatus.DECEPTION_ACTIVE) return '#22d3ee'; // Cyan
    return '#10b981'; // Green
  };

  const center = { x: 400, y: 300 };
  const radius = 220;

  return (
    <div className="glass p-8 rounded-[3rem] border-white/5 relative h-[650px] flex items-center justify-center overflow-hidden">
      <div className="absolute top-8 left-8">
        <h3 className="text-xl font-black uppercase dark:text-white text-slate-900 flex items-center gap-3">
          <i className="fas fa-project-diagram text-cyan-400"></i>
          Live Network Map
        </h3>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Interactive Node Topology</p>
      </div>

      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Safe
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-400">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div> Attention
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-400">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div> Critical
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-400">
          <div className="w-3 h-3 rounded-full bg-cyan-400"></div> Decoy Node
        </div>
      </div>

      <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-full max-w-[800px] drop-shadow-2xl">
        {/* Background Grids/Radials */}
        <circle cx={center.x} cy={center.y} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="10 10" />
        <circle cx={center.x} cy={center.y} r={radius * 0.6} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
        
        {/* Connection Lines */}
        {otherDevices.map((device, idx) => {
          const angle = (idx / otherDevices.length) * 2 * Math.PI;
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);
          const color = getStatusColor(device.status, device.anomalyScore);
          
          return (
            <g key={`line-${device.id}`}>
              <line 
                x1={center.x} y1={center.y} x2={x} y2={y} 
                stroke={color} strokeWidth="1" strokeOpacity="0.2"
                className="transition-all duration-1000"
              />
              <circle cx={x} cy={y} r="3" fill={color} className="animate-pulse opacity-40" />
            </g>
          );
        })}

        {/* Hub / Router */}
        {router && (
          <g className="cursor-pointer group" onClick={() => onDeviceClick(router)}>
            <circle cx={center.x} cy={center.y} r="45" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
            <circle cx={center.x} cy={center.y} r="55" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.1" className="animate-ping" />
            <foreignObject x={center.x - 20} y={center.y - 20} width="40" height="40">
              <div className="w-full h-full flex items-center justify-center text-cyan-400 text-2xl">
                <i className="fas fa-network-wired"></i>
              </div>
            </foreignObject>
            <text x={center.x} y={center.y + 70} textAnchor="middle" className="fill-slate-500 text-[10px] font-black uppercase tracking-widest">Master Gateway</text>
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
              <circle cx={x} cy={y} r="25" fill={color} fillOpacity="0.05" className="group-hover:fill-opacity-10 transition-all" />
              <circle cx={x} cy={y} r="20" fill="#0f172a" stroke={color} strokeWidth="2" className="group-hover:scale-110 transition-transform" />
              
              <foreignObject x={x - 12} y={y - 12} width="24" height="24">
                <div className="w-full h-full flex items-center justify-center text-xs" style={{ color }}>
                  {DEVICE_ICONS[device.type]}
                </div>
              </foreignObject>
              
              <text x={x} y={y + 40} textAnchor="middle" className="fill-white text-[9px] font-bold uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                {device.name}
              </text>
            </g>
          );
        })}

        {/* Decoys Orbit (Inner) */}
        {decoys.map((decoy, idx) => {
          const innerRadius = radius * 0.5;
          const angle = (idx / decoys.length) * 2 * Math.PI + 0.5;
          const x = center.x + innerRadius * Math.cos(angle);
          const y = center.y + innerRadius * Math.sin(angle);
          
          return (
            <g key={decoy.id} className="cursor-pointer group" onClick={() => onDeviceClick(decoy)}>
              <circle cx={x} cy={y} r="15" fill="#22d3ee10" stroke="#22d3ee40" strokeWidth="1" strokeDasharray="4 2" />
              <foreignObject x={x - 8} y={y - 8} width="16" height="16">
                <div className="w-full h-full flex items-center justify-center text-[10px] text-cyan-400/50">
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
