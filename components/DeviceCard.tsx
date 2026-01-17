
import React from 'react';
import { IoTDevice, SecurityStatus, DeviceType } from '../types';
import { DEVICE_ICONS } from '../constants';

interface DeviceCardProps {
  device: IoTDevice;
  onClick: (device: IoTDevice) => void;
  parentName?: string;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onClick, parentName }) => {
  const getRiskColor = (score: number) => {
    if (score < 0.3) return 'text-emerald-500';
    if (score < 0.6) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getStatusColor = (status: SecurityStatus) => {
    switch (status) {
      case SecurityStatus.SECURE: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case SecurityStatus.MONITORING: return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      case SecurityStatus.ISOLATING: return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 pulse-red';
      case SecurityStatus.BLOCKED: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case SecurityStatus.DECEPTION_ACTIVE: return 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
      case SecurityStatus.QUARANTINED: return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case SecurityStatus.RATE_LIMITED: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div 
      onClick={() => onClick(device)}
      className="glass p-5 rounded-3xl hover:scale-[1.03] hover:border-orange-500/40 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.2)] dark:bg-slate-900/40 bg-white/60 dark:border-white/10 border-slate-200 transition-all cursor-pointer group relative overflow-hidden"
    >
      {device.isDecoy && (
        <div className="absolute top-0 right-0 p-2">
          <i className="fas fa-mask text-orange-500/20 text-2xl group-hover:scale-125 transition-transform"></i>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl text-slate-400 group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-all duration-300">
          {DEVICE_ICONS[device.type]}
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(device.status)} transition-colors duration-300`}>
          {device.status}
        </div>
      </div>

      <div className="mb-1">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-orange-400 transition-colors">{device.name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[9px] text-slate-500 font-mono">{device.ip}</span>
          <span className="text-[9px] text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500/70 uppercase">
            <i className="fas fa-link scale-75"></i>
            {device.type === DeviceType.ROUTER ? 'Root Gateway' : parentName ? `Via ${parentName}` : 'Mesh Link'}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-bold uppercase text-[9px]">Anomalous Score</span>
          <span className={`font-black ${getRiskColor(device.anomalyScore)}`}>
            {(device.anomalyScore * 10).toFixed(1)}/10
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ${
              device.anomalyScore > 0.6 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
              device.anomalyScore > 0.3 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
              'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
            }`}
            style={{ width: `${device.anomalyScore * 100}%` }}
          ></div>
        </div>
        
        <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-600 uppercase font-black tracking-widest">
          <span>{device.vendor}</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5">{device.type}</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
