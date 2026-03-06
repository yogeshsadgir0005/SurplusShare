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
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14, { animate: true, duration: 1.5 });
  }, [position, map]);
  return null;
};

const LocationPicker = ({ position, setPosition, lastAction }) => {
  useMapEvents({
    click(e) { 
      if(lastAction) lastAction.current = 'map';
      setPosition(e.latlng); 
    },
  });
  return position ? <Marker position={position} icon={customIcon} draggable={true} eventHandlers={{ dragstart: () => { if(lastAction) lastAction.current = 'map'; }, dragend: (e) => setPosition(e.target.getLatLng()) }} /> : null;
};

// Sage Theme Constant Classes
const inputClasses = "w-full bg-[#f4f7f4] border-2 border-transparent rounded-full px-5 py-3.5 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all placeholder:text-[#82a38e] shadow-inner shadow-black/[0.01]";
const labelClasses = "block text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider pl-1 mb-1.5";

const SignupSupplier = () => {
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const lastAction = useRef('init');

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [formState, setFormState] = useState({
    email: '', password: '', confirmPassword: '', businessType: 'Restaurant', legalName: '', website: '', contactNumber: '', address: '', city: '', district: '', state: ''
  });

  const { states, districts } = useLocationAPI(formState.state);

  useEffect(() => {
    if (lastAction.current === 'map' || lastAction.current === 'init') return;
    const addressParts = [formState.address, formState.city, formState.district, formState.state].filter(Boolean);
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
  }, [formState.address, formState.city, formState.district, formState.state]);

  const syncInput = (e) => {
    const { name, value } = e.target;
    if (['address', 'city', 'district', 'state'].includes(name)) lastAction.current = 'text';
    
    if (name === 'state') setFormState(prev => ({ ...prev, state: value, district: '', city: '' }));
    else if (name === 'district') setFormState(prev => ({ ...prev, district: value, city: '' }));
    else setFormState(prev => ({ ...prev, [name]: value }));
  };

  const processStageOne = async (e) => {
    e.preventDefault();
    if (formState.password !== formState.confirmPassword) return toast.error("Passwords don't match!");
    setIsDeploying(true);
    try {
      await api.post('/auth/check-email', { email: formState.email });
      setActiveStage(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email already exists');
    } finally {
      setIsDeploying(false);
    }
  };

  const requestOTPAndSubmit = async (e) => {
    e.preventDefault();
    setIsDeploying(true);
    try {
       await api.post('/auth/send-otp', { email: formState.email });
       setShowOTPModal(true);
       toast.success(`Verification code sent to ${formState.email}`);
    } catch (err) {
       toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
       setIsDeploying(false);
    }
  };

  const verifyAndRegister = async () => {
    if(otpCode.length !== 6) return toast.error("Please enter the 6-digit code");
    setIsDeploying(true);
    try {
      const payload = {
        email: formState.email, password: formState.password, role: 'Supplier', otp: otpCode,
        details: {
          businessType: formState.businessType, legalName: formState.legalName, website: formState.website,
          contactNumber: formState.contactNumber, address: formState.address, city: formState.city, 
          district: formState.district, state: formState.state,
          lat: mapPosition?.lat, lng: mapPosition?.lng 
        }
      };
      const res = await api.post('/auth/register', payload);
      
      // CRITICAL FIX: Save token so subsequent requests are authorized
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      toast.success('Supplier Hub Deployed Successfully!');
      navigate('/supplier/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsDeploying(true);
    try {
      const res = await api.post('/auth/google', { token: credentialResponse.credential, role: 'Supplier' });
      
      // CRITICAL FIX: Save token so subsequent requests are authorized
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      toast.success('Successfully authenticated via Google Workspace');
      navigate('/supplier/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication sequence failed');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4] flex items-center justify-center p-4 font-sans selection:bg-[#ecfdf5] selection:text-[#059669]">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgb(0,0,0,0.04)] border border-[#e8f0eb] overflow-hidden flex flex-col md:flex-row-reverse min-h-[650px]">
        
        {/* Right Sidebar Branding */}
        <div className="bg-[#059669] md:w-[45%] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#10b981] rounded-full blur-[80px] opacity-30"></div>
           <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#047857] rounded-full blur-[80px] opacity-40"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-14">
                 <div className="w-12 h-12 bg-white text-[#059669] rounded-full flex items-center justify-center shadow-sm">
                    <HeroIcon />
                 </div>
                 <span className="text-xl font-extrabold tracking-tight">SurplusShare</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-5">Zero waste.<br/>Max ROI.</h2>
              <p className="text-[#a7f3d0] text-[15px] font-medium leading-relaxed max-w-sm">Turn surplus inventory into tax-deductible community impact. Setup your supplier hub in minutes.</p>
           </div>
           
           <div className="relative z-10 mt-12 md:mt-0">
             <div className="flex items-center gap-3">
               <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${activeStage === 1 ? 'bg-white' : 'bg-white/20'}`}></div>
               <div className={`w-10 h-1.5 rounded-full transition-all duration-500 ${activeStage === 2 ? 'bg-white' : 'bg-white/20'}`}></div>
             </div>
             <p className="text-[11px] font-extrabold text-[#a7f3d0] mt-4 uppercase tracking-widest">Phase {activeStage} of 2</p>
           </div>
        </div>

        {/* Left Content Form */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 relative flex flex-col justify-center">
          
          <div className="absolute top-8 right-10">
            <p className="text-[13px] text-[#82a38e] font-extrabold uppercase tracking-wider">
              Existing partner? <Link to="/login" className="text-[#10b981] hover:text-[#059669] transition-colors ml-1">Sign in</Link>
            </p>
          </div>

          {activeStage === 1 ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 pt-8">
              <h3 className="text-[28px] font-extrabold text-[#064e3b] mb-8 tracking-tight">Initialize Hub</h3>
              <form onSubmit={processStageOne} className="space-y-5">
                <div>
                  <label className={labelClasses}>Corporate Email</label>
                  <input type="email" name="email" required value={formState.email} onChange={syncInput} className={inputClasses} placeholder="logistics@company.com" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>Password </label>
                    <input type="password" name="password" required minLength="8" value={formState.password} onChange={syncInput} className={inputClasses} placeholder="••••••••" />
                  </div>
                  <div>
                    <label className={labelClasses}>Verify Password</label>
                    <input type="password" name="confirmPassword" required minLength="8" value={formState.confirmPassword} onChange={syncInput} className={inputClasses} placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" disabled={isDeploying} className={`w-full py-4 mt-4 rounded-full text-[15px] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2 ${isDeploying ? 'bg-[#10b981]/70 text-white cursor-not-allowed' : 'bg-[#10b981] text-white hover:bg-[#059669] hover:-translate-y-0.5'}`}>
                  {isDeploying ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> : 'Proceed to Operations Info'}
                  {!isDeploying && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>}
                </button>
              </form>
              
              <div className="mt-10 flex items-center gap-4 before:h-px before:flex-1 before:bg-[#e8f0eb] after:h-px after:flex-1 after:bg-[#e8f0eb]">
                  <span className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider">OR SSO LOGIN</span>
              </div>
              <div className="mt-8 flex justify-center w-full [&>div]:w-full [&_iframe]:w-full overflow-hidden rounded-[1.5rem] border border-[#e8f0eb] hover:border-[#d1fae5] transition-colors bg-[#f4f7f4]">
                  <GoogleLogin 
                      onSuccess={handleGoogleSuccess} 
                      onError={() => toast.error('Google SSO Sequence failed')} 
                      text="signup_with"
                      shape="rectangular"
                      size="large"
                      width="100%"
                  />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 pt-8">
              <h3 className="text-[28px] font-extrabold text-[#064e3b] tracking-tight">Operations Profile</h3>
              <p className="text-[14.5px] font-medium text-[#4a6b56] mb-8">Define your supply chain parameters.</p>
              
              <form onSubmit={requestOTPAndSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>Entity Type</label>
                    <select name="businessType" required value={formState.businessType} onChange={syncInput} className={`${inputClasses} cursor-pointer`}>
                      <option>Restaurant</option>
                      <option>Corporate Cafeteria</option>
                      <option>Event Organizer</option>
                      <option>Wholesaler</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Legal Entity Name</label>
                    <input type="text" name="legalName" required value={formState.legalName} onChange={syncInput} placeholder="Fresh Foods LLC" className={inputClasses}/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#fbfdfb] p-5 rounded-[2rem] border border-[#e8f0eb]">
                   <div>
                    <label className={labelClasses}>Operating State</label>
                    <select name="state" required value={formState.state} onChange={syncInput} className={`${inputClasses} cursor-pointer`}>
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>District Region</label>
                    <select name="district" required value={formState.district} onChange={syncInput} disabled={!formState.state} className={`${inputClasses} cursor-pointer disabled:opacity-50`}>
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>City Zone</label>
                    <input type="text" name="city" required value={formState.city} onChange={syncInput} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Loading Dock</label>
                    <input type="text" name="address" required value={formState.address} onChange={syncInput} placeholder="Street, Building No." className={inputClasses} />
                  </div>

                   <div className="sm:col-span-2 mt-2 relative">
                     <label className={`${labelClasses} mb-3 flex justify-between`}>
                        Pinpoint Dock Coordinates
                        {!mapPosition && <span className="text-[#e11d48] animate-pulse">Required</span>}
                     </label>
                     <div className="h-44 w-full rounded-[1.5rem] overflow-hidden border-4 border-[#f4f7f4] shadow-sm relative z-10 group">
                       <MapContainer center={mapPosition || [20.5937, 78.9629]} zoom={mapPosition ? 14 : 5} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                         <MapUpdater position={mapPosition} />
                         <LocationPicker position={mapPosition} setPosition={setMapPosition} lastAction={lastAction} />
                       </MapContainer>
                       <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#064e3b]/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[11px] font-bold shadow-xl pointer-events-none z-[400] whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                          Drag pin to specific loading dock
                       </div>
                     </div>
                   </div>
                 </div>

               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setActiveStage(1)} className="w-1/3 py-4 bg-[#f4f7f4] text-[#4a6b56] rounded-full font-bold text-[14.5px] hover:bg-[#e8f0eb] hover:text-[#064e3b] transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={isDeploying} className={`w-2/3 py-4 rounded-full text-[15px] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2 ${isDeploying ? 'bg-[#10b981]/70 text-white cursor-not-allowed' : 'bg-[#10b981] text-white hover:bg-[#059669] hover:-translate-y-0.5'}`}>
                    {isDeploying ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> : 'Send Verification OTP'}
                  </button>
               </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* OTP MODAL OVERLAY */}
      {showOTPModal && (
          <div className="fixed inset-0 bg-[#064e3b]/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.1)] p-8 sm:p-10 max-w-[420px] w-full text-center border border-[#e8f0eb]">
                  <div className="w-20 h-20 bg-[#ecfdf5] text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#064e3b] mb-2">Security Check</h3>
                  <p className="text-[14.5px] font-medium text-[#4a6b56] mb-8 leading-relaxed">
                      Enter the 6-digit access code sent to <br/>
                      <span className="font-extrabold text-[#064e3b]">{formState.email}</span>
                  </p>
                  
                  <input 
                      type="text" 
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#f4f7f4] border-2 border-transparent rounded-[1.5rem] px-5 py-4 text-center text-[28px] font-black tracking-[0.5em] text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all mb-8 shadow-inner shadow-black/[0.01]"
                      placeholder="------"
                  />
                  
                  <div className="flex gap-3">
                      <button onClick={() => setShowOTPModal(false)} className="w-1/3 py-4 bg-[#f4f7f4] text-[#4a6b56] rounded-full font-bold text-[14.5px] hover:bg-[#e8f0eb] hover:text-[#064e3b] transition-colors">
                          Cancel
                      </button>
                      <button onClick={verifyAndRegister} disabled={isDeploying || otpCode.length !== 6} className="w-2/3 py-4 bg-[#10b981] text-white rounded-full font-bold text-[14.5px] shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center">
                          {isDeploying ? <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> : 'Verify & Deploy'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SignupSupplier;