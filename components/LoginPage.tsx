
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { emailService } from '../services/emailService';

interface LoginPageProps {
  onLogin: (user: { identity: string; fullName: string }) => void;
}

type AuthMode = 'login' | 'register' | 'reset';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [identity, setIdentity] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  
  // Real verification state
  const [resetStep, setResetStep] = useState(1); 
  const [sentCode, setSentCode] = useState('');
  const [inputCode, setInputCode] = useState('');

  // Load vaulted credentials on mount
  useEffect(() => {
    const vaulted = db.credentials.get();
    if (vaulted) {
      setIdentity(vaulted.identity);
      setPassword(vaulted.password);
      
      const user = db.users.find(vaulted.identity);
      if (user) setFullName(user.fullName || '');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const user = db.users.find(identity);
      
      if (!user) {
        setError('Identity not found in secure database');
        return;
      }
      if (user.password !== password) {
        setError('Invalid Secret Key');
        return;
      }
      
      if (rememberMe) {
        db.credentials.set({ identity, password });
      }

      onLogin({ identity, fullName: user.fullName || 'Security Admin' });
    } 
    else if (mode === 'register') {
      if (!fullName) {
        setError('Full Name is required');
        return;
      }
      if (!identity) {
        setError('Email or Mobile number is required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      db.users.save({ identity, password, fullName });
      
      if (rememberMe) {
        db.credentials.set({ identity, password });
      }

      setSuccess('Agent Registered and Credentials Vaulted');
      setTimeout(() => onLogin({ identity, fullName }), 1000);
    }
    else if (mode === 'reset') {
      await handleResetFlow();
    }
  };

  const handleResetFlow = async () => {
    if (resetStep === 1) {
      if (!db.users.find(identity)) {
        setError('Identity not recognized by network controller');
        return;
      }
      
      setIsDispatching(true);
      setError('');
      
      try {
        const result = await emailService.sendVerificationEmail(identity);
        if (result.success) {
          setSentCode(result.code);
          setSuccess(result.message);
          setResetStep(2);
        }
      } catch (err) {
        setError("SMTP Relay Failure. Please check your internet connection.");
      } finally {
        setIsDispatching(false);
      }
    } 
    else if (resetStep === 2) {
      if (inputCode === sentCode) {
        setResetStep(3);
        setSuccess('Identity Verified. Please establish a new secret key.');
        setInputCode('');
      } else {
        setError('Invalid Verification Code. Authentication rejected.');
      }
    } 
    else if (resetStep === 3) {
      if (password.length < 8) {
        setError('New Secret Key must be at least 8 characters');
        return;
      }
      const existingUser = db.users.find(identity);
      db.users.save({ ...existingUser, password });
      
      db.credentials.set(null);
      
      setSuccess('Secret key updated successfully. Tunnel re-established.');
      setTimeout(() => toggleMode('login'), 1500);
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setResetStep(1);
    setInputCode('');
    setSentCode('');
    setIsDispatching(false);
    
    const vaulted = db.credentials.get();
    if (vaulted) {
      setIdentity(vaulted.identity);
      setPassword(vaulted.password);
    } else {
      setPassword('');
      setConfirmPassword('');
    }

    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans text-slate-200">
      <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.05]"></div>

      <div className="relative w-full max-w-md px-6 z-10">
        <div className="glass p-10 rounded-[2.5rem] border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-1000">
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-20 h-20 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)] overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent"></div>
                <i className="fas fa-shield-halved text-orange-400 text-4xl group-hover:scale-110 transition-transform duration-500"></i>
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1 uppercase text-center">
              {mode === 'login' ? 'ShastraShield' : mode === 'register' ? 'Register Agent' : 'Reset Secret'}
            </h1>
            <p className="text-slate-500 text-[10px] font-mono tracking-[0.4em] uppercase text-center">
              {mode === 'reset' ? 'SMTP Verification Required' : 'Autonomous Intelligence'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-300">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                    <i className="fas fa-user-shield text-slate-600 text-sm"></i>
                  </div>
                  <input type="text" placeholder="Enter your name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/40 focus:bg-slate-950/80 transition-all text-sm text-slate-200 placeholder:text-slate-700" />
                </div>
              </div>
            )}

            {(mode !== 'reset' || resetStep === 1) && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest flex justify-between">
                  User Identity
                  {password && mode === 'login' && <span className="text-orange-500 text-[8px] animate-pulse uppercase tracking-widest">Vault Sync Active</span>}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                    <i className="fas fa-at text-slate-600 text-sm"></i>
                  </div>
                  <input type="text" placeholder="Email or Mobile Number" value={identity} onChange={(e) => setIdentity(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/40 focus:bg-slate-950/80 transition-all text-sm text-slate-200 placeholder:text-slate-700" disabled={mode === 'reset' && (resetStep > 1 || isDispatching)} />
                </div>
              </div>
            )}

            {mode === 'reset' && resetStep === 2 && (
              <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Verification Code</label>
                  <span className="text-[8px] text-orange-500 uppercase font-mono tracking-tighter">(Check Browser Console for SMTP Log)</span>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                    <i className="fas fa-envelope-open-text text-slate-600 text-sm"></i>
                  </div>
                  <input 
                    type="text" 
                    placeholder="6-Digit Verification Code" 
                    value={inputCode} 
                    onChange={(e) => setInputCode(e.target.value)} 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-orange-500/40 focus:bg-slate-950/80 transition-all text-sm text-slate-200 placeholder:text-slate-700 font-mono tracking-widest" 
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {(mode !== 'reset' || resetStep === 3) && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">{mode === 'reset' ? 'New Secret Key' : 'Secret Key'}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                    <i className="fas fa-fingerprint text-slate-600 text-sm"></i>
                  </div>
                  <input type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-orange-500/40 focus:bg-slate-950/80 transition-all text-sm text-slate-200 placeholder:text-slate-700" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-orange-400 transition-colors p-1"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i></button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-1.5 animate-in slide-in-from-top-4 duration-500">
                <label className="text-[10px] font-bold uppercase text-slate-500 ml-1 tracking-widest">Confirm Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5"><i className="fas fa-check-circle text-slate-600 text-sm"></i></div>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Verify Secret Key" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-orange-500/40 focus:bg-slate-950/80 transition-all text-sm text-slate-200 placeholder:text-slate-700" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-orange-400 transition-colors p-1"><i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i></button>
                </div>
              </div>
            )}

            {mode !== 'reset' && (
              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="hidden" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-orange-500 border-orange-500' : 'border-slate-700'}`}>
                    {rememberMe && <i className="fas fa-check text-[8px] text-slate-950"></i>}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-tighter">Vault Credentials</span>
                </label>
                {mode === 'login' && (
                  <button type="button" onClick={() => toggleMode('reset')} className="text-[10px] font-bold text-slate-600 hover:text-orange-400 transition-colors tracking-tighter uppercase">Forgot Secret Key?</button>
                )}
              </div>
            )}

            {error && (
              <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                <p className="text-[11px] text-rose-400 font-bold uppercase tracking-tight leading-tight">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-tight leading-tight">{success}</p>
              </div>
            )}

            <button 
              disabled={isDispatching}
              type="submit" 
              className={`group relative w-full h-14 overflow-hidden rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isDispatching ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin"></i>
                    SMTP Tunneling...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Establish Link' : mode === 'register' ? 'Enter Securely' : resetStep === 1 ? 'Dispatch Code' : resetStep === 2 ? 'Verify Identity' : 'Update Secret'}
                    <i className="fas fa-bolt-lightning text-[10px] group-hover:rotate-12 transition-transform"></i>
                  </>
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-orange-500/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <button 
              disabled={isDispatching}
              onClick={() => toggleMode(mode === 'login' ? 'register' : 'login')} 
              className="text-[11px] font-bold text-slate-500 hover:text-white transition-all tracking-widest disabled:opacity-50"
            >
              {mode === 'register' || mode === 'reset' ? (
                <span className="flex items-center justify-center gap-2 uppercase">
                  <i className="fas fa-arrow-left text-[9px]"></i> Back to Access Point
                </span>
              ) : (
                <span className="">
                  New to Shield, <span className="text-orange-400 ml-1 underline underline-offset-4 decoration-orange-400/30">Register →</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
