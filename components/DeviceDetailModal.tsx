
import React from 'react';
import { IoTDevice, SecurityStatus, DeviceType, CVE } from '../types';
import { DEVICE_ICONS } from '../constants';

interface DeviceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: IoTDevice;
  parentName?: string;
  onUpdateStatus: (id: string, status: SecurityStatus) => void;
  onToggleSafeMode: (id: string, isSafe: boolean) => void;
}

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  device, 
  parentName, 
  onUpdateStatus,
  onToggleSafeMode
}) => {
  if (!isOpen) return null;

  const toggleIsolation = () => {
    const nextStatus = device.status === SecurityStatus.ISOLATING ? SecurityStatus.SECURE : SecurityStatus.ISOLATING;
    onUpdateStatus(device.id, nextStatus);
  };

  const handleOverride = () => {
    if (window.confirm(`Override all active restrictions for ${device.name}? This will trust the device indefinitely until new anomalies are detected.`)) {
      onUpdateStatus(device.id, SecurityStatus.SECURE);
    }
  };

  const getStatusDisplay = (status: SecurityStatus) => {
    switch (status) {
      case SecurityStatus.SECURE: return { color: 'text-emerald-500', icon: 'fa-shield-check', label: 'Healthy & Secure' };
      case SecurityStatus.MONITORING: return { color: 'text-cyan-500', icon: 'fa-radar', label: 'Scanning for Anomaly' };
      case SecurityStatus.ISOLATING: return { color: 'text-amber-500', icon: 'fa-box-open', label: 'Isolating Network' };
      case SecurityStatus.BLOCKED: return { color: 'text-rose-500', icon: 'fa-ban', label: 'Access Forbidden' };
      case SecurityStatus.UNAUTHORIZED: return { color: 'text-amber-500', icon: 'fa-user-secret', label: 'Unauthorized Shadow Device' };
      case SecurityStatus.QUARANTINED: return { color: 'text-purple-500', icon: 'fa-biohazard', label: 'Internal Quarantine' };
      case SecurityStatus.RATE_LIMITED: return { color: 'text-amber-400', icon: 'fa-gauge-simple-low', label: 'Traffic Throttled' };
      default: return { color: 'text-slate-500', icon: 'fa-question', label: 'Unknown State' };
    }
  };

  const statusInfo = getStatusDisplay(device.status);
  const vp = device.vulnerabilityProfile;
  const isRestricted = [SecurityStatus.ISOLATING, SecurityStatus.QUARANTINED, SecurityStatus.RATE_LIMITED, SecurityStatus.BLOCKED].includes(device.status);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative glass w-full max-w-2xl dark:bg-[#0f172a] bg-white rounded-[2.5rem] border dark:border-white/10 border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 border-b dark:border-white/5 border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-3xl text-slate-400 relative">
              {DEVICE_ICONS[device.type]}
              {device.isSafeMode && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-[#0f172a] flex items-center justify-center text-[8px] text-slate-950">
                  <i className="fas fa-user-shield"></i>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase leading-none">{device.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500 font-mono tracking-widest">{device.ip}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">{device.type}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Fail-Safe Control Header */}
          {isRestricted && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <i className="fas fa-triangle-exclamation text-amber-500 text-lg"></i>
                <div>
                  <p className="text-xs font-black text-amber-500 uppercase">Device Restrictions Active</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">System has limited this device's reach.</p>
                </div>
              </div>
              <button 
                onClick={handleOverride}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/10 hover:bg-amber-400 transition-all"
              >
                Override & Trust
              </button>
            </div>
          )}

          {/* Safe Mode Toggle */}
          <div className="p-6 rounded-[1.5rem] bg-slate-950/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${device.isSafeMode ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
                <i className="fas fa-user-shield"></i>
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase leading-none">Safe Mode / Limited Reach</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Prevents this node from lateral spread.</p>
              </div>
            </div>
            <button 
              onClick={() => onToggleSafeMode(device.id, !device.isSafeMode)}
              className={`w-12 h-6 rounded-full relative transition-all ${device.isSafeMode ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${device.isSafeMode ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border dark:border-white/5 border-slate-100">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Live Status</span>
              <div className={`flex items-center gap-2 font-bold text-[10px] uppercase truncate ${statusInfo.color}`}>
                <i className={`fas ${statusInfo.icon}`}></i>
                {device.status}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border dark:border-white/5 border-slate-100">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Vuln Score</span>
              <div className={`font-mono font-bold text-xs ${(device.vulnerabilityScore > 0.7) ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                {(device.vulnerabilityScore * 10).toFixed(1)} / 10
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border dark:border-white/5 border-slate-100">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Exposure</span>
              <div className="font-bold text-slate-900 dark:text-white text-xs">
                {((vp?.internetExposure || 0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Predictive Vulnerability Audit</h4>
              <span className="text-[9px] text-slate-500 font-mono uppercase">Last Audit: {new Date(vp?.lastAuditDate || '').toLocaleDateString()}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-[1.5rem] dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">Firmware Integrity</span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">{vp?.firmwareVersion}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 uppercase font-bold">Patch Age</span>
                  <span className={`font-bold ${vp && vp.firmwareAgeDays > 365 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {vp?.firmwareAgeDays} Days Old
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-[1.5rem] dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-4">Risk Surface Breakdown</span>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${vp?.weakAuthDetected ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <i className="fas fa-key"></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase leading-none">{vp?.weakAuthDetected ? 'Weak Auth' : 'Strong Auth'}</p>
                      <p className="text-[8px] text-slate-500 uppercase mt-0.5">Pattern Detection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Manual Controls</h4>
            <div className="flex gap-4">
              <button 
                onClick={toggleIsolation}
                className={`flex-1 group relative h-14 overflow-hidden rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  device.status === SecurityStatus.ISOLATING 
                  ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10' 
                  : 'bg-rose-50 text-rose-500 dark:bg-rose-500 dark:text-white hover:bg-rose-400 shadow-lg shadow-rose-500/10 border border-rose-500/20'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <i className={`fas ${device.status === SecurityStatus.ISOLATING ? 'fa-unlock' : 'fa-biohazard'}`}></i>
                  {device.status === SecurityStatus.ISOLATING ? 'Restore Connection' : 'Immediate Isolation'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetailModal;
