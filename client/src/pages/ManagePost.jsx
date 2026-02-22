import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/axios';
import { useLocationAPI } from '../hooks/useLocationAPI';
import Layout from '../components/Layout';

const ManagePost = () => {
  const { id } = useParams();
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Loading details...</p>
      </div>
    );
  }

  return (
    <Layout role="Supplier">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-16 border-b border-slate-200 pb-12">
          <div>
            <div className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
              <span>Food Post</span>
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
              <span className="text-slate-900">{post._id}</span>
            </div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Manage Post</h2>
          </div>
          
          <div className="flex items-center gap-6">
            {post.status === 'Active' && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all">Edit Post</button>
            )}
            {isEditing && (
              <button onClick={saveEdits} disabled={actionLocked} className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all">Save Changes</button>
            )}
            
            <div className="bg-white border border-slate-200 px-6 py-4 rounded-[1.5rem] shadow-sm flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
                <span className={`text-xs font-black uppercase tracking-widest ${post.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>{post.status}</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${post.status === 'Active' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-slate-300'}`}></div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-10">
             <section className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700"><svg className="w-32 h-32 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10 pb-6 border-b border-slate-50 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
                  Food Details
                </h3>
                
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-6 relative z-10">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category</label>
                        <select name="category" value={editForm.category || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none">
                          <option>Prepared Meals</option><option>Bakery/Grains</option><option>Produce</option><option>Dairy</option><option>Meat/Protein</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Volume (Kg)</label>
                        <input type="number" step="0.1" name="weight" value={editForm.weight || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                     </div>
                     
                     <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Shelf Life</label>
                        <input type="text" name="shelfLife" value={editForm.shelfLife || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pickup Date</label>
                        <input type="date" name="pickupDate" value={editForm.pickupDate || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pickup Time</label>
                        <input type="time" name="pickupTime" value={editForm.pickupTime || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                     </div>
                     
                     <div className="col-span-2 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Packaging Protocol</h4>
                        <div className="flex gap-4">
                          <label className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 ${editForm.packaging === true ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-transparent border-slate-200 opacity-60'}`}>
                            <input type="radio" name="packaging" value="true" checked={editForm.packaging === true} onChange={handleEditChange} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editForm.packaging === true ? 'border-emerald-500' : 'border-slate-300'}`}>
                              {editForm.packaging === true && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Packaged</span>
                          </label>
                          <label className={`flex-1 p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-center gap-3 ${editForm.packaging === false ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-transparent border-slate-200 opacity-60'}`}>
                            <input type="radio" name="packaging" value="false" checked={editForm.packaging === false} onChange={handleEditChange} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${editForm.packaging === false ? 'border-emerald-500' : 'border-slate-300'}`}>
                              {editForm.packaging === false && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest">Bulk Container</span>
                          </label>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                     {[
                       { label: "Category", value: post.category, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
                       { label: "Mass (kg)", value: post.weight, icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
                       { label: "Packaging", value: post.packaging ? "Packaged" : "No Packaging", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                       { label: "Date & Time", value: `${post.pickupDate || ''} ${post.pickupTime || ''}`, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
                     ].map((item, idx) => (
                       <div key={idx} className="space-y-2">
                          <div className="flex items-center gap-1.5 opacity-40">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={item.icon}/></svg>
                             <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                          </div>
                          <p className="text-base font-black text-slate-800 tracking-tight">{item.value}</p>
                       </div>
                     ))}
                  </div>
                )}

                <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pickup Location</h4>
                   {isEditing ? (
                     <div className="space-y-4">
                       <input type="text" name="pickupAddress" value={editForm.pickupAddress || ''} onChange={handleEditChange} placeholder="Street Address" className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <select name="state" value={editForm.state || ''} onChange={handleEditChange} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none cursor-pointer">
                            <option value="">Select State</option>
                            {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                          </select>
                          <select name="district" value={editForm.district || ''} onChange={handleEditChange} disabled={!editForm.state} className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none disabled:opacity-40 cursor-pointer">
                            <option value="">Select District</option>
                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <input type="text" name="city" value={editForm.city || ''} onChange={handleEditChange} placeholder="City / Town" className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                       </div>
                     </div>
                   ) : (
                     <>
                       <p className="text-sm font-black text-slate-700 leading-relaxed mb-1">{post.pickupAddress}</p>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{post.city}, {post.district && `${post.district}, `}{post.state}</p>
                     </>
                   )}
                </div>
             </section>

             <section className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm relative">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10 flex items-center justify-between">
                  NGO Requests
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{post.claims?.length || 0} Pending</span>
                </h3>
                <div className="space-y-4">
                   {post.claims && post.claims.length > 0 ? post.claims.map(claim => (
                      <div key={claim._id} className="group p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-500 flex flex-col md:flex-row justify-between items-center gap-8">
                         <div className="flex items-center gap-6 text-center md:text-left">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-sm transition-colors ${claim.status === 'Approved' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white border border-slate-200 text-slate-400'}`}>
                              {claim.ngoName?.charAt(0)}
                            </div>
                            <div>
                               <h4 className="text-base font-black text-slate-900 tracking-tight mb-0.5">{claim.ngoName}</h4>
                               <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> {claim.ngoPhone}</span>
                                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${claim.status === 'Approved' ? 'text-emerald-500' : 'text-slate-300'}`}>Status: {claim.status}</span>
                               </div>
                            </div>
                         </div>
                         {claim.status === 'Pending' && post.status === 'Active' && (
                           <div className="flex gap-3 w-full md:w-auto">
                              <button onClick={() => processClaimHandshake(claim._id, 'Approved')} disabled={actionLocked} className="flex-1 px-8 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">Accept</button>
                              <button onClick={() => processClaimHandshake(claim._id, 'Rejected')} disabled={actionLocked} className="flex-1 px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-rose-500 hover:border-rose-100 transition-all">Reject</button>
                           </div>
                         )}
                      </div>
                   )) : (
                      <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                         <svg className="w-16 h-16 text-slate-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                         <p className="text-sm font-black uppercase tracking-[0.3em]">No NGO requests yet</p>
                      </div>
                   )}
                </div>
             </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
             <section className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent opacity-50"></div>
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-10 relative z-10">Update Status</h4>
                <div className="space-y-4 relative z-10">
                   <button 
                     onClick={() => modifyStatus('Claimed')} 
                     disabled={actionLocked || post.status !== 'Active'} 
                     className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:border-emerald-600 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                   >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      Mark as Claimed
                   </button>
                   <button 
                     onClick={() => modifyStatus('Expired')} 
                     disabled={actionLocked || post.status !== 'Active'} 
                     className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:border-rose-600 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                   >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                      Mark as Expired
                   </button>
                </div>
                <div className="mt-12 pt-8 border-t border-white/10">
                   <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest italic">Warning: Once updated, the status cannot be changed back. Manual claims are not counted in your total impact.</p>
                </div>
             </section>

             <section className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Contact Person</h4>
                
                {isEditing ? (
                  <div className="space-y-6">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Name</label>
                        <input type="text" name="contactName" value={editForm.contactName || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                        <input type="tel" name="contactPhone" value={editForm.contactPhone || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"/>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Special Instructions</label>
                        <textarea name="specialInstructions" rows="3" value={editForm.specialInstructions || ''} onChange={handleEditChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 resize-none"/>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xs shadow-sm shadow-emerald-100">{post.contactName?.charAt(0)}</div>
                       <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">{post.contactName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Person</p>
                       </div>
                    </div>
                    <div className="space-y-6 pt-6 border-t border-slate-50">
                       <div>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">Phone Number</span>
                          <p className="text-xs font-black text-emerald-600">{post.contactPhone}</p>
                       </div>
                       {post.specialInstructions && (
                          <div>
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">Special Instructions</span>
                             <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{post.specialInstructions}</p>
                          </div>
                       )}
                    </div>
                  </>
                )}
             </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagePost;