import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Layout from '../components/Layout';

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

// Organic Input Field Component
const InputField = ({ label, name, type = "text", required = true, placeholder, value, onChange, disabled }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider pl-1">{label}</label>
    <input 
      type={type} name={name} required={required} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className="w-full bg-[#f4f7f4] border-2 border-transparent rounded-full px-5 py-3.5 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all placeholder:text-[#82a38e] disabled:opacity-60 disabled:cursor-not-allowed shadow-inner shadow-black/[0.01]"
    />
  </div>
);

const SettingsNGO = () => {
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mapPosition, setMapPosition] = useState(null);
  const lastAction = useRef('init');
  const [originalEmail, setOriginalEmail] = useState('');

  // OTP State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [formState, setFormState] = useState({
    email: '', password: '', name: '', mission: '', website: '', mobile: '', address: '', city: '', district: '', state: ''
  });

  const { states, districts } = useLocationAPI(formState.state);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');
        const details = data.ngoDetails || {};
        setOriginalEmail(data.email || '');
        setFormState({
          email: data.email || '', password: '', 
          name: details.name || '', mission: details.mission || '', website: details.website || '',
          mobile: details.mobile || '', address: details.address || '', city: details.city || '',
          district: details.district || '', state: details.state || ''
        });
        if (details.lat && details.lng) setMapPosition({ lat: details.lat, lng: details.lng });
      } catch (err) {
        toast.error("Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    const isEmailChanged = formState.email.trim() !== originalEmail;
    const isPasswordChanged = formState.password.trim() !== '';
    
    // Trigger OTP if sensitive data changed
    if ((isEmailChanged || isPasswordChanged) && !showOTPModal) {
       if (isPasswordChanged && formState.password.length < 8) return toast.error("New password must be at least 8 characters");
       
       setIsProcessing(true);
       try {
           // Send OTP to NEW email if changed, else CURRENT email
           const targetEmail = isEmailChanged ? formState.email : originalEmail;
           await api.post('/auth/send-otp', { email: targetEmail });
           setShowOTPModal(true);
           toast.success(`Security code sent to ${targetEmail}`);
       } catch(err) {
           toast.error(err.response?.data?.message || 'Failed to send OTP');
       } finally {
           setIsProcessing(false);
       }
       return; // Stop here, wait for OTP entry
    }

    executeFinalSave();
  };

  const executeFinalSave = async () => {
    setIsProcessing(true);
    try {
      const payload = {
        details: {
          name: formState.name, mission: formState.mission, website: formState.website,
          mobile: formState.mobile, address: formState.address, city: formState.city, 
          district: formState.district, state: formState.state,
          lat: mapPosition?.lat, lng: mapPosition?.lng 
        }
      };
      
      const isEmailChanged = formState.email.trim() !== originalEmail;
      if (isEmailChanged) payload.email = formState.email;
      if (formState.password.trim() !== '') payload.password = formState.password;
      if (showOTPModal) payload.otp = otpCode;

      const res = await api.put('/auth/me', payload);
      localStorage.setItem('user', JSON.stringify(res.data));
      setOriginalEmail(res.data.email);
      toast.success('Settings updated successfully!');
      
      setFormState(prev => ({...prev, password: ''}));
      setShowOTPModal(false);
      setOtpCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <Layout role="NGO">
        <div className="max-w-[1000px] mx-auto p-12 text-center text-[#82a38e] font-extrabold text-xl animate-pulse">Loading settings...</div>
    </Layout>
  );

  return (
    <Layout role="NGO">
      <div className="max-w-[1000px] mx-auto space-y-8 pb-10">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">Organization Settings</h1>
          <p className="text-[15px] font-medium text-[#4a6b56]">Update your operational details, location, and account credentials.</p>
        </header>

        <form onSubmit={handleUpdate} className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
            
            <div className="p-6 sm:p-10 space-y-6">
                <h3 className="text-xl font-extrabold text-[#064e3b] border-b border-[#e8f0eb] pb-4 mb-6">General Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                    <InputField label="Organization Name" name="name" value={formState.name} onChange={syncInput} />
                    <InputField label="Contact Mobile" name="mobile" type="tel" value={formState.mobile} onChange={syncInput} />
                    <div className="sm:col-span-2">
                        <InputField label="Website (Optional)" name="website" type="url" required={false} value={formState.website} onChange={syncInput} />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider pl-1">Mission Statement</label>
                        <textarea 
                            name="mission" rows="3" required value={formState.mission} onChange={syncInput} 
                            className="w-full bg-[#f4f7f4] border-2 border-transparent rounded-[1.5rem] px-5 py-4 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all resize-none shadow-inner shadow-black/[0.01]"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-10 bg-[#fbfdfb] border-t border-[#e8f0eb] space-y-6">
                <h3 className="text-xl font-extrabold text-[#064e3b] border-b border-[#e8f0eb] pb-4 mb-6">Location & Coordinates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label className="block text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider pl-1">State</label>
                          <select name="state" required value={formState.state} onChange={syncInput} className="w-full bg-[#f4f7f4] border-2 border-transparent rounded-full px-5 py-3.5 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all cursor-pointer">
                            <option value="">Select State</option>
                            {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider pl-1">District</label>
                          <select name="district" required value={formState.district} onChange={syncInput} disabled={!formState.state} className="w-full bg-[#f4f7f4] border-2 border-transparent rounded-full px-5 py-3.5 text-[15px] font-bold text-[#064e3b] outline-none disabled:opacity-50 cursor-pointer focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all">
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        <InputField label="City / Town" name="city" value={formState.city} onChange={syncInput} />
                        <InputField label="Street Address" name="address" value={formState.address} onChange={syncInput} />
                    </div>

                    <div className="h-full min-h-[300px] w-full rounded-[2rem] overflow-hidden border-4 border-[#f4f7f4] shadow-sm relative z-10 group">
                      <MapContainer center={mapPosition || [20.5937, 78.9629]} zoom={mapPosition ? 14 : 5} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater position={mapPosition} />
                        <LocationPicker position={mapPosition} setPosition={setMapPosition} lastAction={lastAction} />
                      </MapContainer>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#064e3b]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[12px] font-bold shadow-xl pointer-events-none z-[400] whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                         Drag pin to adjust operational hub
                      </div>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-10 border-t border-[#e8f0eb] space-y-6">
                <div className="flex items-center justify-between border-b border-[#e8f0eb] pb-4 mb-6">
                   <h3 className="text-xl font-extrabold text-[#064e3b]">Account Security</h3>
                   <span className="text-[11px] font-extrabold text-[#d97706] bg-[#fffbeb] px-3.5 py-1.5 rounded-full uppercase tracking-wider">OTP Required to modify</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                    <InputField label="Login Email" name="email" type="email" value={formState.email} onChange={syncInput} />
                    <InputField label="New Password" name="password" type="password" required={false} value={formState.password} onChange={syncInput} placeholder="Leave blank to keep current" />
                </div>
            </div>

            <div className="p-6 sm:p-8 bg-[#fbfdfb] border-t border-[#e8f0eb] flex justify-end">
                <button type="submit" disabled={isProcessing} className="px-8 py-4 bg-[#10b981] text-white rounded-full text-[15px] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {isProcessing ? (
                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>

      {/* OTP MODAL OVERLAY */}
      {showOTPModal && (
          <div className="fixed inset-0 bg-[#064e3b]/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgb(0,0,0,0.1)] p-8 sm:p-10 max-w-[420px] w-full text-center border border-[#e8f0eb]">
                  <div className="w-20 h-20 bg-[#ecfdf5] text-[#10b981] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#064e3b] mb-2">Security Check</h3>
                  <p className="text-[14.5px] font-medium text-[#4a6b56] mb-8 leading-relaxed">
                      Enter the 6-digit code sent to <br/>
                      <span className="font-extrabold text-[#064e3b]">{formState.email.trim() !== originalEmail ? formState.email : originalEmail}</span>
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
                      <button onClick={() => {setShowOTPModal(false); setOtpCode('');}} className="w-1/3 py-4 bg-[#f4f7f4] text-[#4a6b56] rounded-full font-bold text-[14.5px] hover:bg-[#e8f0eb] hover:text-[#064e3b] transition-colors">
                          Cancel
                      </button>
                      <button onClick={executeFinalSave} disabled={isProcessing || otpCode.length !== 6} className="w-2/3 py-4 bg-[#10b981] text-white rounded-full font-bold text-[14.5px] shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center">
                          {isProcessing ? (
                              <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : 'Verify & Save'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </Layout>
  );
};

export default SettingsNGO;