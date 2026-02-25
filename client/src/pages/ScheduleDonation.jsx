import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import Layout from '../components/Layout';

// Clean B2B Input Wrapper
const InputWrapper = ({ label, children, icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
      {icon && (
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
        </svg>
      )}
      {label}
    </label>
    {children}
  </div>
);

const ScheduleDonation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsProfile, setSameAsProfile] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'state') setFormData(prev => ({ ...prev, state: value, district: '', city: '' }));
    else if (name === 'district') setFormData(prev => ({ ...prev, district: value, city: '' }));
    else setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (value === 'true' ? true : value === 'false' ? false : value) }));
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
    
    setIsSubmitting(true);
    try {
      const payload = { ...formData, scheduledDays: activeDays };
      await api.post('/posts', payload);
      toast.success('Schedule Saved Successfully');
      navigate('/supplier/dashboard');
    } catch (err) {
      toast.error('Failed to save schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout role="Supplier">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Sleek Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span className="cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => navigate('/supplier/dashboard')}>Dashboard</span>
              <span>/</span>
              <span className="text-emerald-600">Daily Drops</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Configure Weekly Schedule</h1>
          </div>
        </header>

        <form onSubmit={executeScheduling} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Data Entry */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Standard Logistics Card */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
               <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Standard Drop Details</h3>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputWrapper label="Category" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
                     <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                        <option>Bakery/Grains</option><option>Dairy</option><option>Produce</option><option>Prepared Meals</option>
                     </select>
                  </InputWrapper>
                  <InputWrapper label="Daily Volume (kg)" icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                     <input type="number" step="0.1" name="weight" required value={formData.weight} onChange={handleInputChange} placeholder="0.0" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                  </InputWrapper>
               </div>

               <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Packaging Protocol</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${formData.packaging === true ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="radio" name="packaging" value="true" checked={formData.packaging === true} onChange={handleInputChange} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.packaging === true ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {formData.packaging === true && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                    </div>
                    <span className="text-sm font-semibold">Packaged</span>
                  </label>
                  <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${formData.packaging === false ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type="radio" name="packaging" value="false" checked={formData.packaging === false} onChange={handleInputChange} className="hidden" />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.packaging === false ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {formData.packaging === false && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                    </div>
                    <span className="text-sm font-semibold">Bulk Transfer</span>
                  </label>
                </div>
               </div>

               <InputWrapper label="Shelf Life / Freshness" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                  <input type="text" name="shelfLife" required value={formData.shelfLife} onChange={handleInputChange} placeholder="e.g. Needs pickup within 4 hours" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-slate-400"/>
               </InputWrapper>
            </section>

            {/* Standard Location Card */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
               <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Pickup Location</h3>
               <InputWrapper label="Street Address" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                  <input type="text" name="pickupAddress" required value={formData.pickupAddress} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
               </InputWrapper>
               
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
                     <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="e.g. Pune" className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors placeholder:text-slate-400"/>
                  </InputWrapper>
               </div>
            </section>

            {/* Restored Point of Contact Card */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
               <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-semibold text-slate-900">Point of Contact</h3>
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
                     <input type="text" name="contactName" required value={formData.contactName} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                  </InputWrapper>
                  <InputWrapper label="Phone Number" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                     <input type="tel" name="contactPhone" required value={formData.contactPhone} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                  </InputWrapper>
               </div>
            </section>
          </div>

          {/* Right Column: Timetable & Submission */}
          <div className="lg:col-span-5 space-y-6">
             <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-base font-semibold text-slate-900">Weekly Configuration</h3>
                  <p className="text-xs text-slate-500 mt-1">Activate the days when drops occur.</p>
                </div>
                
                <div className="divide-y divide-slate-100">
                   {scheduleMatrix.map((item, idx) => (
                     <div key={item.day} className={`p-5 transition-colors ${item.isActive ? 'bg-emerald-50/30' : 'bg-white'}`}>
                        <div className="flex items-center justify-between">
                           <span className={`text-sm font-semibold transition-colors ${item.isActive ? 'text-emerald-800' : 'text-slate-600'}`}>
                             {item.day}
                           </span>
                           {/* SaaS Toggle Switch */}
                           <div onClick={() => updateMatrix(idx, 'isActive', !item.isActive)} className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                           </div>
                        </div>

                        {/* Inline Time Editors */}
                        {item.isActive && (
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-100/50 animate-in slide-in-from-top-2 duration-300">
                             <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-emerald-700">Release Time</label>
                                <input type="time" value={item.postTime} onChange={(e) => updateMatrix(idx, 'postTime', e.target.value)} className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm"/>
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-emerald-700">Deadline</label>
                                <input type="time" value={item.deadlineTime} onChange={(e) => updateMatrix(idx, 'deadlineTime', e.target.value)} className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors shadow-sm"/>
                             </div>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </section>

             {/* Final Actions Block */}
             <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex gap-3 items-start mb-5">
                   <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                   <p className="text-xs text-slate-600 leading-relaxed">System will automatically broadcast this surplus to local network based on active days.</p>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`w-full py-3 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                    isSubmitting ? 'bg-emerald-500 opacity-70 cursor-not-allowed text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      Save Weekly Schedule
                    </>
                  )}
                </button>
             </section>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ScheduleDonation;