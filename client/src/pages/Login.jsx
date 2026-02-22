import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../services/axios';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('NGO');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const updateCredentials = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const executeAuth = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Login Successful');
      navigate(data.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard');
    } catch (err) {
      toast.error('Invalid Email or Password');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleAuthSuccess = async (response) => {
    setIsAuthenticating(true);
    try {
      const { data } = await api.post('/auth/google', { token: response.credential });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Google Login Successful');
      navigate(data.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login Failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[80%] sm:w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px] sm:blur-[150px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[80%] sm:w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[100px] sm:blur-[150px]"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl border border-white/20">
          
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl rotate-3">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2 leading-none">Welcome Back</h1>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">SurplusShare Platform</p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-slate-100 p-1 sm:p-1.5 rounded-2xl sm:rounded-[1.5rem] mb-8 sm:mb-10">
            {['NGO', 'Supplier'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === tab ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab === 'Supplier' ? 'Restaurant' : tab}
              </button>
            ))}
          </div>

          <form onSubmit={executeAuth} className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5">
               <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
               <input 
                 type="email" 
                 name="email" 
                 required 
                 onChange={updateCredentials} 
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-4 sm:py-5 text-sm font-black outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-300" 
                 placeholder="Enter your email..."
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
               <input 
                 type="password" 
                 name="password" 
                 required 
                 onChange={updateCredentials} 
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-4 sm:py-5 text-sm font-black outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all placeholder:text-slate-300" 
                 placeholder="••••••••"
               />
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating} 
              className="w-full py-5 sm:py-6 bg-slate-900 text-white rounded-2xl sm:rounded-[1.5rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
               {isAuthenticating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Log In'}
            </button>
          </form>

          <div className="mt-10 sm:mt-12 mb-8 sm:mb-10 flex items-center justify-center space-x-6">
            <div className="h-[2px] bg-slate-100 flex-1"></div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Or continue with</span>
            <div className="h-[2px] bg-slate-100 flex-1"></div>
          </div>

          {/* Google Login Container */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="w-full shadow-xl shadow-slate-100 rounded-[1.5rem] sm:rounded-3xl overflow-hidden border border-slate-200">
               <GoogleLogin 
                 onSuccess={handleGoogleAuthSuccess} 
                 onError={() => toast.error('Google Login Cancelled')} 
                 theme="filled_blue" 
                 shape="rectangular" 
                 size="large" 
                 width="100%"
               />
            </div>
          </div>

          <div className="text-center pt-6 sm:pt-8 border-t border-slate-50">
             <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">
               Don't have an account? 
               <Link to={activeTab === 'NGO' ? '/signup/ngo' : '/signup/supplier'} className="text-indigo-600 hover:text-indigo-700 underline decoration-2 underline-offset-4 ml-2">
                 Sign up here
               </Link>
             </p>
          </div>
        </div>
        
        {/* Footer Details */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between items-center px-8 gap-4">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">© 2026 SurplusShare Global</p>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Secure & Protected</p>
        </div>
      </div>
    </div>
  );
};

export default Login;