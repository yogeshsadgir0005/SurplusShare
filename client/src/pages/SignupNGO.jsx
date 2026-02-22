import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';

// Helper components moved outside to prevent focus loss during typing
const ProgressMarker = ({ step, label, active }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all duration-500 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-100 text-slate-400'}`}>{step}</div>
    <div className="flex flex-col">
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</span>
      {active && <div className="h-0.5 bg-indigo-600 w-full mt-1 animate-in slide-in-from-left duration-700"></div>}
    </div>
  </div>
);

const InputField = ({ label, name, type = "text", required = true, placeholder, icon, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon}/></svg>
      {label}
    </label>
    <input type={type} name={name} required={required} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"/>
  </div>
);

const SignupNGO = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formState, setFormState] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', mission: '', website: '', mobile: '', address: '', city: '', district: '', state: ''
  });

  const { states, districts } = useLocationAPI(formState.state);

  const syncInput = (e) => {
    const { name, value } = e.target;
    if (name === 'state') setFormState(prev => ({ ...prev, state: value, district: '', city: '' }));
    else if (name === 'district') setFormState(prev => ({ ...prev, district: value, city: '' }));
    else setFormState(prev => ({ ...prev, [name]: value }));
  };

  const advanceStage = (e) => {
    e.preventDefault();
    if (formState.password !== formState.confirmPassword) return toast.error('Passwords do not match');
    if (formState.password.length < 8) return toast.error('Minimum 8 characters required');
    setCurrentStep(2);
  };

  const initializeGoogleBridge = (response) => {
    setGoogleCredential(response.credential);
    toast.success('Google Sign-In Successful');
    setCurrentStep(2);
  };

  const finalizeOnboarding = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let sessionData;
      const attributes = {
        name: formState.name, mission: formState.mission, website: formState.website,
        mobile: formState.mobile, address: formState.address, city: formState.city, 
        district: formState.district, state: formState.state
      };
      if (googleCredential) {
        const res = await api.post('/auth/google', { token: googleCredential, role: 'NGO', details: attributes });
        sessionData = res.data;
      } else {
        const res = await api.post('/auth/register', { email: formState.email, password: formState.password, role: 'NGO', details: attributes });
        sessionData = res.data;
      }
      localStorage.setItem('token', sessionData.token);
      localStorage.setItem('user', JSON.stringify(sessionData));
      toast.success('Account Created Successfully');
      navigate('/ngo/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* Desktop Sidebar: Exactly as original */}
      <aside className="hidden lg:flex w-[450px] bg-slate-900 flex-col p-16 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl"><svg className="w-7 h-7 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">SURPLUS<span className="text-indigo-400">SHARE</span></span>
          </div>
          <div className="space-y-12">
            <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">NGO <br/>Sign Up</h2>
            <div className="space-y-8">
              <ProgressMarker step="01" label="Account Details" active={currentStep === 1} />
              <ProgressMarker step="02" label="Organization Details" active={currentStep === 2} />
            </div>
            <div className="pt-24 border-t border-white/10 mt-24">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Account Type: NGO</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 lg:p-24 bg-slate-50">
        {/* Mobile Logo Header: Visible only on mobile/tablet */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl mb-4" onClick={() => navigate('/')}>
             <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">NGO Sign Up</h2>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-12 lg:p-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-slate-200">
          <div className="mb-10 sm:mb-16 text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4 leading-none">Create Account</h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">Join SurplusShare to easily find and claim nearby food donations.</p>
          </div>

          {currentStep === 1 ? (
            <form onSubmit={advanceStage} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex justify-center mb-6"><div className="w-full shadow-xl shadow-slate-100 rounded-2xl overflow-hidden border border-slate-200"><GoogleLogin onSuccess={initializeGoogleBridge} onError={() => toast.error('Google Sign-In Cancelled')} theme="filled_blue" size="large" width="100%"/></div></div>
              <InputField label="Email Address" name="email" type="email" value={formState.email} onChange={syncInput} placeholder="email@example.com" icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Password" name="password" type="password" value={formState.password} onChange={syncInput} placeholder="••••••••" icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                <InputField label="Confirm Password" name="confirmPassword" type="password" value={formState.confirmPassword} onChange={syncInput} placeholder="••••••••" icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </div>
              <button type="submit" className="w-full py-5 sm:py-6 bg-slate-900 text-white rounded-2xl sm:rounded-[1.5rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Continue</button>
            </form>
          ) : (
            <form onSubmit={finalizeOnboarding} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <InputField label="Organization Name" name="name" value={formState.name} onChange={syncInput} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              <InputField label="Street Address" name="address" value={formState.address} onChange={syncInput} icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              
              <div className="grid grid-cols-1 gap-4 border p-5 sm:p-6 rounded-[2rem] border-slate-200 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                    <select name="state" required value={formState.state} onChange={syncInput} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none cursor-pointer">
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                    <select name="district" required value={formState.district} onChange={syncInput} disabled={!formState.state} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none disabled:opacity-40 cursor-pointer">
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Town</label>
                  <input type="text" name="city" required value={formState.city} onChange={syncInput} placeholder="Specific city..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none"/>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField label="Mobile Number" name="mobile" type="tel" value={formState.mobile} onChange={syncInput} icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                <InputField label="Website" name="website" type="url" required={false} value={formState.website} onChange={syncInput} icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NGO Mission</label>
                <textarea name="mission" rows="2" required value={formState.mission} onChange={syncInput} placeholder="Tell us about your organization..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none"/>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 py-4 sm:py-5 border-2 border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 active:scale-95 transition-all">Back</button>
                <button type="submit" disabled={isProcessing} className="flex-[2] py-4 sm:py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all">
                  {isProcessing ? 'Processing...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default SignupNGO;