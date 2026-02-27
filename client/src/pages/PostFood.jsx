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
    if (position) {
      map.setView(position, 14, { animate: true, duration: 0.5 });
    }
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
  return position ? (
    <Marker 
      position={position} 
      icon={customIcon} 
      draggable={true} 
      eventHandlers={{ 
        dragstart: () => { if(lastAction) lastAction.current = 'map'; },
        dragend: (e) => setPosition(e.target.getLatLng()) 
      }} 
    />
  ) : null;
};

const InputWrapper = ({ label, children, icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      {icon && <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/></svg>}
      {label}
    </label>
    {children}
  </div>
);

const PostFood = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [sameAsProfile, setSameAsProfile] = useState(false);

  const lastAction = useRef('init'); 

  const defaultPosition = (user?.supplierDetails?.lat && user?.supplierDetails?.lng) 
    ? { lat: user.supplierDetails.lat, lng: user.supplierDetails.lng } 
    : { lat: 20.5937, lng: 78.9629 };
    
  const [mapPosition, setMapPosition] = useState(
    (user?.supplierDetails?.lat && user?.supplierDetails?.lng) ? defaultPosition : null
  );

  const [formData, setFormData] = useState({
    type: 'OneTime', weight: '', packaging: true, pickupAddress: '', city: '', district: '', state: '',
    shelfLife: '', category: 'Prepared Meals', pickupDate: '', pickupTime: '', contactName: '', contactPhone: '', specialInstructions: ''
  });

  const { states, districts } = useLocationAPI(formData.state);

  // Helper to format today's date for the min attribute (YYYY-MM-DD)
  const getTodayFormatted = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayFormatted = getTodayFormatted();

  useEffect(() => {
    if (user?.supplierDetails) {
      setFormData(prev => ({
        ...prev,
        pickupAddress: user.supplierDetails.address || '',
        city: user.supplierDetails.city || '',
        district: user.supplierDetails.district || '',
        state: user.supplierDetails.state || ''
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

  const executePost = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Product verification photo required');
    if (!mapPosition) return toast.error('Please click the map to pin the exact pickup location. (Required)');
    if (!formData.contactName?.trim() || !formData.contactPhone?.trim()) return toast.error('Contact details are missing.');
    
    // NEW: 30-Minute Future Validation
    if (formData.pickupDate && formData.pickupTime) {
      const selectedDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      // Add 30 minutes (30 * 60,000 milliseconds) to current time
      const minAllowedTime = new Date(Date.now() + 30 * 60000); 
      
      if (selectedDateTime < minAllowedTime) {
        return toast.error('Pickup time must be at least 30 minutes from the current time.');
      }
    }

    setIsSubmitting(true);
    try {
      const submission = new FormData();
      Object.keys(formData).forEach(key => submission.append(key, formData[key]));
      submission.append('image', imageFile);
      submission.append('lat', mapPosition.lat);
      submission.append('lng', mapPosition.lng);

      await api.post('/posts', submission);
      toast.success('Surplus Released to Network');
      navigate('/supplier/dashboard');
    } catch (err) {
      toast.error('Network Synchronization Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout role="Supplier">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span className="cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => navigate('/supplier/dashboard')}>Dashboard</span>
              <span>/</span>
              <span className="text-emerald-600">New Release</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Post Food Drop</h1>
          </div>
        </header>

        <form onSubmit={executePost} className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Food Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputWrapper label="Category" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                    <option>Prepared Meals</option><option>Bakery/Grains</option><option>Produce</option><option>Dairy</option><option>Meat/Protein</option>
                  </select>
                </InputWrapper>
                <InputWrapper label="Total Volume (kg)" icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                  <input type="number" step="0.1" name="weight" required value={formData.weight} onChange={handleInputChange} placeholder="0.0" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                </InputWrapper>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Will you provide packaging ?</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${formData.packaging === true ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="radio" name="packaging" value="true" checked={formData.packaging === true} onChange={handleInputChange} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.packaging === true ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {formData.packaging === true && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                    </div>
                    <span className="text-sm font-semibold">YES</span>
                  </label>
                  <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${formData.packaging === false ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="radio" name="packaging" value="false" checked={formData.packaging === false} onChange={handleInputChange} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.packaging === false ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {formData.packaging === false && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                    </div>
                    <span className="text-sm font-semibold">NO</span>
                  </label>
                </div>
              </div>

              <InputWrapper label="Freshness" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                 <input type="text" name="shelfLife" required value={formData.shelfLife} onChange={handleInputChange} placeholder="e.g. Needs pickup within 4 hours" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
              </InputWrapper>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 pt-5">
                <InputWrapper label="Pickup Deadline" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                  {/* ADDED: min={todayFormatted} to prevent selecting past dates */}
                  <input type="date" name="pickupDate" required min={todayFormatted} value={formData.pickupDate} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                </InputWrapper>
                <InputWrapper label="Pickup Time" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                  <input type="time" name="pickupTime" required value={formData.pickupTime} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                </InputWrapper>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
               <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Pickup Location</h3>
           
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 border border-slate-200 p-5 rounded-lg">
                  <InputWrapper label="State">
                     <select name="state" required value={formData.state} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer">
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                     </select>
                  </InputWrapper>
                  <InputWrapper label="District">
                     <select name="district" required value={formData.district} onChange={handleInputChange} disabled={!formData.state} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none disabled:opacity-50 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer">
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                  </InputWrapper>
                  <InputWrapper label="City / Town">
                     <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                  </InputWrapper>
               </div>
    <InputWrapper label="Street Address" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                  <input type="text" name="pickupAddress" required value={formData.pickupAddress} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
               </InputWrapper>
               <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      Pin Exact Location
                    </label>
                    {!mapPosition ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 uppercase tracking-widest animate-pulse">Required</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 uppercase tracking-widest">Saved</span>
                    )}
                  </div>
                  <div className="h-[300px] w-full rounded-lg overflow-hidden border border-slate-300 relative z-10 shadow-sm">
                    <MapContainer center={defaultPosition} zoom={mapPosition ? 14 : 5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                      <MapUpdater position={mapPosition} />
                      <LocationPicker position={mapPosition} setPosition={setMapPosition} lastAction={lastAction} />
                    </MapContainer>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Auto-pins to your address. Drag it to adjust the exact gate or loading dock.
                  </p>
               </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-semibold text-slate-900">Contact Details</h3>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                     <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${sameAsProfile ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300 group-hover:border-emerald-500'}`}>
                        {sameAsProfile && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                     </div>
                     <input type="checkbox" checked={sameAsProfile} onChange={toggleSameAsProfile} className="hidden"/>
                     <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Use profile defaults</span>
                  </label>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputWrapper label="Contact Name" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                     <input type="text" name="contactName" required value={formData.contactName} onChange={handleInputChange} disabled={sameAsProfile} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200"/>
                  </InputWrapper>
                  <InputWrapper label="Phone Number" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                     <input type="tel" name="contactPhone" required value={formData.contactPhone} onChange={handleInputChange} disabled={sameAsProfile} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-200"/>
                  </InputWrapper>
               </div>
               
               <InputWrapper label="Gate / Entry Instructions (Optional)" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  <textarea name="specialInstructions" rows="3" value={formData.specialInstructions} onChange={handleInputChange} placeholder="e.g. Enter via South Gate terminal 4. Ask for John." className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none placeholder:text-slate-400"/>
               </InputWrapper>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-6">
             <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">Food Verification</h3>
                  <p className="text-xs text-slate-500 mt-1">Clear visual proof is required to ensure trust across the network.</p>
                </div>
                
                <div className="p-5 bg-slate-50 flex-grow">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className={`relative w-full h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${imagePreview ? 'border-emerald-500 bg-white' : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 group'}`}
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview"/>
                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">Change Photo</div>
                      </>
                    ) : (
                      <div className="text-center px-4">
                         <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-100/50 transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                         </div>
                         <p className="text-sm font-semibold text-slate-700 mb-1">Click to Upload</p>
                         <p className="text-xs text-slate-500">Max size: 5MB</p>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange}/>
                </div>
             </section>

             <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="space-y-3 mb-6">
                   <div className="flex gap-3 items-start">
                     <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     <p className="text-xs text-slate-600 leading-relaxed">By posting, you verify this food complies with local safety and handling regulations.</p>
                   </div>
                   <div className="flex gap-3 items-start">
                     <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                     <p className="text-xs text-slate-600 leading-relaxed">Verified NGO partners in your logistics radius will be notified immediately.</p>
                   </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'bg-emerald-500 opacity-70 cursor-not-allowed text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'}`}>
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>Post Food drop</>}
                </button>
             </section>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PostFood;