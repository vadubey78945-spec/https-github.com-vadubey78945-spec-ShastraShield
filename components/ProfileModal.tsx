
import React, { useState, useRef } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { fullName: string; profileImage?: string };
  onUpdate: (updates: { fullName: string; profileImage?: string }) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [previewImage, setPreviewImage] = useState<string | null>(user.profileImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ fullName, profileImage: previewImage || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative glass w-full max-w-lg dark:bg-[#0f172a] bg-white rounded-[2.5rem] border dark:border-white/10 border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex items-center justify-between p-8 border-b dark:border-white/5 border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 text-xl">
              <i className="fas fa-user-circle"></i>
            </div>
            <div>
              <h2 className="text-2xl font-black dark:text-white text-slate-900 tracking-tight uppercase">Agent Profile</h2>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Verified Credentials</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full dark:hover:bg-white/5 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Image Upload Area */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-camera text-slate-400 text-3xl"></i>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-bold uppercase">Update</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            <p className="mt-3 text-[10px] text-slate-500 font-mono uppercase tracking-widest">Biometric Identity Image</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Full Name / Agent Alias</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                  <i className="fas fa-id-card text-slate-600 text-sm"></i>
                </div>
                <input 
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950/50 dark:bg-slate-950/50 bg-slate-50 border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/40 focus:bg-white dark:focus:bg-slate-950/80 transition-all text-sm dark:text-slate-200 text-slate-800"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
            </div>
            
            <div className="p-4 rounded-2xl dark:bg-cyan-500/5 bg-cyan-50 border dark:border-cyan-500/20 border-cyan-100">
               <div className="flex gap-3">
                 <i className="fas fa-info-circle text-cyan-500 mt-0.5"></i>
                 <div>
                   <p className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-widest">Data Privacy Note</p>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                     Your agent information is stored locally within this terminal's secure sandbox. No PII is transmitted to central servers.
                   </p>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
             <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-200 dark:border-white/10 dark:text-white text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              Update Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
