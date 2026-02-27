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
      toast.success('Authentication Successful');
      navigate(data.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard');
    } catch (err) {
      toast.error('Invalid Credentials. Please try again.');
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
      toast.success('Google Authentication Successful');
      navigate(data.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication Failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

    const HeroIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (

    < div className="flex item-center ">
    
    
                      <aside className="hidden flex items-center justify-center lg:flex w-[400px] xl:w-[480px] bg-slate-900 flex-col p-12 relative overflow-hidden shrink-0 border-r border-slate-800">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-16 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
        <HeroIcon />            </div>
            <span className="text-xl font-bold tracking-tight text-white">SurplusShare</span>
          </div>
          
          <div className="space-y-6 mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">Start sharing your surplus food.</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">Create a verified donor account to connect with local NGOs, schedule daily drops, and track your organization's impact.</p>
          </div>
        </div>
      </aside>


    <div className=" min-h-screen bg-slate-50 flex flex-col w-full justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100">
      {/* Clean Header & Logo */}
      <div className="sm:mx-auto  sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-500">
          Or{' '}
          <Link to={activeTab === 'NGO' ? '/signup/ngo' : '/signup/supplier'} className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            register a new {activeTab === 'NGO' ? 'NGO' : 'Donor'} account
          </Link>
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          


          {/* Professional Segmented Control for Role */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-8 border border-slate-200/60">
            {['NGO', 'Supplier'].map(tab => (
              <button 
                key={tab} 
                type="button"
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'Supplier' ? 'Food Donor' : 'NGO Partner'}
              </button>
            ))}
          </div>

          <form onSubmit={executeAuth} className="space-y-5">
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
               <input 
                 type="email" 
                 name="email" 
                 required 
                 onChange={updateCredentials} 
                 className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400" 
                 placeholder="name@company.com"
               />
            </div>
            
            <div>
               <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
               <input 
                 type="password" 
                 name="password" 
                 required 
                 onChange={updateCredentials} 
                 className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400" 
                 placeholder="••••••••"
               />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isAuthenticating} 
                className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all ${
                  isAuthenticating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                }`}
              >
                 {isAuthenticating ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                   'Sign in'
                 )}
              </button>
            </div>
          </form>

          {/* Social Login Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="w-full overflow-hidden rounded-lg border border-slate-300 hover:border-slate-400 transition-colors bg-white">
                 <GoogleLogin 
                   onSuccess={handleGoogleAuthSuccess} 
                   onError={() => toast.error('Google Authentication Cancelled')} 
                   theme="outline" 
                   shape="rectangular" 
                   size="large" 
                   text="continue_with"
                   width="100%"
                 />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Clean Footer Details */}
      <div className="mt-8 text-center">
         <p className="text-xs text-slate-500 font-medium">© 2026 SurplusShare Global. Secure & Protected.</p>
      </div>
      
    </div>

    
    </div>

  );
};

export default Login;