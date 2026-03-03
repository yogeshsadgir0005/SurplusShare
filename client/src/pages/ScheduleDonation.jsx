import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import Layout from '../components/Layout';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

// Organic Input Wrapper
const InputWrapper = ({ label, children, icon }) => (
  <div className="space-y-2">
    <label className="text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider flex items-center gap-2 pl-1">
      {icon && <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon}/></svg>}
      {label}
    </label>
    {children}
  </div>
);

const ScheduleDonation = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsProfile, setSameAsProfile] = useState(false);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const lastAction = useRef('init');

  const defaultPosition = (user?.supplierDetails?.lat && user?.supplierDetails?.lng) 
    ? { lat: user.supplierDetails.lat, lng: user.supplierDetails.lng } 
    : { lat: 20.5937, lng: 78.9629 };
    
  const [mapPosition, setMapPosition] = useState(
    (user?.supplierDetails?.lat && user?.supplierDetails?.lng) ? defaultPosition : null
  );

  const [scheduleMatrix, setScheduleMatrix] = useState(
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({ 
      day, isActive: false, postTime: '18:00', deadlineTime: '21:00' 
    }))
  );

  const [formData, setFormData] = useState({
    type: 'Scheduled', weight: '', packaging: true, pickupAddress: '', city: '', district: '', state: '',
    shelfLife: '1 Day', category: 'Bakery/Grains', contactName: '', contactPhone: '', specialInstructions: ''
  });

  const { states, districts } = useLocationAPI(formData.state);

  useEffect(() => {
    if (user?.supplierDetails) {
      setFormData(prev => ({
        ...prev,
        pickupAddress: user.supplierDetails.address || '',
        city: user.supplierDetails.city || '',
        district: user.supplierDetails.district || '',
        state: user.supplierDetails.state || '',
      }));
    }
  }, []);

  useEffect(() => {
    if (lastAction.current === 'map' || lastAction.current === 'init') return;

    const addressParts = [formData.pickupAddress, formData.city, formData.district, formData.state].filter(Boolean);
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
  }, [formData.pickupAddress, formData.city, formData.district, formData.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (['pickupAddress', 'city', 'district', 'state'].includes(name)) {
      lastAction.current = 'text';
    }

    if (name === 'state') setFormData(prev => ({ ...prev, state: value, district: '', city: '' }));
    else if (name === 'district') setFormData(prev => ({ ...prev, district: value, city: '' }));
    else setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (value === 'true' ? true : value === 'false' ? false : value) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('File exceeds 5MB limit');
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleSameAsProfile = (e) => {
    const checked = e.target.checked;
    setSameAsProfile(checked);
    if (checked && user?.supplierDetails) {
      setFormData(prev => ({ ...prev, contactName: user.supplierDetails.legalName || '', contactPhone: user.supplierDetails.contactNumber || '' }));
    } else {
      setFormData(prev => ({ ...prev, contactName: '', contactPhone: '' }));
    }
  };

  const updateMatrix = (idx, field, value) => {
    const nextMatrix = [...scheduleMatrix];
    nextMatrix[idx][field] = value;
    setScheduleMatrix(nextMatrix);
  };

  const executeScheduling = async (e) => {
    e.preventDefault();
    const activeDays = scheduleMatrix.filter(d => d.isActive);
    if (!activeDays.length) return toast.error('Please select at least one day');
    if (!imageFile) return toast.error('Product verification photo required');
    if (!mapPosition) return toast.error('Please pin the exact pickup location on the map.');

    if (!formData.contactName?.trim() || !formData.contactPhone?.trim()) {
      return toast.error('Contact details are missing. Please uncheck "Use profile defaults" and fill them in.');
    }
    
    setIsSubmitting(true);
    try {
      const submission = new FormData();
      Object.keys(formData).forEach(key => submission.append(key, formData[key]));
      
      submission.append('image', imageFile);
      submission.append('lat', mapPosition.lat);
      submission.append('lng', mapPosition.lng);
      submission.append('scheduledDays', JSON.stringify(activeDays));

      await api.post('/posts', submission, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Schedule Saved Successfully');
      navigate('/supplier/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonInputClass = "w-full bg-[#f4f7f4] border-2 border-transparent rounded-full px-5 py-3.5 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all placeholder:text-[#82a38e] shadow-inner shadow-black/[0.01]";

  return (
    <Layout role="Supplier">
      <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
        
        <header className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">
             <span className="cursor-pointer hover:text-[#10b981] transition-colors" onClick={() => navigate('/supplier/dashboard')}>Dashboard</span>
             <span>/</span>
             <span className="text-[#10b981]">Daily Drops</span>
          </div>
          <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">Configure Weekly Schedule</h1>
        </header>

        <form onSubmit={executeScheduling} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Left Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* Food Details Section */}
            <section className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 sm:p-10 transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
               <h3 className="text-xl font-extrabold text-[#064e3b] mb-6 border-b border-[#e8f0eb] pb-4">Standard Drop Details</h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <InputWrapper label="Category" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
                     <select name="category" value={formData.category} onChange={handleInputChange} className={`${commonInputClass} cursor-pointer`}>
                        <option>Bakery/Grains</option><option>Dairy</option><option>Produce</option><option>Prepared Meals</option>
                     </select>
                  </InputWrapper>
                  <InputWrapper label="Daily Volume (kg)" icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                     <input type="number" step="0.1" name="weight" required value={formData.weight} onChange={handleInputChange} placeholder="e.g. 15.5" className={commonInputClass}/>
                  </InputWrapper>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                  <InputWrapper label="Packaging" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z">
                      <div className="flex bg-[#f4f7f4] rounded-full p-1.5 border border-[#e8f0eb]">
                          <button 
                              type="button" 
                              onClick={() => setFormData({...formData, packaging: true})} 
                              className={`flex-1 py-2.5 text-[14.5px] font-extrabold rounded-full transition-all duration-300 ${formData.packaging === true ? 'bg-white text-[#064e3b] shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-[#82a38e] hover:text-[#4a6b56]'}`}
                          >
                              YES
                          </button>
                          <button 
                              type="button" 
                              onClick={() => setFormData({...formData, packaging: false})} 
                              className={`flex-1 py-2.5 text-[14.5px] font-extrabold rounded-full transition-all duration-300 ${formData.packaging === false ? 'bg-white text-[#064e3b] shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-[#82a38e] hover:text-[#4a6b56]'}`}
                          >
                              NO
                          </button>
                      </div>
                  </InputWrapper>
                  
                  <InputWrapper label="Food Life" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                     <input type="text" name="shelfLife" required value={formData.shelfLife} onChange={handleInputChange} placeholder="e.g. Needs pickup within 4 hours" className={`${commonInputClass} placeholder:text-[#82a38e]`}/>
                  </InputWrapper>
               </div>
            </section>

            {/* Logistics & Location Section */}
            <section className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 sm:p-10 transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
               <h3 className="text-xl font-extrabold text-[#064e3b] mb-6 border-b border-[#e8f0eb] pb-4">Pickup Location</h3>
            
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <InputWrapper label="State">
                     <select name="state" required value={formData.state} onChange={handleInputChange} className={`${commonInputClass} cursor-pointer`}>
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                     </select>
                  </InputWrapper>
                  <InputWrapper label="District">
                     <select name="district" required value={formData.district} onChange={handleInputChange} disabled={!formData.state} className={`${commonInputClass} cursor-pointer disabled:opacity-50`}>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                  </InputWrapper>
                  <InputWrapper label="City / Town">
                     <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="e.g. Pune" className={commonInputClass}/>
                  </InputWrapper>
               </div>

               <div className="mb-6">
                  <InputWrapper label="Street Address" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                     <input type="text" name="pickupAddress" required value={formData.pickupAddress} onChange={handleInputChange} className={commonInputClass}/>
                  </InputWrapper>
               </div>

               <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider flex items-center gap-2 pl-1">
                      <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      Pin Exact Location
                    </label>
                    {!mapPosition ? (
                      <span className="text-[10px] font-bold text-[#d97706] bg-[#fffbeb] px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">Required</span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#10b981] bg-[#ecfdf5] px-2.5 py-1 rounded-full uppercase tracking-widest">Saved</span>
                    )}
                  </div>
                  <div className="h-[300px] w-full rounded-[2rem] overflow-hidden border-4 border-[#f4f7f4] shadow-sm relative z-10 group">
                    <MapContainer center={defaultPosition} zoom={mapPosition ? 14 : 5} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                      <MapUpdater position={mapPosition} />
                      <LocationPicker position={mapPosition} setPosition={setMapPosition} lastAction={lastAction} />
                    </MapContainer>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#064e3b]/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[12px] font-bold shadow-xl pointer-events-none z-[400] whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                         Drag pin to adjust exact loading dock
                    </div>
                  </div>
               </div>
            </section>

            {/* Contact Section */}
            <section className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 sm:p-10 transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#e8f0eb] pb-4 mb-6">
                  <h3 className="text-xl font-extrabold text-[#064e3b]">Contact Details</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer group bg-[#f4f7f4] p-1.5 pr-4 rounded-full border border-[#e8f0eb]">
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm ${sameAsProfile ? 'bg-[#10b981]' : 'bg-white group-hover:bg-[#e8f0eb]'}`}>
                        {sameAsProfile && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                     </div>
                     <input type="checkbox" checked={sameAsProfile} onChange={toggleSameAsProfile} className="hidden"/>
                     <span className="text-[13px] font-bold text-[#064e3b] uppercase tracking-wider">Use Profile Defaults</span>
                  </label>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <InputWrapper label="Contact Name" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                     <input type="text" name="contactName" required value={formData.contactName} onChange={handleInputChange} disabled={sameAsProfile} className={`${commonInputClass} ${sameAsProfile ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`} placeholder="Name"/>
                  </InputWrapper>
                  <InputWrapper label="Phone Number" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                     <input type="tel" name="contactPhone" required value={formData.contactPhone} onChange={handleInputChange} disabled={sameAsProfile} className={`${commonInputClass} ${sameAsProfile ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`} placeholder="Phone"/>
                  </InputWrapper>
               </div>
               
               <InputWrapper label="Gate / Entry Instructions (Optional)" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  <textarea name="specialInstructions" rows="3" value={formData.specialInstructions} onChange={handleInputChange} className="w-full bg-[#f4f7f4] border-2 border-transparent rounded-[1.5rem] px-5 py-4 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all resize-none placeholder:text-[#82a38e] shadow-inner shadow-black/[0.01]" placeholder="e.g. Enter via South Gate terminal 4. Ask for John."/>
               </InputWrapper>
            </section>
          </div>

          {/* Right Column / Sticky Upload & Schedule */}
          <div className="lg:col-span-1 space-y-6">
             
             {/* Verification Upload */}
             <section className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                <div className="p-6 border-b border-[#e8f0eb] bg-[#fbfdfb]">
                  <h3 className="text-lg font-extrabold text-[#064e3b]">Reference Photo</h3>
                  <p className="text-[13px] font-medium text-[#4a6b56] mt-1">Upload an image of the typical surplus to build NGO trust.</p>
                </div>
                
                <div className="p-6 flex-grow">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className={`relative w-full h-48 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${imagePreview ? 'border-[#10b981] bg-white' : 'border-[#82a38e]/40 bg-[#f4f7f4] hover:border-[#10b981] hover:bg-[#ecfdf5] group'}`}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview"/>
                        <div className="absolute inset-0 bg-[#064e3b]/60 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[13px] font-extrabold uppercase tracking-wider">
                          Change Photo
                        </div>
                      </>
                    ) : (
                      <div className="text-center px-4">
                         <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-[#82a38e] group-hover:text-[#10b981] shadow-sm transition-colors">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                         </div>
                         <p className="text-[15px] font-extrabold text-[#064e3b] mb-1">Click to Upload</p>
                         <p className="text-[12px] font-semibold text-[#82a38e] uppercase tracking-wider">JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange}/>
                </div>
             </section>

             {/* Weekly Configuration */}
             <section className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] sticky top-24">
                <div className="p-6 border-b border-[#e8f0eb] bg-[#fbfdfb]">
                  <h3 className="text-lg font-extrabold text-[#064e3b]">Weekly Configuration</h3>
                  <p className="text-[13px] font-medium text-[#4a6b56] mt-1">Activate the days when drops occur.</p>
                </div>
                
                <div className="divide-y divide-[#e8f0eb]">
                   {scheduleMatrix.map((item, idx) => (
                     <div key={item.day} className={`p-5 transition-colors ${item.isActive ? 'bg-[#ecfdf5]/50' : 'bg-transparent'}`}>
                        <div className="flex items-center justify-between">
                           <span className={`text-[15px] font-extrabold transition-colors ${item.isActive ? 'text-[#10b981]' : 'text-[#4a6b56]'}`}>
                             {item.day}
                           </span>
                           <div onClick={() => updateMatrix(idx, 'isActive', !item.isActive)} className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors shadow-inner ${item.isActive ? 'bg-[#10b981]' : 'bg-[#e8f0eb]'}`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${item.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                           </div>
                        </div>

                        {item.isActive && (
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#e8f0eb] animate-in slide-in-from-top-2 duration-300">
                             <InputWrapper label="Release Time">
                                <input type="time" value={item.postTime} onChange={(e) => updateMatrix(idx, 'postTime', e.target.value)} className={commonInputClass}/>
                             </InputWrapper>
                             <InputWrapper label="Deadline">
                                <input type="time" value={item.deadlineTime} onChange={(e) => updateMatrix(idx, 'deadlineTime', e.target.value)} className={commonInputClass}/>
                             </InputWrapper>
                          </div>
                        )}
                     </div>
                   ))}
                </div>

                <div className="p-6 bg-[#fbfdfb] border-t border-[#e8f0eb] space-y-4">
                   <div className="flex gap-3 items-start bg-[#ecfdf5] p-4 rounded-[1.5rem] border border-[#d1fae5]">
                     <svg className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     <p className="text-[13px] font-semibold text-[#064e3b] leading-relaxed">System will automatically broadcast this surplus based on active days.</p>
                   </div>
                   
                   <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-full text-[15px] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all duration-300 flex items-center justify-center gap-2.5 ${isSubmitting ? 'bg-[#10b981]/70 text-white cursor-not-allowed' : 'bg-[#10b981] text-white hover:bg-[#059669] hover:-translate-y-0.5'}`}>
                    {isSubmitting ? (
                       <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Save Weekly Schedule
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      </>
                    )}
                  </button>
                </div>
             </section>

          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ScheduleDonation;