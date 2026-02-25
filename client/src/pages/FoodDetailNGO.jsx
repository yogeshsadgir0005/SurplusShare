import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { API_BASE_URL } from '../services/axios';
import Layout from '../components/Layout';

const FoodDetailNGO = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setResource(data);
        if (data.hasClaimed) setHasClaimed(true);
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
      setHasClaimed(true); 
      setResource(prev => ({ ...prev, claims: [...(prev.claims || []), {}] }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could Not Claim: Error Occurred');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isSyncing || !resource) {
    return (
      <Layout role="NGO">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="bg-white rounded-xl border border-slate-200 h-[600px] flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 bg-slate-100 border-r border-slate-200"></div>
            <div className="w-full lg:w-1/2 p-8 space-y-6">
              <div className="h-10 w-3/4 bg-slate-200 rounded-lg"></div>
              <div className="h-24 w-full bg-slate-100 rounded-lg"></div>
              <div className="h-48 w-full bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const distString = resource.district ? `${resource.district}, ` : '';
  const mapQuery = (resource.lat && resource.lng) 
    ? `${resource.lat},${resource.lng}` 
    : encodeURIComponent(`${resource.pickupAddress}, ${resource.city}, ${distString}${resource.state}, India`);
  const claimCount = resource.claims ? resource.claims.length : 0;

  return (
    <Layout role="NGO">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Sleek Top Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <button 
             onClick={() => navigate('/ngo/listings')} 
             className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
             Back to Food List
           </button>
           <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500 font-medium">Reference ID:</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-xs border border-slate-200">{resource._id}</span>
           </div>
        </div>

        {/* Professional Split Layout Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row">
           
           {/* Left Column: Media & Map (Logistics View) */}
           <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50">
              
              {/* Product Verification Image */}
              <div className="h-64 sm:h-80 relative bg-slate-100 border-b border-slate-200 shrink-0">
                 {resource.type === 'Scheduled' || !resource.image ? (
                   <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                      <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                      <h4 className="text-sm font-semibold text-slate-700">Scheduled Daily Release</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">Standardized daily drop. Please verify quality directly at pickup location.</p>
                   </div>
                 ) : (
                   <>
                      <img src={`${API_BASE_URL}${resource.image}`} className="w-full h-full object-cover" alt="Resource Verification"/>
                      <div className="absolute top-4 left-4 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Verified Photo
                      </div>
                   </>
                 )}
              </div>

              {/* Map Routing Frame */}
              <div className="flex-grow min-h-[300px] relative bg-slate-200 group/map">
                <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  loading="lazy" 
                  allowFullScreen 
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
                
                {/* Clean Directions Button */}
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 bg-white text-slate-700 border border-slate-200 shadow-sm px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                  Get Directions
                </a>
              </div>
           </div>

           {/* Right Column: Structured Data Table */}
           <div className="w-full lg:w-[55%] flex flex-col p-6 sm:p-8">
              
              {/* Main Header Block */}
              <div className="mb-8 border-b border-slate-100 pb-6">
                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                    <div>
                       <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                         {resource.supplierId?.supplierDetails?.legalName}
                       </h1>
                       <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">{resource.category}</span>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{resource.type === 'Scheduled' ? 'Daily Drops' : 'One-Time Post'}</span>
                       </div>
                    </div>
                    <div className="sm:text-right bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg shrink-0">
                       <span className="block text-xs font-semibold text-slate-500 mb-0.5 uppercase tracking-wide">Total Volume</span>
                       <span className="text-2xl font-bold text-slate-900 leading-none">{resource.weight} <span className="text-sm text-slate-500 font-medium">kg</span></span>
                    </div>
                 </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
                 {[
                   { label: "Fresh For", val: resource.shelfLife, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                   { label: "Pickup Deadline", val: resource.pickupDeadline || "ASAP", icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-10.714A9.535 9.535 0 003 12c0 1.291.256 2.523.721 3.647" },
                   { label: "Packaging", val: resource.packaging ? "YES" : "NO", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                   { label: "Quality Assessment", val: "Tier 1", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944" }
                 ].map((stat, i) => (
                   <div key={i} className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/></svg>
                         <span className="text-xs font-medium">{stat.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 pl-5">{stat.val}</p>
                   </div>
                 ))}
              </div>

              {/* CRM Style Location & Contact Cards */}
              <div className="space-y-4 mb-auto pb-8">
                 <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                       <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       Pickup Address
                    </h4>
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {resource.pickupAddress}<br/>
                      <span className="text-slate-500">{resource.city}, {resource.district && `${resource.district}, `}{resource.state}</span>
                    </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center font-bold text-slate-600 shrink-0">
                        {resource.contactName?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                         <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-0.5">Primary Contact</span>
                         <p className="text-sm font-semibold text-slate-900 truncate">{resource.contactName}</p>
                         <p className="text-sm text-indigo-600 font-medium truncate">{resource.contactPhone}</p>
                      </div>
                   </div>

                   {resource.specialInstructions && (
                     <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">Gate Instructions</span>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed">{resource.specialInstructions}</p>
                     </div>
                   )}
                 </div>
              </div>

              {/* Action Area with Request Count */}
              <div className="pt-6 border-t border-slate-200 mt-6 space-y-4">
                 {claimCount > 0 && resource.status === 'Active' && (
                    <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 py-2 rounded-lg border border-amber-100">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span className="text-xs font-semibold">
                        {claimCount} {claimCount === 1 ? 'organization has' : 'organizations have'} requested this load
                      </span>
                    </div>
                 )}

                 <button 
                   onClick={executeClaimNode} 
                   disabled={isClaiming || resource.status !== 'Active' || hasClaimed}
                   className={`w-full py-4 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 ${
                     hasClaimed || resource.status !== 'Active' 
                       ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed' 
                       : 'bg-indigo-600 text-white hover:bg-indigo-700'
                   }`}
                 >
                    {resource.status !== 'Active' ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        Already Claimed
                      </>
                    ) : hasClaimed ? (
                      <>
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Request Pending Review
                      </>
                    ) : isClaiming ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        Submit Claim Request
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