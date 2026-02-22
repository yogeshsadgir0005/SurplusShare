import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';

// Helper component moved outside
const InputField = ({ label, name, type = "text", required = true, icon, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
      <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon}/></svg>
      {label}
    </label>
    <input 
      type={type} name={name} required={required} 
      value={value} onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300"
    />
  </div>
);

const SignupSupplier = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(1);
  const [googleToken, setGoogleToken] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [supplierState, setSupplierState] = useState({
    email: '', password: '', confirmPassword: '',
    businessType: 'Restaurant', legalName: '', address: '', city: '', district: '', state: '', website: '', contactNumber: ''
  });

  const { states, districts } = useLocationAPI(supplierState.state);

  const handleUpdate = (e) => {
    const { name, value } = e.target;
    if (name === 'state') setSupplierState(prev => ({ ...prev, state: value, district: '', city: '' }));
    else if (name === 'district') setSupplierState(prev => ({ ...prev, district: value, city: '' }));
    else setSupplierState(prev => ({ ...prev, [name]: value }));
  };

  const proceedToDetails = (e) => {
    e.preventDefault();
    if (supplierState.password !== supplierState.confirmPassword) return toast.error('Passwords do not match');
    if (supplierState.password.length < 8) return toast.error('Minimum 8 characters required');
    setActiveStage(2);
  };

  const gAuthCapture = (res) => {
    setGoogleToken(res.credential);
    toast.success('Google Sign-In Successful');
    setActiveStage(2);
  };

  const commitRegistration = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
      let data;
      const details = {
        businessType: supplierState.businessType, legalName: supplierState.legalName, address: supplierState.address,
        city: supplierState.city, district: supplierState.district, state: supplierState.state, website: supplierState.website, contactNumber: supplierState.contactNumber
      };
      if (googleToken) {
        const res = await api.post('/auth/google', { token: googleToken, role: 'Supplier', details });
        data = res.data;
      } else {
        const res = await api.post('/auth/register', { email: supplierState.email, password: supplierState.password, role: 'Supplier', details });
        data = res.data;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Account Created Successfully');
      navigate('/supplier/dashboard');
    } catch (error) {
      toast.error('Registration Failed');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex font-sans selection:bg-emerald-100 overflow-x-hidden">
      {/* Desktop Sidebar: Exactly as original */}
      <aside className="hidden lg:flex w-[500px] bg-slate-900 flex-col p-16 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent"></div>
           <div className="absolute bottom-0 right-0 p-10 opacity-5"><svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>
        </div>
        <div className="relative z-10 flex flex-col h-full">
           <div className="flex items-center gap-3 mb-32 group cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
               <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
             </div>
             <span className="text-2xl font-black tracking-tighter text-white uppercase">SURPLUS<span className="text-emerald-400">SHARE</span></span>
           </div>
           <div className="space-y-6">
              <h2 className="text-6xl font-black text-white leading-none tracking-tighter">Food Donor <br/>Sign Up.</h2>
              <p className="text-slate-400 text-lg font-bold leading-relaxed max-w-xs">Create an account to start sharing your extra food with local NGOs.</p>
           </div>
           <div className="mt-auto space-y-4">
              <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${activeStage === 1 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div><span className={`text-[10px] font-black uppercase tracking-widest ${activeStage === 1 ? 'text-white' : 'text-slate-500'}`}>Account Details</span></div>
              <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${activeStage === 2 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div><span className={`text-[10px] font-black uppercase tracking-widest ${activeStage === 2 ? 'text-white' : 'text-slate-500'}`}>Business Details</span></div>
           </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 lg:p-24 bg-slate-50">
        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl mb-4" onClick={() => navigate('/')}>
             <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Supplier Sign Up</h2>
        </div>

        <div className="w-full max-w-3xl bg-white rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 lg:p-24 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.06)] border border-slate-200">
           <header className="mb-10 sm:mb-16 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4 leading-none">Create Account</h1>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                 <span>SurplusShare</span>
                 <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                 <span className="text-emerald-600">Secure Signup</span>
              </div>
           </header>

           {activeStage === 1 ? (
             <form onSubmit={proceedToDetails} className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-8 duration-700">
               <div className="flex justify-center mb-6"><div className="w-full shadow-2xl shadow-slate-100 rounded-3xl overflow-hidden border border-slate-200"><GoogleLogin onSuccess={gAuthCapture} onError={() => toast.error('Google Sign-In Cancelled')} theme="filled_blue" shape="pill" size="large" width="100%"/></div></div>
               <div className="flex items-center gap-4 sm:gap-10 my-8 sm:my-16">
                 <div className="h-px bg-slate-100 flex-1"></div>
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] whitespace-nowrap text-center">Or use email</span>
                 <div className="h-px bg-slate-100 flex-1"></div>
               </div>
               <InputField label="Email Address" name="email" type="email" placeholder="email@example.com" value={supplierState.email} onChange={handleUpdate} icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                 <InputField label="Password" name="password" type="password" placeholder="••••••••" value={supplierState.password} onChange={handleUpdate} icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                 <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" value={supplierState.confirmPassword} onChange={handleUpdate} icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </div>
               <button type="submit" className="w-full py-5 sm:py-6 bg-slate-900 text-white rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3 mt-8">
                 Continue
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
               </button>
             </form>
           ) : (
             <form onSubmit={commitRegistration} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Type</label>
                    <select name="businessType" value={supplierState.businessType} onChange={handleUpdate} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyBmaWxsPSdibGFjaycgdmlld0JveD0nMCAwIDIwIDIwJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxwYXRoIGQ9J003IDdsMyAzIDMtMycgLz48L3N2Zz4=')] bg-[length:20px_20px] bg-[right_15px_center] bg-no-repeat">
                       <option>Restaurant</option><option>Corporate Cafeteria</option><option>Event Organizer</option><option>Wholesaler</option>
                    </select>
                  </div>
                  <InputField label="Business Name" name="legalName" value={supplierState.legalName} onChange={handleUpdate} icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
               </div>
               
               <InputField label="Street Address" name="address" value={supplierState.address} onChange={handleUpdate} icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
               
               <div className="grid grid-cols-1 gap-4 border p-5 sm:p-6 rounded-[2rem] border-slate-200 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                      <select name="state" required value={supplierState.state} onChange={handleUpdate} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none cursor-pointer">
                         <option value="">Select State</option>
                         {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                      <select name="district" required value={supplierState.district} onChange={handleUpdate} disabled={!supplierState.state} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none disabled:opacity-40 cursor-pointer">
                         <option value="">Select District</option>
                         {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City / Town</label>
                    <input type="text" name="city" required value={supplierState.city} onChange={handleUpdate} placeholder="Specific city..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none"/>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <InputField label="Mobile Number" name="contactNumber" type="tel" value={supplierState.contactNumber} onChange={handleUpdate} icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  <InputField label="Website" name="website" type="url" required={false} value={supplierState.website} onChange={handleUpdate} icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
               </div>

               <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-8 sm:pt-12">
                  <button type="button" onClick={() => setActiveStage(1)} className="flex-1 py-4 sm:py-6 border-2 border-slate-100 text-slate-400 rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-50 active:scale-95 transition-all">Back</button>
                  <button type="submit" disabled={isDeploying} className="flex-[2] py-4 sm:py-6 bg-emerald-600 text-white rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {isDeploying ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Create Account'}
                  </button>
               </div>
             </form>
           )}
        </div>
      </main>
    </div>
  );
};

export default SignupSupplier;