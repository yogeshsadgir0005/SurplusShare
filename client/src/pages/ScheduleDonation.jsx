import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import Layout from '../components/Layout';

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
      <div className="max-w-5xl mx-auto px-4 sm:px-0">
        <header className="mb-10 sm:mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
              <span>Daily Posting</span>
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
              <span className="text-emerald-600">Setup</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">Schedule Daily Drops</h2>
          </div>
          <button 
            onClick={() => navigate('/supplier/dashboard')} 
            className="mb-0 sm:mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2"
          >
             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
             Back to Dashboard
          </button>
        </header>

        <form onSubmit={executeScheduling} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-12 lg:pb-0">
          <div className="space-y-8 lg:space-y-10">
            {/* Food Details Section */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 sm:space-y-8">
               <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3 border-b border-slate-100 pb-6 uppercase">
                  Food Details
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                     <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none">
                        <option>Bakery/Grains</option><option>Dairy</option><option>Produce</option><option>Prepared Meals</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Amount (Kg)</label>
                     <input type="number" step="0.1" name="weight" required value={formData.weight} onChange={handleInputChange} placeholder="0.0" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                  </div>
               </div>

               <div className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Provide packaging?</h4>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <label className={`flex-1 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 ${formData.packaging === true ? 'bg-white border-emerald-500 shadow-lg' : 'bg-transparent border-slate-200 opacity-60'}`}>
                    <input type="radio" name="packaging" value="true" checked={formData.packaging === true} onChange={handleInputChange} className="hidden" />
                    <span className="text-xs font-black uppercase tracking-widest">Yes</span>
                  </label>
                  <label className={`flex-1 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 ${formData.packaging === false ? 'bg-white border-emerald-500 shadow-lg' : 'bg-transparent border-slate-200 opacity-60'}`}>
                    <input type="radio" name="packaging" value="false" checked={formData.packaging === false} onChange={handleInputChange} className="hidden" />
                    <span className="text-xs font-black uppercase tracking-widest">No</span>
                  </label>
                </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shelf Life</label>
                  <input type="text" name="shelfLife" required value={formData.shelfLife} onChange={handleInputChange} placeholder="e.g. 4 Hours" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
               </div>
            </div>

            {/* Pickup Location Section */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 sm:space-y-8">
               <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">Pickup Location</h3>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                  <input type="text" name="pickupAddress" required value={formData.pickupAddress} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
               </div>
               
               <div className="grid grid-cols-1 gap-4 bg-slate-50 border border-slate-100 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem]">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                     <select name="state" required value={formData.state} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none appearance-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500">
                        <option value="">Select State</option>
                        {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                     <select name="district" required value={formData.district} onChange={handleInputChange} disabled={!formData.state} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none appearance-none disabled:opacity-40 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500">
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                     <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="City..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black outline-none placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
               <h4 className="text-xl font-black tracking-tight mb-4 relative z-10">Automatic Posting</h4>
               <p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-10 relative z-10">Your food surplus will be automatically broadcasting to local NGOs at your specified posting times.</p>
               <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">
                 {isSubmitting ? 'Saving...' : 'Save Schedule'}
               </button>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Weekly Schedule
             </h3>
             <div className="space-y-3 sm:space-y-4">
                {scheduleMatrix.map((item, idx) => (
                  <div key={item.day} className={`p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-300 ${item.isActive ? 'bg-white border-emerald-200 shadow-xl' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${item.isActive ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>{item.day.charAt(0)}</div>
                           <span className="text-sm sm:text-base font-black text-slate-800 tracking-tight">{item.day}</span>
                        </div>
                        <div onClick={() => updateMatrix(idx, 'isActive', !item.isActive)} className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full p-1 cursor-pointer transition-all ${item.isActive ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                           <div className={`w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full shadow-md transition-all transform ${item.isActive ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                     </div>
                     {item.isActive && (
                       <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-in slide-in-from-top-2 duration-500">
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Post Time</label>
                             <input type="time" value={item.postTime} onChange={(e) => updateMatrix(idx, 'postTime', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 sm:py-2.5 text-xs font-black outline-none focus:ring-4 focus:ring-emerald-500/10"/>
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
                             <input type="time" value={item.deadlineTime} onChange={(e) => updateMatrix(idx, 'deadlineTime', e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 sm:py-2.5 text-xs font-black outline-none focus:ring-4 focus:ring-emerald-500/10"/>
                          </div>
                       </div>
                     )}
                  </div>
                ))}
             </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ScheduleDonation;