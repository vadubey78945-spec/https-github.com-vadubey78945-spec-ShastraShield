
import React, { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAttackActive: boolean;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onAddDeviceClick: () => void;
  user: { fullName: string; profileImage?: string } | null;
  deviceCount: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isAttackActive, 
  onSettingsClick, 
  onProfileClick, 
  onLogout,
  onAddDeviceClick,
  user, 
  deviceCount 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Safety Hub', icon: 'fa-house-shield' },
    { id: 'intelligence', label: 'Neural Hub', icon: 'fa-brain' },
    { id: 'devices', label: 'IoT Inventory', icon: 'fa-microchip' },
    { id: 'firewall', label: 'Adaptive Firewall', icon: 'fa-building-shield' },
    { id: 'deception', label: 'Deception Ops', icon: 'fa-ghost' },
    { id: 'mitigation', label: 'Mitigation Center', icon: 'fa-hand-holding-shield' },
    { id: 'analytics', label: 'Expert Analytics', icon: 'fa-shield-halved' },
    { id: 'reports', label: 'Security Reports', icon: 'fa-file-shield' },
  ];

  return (
    <div className="flex h-screen w-full dark:bg-[#020617] bg-slate-50 text-slate-200 dark:text-slate-200 overflow-hidden transition-colors duration-500">
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-72'
        } glass dark:bg-slate-950/60 bg-white/80 border-r border-slate-200 dark:border-white/10 flex flex-col z-20 transition-all duration-300 ease-in-out relative`}
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-8 w-8 h-8 bg-slate-800 dark:bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-400 transition-colors z-30 shadow-lg"
        >
          <i className={`fas ${isCollapsed ? 'fa-bars' : 'fa-chevron-left'} text-xs`}></i>
        </button>

        <div className={`p-6 mb-4 transition-opacity duration-300 ${isCollapsed ? 'px-4' : 'px-6'}`}>
          <div className="flex items-center gap-3">
            <div className="min-w-[40px] w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-transform hover:rotate-6">
              <i className="fas fa-shield-virus text-white text-xl"></i>
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="font-black text-xl tracking-tighter neon-text-orange dark:text-orange-400 text-slate-900 leading-none uppercase">ShastraShield</h1>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-sm'
                  : 'hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:scale-[1.02]'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? tab.label : ''}
            >
              <i className={`fas ${tab.icon} w-5 text-center`}></i>
              {!isCollapsed && (
                <span className="font-bold text-sm animate-in fade-in slide-in-from-left-1 duration-300">{tab.label}</span>
              )}
            </button>
          ))}
          
          {!isCollapsed && (
            <div className="mt-8 px-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div 
                onClick={() => setActiveTab('devices')}
                className="p-4 rounded-2xl dark:bg-slate-900/60 bg-slate-100 border dark:border-white/5 border-slate-200 cursor-pointer hover:border-orange-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mesh Health</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-orange-400 animate-ping"></div>
                    <div className="w-1 h-1 rounded-full bg-orange-400"></div>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black dark:text-white text-slate-900 leading-none">{deviceCount}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">Nodes</span>
                  </div>
                  <i className="fas fa-radar text-orange-500/30 text-2xl group-hover:text-orange-400/50 transition-colors"></i>
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button 
            onClick={onLogout}
            className={`w-full group flex items-center gap-3 p-3 rounded-2xl dark:bg-rose-500/5 bg-rose-50 border border-transparent dark:hover:bg-rose-500/10 hover:bg-rose-100 transition-all dark:hover:border-rose-500/30 hover:border-rose-500/20 shadow-sm ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="relative min-w-[32px]">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-orange-500/50 grayscale group-hover:grayscale-0 transition-all" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 group-hover:text-rose-400 transition-colors">
                  <i className="fas fa-power-off text-xs"></i>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden text-left animate-in fade-in slide-in-from-left-1 duration-300">
                <p className="text-sm font-black truncate text-slate-800 dark:text-slate-100 group-hover:text-rose-500 transition-colors uppercase tracking-tight">
                  Logout
                </p>
                <p className="text-[8px] text-slate-500 truncate uppercase font-mono tracking-tighter">
                  End Admin Session
                </p>
              </div>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 glass dark:bg-slate-950/30 bg-white/80 border-b border-slate-200 dark:border-white/5 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAttackActive ? 'bg-rose-500 pulse-red' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isAttackActive ? 'Defensive Matrix Active' : 'System Healthy'}
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slate-900/50 border border-white/5">
               <i className="fas fa-clock text-orange-500 text-[10px]"></i>
               <span className="text-[11px] font-mono font-bold text-white tracking-widest uppercase">
                  {currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
               </span>
               <span className="text-[9px] font-mono text-slate-500 uppercase ml-2 border-l border-white/10 pl-2">
                  {currentTime.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold leading-tight">Shield Status</span>
                <span className="text-xs text-orange-600 dark:text-orange-400 font-bold leading-tight uppercase">Armed & Ready</span>
             </div>
             <button onClick={onSettingsClick} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-orange-500 hover:border-orange-500/50 transition-all active:scale-90">
               <i className="fas fa-cog"></i>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">{children}</div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -z-10"></div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
