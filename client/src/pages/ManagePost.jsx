import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { API_BASE_URL } from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import Layout from '../components/Layout';

const InputWrapper = ({ label, children, icon }) => (
  <div className="space-y-2">
    <label className="text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider flex items-center gap-2 pl-1">
      {icon && <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon}/></svg>}
      {label}
    </label>
    {children}
  </div>
);

const ManagePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLocked, setActionLocked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editForm, setEditForm] = useState({});
  const [editScheduleMatrix, setEditScheduleMatrix] = useState([]);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const { states, districts } = useLocationAPI(editForm.state);

  const getTodayFormatted = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayFormatted = getTodayFormatted();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get('/posts/supplier');
        const currentPost = data.find(p => p._id === id);
        setPost(currentPost);
        setEditForm(currentPost);
        
        if (currentPost?.image) {
           setImagePreview(`${API_BASE_URL}${currentPost.image}`);
        }
        if (currentPost?.type === 'Scheduled') {
          setEditScheduleMatrix(currentPost.scheduledDays || []);
        }
      } catch (error) {
        toast.error('Failed to load details');
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    fetchPost();
  }, [id]);

  const modifyStatus = async (status) => {
    setActionLocked(true);
    try {
      await api.put(`/posts/${id}/status`, { status });
      setPost({ ...post, status });
      toast.success(`Status Updated: ${status}`);
    } catch (error) {
      toast.error('State Update Refused');
    } finally {
      setActionLocked(false);
    }
  };

  const processClaimHandshake = async (claimId, claimStatus) => {
    setActionLocked(true);
    try {
      const { data } = await api.put(`/posts/${id}/claim/manage`, { claimId, status: claimStatus });
      setPost(data);
      toast.success(`NGO Request: ${claimStatus}`);
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setActionLocked(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'state') setEditForm(prev => ({ ...prev, state: value, district: '', city: '' }));
    else if (name === 'district') setEditForm(prev => ({ ...prev, district: value, city: '' }));
    else setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (value === 'true' ? true : value === 'false' ? false : value) }));
  };

  const updateMatrix = (idx, field, value) => {
    const nextMatrix = [...editScheduleMatrix];
    nextMatrix[idx][field] = value;
    setEditScheduleMatrix(nextMatrix);
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

  const saveEdits = async () => {
    setActionLocked(true);

    if (post.type === 'OneTime' && editForm.pickupDate && editForm.pickupTime) {
      const selectedDateTime = new Date(`${editForm.pickupDate}T${editForm.pickupTime}`);
      const minAllowedTime = new Date(Date.now() + 30 * 60000); 
      
      if (selectedDateTime < minAllowedTime) {
        setActionLocked(false);
        return toast.error('Pickup time must be at least 30 minutes from the current time.');
      }
    }

    try {
      const payload = new FormData();
      const updatableFields = ['weight', 'packaging', 'pickupAddress', 'city', 'district', 'state', 'shelfLife', 'category', 'pickupDate', 'pickupTime', 'contactName', 'contactPhone', 'specialInstructions'];
      
      updatableFields.forEach(field => {
         if (editForm[field] !== undefined && editForm[field] !== null) {
            payload.append(field, editForm[field]);
         }
      });

      if (post.type === 'Scheduled') {
         payload.append('scheduledDays', JSON.stringify(editScheduleMatrix));
      }
      
      if (imageFile) {
         payload.append('image', imageFile);
      }

      const { data } = await api.put(`/posts/${id}`, payload);
      
      setPost(data);
      setIsEditing(false);
      setImageFile(null); 
      toast.success('Post Updated Successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setActionLocked(false);
    }
  };

  const cancelEdits = () => {
    setIsEditing(false);
    setEditForm(post);
    setEditScheduleMatrix(post.scheduledDays || []);
    setImagePreview(post.image ? `${API_BASE_URL}${post.image}` : null);
    setImageFile(null);
  };

  const commonInputClass = "w-full bg-[#f4f7f4] border-2 border-transparent rounded-full px-5 py-3.5 text-[15px] font-bold text-[#064e3b] outline-none focus:bg-white focus:border-[#10b981]/30 focus:ring-4 focus:ring-[#10b981]/10 transition-all placeholder:text-[#82a38e] shadow-inner shadow-black/[0.01]";

  if (isLoading || !post) {
    return (
      <Layout role="Supplier">
        <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 animate-pulse">
          <div className="h-10 bg-[#e8f0eb] rounded-full w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-white rounded-[2rem] border border-[#e8f0eb]"></div>
              <div className="h-48 bg-white rounded-[2rem] border border-[#e8f0eb]"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-white rounded-[2rem] border border-[#e8f0eb]"></div>
              <div className="h-48 bg-white rounded-[2rem] border border-[#e8f0eb]"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="Supplier">
      <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
        
        {/* Organic Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e8f0eb] pb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">
              <span className="cursor-pointer hover:text-[#10b981] transition-colors" onClick={() => navigate('/supplier/dashboard')}>Dashboard</span>
              <span>/</span>
              <span className="font-mono text-[#10b981]">{post._id}</span>
            </div>
            <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">{post.type === 'Scheduled' ? 'Manage Schedule' : 'Manage Drop'}</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2 rounded-full text-[12px] font-extrabold uppercase tracking-wider flex items-center gap-2 ${post.status === 'Active' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#f4f7f4] text-[#82a38e]'}`}>
              {post.status === 'Active' && <span className="w-2 h-2 bg-[#10b981] rounded-full animate-ping"></span>}
              {post.status}
            </div>

            {post.status === 'Active' && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-white border border-[#e8f0eb] text-[#064e3b] rounded-full text-[14.5px] font-bold hover:bg-[#f4f7f4] transition-colors shadow-sm">
                Edit Details
              </button>
            )}
            {isEditing && (
              <div className="flex gap-3">
                <button onClick={cancelEdits} className="px-6 py-2.5 bg-[#f4f7f4] text-[#4a6b56] rounded-full text-[14.5px] font-bold hover:bg-[#e8f0eb] hover:text-[#064e3b] transition-colors">
                  Cancel
                </button>
                <button onClick={saveEdits} disabled={actionLocked} className="px-6 py-2.5 bg-[#10b981] text-white rounded-full text-[14.5px] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                  {actionLocked ? <div className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
             
             {/* Food Details Section */}
             <section className="bg-white border border-[#e8f0eb] rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                <h3 className="text-xl font-extrabold text-[#064e3b] mb-6 border-b border-[#e8f0eb] pb-4">Food Drop Details</h3>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <InputWrapper label="Category" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
                        <select name="category" value={editForm.category || ''} onChange={handleEditChange} className={`${commonInputClass} cursor-pointer`}>
                          <option>Prepared Meals</option><option>Bakery/Grains</option><option>Produce</option><option>Dairy</option><option>Meat/Protein</option>
                        </select>
                     </InputWrapper>
                     <InputWrapper label="Volume (Kg)" icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                        <input type="number" step="0.1" name="weight" value={editForm.weight || ''} onChange={handleEditChange} className={commonInputClass}/>
                     </InputWrapper>
                     
                     <div className="sm:col-span-2">
                        <InputWrapper label="Food Life" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                           <input type="text" name="shelfLife" value={editForm.shelfLife || ''} onChange={handleEditChange} className={commonInputClass}/>
                        </InputWrapper>
                     </div>

                     {post.type === 'OneTime' && (
                       <>
                         <InputWrapper label="Pickup Date" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                            <input type="date" name="pickupDate" min={todayFormatted} value={editForm.pickupDate || ''} onChange={handleEditChange} className={commonInputClass}/>
                         </InputWrapper>
                         <InputWrapper label="Pickup Time" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                            <input type="time" name="pickupTime" value={editForm.pickupTime || ''} onChange={handleEditChange} className={commonInputClass}/>
                         </InputWrapper>
                       </>
                     )}
                     
                     {/* Exact Preserved Segmented Logic for YES/NO */}
                     <div className="sm:col-span-2 bg-[#fbfdfb] border border-[#e8f0eb] rounded-[1.5rem] p-5 mt-2">
                        <h4 className="text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-4">Will you provide packaging?</h4>
                        <div className="flex bg-[#f4f7f4] rounded-full p-1.5 border border-[#e8f0eb]">
                          <label className={`flex-1 py-2.5 text-[14.5px] font-extrabold rounded-full transition-all duration-300 cursor-pointer text-center ${editForm.packaging === true ? 'bg-white text-[#064e3b] shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-[#82a38e] hover:text-[#4a6b56]'}`}>
                            <input type="radio" name="packaging" value="true" checked={editForm.packaging === true} onChange={handleEditChange} className="hidden" />
                            YES
                          </label>
                          <label className={`flex-1 py-2.5 text-[14.5px] font-extrabold rounded-full transition-all duration-300 cursor-pointer text-center ${editForm.packaging === false ? 'bg-white text-[#064e3b] shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'text-[#82a38e] hover:text-[#4a6b56]'}`}>
                            <input type="radio" name="packaging" value="false" checked={editForm.packaging === false} onChange={handleEditChange} className="hidden" />
                            NO
                          </label>
                        </div>
                     </div>

                     <div className="sm:col-span-2 border-t border-[#e8f0eb] pt-6 mt-4 space-y-6">
                        <h4 className="text-[15px] font-extrabold text-[#064e3b]">Location Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <InputWrapper label="State">
                              <select name="state" value={editForm.state || ''} onChange={handleEditChange} className={`${commonInputClass} cursor-pointer`}>
                                <option value="">Select State</option>
                                {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                              </select>
                           </InputWrapper>
                           <InputWrapper label="District">
                              <select name="district" value={editForm.district || ''} onChange={handleEditChange} disabled={!editForm.state} className={`${commonInputClass} cursor-pointer disabled:opacity-50`}>
                                <option value="">Select District</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                           </InputWrapper>
                           <InputWrapper label="City">
                              <input type="text" name="city" value={editForm.city || ''} onChange={handleEditChange} className={commonInputClass}/>
                           </InputWrapper>
                        </div>
                        <InputWrapper label="Street Address" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                           <input type="text" name="pickupAddress" value={editForm.pickupAddress || ''} onChange={handleEditChange} className={commonInputClass}/>
                        </InputWrapper>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6 sm:gap-8">
                       {[
                         { label: "Category", value: post.category, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
                         { label: "Total Volume", value: `${post.weight} kg`, icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
                         { label: "Packaging", value: post.packaging ? "Packaged" : "Bulk Transfer", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                         { label: "Scheduled Slot", value: post.type === 'Scheduled' ? 'Weekly Active Schedule' : `${post.pickupDate || 'ASAP'} ${post.pickupTime || ''}`, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
                       ].map((item, idx) => (
                         <div key={idx} className="flex flex-col">
                            <div className="flex items-center gap-2 text-[#82a38e] mb-1.5">
                               <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon}/></svg>
                               <span className="text-[12px] font-extrabold uppercase tracking-wider">{item.label}</span>
                            </div>
                            <p className="text-[15px] font-bold text-[#064e3b] pl-6">{item.value}</p>
                         </div>
                       ))}
                    </div>

                    <div className="bg-[#f4f7f4] border border-[#e8f0eb] rounded-[1.5rem] p-6 mt-6">
                       <h4 className="text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          Pickup Location
                       </h4>
                       <p className="text-[15px] font-bold text-[#064e3b] leading-relaxed pl-6">
                         {post.pickupAddress}<br/>
                         <span className="text-[#4a6b56] font-medium">{post.city}, {post.district && `${post.district}, `}{post.state}</span>
                       </p>
                    </div>
                  </div>
                )}
             </section>

             {/* Schedule Matrix */}
             {post.type === 'Scheduled' && (
               <section className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                  <div className="p-6 border-b border-[#e8f0eb] bg-[#fbfdfb] flex items-center justify-between">
                     <div>
                       <h3 className="text-lg font-extrabold text-[#064e3b]">Schedule Timetable</h3>
                       <p className="text-[13px] font-medium text-[#4a6b56] mt-0.5">{isEditing ? 'Modify your active days below.' : 'Currently active broadcast days.'}</p>
                     </div>
                  </div>
                  <div className="divide-y divide-[#e8f0eb]">
                     {(isEditing ? editScheduleMatrix : post.scheduledDays).map((item, idx) => (
                       <div key={item.day} className={`p-5 transition-colors ${item.isActive ? 'bg-[#ecfdf5]/50' : 'bg-white'}`}>
                          <div className="flex items-center justify-between">
                             <span className={`text-[15px] font-extrabold transition-colors ${item.isActive ? 'text-[#10b981]' : 'text-[#4a6b56]'}`}>
                               {item.day}
                             </span>
                             {isEditing && (
                               <div onClick={() => updateMatrix(idx, 'isActive', !item.isActive)} className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors shadow-inner ${item.isActive ? 'bg-[#10b981]' : 'bg-[#e8f0eb]'}`}>
                                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${item.isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                               </div>
                             )}
                          </div>
                          {item.isActive && (
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#e8f0eb] animate-in slide-in-from-top-2 duration-300">
                               <InputWrapper label="Release">
                                  {isEditing ? (
                                    <input type="time" value={item.postTime} onChange={(e) => updateMatrix(idx, 'postTime', e.target.value)} className={commonInputClass}/>
                                  ) : (
                                    <p className="text-[15px] font-bold text-[#064e3b]">{item.postTime}</p>
                                  )}
                               </InputWrapper>
                               <InputWrapper label="Deadline">
                                  {isEditing ? (
                                    <input type="time" value={item.deadlineTime} onChange={(e) => updateMatrix(idx, 'deadlineTime', e.target.value)} className={commonInputClass}/>
                                  ) : (
                                    <p className="text-[15px] font-bold text-[#064e3b]">{item.deadlineTime}</p>
                                  )}
                               </InputWrapper>
                            </div>
                          )}
                       </div>
                     ))}
                  </div>
               </section>
             )}

             {/* NGO Claims Area */}
             <section className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                <div className="p-6 border-b border-[#e8f0eb] bg-[#fbfdfb] flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#064e3b]">NGO Requests</h3>
                    <p className="text-[13px] font-medium text-[#4a6b56] mt-0.5">Manage incoming claims from local network</p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-[#ecfdf5] text-[#10b981] border border-[#d1fae5] rounded-full text-[11px] font-extrabold uppercase tracking-wider">
                    {post.claims?.length || 0} Total
                  </span>
                </div>
                
                <div className="divide-y divide-[#e8f0eb]">
                   {post.claims && post.claims.length > 0 ? post.claims.map(claim => (
                      <div key={claim._id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:bg-[#fbfdfb] transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[16px] shrink-0 border ${claim.status === 'Approved' ? 'bg-[#ecfdf5] text-[#10b981] border-[#d1fae5]' : claim.status === 'Rejected' ? 'bg-[#fef2f2] text-[#e11d48] border-[#fecdd3]' : 'bg-[#f4f7f4] text-[#4a6b56] border-[#e8f0eb]'}`}>
                              {claim.ngoName?.charAt(0)}
                            </div>
                            <div>
                               <h4 className="text-[15px] font-extrabold text-[#064e3b]">{claim.ngoName}</h4>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[12px] font-bold text-[#82a38e] flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> 
                                    {claim.ngoPhone}
                                  </span>
                                  <div className="w-1 h-1 bg-[#e8f0eb] rounded-full"></div>
                                  <span className={`text-[11px] font-extrabold uppercase tracking-wider ${claim.status === 'Approved' ? 'text-[#10b981]' : claim.status === 'Rejected' ? 'text-[#e11d48]' : 'text-[#d97706]'}`}>
                                    {claim.status}
                                  </span>
                               </div>
                            </div>
                         </div>
                         {claim.status === 'Pending' && post.status === 'Active' && (
                           <div className="flex gap-3 w-full sm:w-auto">
                              <button onClick={() => processClaimHandshake(claim._id, 'Rejected')} disabled={actionLocked} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#f4f7f4] text-[#4a6b56] rounded-full text-[13px] font-extrabold hover:bg-[#fef2f2] hover:text-[#e11d48] transition-colors">Reject</button>
                              <button onClick={() => processClaimHandshake(claim._id, 'Approved')} disabled={actionLocked} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#10b981] text-white rounded-full text-[13px] font-extrabold hover:bg-[#059669] hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)]">Approve</button>
                           </div>
                         )}
                      </div>
                   )) : (
                      <div className="py-16 flex flex-col items-center justify-center text-center">
                         <div className="w-14 h-14 bg-[#f4f7f4] rounded-full flex items-center justify-center mb-4">
                           <svg className="w-6 h-6 text-[#82a38e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                         </div>
                         <p className="text-[15px] font-extrabold text-[#064e3b] mb-1.5">No requests yet</p>
                         <p className="text-[14px] font-medium text-[#4a6b56] max-w-xs">When verified NGOs request this food, they will appear here for your approval.</p>
                      </div>
                   )}
                </div>
             </section>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
             
             {/* Edit Image Section */}
             <section className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)] sticky top-24">
                <div className="p-6 border-b border-[#e8f0eb] bg-[#fbfdfb]">
                  <h3 className="text-lg font-extrabold text-[#064e3b]">Reference Photo</h3>
                </div>
                <div className="p-6 bg-white">
                  {isEditing ? (
                     <>
                       <div onClick={() => fileInputRef.current.click()} className={`relative w-full h-48 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${imagePreview ? 'border-[#10b981] bg-white' : 'border-[#82a38e]/40 bg-[#f4f7f4] hover:border-[#10b981] hover:bg-[#ecfdf5] group'}`}>
                         {imagePreview ? (
                           <>
                             <img src={imagePreview} className="w-full h-full object-cover" alt="Preview"/>
                             <div className="absolute inset-0 bg-[#064e3b]/60 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[13px] font-extrabold uppercase tracking-wider">Change Photo</div>
                           </>
                         ) : (
                           <div className="text-center px-4">
                              <p className="text-[14px] font-bold text-[#064e3b]">Click to Upload</p>
                           </div>
                         )}
                       </div>
                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange}/>
                     </>
                  ) : (
                     <div className="relative w-full h-48 rounded-[1.5rem] overflow-hidden bg-[#f4f7f4] border border-[#e8f0eb]">
                        {post.image ? (
                           <img src={`${API_BASE_URL}${post.image}`} className="w-full h-full object-cover" alt="Food Verification"/>
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-[#82a38e] p-4 text-center">
                             <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                             <span className="text-[12px] font-extrabold uppercase tracking-wider">No image provided</span>
                           </div>
                        )}
                     </div>
                  )}
                </div>
             </section>

             <section className="bg-white border border-[#e8f0eb] rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                <h4 className="text-lg font-extrabold text-[#064e3b] mb-6 border-b border-[#e8f0eb] pb-4">Contact Details</h4>
                {isEditing ? (
                  <div className="space-y-5">
                     <InputWrapper label="Contact Name">
                        <input type="text" name="contactName" value={editForm.contactName || ''} onChange={handleEditChange} className={commonInputClass}/>
                     </InputWrapper>
                     <InputWrapper label="Phone Number">
                        <input type="tel" name="contactPhone" value={editForm.contactPhone || ''} onChange={handleEditChange} className={commonInputClass}/>
                     </InputWrapper>
                     <InputWrapper label="Gate Instructions">
                        <textarea name="specialInstructions" rows="3" value={editForm.specialInstructions || ''} onChange={handleEditChange} className={`${commonInputClass} rounded-[1.5rem] resize-none`}/>
                     </InputWrapper>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#10b981] font-black text-lg shrink-0">
                         {post.contactName?.charAt(0)}
                       </div>
                       <div className="min-w-0">
                          <p className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-0.5">Primary Contact</p>
                          <p className="text-[15px] font-bold text-[#064e3b] truncate">{post.contactName}</p>
                       </div>
                    </div>
                    <div className="pt-6 border-t border-[#e8f0eb] space-y-6">
                       <div>
                          <span className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider block mb-1">Contact no.</span>
                          <p className="text-[15px] font-bold text-[#064e3b]">{post.contactPhone}</p>
                       </div>
                       {post.specialInstructions && (
                          <div>
                             <span className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider block mb-2">Instructions</span>
                             <p className="text-[13.5px] font-medium text-[#4a6b56] leading-relaxed bg-[#f4f7f4] p-4 rounded-[1.5rem] border border-[#e8f0eb]">{post.specialInstructions}</p>
                          </div>
                       )}
                    </div>
                  </div>
                )}
             </section>

             <section className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                <div className="p-6 border-b border-[#fecdd3] bg-[#fff1f2]">
                  <h4 className="text-[15px] font-extrabold text-[#e11d48] flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    Manual Override
                  </h4>
                </div>
                <div className="p-6 space-y-4 bg-[#fbfdfb]">
                   <p className="text-[13px] font-medium text-[#4a6b56] leading-relaxed mb-4">Updating status skips tracking. Used only if food is disposed of or picked up outside the app.</p>
                   <button onClick={() => modifyStatus('Claimed')} disabled={actionLocked || post.status !== 'Active'} className="w-full py-3.5 bg-white border border-[#e8f0eb] text-[#064e3b] rounded-full text-[14.5px] font-bold hover:bg-[#f4f7f4] hover:border-[#d1fae5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                      <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> Force Claimed
                   </button>
                   <button onClick={() => modifyStatus('Expired')} disabled={actionLocked || post.status !== 'Active'} className="w-full py-3.5 bg-white border border-[#fecdd3] text-[#e11d48] rounded-full text-[14.5px] font-bold hover:bg-[#fef2f2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg> Mark as Expired
                   </button>
                </div>
             </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagePost;