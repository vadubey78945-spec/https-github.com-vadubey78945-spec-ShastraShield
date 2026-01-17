
import React, { useState } from 'react';
import { DeviceType, SecurityStatus, IoTDevice } from '../types';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (deviceData: any) => void;
  existingDevices: IoTDevice[];
}

const DeviceModal: React.FC<DeviceModalProps> = ({ isOpen, onClose, onAdd, existingDevices }) => {
  const routers = existingDevices.filter(d => d.type === DeviceType.ROUTER);
  
  const [formData, setFormData] = useState({
    name: '',
    type: DeviceType.LIGHT,
    ip: '192.168.1.',
    vendor: '',
    parentId: routers[0]?.id || ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      mac: Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
      ).join(':'),
      criticality: 5,
      vulnerabilityScore: Math.random() * 0.4,
      anomalyScore: 0.0,
      status: SecurityStatus.SECURE,
      lastSeen: new Date().toISOString()
    });
    setFormData({ 
      name: '', 
      type: DeviceType.LIGHT, 
      ip: '192.168.1.', 
      vendor: '',
      parentId: routers[0]?.id || ''
    });
    onClose();
  };

  const deviceTypes = Object.values(DeviceType);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      <div className="relative glass w-full max-w-md dark:bg-[#0f172a] bg-white rounded-[2.5rem] border dark:border-white/10 border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 border-b dark:border-white/5 border-slate-100 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 text-xl shadow-[0_0_20px_rgba(34,211,238,0.15)]">
              <i className="fas fa-microchip"></i>
            </div>
            <div>
              <h2 className="text-xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Provision Node</h2>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Manual Mesh Entry</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Device Name</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/40 transition-all text-sm"
                placeholder="e.g. Living Room Camera"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Uplink Gateway (Router)</label>
              <div className="relative">
                <select 
                  required
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  className="w-full dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/40 transition-all text-sm appearance-none"
                >
                  <option value="" disabled>Select Router</option>
                  {routers.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.ip})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <i className="fas fa-chevron-down text-[10px]"></i>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Device Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as DeviceType})}
                  className="w-full dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/40 transition-all text-sm appearance-none"
                >
                  {deviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">IP Address</label>
                <input 
                  required
                  type="text"
                  value={formData.ip}
                  onChange={(e) => setFormData({...formData, ip: e.target.value})}
                  className="w-full dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/40 transition-all text-sm font-mono"
                  placeholder="192.168.1.X"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Vendor / Brand</label>
              <input 
                required
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                className="w-full dark:bg-slate-950/50 bg-slate-50 border dark:border-white/5 border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-cyan-500/40 transition-all text-sm"
                placeholder="e.g. Philips Hue, TP-Link"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 dark:bg-white/5 bg-slate-100 dark:text-slate-400 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:dark:bg-white/10 hover:bg-slate-200 transition-all"
            >
              Abort
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-500/10 transition-all"
            >
              Verify & Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeviceModal;
