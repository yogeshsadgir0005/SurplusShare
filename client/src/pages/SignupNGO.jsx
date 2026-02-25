import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({ click(e) { setPosition(e.latlng); } });
  return position ? (
    <Marker position={position} icon={customIcon} draggable={true} eventHandlers={{ dragend: (e) => setPosition(e.target.getLatLng()) }} />
  ) : null;
};

// Clean B2B Step Indicator
const ProgressMarker = ({ step, label, active, completed }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
      active ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' 
      : completed ? 'bg-indigo-100 text-indigo-600' 
      : 'bg-slate-800 text-slate-400'
    }`}>
      {completed ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg> : step}
    </div>
    <span className={`text-sm font-semibold transition-colors ${active || completed ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </div>
);

// Clean B2B Input Wrapper
const InputField = ({ label, name, type = "text", required = true, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <input 
      type={type} name={name} required={required} value={value} onChange={onChange} placeholder={placeholder} 
      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
    />
  </div>
);

const SignupNGO = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [mapPosition, setMapPosition] = useState(null);

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
    toast.success('Google Authentication Successful');
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
        district: formState.district, state: formState.state,
        lat: mapPosition?.lat, lng: mapPosition?.lng 
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
      toast.success('Workspace Created Successfully');
      navigate('/ngo/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-indigo-100">
      
      {/* SaaS Sidebar */}
      <aside className="hidden lg:flex w-[400px] xl:w-[480px] bg-slate-900 flex-col p-12 relative overflow-hidden shrink-0 border-r border-slate-800">
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SurplusShare</span>
          </div>
          
          <div className="space-y-6 mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">Partner with us to end hunger.</h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">Join the centralized network to efficiently locate, claim, and coordinate surplus food pickups in your operational area.</p>
          </div>

          <div className="space-y-8 mt-auto">
            <ProgressMarker step="1" label="Account Configuration" active={currentStep === 1} completed={currentStep > 1} />
            <div className="w-0.5 h-8 bg-slate-800 ml-4 -my-4"></div>
            <ProgressMarker step="2" label="Organization Profile" active={currentStep === 2} completed={false} />
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col items-center mb-8 text-center w-full">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-3 shadow-sm" onClick={() => navigate('/')}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">NGO Partner Application</h2>
        </div>

        <div className="w-full max-w-[600px] bg-white rounded-xl sm:rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              {currentStep === 1 ? 'Create your account' : 'Organization Details'}
            </h1>
            <p className="text-sm text-slate-500">
              {currentStep === 1 ? 'Start by setting up your login credentials.' : 'Complete your profile to gain network access.'}
            </p>
          </header>

          {currentStep === 1 ? (
            <form onSubmit={advanceStage} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="w-full rounded-lg border border-slate-300 hover:border-slate-400 transition-colors bg-white overflow-hidden shadow-sm">
                <GoogleLogin onSuccess={initializeGoogleBridge} onError={() => toast.error('Google Authentication Cancelled')} theme="outline" size="large" text="continue_with" width="100%"/>
              </div>
              
              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Or register with email</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <InputField label="Email Address" name="email" type="email" value={formState.email} onChange={syncInput} placeholder="name@organization.org" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField label="Password" name="password" type="password" value={formState.password} onChange={syncInput} placeholder="••••••••" />
                <InputField label="Confirm Password" name="confirmPassword" type="password" value={formState.confirmPassword} onChange={syncInput} placeholder="••••••••" />
              </div>
              
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  Continue to Profile
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
              </div>

              <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Sign in here</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={finalizeOnboarding} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <InputField label="Organization Name" name="name" value={formState.name} onChange={syncInput} placeholder="Legal NGO Name" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField label="Mobile Number" name="mobile" type="tel" value={formState.mobile} onChange={syncInput} placeholder="+91 98765 43210" />
                <InputField label="Website (Optional)" name="website" type="url" required={false} value={formState.website} onChange={syncInput} placeholder="https://www.example.org" />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Location Configuration</h4>
                <div className="space-y-5">
                  <InputField label="Street Address" name="address" value={formState.address} onChange={syncInput} placeholder="HQ or Main Hub Address" />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">State</label>
                      <select name="state" required value={formState.state} onChange={syncInput} className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">District</label>
                      <select name="district" required value={formState.district} onChange={syncInput} disabled={!formState.state} className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium outline-none disabled:opacity-50 cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700">City / Town</label>
                      <input type="text" name="city" required value={formState.city} onChange={syncInput} placeholder="Specific city..." className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"/>
                    </div>
                  </div>

                  {/* Clean Map UI */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-slate-700">HQ Pin Location</label>
                      {!mapPosition ? (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Recommended</span>
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">Saved</span>
                      )}
                    </div>
                    <div className="h-[220px] w-full rounded-lg overflow-hidden border border-slate-300 relative z-10 shadow-sm">
                      <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                      </MapContainer>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      Drag map pin to your exact facility for better matching.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                <label className="block text-sm font-semibold text-slate-700">Mission Statement</label>
                <textarea name="mission" rows="3" required value={formState.mission} onChange={syncInput} placeholder="Briefly describe your organization's core focus..." className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none placeholder:text-slate-400"/>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setCurrentStep(1)} className="w-1/3 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button type="submit" disabled={isProcessing} className={`w-2/3 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${isProcessing ? 'bg-indigo-400 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'}`}>
                  {isProcessing ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Complete Setup'}
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