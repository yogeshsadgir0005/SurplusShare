import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import Layout from '../components/Layout';

// Helper components moved outside to prevent focus loss during typing
const InputWrapper = ({ label, children, icon }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
      {icon && (
        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon}/>
        </svg>
      )}
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

  const [formData, setFormData] = useState({
    type: 'OneTime', 
    weight: '', 
    packaging: true, 
    pickupAddress: '', 
    city: '', 
    district: '', 
    state: '',
    shelfLife: '', 
    category: 'Prepared Meals', 
    pickupDate: '', 
    pickupTime: '', 
    contactName: '', 
    contactPhone: '', 
    specialInstructions: ''
  });

  const { states, districts } = useLocationAPI(formData.state);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '', city: '' }));
    } else if (name === 'district') {
      setFormData(prev => ({ ...prev, district: value, city: '' }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : (value === 'true' ? true : value === 'false' ? false : value) 
      }));
    }
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
      setFormData(prev => ({ 
        ...prev, 
        contactName: user.supplierDetails.legalName || '', 
        contactPhone: user.supplierDetails.contactNumber || '' 
      }));
    } else {
      setFormData(prev => ({ ...prev, contactName: '', contactPhone: '' }));
    }
  };

  const executePost = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Product verification photo required');
    setIsSubmitting(true);
    try {
      const submission = new FormData();
      Object.keys(formData).forEach(key => submission.append(key, formData[key]));
      submission.append('image', imageFile);
      await api.post('/posts', submission, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      <div className="max-w-4xl mx-auto space-y-8 lg:space-y-12">
        <header className="mb-10 lg:mb-16">
          <div className="flex items-center gap-3 text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Food Post</span>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
            <span className="text-emerald-600">New Release</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">Share Food Now</h2>
        </header>

        <form onSubmit={executePost} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-7 space-y-8 lg:space-y-10">
            <section className="bg-white rounded-[2.5rem] lg:rounded-[3rem] border border-slate-200 p-6 lg:p-10 shadow-sm space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputWrapper label="Food Category" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none">
                    <option>Prepared Meals</option>
                    <option>Bakery/Grains</option>
                    <option>Produce</option>
                    <option>Dairy</option>
                    <option>Meat/Protein</option>
                  </select>
                </InputWrapper>
                <InputWrapper label="Amount (Kg)" icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                  <input type="number" step="0.1" name="weight" required value={formData.weight} onChange={handleInputChange} placeholder="0.0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                </InputWrapper>
              </div>

              <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Will you provide packaging?</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 ${formData.packaging === true ? 'bg-white border-emerald-500 shadow-lg' : 'bg-transparent border-slate-200 opacity-60'}`}>
                    <input type="radio" name="packaging" value="true" checked={formData.packaging === true} onChange={handleInputChange} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.packaging === true ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {formData.packaging === true && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Yes</span>
                  </label>
                  <label className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 ${formData.packaging === false ? 'bg-white border-emerald-500 shadow-lg' : 'bg-transparent border-slate-200 opacity-60'}`}>
                    <input type="radio" name="packaging" value="false" checked={formData.packaging === false} onChange={handleInputChange} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.packaging === false ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {formData.packaging === false && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">No</span>
                  </label>
                </div>
              </div>

              <InputWrapper label="Stays Fresh For" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                 <input type="text" name="shelfLife" required value={formData.shelfLife} onChange={handleInputChange} placeholder="e.g. 4 Hours" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
              </InputWrapper>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputWrapper label="Pickup Date" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                  <input type="date" name="pickupDate" required value={formData.pickupDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                </InputWrapper>
                <InputWrapper label="Pickup Time" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                  <input type="time" name="pickupTime" required value={formData.pickupTime} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                </InputWrapper>
              </div>
            </section>

            {/* Pickup Location Section */}
            <section className="bg-white rounded-[2.5rem] lg:rounded-[3rem] border border-slate-200 p-6 lg:p-10 shadow-sm space-y-6 lg:space-y-8">
               <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">Pickup Location</h3>
               <InputWrapper label="Street Address" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                  <input type="text" name="pickupAddress" required value={formData.pickupAddress} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
               </InputWrapper>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 border border-slate-100 p-6 rounded-[2rem]">
                  <InputWrapper label="State">
                     <select name="state" required value={formData.state} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500">
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                     </select>
                  </InputWrapper>
                  <InputWrapper label="District">
                     <select name="district" required value={formData.district} onChange={handleInputChange} disabled={!formData.state} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none appearance-none disabled:opacity-40 cursor-pointer focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500">
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                  </InputWrapper>
                  <InputWrapper label="City / Town">
                     <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="Specific city..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                  </InputWrapper>
               </div>
            </section>

            {/* Contact Details Section */}
            <section className="bg-white rounded-[2.5rem] lg:rounded-[3rem] border border-slate-200 p-6 lg:p-10 shadow-sm space-y-6 lg:space-y-8">
               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Contact Details</h3>
                  <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="checkbox" checked={sameAsProfile} onChange={toggleSameAsProfile} className="hidden"/>
                     <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${sameAsProfile ? 'bg-emerald-600 border-emerald-600 shadow-lg' : 'bg-white border-slate-200 group-hover:border-emerald-500'}`}>
                        {sameAsProfile && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>}
                     </div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900">Same as profile</span>
                  </label>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputWrapper label="Contact Name" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                     <input type="text" name="contactName" required value={formData.contactName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                  </InputWrapper>
                  <InputWrapper label="Phone Number" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                     <input type="tel" name="contactPhone" required value={formData.contactPhone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                  </InputWrapper>
               </div>
               <InputWrapper label="Special Instructions (Optional)" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  <textarea name="specialInstructions" rows="3" value={formData.specialInstructions} onChange={handleInputChange} placeholder="e.g. Access via South Gate terminal 4..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none"/>
               </InputWrapper>
            </section>
          </div>

          {/* Right Column: Photo & Submit */}
          <div className="lg:col-span-5 space-y-8 lg:space-y-10">
             <section className="bg-slate-900 rounded-[3rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 to-transparent"></div>
                <h3 className="text-white text-lg font-black tracking-tight mb-8 relative z-10 uppercase">Food Photo</h3>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`relative z-10 w-full h-64 sm:h-80 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden ${imagePreview ? 'border-emerald-500' : 'border-slate-700 hover:border-slate-500 hover:bg-white/5'}`}
                >
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview"/>
                  ) : (
                    <div className="text-center p-6">
                       <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                         <svg className="w-6 h-6 lg:w-8 lg:h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                         </svg>
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Upload Photo<br/><span className="text-[9px] text-slate-600 tracking-normal font-bold lowercase">Required to post</span></p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange}/>
                <div className="mt-8 space-y-4 relative z-10">
                   <div className="flex items-center gap-3"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure upload</p></div>
                   <div className="flex items-center gap-3"><div className="w-1 h-1 bg-emerald-500 rounded-full"></div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visible to local NGOs</p></div>
                </div>
             </section>

             <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 lg:p-10 shadow-sm text-center lg:text-left">
                <h3 className="text-xs lg:text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Final Confirmation</h3>
                <div className="space-y-4 lg:space-y-6 mb-10 text-[10px] lg:text-[11px] font-bold text-slate-400 leading-relaxed">
                   <p>Once posted, your food will be visible to nearby NGOs. Verified organizations will be notified immediately.</p>
                   <p>By posting, you confirm the food is safe for consumption and follows guidelines.</p>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      Release Surplus
                    </>
                  )}
                </button>
             </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PostFood;