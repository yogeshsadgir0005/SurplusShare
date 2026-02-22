import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/axios';
import Layout from '../components/Layout';

const FoodDetailNGO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setResource(data);
      } catch (error) {
        toast.error('Network Connection Error');
      } finally {
        setTimeout(() => setIsSyncing(false), 800);
      }
    };
    fetchResource();
  }, [id]);

  const executeClaimNode = async () => {
    setIsClaiming(true);
    try {
      await api.post(`/posts/${id}/claim`);
      toast.success('Claim Request Sent Successfully');
      navigate('/ngo/listings');
    } catch (error) {
      toast.error('Could Not Claim: Limit Reached');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isSyncing || !resource) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-center">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Loading Details...</p>
           <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
             <div className="h-full bg-indigo-500 animate-pulse w-full"></div>
           </div>
        </div>
      </div>
    );
  }

  const distString = resource.district ? `${resource.district}, ` : '';
  const mapQuery = encodeURIComponent(`${resource.pickupAddress}, ${resource.city}, ${distString}${resource.state}, India`);

  return (
    <Layout role="NGO">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
        
        {/* Top Navigation Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <button onClick={() => navigate('/ngo/listings')} className="group flex items-center text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-[0.3em] gap-3">
             <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 19l-7-7 7-7"/></svg>
             </div>
             Back to Food List
           </button>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Post ID</span>
              <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-black tracking-tight">{resource._id}</span>
           </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[2.5rem] lg:rounded-[4rem] shadow-[0_60px_120px_-40px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2">
              
              {/* Media Section: Image/Placeholder + Map Overlay */}
              <div className="relative border-b lg:border-b-0 lg:border-r border-slate-200 min-h-[400px] lg:min-h-0">
                 {resource.type === 'Scheduled' || !resource.image ? (
                   <div className="h-full bg-slate-900 flex flex-col items-center justify-center p-12 lg:p-20 text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-transparent"></div>
                      <svg className="w-16 h-16 lg:w-24 lg:h-24 text-indigo-500/20 mb-8 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                      <h4 className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase mb-4 relative z-10">Scheduled Daily Post</h4>
                      <p className="text-slate-500 text-[10px] lg:text-xs font-bold leading-relaxed max-w-xs relative z-10 uppercase tracking-widest px-4">This food is posted automatically every day. Please check quality on pickup.</p>
                   </div>
                 ) : (
                   <div className="h-64 sm:h-96 lg:h-full relative group">
                      <img src={`${API_BASE_URL}${resource.image}`} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt="Resource"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      <div className="absolute top-6 lg:top-10 left-6 lg:left-10 bg-emerald-500 text-white px-4 lg:px-5 py-2 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">Verified Photo</div>
                   </div>
                 )}
                 
                 {/* Map Overlay - Adjusting position for mobile */}
                 <div className="absolute bottom-6 lg:bottom-10 left-6 lg:left-10 right-6 lg:right-10 h-48 sm:h-64 rounded-[2rem] lg:rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'grayscale(0.6) contrast(1.2)' }} 
                      loading="lazy" 
                      allowFullScreen 
                      src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                    <div className="absolute inset-0 pointer-events-none border border-slate-900/10 rounded-[2rem] lg:rounded-[3rem]"></div>
                 </div>
              </div>

              {/* Details Section */}
              <div className="p-8 sm:p-12 lg:p-24 flex flex-col justify-between">
                 <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                       <div>
                          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4 uppercase">{resource.supplierId?.supplierDetails?.legalName}</h1>
                          <div className="flex flex-wrap items-center gap-3">
                             <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100">{resource.category}</span>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resource.type === 'Scheduled' ? 'Daily Drops' : 'One-Time Post'}</span>
                          </div>
                       </div>
                       <div className="sm:text-right">
                          <span className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-none">{resource.weight}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mt-1">Kg Total</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 lg:gap-10 mb-16">
                       {[
                         { label: "Fresh For", val: resource.shelfLife, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                         { label: "Pickup By", val: resource.pickupDeadline || "ASAP", icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-10.714A9.535 9.535 0 003 12c0 1.291.256 2.523.721 3.647" },
                         { label: "Packed", val: resource.packaging ? "Yes" : "No", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                         { label: "Quality", val: "Tier 1", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" }
                       ].map((stat, i) => (
                         <div key={i} className="space-y-2">
                            <div className="flex items-center gap-1.5 opacity-30">
                               <svg className="w-3.5 h-3.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon}/></svg>
                               <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                            </div>
                            <p className="text-base lg:text-lg font-black text-slate-800 tracking-tight leading-none">{stat.val}</p>
                         </div>
                       ))}
                    </div>

                    <div className="space-y-8 lg:space-y-10 mb-12 lg:mb-20">
                       <div>
                          <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                             Pickup Location
                          </h4>
                          <p className="text-lg lg:text-xl font-black text-slate-900 leading-snug tracking-tighter">
                            {resource.pickupAddress}<br/>
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] lg:text-[10px]">
                               {resource.city}, {resource.district && `${resource.district}, `}{resource.state}
                            </span>
                          </p>
                       </div>

                       <div className="flex items-center gap-5 p-6 lg:p-8 bg-slate-50 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100">
                          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-400 text-sm shadow-sm shrink-0 uppercase">{resource.contactName?.charAt(0)}</div>
                          <div className="min-w-0">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact</span>
                             <p className="text-sm lg:text-base font-black text-slate-900 tracking-tight leading-none mb-2 truncate">{resource.contactName}</p>
                             <p className="text-xs font-black text-indigo-600 tracking-wider flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.516 5.516l.773-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
                                {resource.contactPhone}
                             </p>
                          </div>
                       </div>

                       {resource.specialInstructions && (
                         <div>
                            <h4 className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                               Instructions
                            </h4>
                            <p className="text-xs lg:text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] border border-slate-100">{resource.specialInstructions}</p>
                         </div>
                       )}
                    </div>
                 </div>

                 <button 
                   onClick={executeClaimNode} 
                   disabled={isClaiming || resource.status !== 'Active'}
                   className="w-full py-6 lg:py-8 bg-indigo-600 text-white rounded-[1.5rem] lg:rounded-[2rem] font-black text-[10px] lg:text-xs uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-30 disabled:hover:translate-y-0"
                 >
                    {resource.status !== 'Active' ? (
                      <>
                        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        Already Claimed
                      </>
                    ) : isClaiming ? (
                      <div className="w-5 h-5 lg:w-6 lg:h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        Claim This Food
                      </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default FoodDetailNGO;