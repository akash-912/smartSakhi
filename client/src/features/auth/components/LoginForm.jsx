import { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { supabase } from '../../../lib/supabase'; 
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Label } from '../../../components/ui/Label.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/Select.jsx';
import { useBranches } from '../../syllabus/hooks/useBranches';
import { GalleryVerticalEnd, Sparkles, Loader2 } from 'lucide-react';

export function LoginPage() {
  const location = useLocation();
  const [mode, setMode] = useState('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('1');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const { logIn, signUp } = useAuth();
  const { branches } = useBranches();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password', 
      });
      if (error) throw error;
      setSuccessMsg('Check your email for the password reset link!');
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg(''); 
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await logIn(email, password);
        navigate('/dashboard'); 
      } else {
        const data = await signUp(email, password, name, branch, semester);
        
        if (data?.user && !data?.session) {
          setSuccessMsg('Account created! Please check your college email to verify your account.');
          setMode('login');
          setPassword('');  
        } else {
          navigate('/dashboard'); 
        }
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "bg-[#0a0a0a] border-zinc-800 text-zinc-200 focus:border-teal-500/50 rounded-xl px-4 h-11 w-full outline-none transition-colors";
  const labelClass = "block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        <div className="hidden md:flex flex-col justify-center pr-8">
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <GalleryVerticalEnd size={32} className="text-zinc-100" strokeWidth={1.5} />
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
              smartSakhi
            </span>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 mb-6 text-xs font-medium text-zinc-300 w-fit">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Welcome to the workspace</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
            Track your academic progress. <br/>
            <span className="text-zinc-500">Protect your peace.</span>
          </h1>
          
          <p className="text-lg text-zinc-400 leading-relaxed">
            Access your exact syllabus, break down complex subjects into daily tasks, and get instant feedback from your AI Tutor.
          </p>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative">
          
          <div className="md:hidden flex items-center justify-center gap-2 mb-8" onClick={() => navigate('/')}>
            <GalleryVerticalEnd size={24} className="text-zinc-100" strokeWidth={1.5} />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
              smartSakhi
            </span>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'signup' && 'Create your account'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-sm text-zinc-400">
                {mode === 'login' && 'Sign in to access your dashboard.'}
                {mode === 'signup' && 'Join the ultimate engineering workspace.'}
                {mode === 'forgot' && 'Enter your email to receive a secure link.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">
                {successMsg}
              </div>
            )}

            {mode === 'forgot' ? (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <Label htmlFor="reset-email" className={labelClass}>Email Address</Label>
                  <Input id="reset-email" type="email" placeholder="student@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                </div>
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-teal-400 to-emerald-600 hover:from-teal-500 hover:to-emerald-700 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Reset Link'}
                </Button>
                <button type="button" onClick={() => { setMode('login'); setSuccessMsg(''); setErrorMsg(''); }} className="w-full text-sm font-semibold text-zinc-500 hover:text-white transition-colors mt-2">
                  Back to Sign In
                </button>
              </form>
            ) : (
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div>
                      <Label htmlFor="name" className={labelClass}>Full Name</Label>
                      <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className={labelClass}>Branch</Label>
                        <Select value={branch} onValueChange={setBranch} required>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                            {branches.map((b) => (
                              <SelectItem key={b.id} value={b.name} className="hover:bg-zinc-800 cursor-pointer">{b.short_code || b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className={labelClass}>Semester</Label>
                        <Select value={semester} onValueChange={setSemester} required>
                          <SelectTrigger className={inputClass}><SelectValue placeholder="Sem" /></SelectTrigger>
                          <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-200">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <SelectItem key={s} value={s.toString()} className="hover:bg-zinc-800 cursor-pointer">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className={labelClass}>College Email</Label>
                  <Input id="email" type="email" placeholder="student@nitkkr.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required pattern="^[0-9]+@nitkkr\.ac\.in$" title="Please enter a valid NIT Kurukshetra student email" className={inputClass} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="password" className={`${labelClass} mb-0`}>Password</Label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-teal-500 hover:text-teal-400 transition-colors">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
                </div>

                <Button type="submit" className="w-full h-12 mt-2 bg-gradient-to-r from-teal-400 to-emerald-600 hover:from-teal-500 hover:to-emerald-700 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-2" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                </Button>
              </form>
            )}

            {mode !== 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMsg(''); }}
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  {mode === 'login' ? (
                    <>Don't have an account? <span className="text-teal-500 font-bold">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="text-teal-500 font-bold">Sign in</span></>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}