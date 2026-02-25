import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const ManagePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLocked, setActionLocked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const { states, districts } = useLocationAPI(editForm.state);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get('/posts/supplier');
        const currentPost = data.find(p => p._id === id);
        setPost(currentPost);
        setEditForm(currentPost);
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

  const saveEdits = async () => {
    setActionLocked(true);
    try {
      const { data } = await api.put(`/posts/${id}`, editForm);
      setPost(data);
      setIsEditing(false);
      toast.success('Post Updated Successfully');
    } catch (error) {
      toast.error('Failed to update post');
    } finally {
      setActionLocked(false);
    }
  };

  if (isLoading || !post) {
    return (
      <Layout role="Supplier">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-100 rounded-xl"></div>
              <div className="h-48 bg-slate-100 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-slate-100 rounded-xl"></div>
              <div className="h-48 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="Supplier">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Sleek Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
              <span className="cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => navigate('/supplier/dashboard')}>Dashboard</span>
              <span>/</span>
              <span className="font-mono text-slate-400">{post._id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Post</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-2 ${post.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {post.status === 'Active' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
              {post.status}
            </div>

            {post.status === 'Active' && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                Edit Details
              </button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <button onClick={() => {setIsEditing(false); setEditForm(post);}} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                  Cancel
                </button>
                <button onClick={saveEdits} disabled={actionLocked} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                  {actionLocked ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Logistics & Claims (2/3 width) */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
             
             {/* Food Details Section */}
             <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-3">Food & Logistics</h3>
                
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <InputWrapper label="Category" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4">
                        <select name="category" value={editForm.category || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors">
                          <option>Prepared Meals</option><option>Bakery/Grains</option><option>Produce</option><option>Dairy</option><option>Meat/Protein</option>
                        </select>
                     </InputWrapper>
                     <InputWrapper label="Volume (Kg)" icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                        <input type="number" step="0.1" name="weight" value={editForm.weight || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                     </InputWrapper>
                     
                     <div className="sm:col-span-2">
                        <InputWrapper label="Shelf Life" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                           <input type="text" name="shelfLife" value={editForm.shelfLife || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                        </InputWrapper>
                     </div>

                     <InputWrapper label="Pickup Date" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                        <input type="date" name="pickupDate" value={editForm.pickupDate || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                     </InputWrapper>
                     <InputWrapper label="Pickup Time" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                        <input type="time" name="pickupTime" value={editForm.pickupTime || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                     </InputWrapper>
                     
                     <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4 mt-2">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Packaging Protocol</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${editForm.packaging === true ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'}`}>
                            <input type="radio" name="packaging" value="true" checked={editForm.packaging === true} onChange={handleEditChange} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${editForm.packaging === true ? 'border-emerald-500' : 'border-slate-300'}`}>
                              {editForm.packaging === true && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                            </div>
                            <span className="text-sm font-semibold">Packaged</span>
                          </label>
                          <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${editForm.packaging === false ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-600'}`}>
                            <input type="radio" name="packaging" value="false" checked={editForm.packaging === false} onChange={handleEditChange} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${editForm.packaging === false ? 'border-emerald-500' : 'border-slate-300'}`}>
                              {editForm.packaging === false && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                            </div>
                            <span className="text-sm font-semibold">Bulk Transfer</span>
                          </label>
                        </div>
                     </div>

                     <div className="sm:col-span-2 border-t border-slate-100 pt-5 mt-2 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-900">Location Settings</h4>
                        <InputWrapper label="Street Address" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                           <input type="text" name="pickupAddress" value={editForm.pickupAddress || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                        </InputWrapper>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <InputWrapper label="State">
                              <select name="state" value={editForm.state || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer">
                                <option value="">Select State</option>
                                {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                              </select>
                           </InputWrapper>
                           <InputWrapper label="District">
                              <select name="district" value={editForm.district || ''} onChange={handleEditChange} disabled={!editForm.state} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:opacity-50 cursor-pointer">
                                <option value="">Select District</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                           </InputWrapper>
                           <InputWrapper label="City">
                              <input type="text" name="city" value={editForm.city || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                           </InputWrapper>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                       {[
                         { label: "Category", value: post.category, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
                         { label: "Total Volume", value: `${post.weight} kg`, icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
                         { label: "Packaging", value: post.packaging ? "Packaged" : "Bulk Transfer", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                         { label: "Scheduled Slot", value: post.type === 'Scheduled' ? 'Daily Setup' : `${post.pickupDate || 'ASAP'} ${post.pickupTime || ''}`, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
                       ].map((item, idx) => (
                         <div key={idx} className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
                               <span className="text-xs font-medium">{item.label}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 pl-5">{item.value}</p>
                         </div>
                       ))}
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mt-6">
                       <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          Pickup Location
                       </h4>
                       <p className="text-sm font-medium text-slate-900 leading-relaxed pl-5">
                         {post.pickupAddress}<br/>
                         <span className="text-slate-500">{post.city}, {post.district && `${post.district}, `}{post.state}</span>
                       </p>
                    </div>
                  </div>
                )}
             </section>

             {/* CRM Style Claims List */}
             <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">NGO Requests</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Manage incoming claims from local network</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold">
                    {post.claims?.length || 0} Total
                  </span>
                </div>
                
                <div className="divide-y divide-slate-100">
                   {post.claims && post.claims.length > 0 ? post.claims.map(claim => (
                      <div key={claim._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border ${claim.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : claim.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                              {claim.ngoName?.charAt(0)}
                            </div>
                            <div>
                               <h4 className="text-sm font-semibold text-slate-900">{claim.ngoName}</h4>
                               <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> 
                                    {claim.ngoPhone}
                                  </span>
                                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                  <span className={`text-xs font-semibold ${claim.status === 'Approved' ? 'text-emerald-600' : claim.status === 'Rejected' ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {claim.status}
                                  </span>
                               </div>
                            </div>
                         </div>

                         {/* Action Buttons for Pending Claims */}
                         {claim.status === 'Pending' && post.status === 'Active' && (
                           <div className="flex gap-2 w-full sm:w-auto">
                              <button 
                                onClick={() => processClaimHandshake(claim._id, 'Rejected')} 
                                disabled={actionLocked} 
                                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                              >
                                Reject
                              </button>
                              <button 
                                onClick={() => processClaimHandshake(claim._id, 'Approved')} 
                                disabled={actionLocked} 
                                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                           </div>
                         )}
                      </div>
                   )) : (
                      <div className="py-12 flex flex-col items-center justify-center text-center">
                         <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-3">
                           <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                         </div>
                         <p className="text-sm font-medium text-slate-900 mb-1">No requests yet</p>
                         <p className="text-xs text-slate-500 max-w-xs">When verified NGOs request this food, they will appear here for your approval.</p>
                      </div>
                   )}
                </div>
             </section>
          </div>

          {/* Right Column: Actions & Contact (1/3 width) */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
             
             {/* Contact Person Card */}
             <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Point of Contact</h4>
                
                {isEditing ? (
                  <div className="space-y-4">
                     <InputWrapper label="Contact Name">
                        <input type="text" name="contactName" value={editForm.contactName || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                     </InputWrapper>
                     <InputWrapper label="Phone Number">
                        <input type="tel" name="contactPhone" value={editForm.contactPhone || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"/>
                     </InputWrapper>
                     <InputWrapper label="Gate Instructions">
                        <textarea name="specialInstructions" rows="3" value={editForm.specialInstructions || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"/>
                     </InputWrapper>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                         {post.contactName?.charAt(0)}
                       </div>
                       <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Primary Contact</p>
                          <p className="text-sm font-semibold text-slate-900 truncate">{post.contactName}</p>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                       <div>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">Direct Line</span>
                          <p className="text-sm font-semibold text-slate-900">{post.contactPhone}</p>
                       </div>
                       {post.specialInstructions && (
                          <div>
                             <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">Instructions</span>
                             <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{post.specialInstructions}</p>
                          </div>
                       )}
                    </div>
                  </div>
                )}
             </section>

             {/* Danger Zone / Status Management */}
             <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-rose-50/30">
                  <h4 className="text-sm font-semibold text-rose-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    Manual Override
                  </h4>
                </div>
                
                <div className="p-5 space-y-4">
                   <p className="text-xs text-slate-600 leading-relaxed mb-2">
                     Manually updating the status skips standard tracking. Used only if food is disposed of or picked up outside the app.
                   </p>
                   
                   <button 
                     onClick={() => modifyStatus('Claimed')} 
                     disabled={actionLocked || post.status !== 'Active'} 
                     className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                   >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                      Force Claimed
                   </button>
                   <button 
                     onClick={() => modifyStatus('Expired')} 
                     disabled={actionLocked || post.status !== 'Active'} 
                     className="w-full py-2.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-50 hover:border-rose-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                   >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      Mark as Expired
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