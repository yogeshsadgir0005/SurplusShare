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
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const inputClasses = "w-full bg-[#f4f7f4] border-2 border-transparent rounded-full px-5 py-3.5 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all placeholder:text-[#82a38e] shadow-inner shadow-black/[0.01]";
  const labelClasses = "block text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider pl-1 mb-1.5";

  return (
    <div className="flex min-h-screen font-sans selection:bg-[#ecfdf5] selection:text-[#059669]">
    
      {/* Left Sidebar Branding (Visible on Desktop) */}
      <aside className="hidden lg:flex flex-col justify-center w-[400px] xl:w-[480px] bg-[#064e3b] p-12 relative overflow-hidden shrink-0">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#10b981] rounded-full blur-[80px] opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#059669] rounded-full blur-[80px] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-center">
          <div className="flex items-center gap-3 mb-16 cursor-pointer group w-max" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-[#ecfdf5] text-[#10b981] rounded-full flex items-center justify-center shadow-sm">
                <HeroIcon />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">SurplusShare</span>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-tight">Welcome back.</h2>
            <p className="text-[#82a38e] text-[15px] font-medium leading-relaxed max-w-sm">Sign in to your account to manage surplus drops, claim food, and track your organizational impact.</p>
          </div>
        </div>
      </aside>

      {/* Right Content Form Area */}
      <div className="flex-1 bg-[#f4f7f4] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        
        {/* Mobile Header & Logo */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center lg:hidden mb-8">
          <div className="w-14 h-14 bg-[#ecfdf5] text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <HeroIcon />
          </div>
          <h2 className="text-[28px] font-extrabold text-[#064e3b] tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-[14.5px] font-medium text-[#4a6b56]">
            Or{' '}
            <Link to={activeTab === 'NGO' ? '/signup/ngo' : '/signup/supplier'} className="font-extrabold text-[#10b981] hover:text-[#059669] transition-colors ml-1">
              register a new {activeTab === 'NGO' ? 'NGO' : 'Donor'} account
            </Link>
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
          
          {/* Desktop Link (Hidden on Mobile) */}
          <div className="hidden lg:block text-right mb-6">
            <p className="text-[13px] text-[#82a38e] font-extrabold uppercase tracking-wider">
              New to SurplusShare?{' '}
              <Link to={activeTab === 'NGO' ? '/signup/ngo' : '/signup/supplier'} className="text-[#10b981] hover:text-[#059669] transition-colors ml-1">
                Create an account
              </Link>
            </p>
          </div>

          <div className="bg-white py-8 sm:py-10 px-6 sm:px-10 shadow-[0_15px_40px_rgb(0,0,0,0.04)] rounded-[2.5rem] border border-[#e8f0eb] transition-all duration-500">
            
            {/* Organic Segmented Control for Role */}
            <div className="flex bg-[#f4f7f4] p-1.5 rounded-full mb-8 border border-[#e8f0eb]">
              {['NGO', 'Supplier'].map(tab => (
                <button 
                  key={tab} 
                  type="button"
                  onClick={() => setActiveTab(tab)} 
                  className={`flex-1 py-3 text-[14px] font-extrabold rounded-full transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-white text-[#064e3b] shadow-[0_2px_8px_rgba(0,0,0,0.04)]' 
                      : 'text-[#82a38e] hover:text-[#4a6b56]'
                  }`}
                >
                  {tab === 'Supplier' ? 'Food Donor' : 'NGO Partner'}
                </button>
              ))}
            </div>

            <form onSubmit={executeAuth} className="space-y-6">
              <div>
                 <label className={labelClasses}>Email address</label>
                 <input 
                   type="email" 
                   name="email" 
                   required 
                   value={credentials.email}
                   onChange={updateCredentials} 
                   className={inputClasses} 
                   placeholder="name@company.com"
                 />
              </div>
              
              <div>
                 <label className={labelClasses}>Password</label>
                 <input 
                   type="password" 
                   name="password" 
                   required 
                   value={credentials.password}
                   onChange={updateCredentials} 
                   className={inputClasses} 
                   placeholder="••••••••"
                 />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isAuthenticating} 
                  className={`w-full py-4 flex justify-center items-center gap-2 rounded-full text-[15px] font-extrabold transition-all duration-300 ${
                    isAuthenticating ? 'bg-[#10b981]/70 text-white cursor-not-allowed' : 'bg-[#10b981] text-white hover:bg-[#059669] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(16,185,129,0.3)]'
                  }`}
                >
                   {isAuthenticating ? (
                     <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     'Secure Sign In'
                   )}
                </button>
              </div>
            </form>

            {/* Social Login Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e8f0eb]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#82a38e] font-extrabold uppercase tracking-wider text-[11px]">Or continue with</span>
                </div>
              </div>

              <div className="mt-8">
                <div className="w-full overflow-hidden rounded-[1.5rem] border border-[#e8f0eb] hover:border-[#d1fae5] transition-colors bg-[#f4f7f4]">
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

          {/* Clean Footer Details */}
          <div className="mt-8 text-center">
             <p className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-widest">© 2026 SurplusShare Global</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;