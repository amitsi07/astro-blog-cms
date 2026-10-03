import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, pass: string) => boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = onLogin(username.trim(), password.trim());
      setIsLoading(false);
      if (!success) {
        setError('Invalid username or password. Default is "admin" / "admin123"');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#07080c] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-xl shadow-violet-900/40 mb-2 ring-4 ring-violet-500/20">
            <span className="font-display font-black text-2xl">W</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            WordPress Admin CMS
          </h1>
          <p className="text-xs text-slate-400">
            PromptPlum.astro · Secure Editorial & Publishing Studio
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#11131c] border border-[#23273a] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-md">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full bg-[#090a10] border border-[#24283b] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-mono transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#090a10] border border-[#24283b] rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#090a10] border-[#24283b] text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-400">Remember Me</span>
              </label>

              <span className="text-[11px] text-violet-400 font-mono">
                Role: Administrator
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-violet-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Log In to WP Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Credentials Notice Box */}
          <div className="pt-3 border-t border-[#1e2233] space-y-2">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#0a0b12] border border-[#1e2233] text-[11px] text-slate-400">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block mb-0.5">Default Admin Credentials:</span>
                <p className="font-mono text-violet-300">
                  User: <span className="text-white font-bold">admin</span> &nbsp;|&nbsp; Pass: <span className="text-white font-bold">admin123</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  You can change your password anytime inside WP Admin Settings.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Back to Live Site Link */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>&larr; Back to PromptPlum Frontend Site</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
