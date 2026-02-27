import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

  const HeroIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// NEW: Auto Map Updater
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14, { animate: true, duration: 1.5 });
  }, [position, map]);
  return null;
};

// UPDATED: Tracks manual interactions
const LocationPicker = ({ position, setPosition, lastAction }) => {
  useMapEvents({
    click(e) { 
      if(lastAction) lastAction.current = 'map';
      setPosition(e.latlng); 
    },
  });
  return position ? <Marker position={position} icon={customIcon} draggable={true} eventHandlers={{ dragstart: () => { if(lastAction) lastAction.current = 'map'; }, dragend: (e) => setPosition(e.target.getLatLng()) }} /> : null;
};

const ProgressMarker = ({ step, label, active, completed }) => (
  <div className="flex items-center gap-4 group">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
      active ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' 
      : completed ? 'bg-emerald-100 text-emerald-600' 
      : 'bg-slate-800 text-slate-400'
    }`}>
      {completed ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg> : step}
    </div>
    <span className={`text-sm font-semibold transition-colors ${active || completed ? 'text-white' : 'text-slate-500'}`}>{label}</span>
  </div>
);

const InputField = ({ label, name, type = "text", required = true, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <input 
      type={type} name={name} required={required} value={value} onChange={onChange} placeholder={placeholder} 
      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-slate-400"
    />
  </div>
);

const SignupSupplier = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(1);
  const [googleToken, setGoogleToken] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [mapPosition, setMapPosition] = useState(null);
  const lastAction = useRef('init');

  const [supplierState, setSupplierState] = useState({
    email: '', password: '', confirmPassword: '',
    businessType: 'Restaurant', legalName: '', address: '', city: '', district: '', state: '', website: '', contactNumber: ''
  });

  const { states, districts } = useLocationAPI(supplierState.state);

  // NEW: Debounced Auto-Geocoder for Registration
  useEffect(() => {
    if (lastAction.current === 'map' || lastAction.current === 'init') return;

    const addressParts = [supplierState.address, supplierState.city, supplierState.district, supplierState.state].filter(Boolean);
    if (addressParts.length < 2) return; 

    const query = addressParts.join(', ') + ', India';

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();
        if (data && data[0] && lastAction.current === 'text') {
          setMapPosition({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch (err) { console.error('Auto-geocode failed', err); }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [supplierState.address, supplierState.city, supplierState.district, supplierState.state]);

  const handleUpdate = (e) => {
    const { name, value } = e.target;
    if (['address', 'city', 'district', 'state'].includes(name)) {
      lastAction.current = 'text';
    }

    if (name === 'state') setSupplierState(prev => ({ ...prev, state: value, district: '', city: '' }));
    else if (name === 'district') setSupplierState(prev => ({ ...prev, district: value, city: '' }));
    else setSupplierState(prev => ({ ...prev, [name]: value }));
  };

const proceedToDetails = async (e) => {
    e.preventDefault();
    if (supplierState.password !== supplierState.confirmPassword) return toast.error('Passwords do not match');
    if (supplierState.password.length < 8) return toast.error('Minimum 8 characters required');
    
    // FIXED: Block progression if email already exists
    try {
      await api.post('/auth/check-email', { email: supplierState.email });
      setActiveStage(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email verification failed');
    }
  };

  const gAuthCapture = async (resAuth) => {
    // FIXED: Test if Google account exists before proceeding
    try {
      const res = await api.post('/auth/google', { token: resAuth.credential });
      // If no error, the user exists! Log them straight in.
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Welcome back! Logged in successfully.');
      
      // Route based on what role they had
      if (res.data.role === 'Supplier') navigate('/supplier/dashboard');
      else navigate('/ngo/dashboard');

    } catch (error) {
      // 404 means they don't exist yet, proceed to Profile Setup (Step 2)
      if (error.response?.status === 404) {
        setGoogleToken(resAuth.credential);
        toast.success('Google verified. Please complete your profile.');
        setActiveStage(2);
      } else {
        toast.error('Google Authentication Failed');
      }
    }
  };

  const commitRegistration = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
      let data;
      const details = {
        businessType: supplierState.businessType, legalName: supplierState.legalName, address: supplierState.address,
        city: supplierState.city, district: supplierState.district, state: supplierState.state, website: supplierState.website, contactNumber: supplierState.contactNumber,
        lat: mapPosition?.lat, lng: mapPosition?.lng
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
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-emerald-100">
      
      <aside className="hidden lg:flex w-[400px] xl:w-[480px] bg-slate-900 flex-col p-12 relative overflow-hidden shrink-0 border-r border-slate-800">
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

          <div className="space-y-8 mt-auto">
            <ProgressMarker step="1" label="Account Configuration" active={activeStage === 1} completed={activeStage > 1} />
            <div className="w-0.5 h-8 bg-slate-800 ml-4 -my-4"></div>
            <ProgressMarker step="2" label="Business Details" active={activeStage === 2} completed={false} />
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        
        <div className="lg:hidden flex flex-col items-center mb-8 text-center w-full">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-3 shadow-sm" onClick={() => navigate('/')}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Food Donor Application</h2>
        </div>

        <div className="w-full max-w-[600px] bg-white rounded-xl sm:rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              {activeStage === 1 ? 'Create your account' : 'Business Details'}
            </h1>
            <p className="text-sm text-slate-500">
              {activeStage === 1 ? 'Start by setting up your login credentials.' : 'Complete your profile to gain network access.'}
            </p>
          </header>

           {activeStage === 1 ? (
             <form onSubmit={proceedToDetails} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               
               <div className="w-full rounded-lg border border-slate-300 hover:border-slate-400 transition-colors bg-white overflow-hidden shadow-sm">
                 <GoogleLogin onSuccess={gAuthCapture} onError={() => toast.error('Google Authentication Cancelled')} theme="outline" size="large" text="continue_with" width="100%"/>
               </div>
               
               <div className="flex items-center gap-4 my-6">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs font-medium text-slate-400 whitespace-nowrap">Or register with email</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
               </div>

               <InputField label="Email Address" name="email" type="email" value={supplierState.email} onChange={handleUpdate} placeholder="name@company.com" />
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <InputField label="Password" name="password" type="password" value={supplierState.password} onChange={handleUpdate} placeholder="••••••••" />
                 <InputField label="Confirm Password" name="confirmPassword" type="password" value={supplierState.confirmPassword} onChange={handleUpdate} placeholder="••••••••" />
               </div>
               
               <div className="pt-2">
                 <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                   Continue to Profile
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                 </button>
               </div>

               <p className="text-center text-sm text-slate-500 mt-6">
                 Already have an account? <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">Sign in here</Link>
               </p>
             </form>
           ) : (
             <form onSubmit={commitRegistration} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                   <label className="block text-sm font-semibold text-slate-700">Business Type</label>
                   <select name="businessType" value={supplierState.businessType} onChange={handleUpdate} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                      <option>Restaurant</option><option>Corporate Cafeteria</option><option>Event Organizer</option><option>Wholesaler</option>
                   </select>
                 </div>
                 <InputField label="Business Name" name="legalName" value={supplierState.legalName} onChange={handleUpdate} placeholder="Legal Entity Name" />
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <InputField label="Mobile Number" name="contactNumber" type="tel" value={supplierState.contactNumber} onChange={handleUpdate} placeholder="+91 98765 43210" />
                 <InputField label="Website (Optional)" name="website" type="url" required={false} value={supplierState.website} onChange={handleUpdate} placeholder="https://www.example.com" />
               </div>

               <div className="pt-4 border-t border-slate-100">
                 <h4 className="text-sm font-semibold text-slate-900 mb-4">Location Configuration</h4>
                 <div className="space-y-5">
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                     <div className="space-y-1.5">
                       <label className="block text-xs font-semibold text-slate-700">State</label>
                       <select name="state" required value={supplierState.state} onChange={handleUpdate} className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                          <option value="">Select State</option>
                          {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                       </select>
                     </div>
                     <div className="space-y-1.5">
                       <label className="block text-xs font-semibold text-slate-700">District</label>
                       <select name="district" required value={supplierState.district} onChange={handleUpdate} disabled={!supplierState.state} className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium outline-none disabled:opacity-50 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                          <option value="">Select District</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                     </div>
                     <div className="space-y-1.5 sm:col-span-2">
                       <label className="block text-xs font-semibold text-slate-700">City / Town</label>
                       <input type="text" name="city" required value={supplierState.city} onChange={handleUpdate} placeholder="Specific city..." className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"/>
                     </div>
                         <InputField label="Street Address" name="address" value={supplierState.address} onChange={handleUpdate} placeholder="Main Facility Address" />
               
                   </div>

                   {/* Clean Map UI with Auto-Center */}
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <label className="block text-sm font-semibold text-slate-700">Facility Pin Location</label>
                       {!mapPosition ? (
                         <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Recommended</span>
                       ) : (
                         <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Saved</span>
                       )}
                     </div>
                     <div className="h-[220px] w-full rounded-lg overflow-hidden border border-slate-300 relative z-10 shadow-sm">
                       <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                         <MapUpdater position={mapPosition} />
                         <LocationPicker position={mapPosition} setPosition={setMapPosition} lastAction={lastAction} />
                       </MapContainer>
                     </div>
                     <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       Auto-pins to your address. Drag map pin to your exact loading dock.
                     </p>
                   </div>
                 </div>
               </div>

               <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveStage(1)} className="w-1/3 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={isDeploying} className={`w-2/3 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${isDeploying ? 'bg-emerald-400 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'}`}>
                    {isDeploying ? (
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

export default SignupSupplier;