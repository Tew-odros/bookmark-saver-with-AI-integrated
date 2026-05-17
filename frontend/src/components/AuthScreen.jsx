import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Shield, Mail, Loader2 } from 'lucide-react';

const API_BASE_URL = '/api/auth';

const AuthScreen = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email.includes('@') || password.length < 6) {
      setError('Please provide a valid email and a password of at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-bg">
      {/* Left Column: Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-left duration-700">
          {/* Logo - Matching Home Page Branding */}
          <div className="flex items-center gap-3 mb-10 group cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-2xl shadow-inner group-hover:bg-brand-accent/20 transition-colors" aria-hidden="true">🔖</div>
            <span className="text-2xl font-black tracking-tighter gradient-text">BookmarkVault</span>
          </div>

          <h1 className="text-4xl font-black text-brand-text mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-brand-muted mb-10">
            {isLogin 
              ? 'Sign in to access your saved links.' 
              : 'Start organizing your digital life today.'}
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-text flex items-center gap-2">
                <Mail size={14} className="text-brand-muted" />
                Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required 
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-text flex items-center gap-2">
                <Lock size={14} className="text-brand-muted" />
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
                className="input-field"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-4 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </span>
              ) : (isLogin ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="mt-8 text-center text-brand-muted text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-brand-text font-bold hover:underline"
            >
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Branding Section */}
      <div className="hidden md:flex w-1/2 bg-brand-surface items-center justify-center p-12 lg:p-24 relative overflow-hidden">
        {/* Subtle Background Pattern/Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="max-w-lg text-center animate-in fade-in slide-in-from-right duration-1000">
          <h2 className="text-5xl lg:text-6xl font-black text-brand-text mb-8 leading-tight">
            {isLogin 
              ? 'Your digital memory, organized.' 
              : 'Secure, fast, and beautiful.'}
          </h2>
          <p className="text-xl text-brand-muted leading-relaxed">
            {isLogin
              ? 'Save articles, tools, and resources securely in your personal vault.'
              : 'Join thousands of power users who trust BookmarkVault to organize their web.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
