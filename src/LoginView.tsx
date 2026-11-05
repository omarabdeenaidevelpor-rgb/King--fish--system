import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Mail, Lock, User, Loader2, ArrowRight, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from './lib/utils';

export const LoginView = () => {
  const { i18n } = useTranslation();
  const { login, loginWithCredentials } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const ok = await loginWithCredentials(username.trim(), password);
      if (!ok) {
        setError(i18n.language === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden" dir={i18n.dir()}>
      {/* Dynamic Brand Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/aistudio/file_0000000064608246878eeb8954a49ae3_c40bdb85.png" 
          alt="" 
          className="w-full h-full object-cover opacity-15 grayscale brightness-75 scale-105 blur-[3px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/95 to-[#050D1A]" />
      </div>
      
      <div className="w-full max-w-[480px] relative z-10">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[40px] shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-white/40 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-36 h-36 rounded-3xl flex items-center justify-center p-1 group transition-transform duration-500 hover:scale-105 drop-shadow-[0_15px_30px_rgba(10,25,47,0.25)]">
                <img 
                  src="/assets/aistudio/file_0000000064608246878eeb8954a49ae3_c40bdb85.png" 
                  alt="King Fish Logo" 
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-primary tracking-tight font-display">King Fish</h1>
                <p className="text-accent font-black uppercase tracking-[0.3em] text-[9px]">
                  {i18n.language === 'ar' ? 'بوابة دخول المدير العام' : 'General Manager Portal'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-5">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-[11px] font-bold text-center animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {i18n.language === 'ar' ? 'اسم المستخدم' : 'Username'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-4" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="admin"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-11 text-sm font-semibold text-primary outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {i18n.language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-11 text-sm font-semibold text-primary outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 gold-gradient text-primary rounded-2xl text-xs font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(197,160,89,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{i18n.language === 'ar' ? 'تسجيل الدخول للنظام' : 'Log In to System'}</span>
                    <ArrowRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", i18n.dir() === 'rtl' && "rotate-180 group-hover:-translate-x-1")} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Certifications Banner */}
          <div className="bg-slate-50/80 backdrop-blur-sm border-t border-slate-100 p-5 flex flex-col items-center gap-2">
            <span className="text-[9px] font-black tracking-[0.25em] text-slate-400 uppercase">
              {i18n.language === 'ar' ? 'الاعتمادات وشهادات الجودة الدولية للمصنع' : 'International Factory Accreditations & Standards'}
            </span>
            <div className="w-full bg-white rounded-2xl p-2.5 border border-slate-200/80 shadow-xs flex items-center justify-center hover:shadow-md transition-shadow">
              <img 
                src="/public/assets/aistudio/1793888974992_b4f00f48.jpg" 
                alt="King Fish Certifications: HACCP, Halal, ISO 22000, MSC, FDA, ASC, BRC" 
                className="w-full max-h-16 object-contain filter contrast-105"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-full">HACCP</span>
              <span className="text-[9px] font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-full">HALAL</span>
              <span className="text-[9px] font-bold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-full">ISO 22000</span>
              <span className="text-[9px] font-bold text-sky-700 px-2 py-0.5 bg-sky-50 rounded-full">FDA APPROVED</span>
              <span className="text-[9px] font-bold text-rose-700 px-2 py-0.5 bg-rose-50 rounded-full">BRC QUALITY</span>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-5 flex flex-col items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
            >
              <Languages className="w-4 h-4 text-accent" />
              {i18n.language === 'ar' ? 'Switch to English' : 'تحويل للغة العربية'}
            </button>
            <p className="text-[10px] text-slate-400 font-medium">© 2024 King Fish Port Said · Enterprise Industrial Edition</p>
          </div>
        </div>
      </div>
    </div>
  );
};
