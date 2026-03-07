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

  // Organic Theme Skeleton
  if (isSyncing || !resource) {
    return (
      <Layout role="NGO">
        <div className="max-w-[1400px] mx-auto animate-pulse space-y-6">
          <div className="h-6 w-48 bg-[#e8f0eb] rounded-full"></div>
          <div className="bg-white rounded-[2rem] border border-[#e8f0eb] h-[600px] flex flex-col lg:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="w-full lg:w-1/2 bg-[#f4f7f4] border-b lg:border-b-0 lg:border-r border-[#e8f0eb]"></div>
            <div className="w-full lg:w-1/2 p-8 lg:p-12 space-y-8">
              <div className="h-10 w-3/4 bg-[#f4f7f4] rounded-full"></div>
              <div className="h-24 w-full bg-[#f4f7f4] rounded-[1.5rem]"></div>
              <div className="h-48 w-full bg-[#f4f7f4] rounded-[1.5rem]"></div>
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


  const getScheduledDeadlineTime = (resource) => {
  if (resource.type !== 'Scheduled' || !Array.isArray(resource.scheduledDays)) {
    return resource.pickupTime || 'ASAP';
  }

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const todaySchedule = resource.scheduledDays.find(
    (item) => item.day === todayName && item.isActive
  );

  return todaySchedule?.deadlineTime || 'ASAP';
};

const pickupDeadlineTime =
  resource.type === 'Scheduled'
    ? getScheduledDeadlineTime(resource)
    : (resource.pickupTime || 'ASAP');


  return (
    <Layout role="NGO">
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-10">
        
        {/* Sleek Top Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <button 
             onClick={() => navigate('/ngo/listings')} 
             className="flex items-center text-[14.5px] font-bold text-[#82a38e] hover:text-[#10b981] transition-colors gap-2"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
             Back to Food List
           </button>
           <div className="flex items-center gap-3">
              <span className="text-[#82a38e] text-[11px] font-extrabold uppercase tracking-wider">Reference ID</span>
              <span className="px-4 py-1.5 bg-[#f4f7f4] text-[#064e3b] rounded-full font-mono text-[13px] font-bold border border-[#e8f0eb]">{resource._id}</span>
           </div>
        </div>

        {/* Organic Split Layout Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#e8f0eb] overflow-hidden flex flex-col lg:flex-row transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1">
           
           {/* Left Column: Media & Map */}
           <div className="w-full lg:w-[45%] flex flex-col border-b lg:border-b-0 lg:border-r border-[#e8f0eb] bg-[#f4f7f4]">
              
              {/* Product Verification Image */}
              <div className="h-64 sm:h-80 relative bg-[#f4f7f4] border-b border-[#e8f0eb] shrink-0 overflow-hidden group">
                {!resource.image ? (
                   <div className="h-full flex flex-col items-center justify-center text-[#82a38e] p-8 text-center transition-transform duration-700 group-hover:scale-105">
                      <svg className="w-14 h-14 mb-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                      <h4 className="text-[15px] font-extrabold text-[#064e3b]">Scheduled Daily Release</h4>
                      <p className="text-[13px] font-medium text-[#4a6b56] mt-2 max-w-xs leading-relaxed">Standardized daily drop. Please verify quality directly at the pickup location.</p>
                   </div>
                 ) : (
                   <>
                      <img src={`${API_BASE_URL}${resource.image}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Resource Verification"/>
                      <div className="absolute top-5 left-5 bg-[#ecfdf5]/95 backdrop-blur-sm text-[#059669] border border-[#d1fae5] px-4 py-2 rounded-full text-[11px] uppercase tracking-wider font-extrabold flex items-center gap-2 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Verified Photo
                      </div>
                   </>
                 )}
              </div>

              {/* Map Routing Frame */}
              <div className="flex-grow min-h-[300px] lg:min-h-[400px] relative bg-[#e8f0eb]">
                <iframe 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'contrast(0.95) saturate(1.1)' }} 
                  loading="lazy" 
                  allowFullScreen 
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
                
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-5 right-5 bg-white text-[#064e3b] border border-[#e8f0eb] shadow-[0_4px_15px_rgb(0,0,0,0.05)] px-5 py-3 rounded-full text-[14px] font-bold hover:bg-[#ecfdf5] hover:text-[#10b981] transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                  Get Directions
                </a>
              </div>
           </div>

           {/* Right Column: Structured Data Table */}
           <div className="w-full lg:w-[55%] flex flex-col p-6 sm:p-10 lg:p-12">
              
              {/* Main Header Block */}
              <div className="mb-8 border-b border-[#e8f0eb] pb-8">
                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-4">
                    <div>
                       <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#064e3b] leading-tight tracking-tight">
                         {resource.supplierId?.supplierDetails?.legalName}
                       </h1>
                       <div className="flex flex-wrap items-center gap-2 mt-4">
                          <span className="text-[12px] font-extrabold text-[#10b981] bg-[#ecfdf5] px-3.5 py-1.5 rounded-full uppercase tracking-wider">{resource.category}</span>
                          <span className="text-[12px] font-bold text-[#4a6b56] bg-[#f4f7f4] border border-[#e8f0eb] px-3.5 py-1.5 rounded-full">{resource.type === 'Scheduled' ? 'Daily Drops' : 'One-Time Post'}</span>
                       </div>
                    </div>
                    <div className="sm:text-right bg-[#f4f7f4] border border-[#e8f0eb] px-6 py-4 rounded-[1.5rem] shrink-0">
                       <span className="block text-[11px] font-extrabold text-[#82a38e] mb-1 uppercase tracking-widest">Total Volume</span>
                       <span className="text-3xl font-black text-[#064e3b] leading-none">{resource.weight} <span className="text-[16px] text-[#4a6b56] font-bold">kg</span></span>
                    </div>
                 </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-10">
                 {[
                   { label: "Fresh For", val: resource.shelfLife, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                   { label: "Pickup Date DeadLine", val: resource.pickupDate   || "TODAY", icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-10.714A9.535 9.535 0 003 12c0 1.291.256 2.523.721 3.647" },
               { label: "Pickup Time DeadLine", val: resource.pickupTime   || pickupDeadlineTime, icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-10.714A9.535 9.535 0 003 12c0 1.291.256 2.523.721 3.647" },
        
                   { label: "Packaging", val: resource.packaging ? "YES" : "NO", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                           ].map((stat, i) => (
                   <div key={i} className="flex flex-col">
                      <div className="flex items-center gap-2 text-[#82a38e] mb-1.5">
                         <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon}/></svg>
                         <span className="text-[12px] font-extrabold uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <p className="text-[16px] font-bold text-[#064e3b] pl-6">{stat.val}</p>
                   </div>
                 ))}
              </div>

              {/* Location & Contact Cards */}
              <div className="space-y-4 mb-auto pb-8">
                 <div className="bg-[#f4f7f4] border border-[#e8f0eb] rounded-[1.5rem] p-6">
                    <h4 className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-widest mb-3 flex items-center gap-2">
                       <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       Pickup Location
                    </h4>
                    <p className="text-[15px] font-bold text-[#064e3b] leading-relaxed">
                      {resource.pickupAddress}<br/>
                      <span className="text-[#4a6b56] font-medium">{resource.city}, {resource.district && `${resource.district}, `}{resource.state}</span>
                    </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-white border border-[#e8f0eb] rounded-[1.5rem] p-5 flex items-start gap-4 shadow-sm">
                      <div className="w-12 h-12 bg-[#ecfdf5] rounded-full flex items-center justify-center font-black text-[#10b981] shrink-0 text-lg">
                        {resource.contactName?.charAt(0)}
                      </div>
                      <div className="min-w-0 mt-0.5">
                         <span className="text-[10px] font-extrabold text-[#82a38e] uppercase tracking-widest block mb-1">Primary Contact</span>
                         <p className="text-[15px] font-bold text-[#064e3b] truncate">{resource.contactName}</p>
                         <p className="text-[14px] text-[#10b981] font-semibold truncate mt-0.5">{resource.contactPhone}</p>
                      </div>
                   </div>

                   {resource.specialInstructions && (
                     <div className="bg-[#f4f7f4] border border-[#e8f0eb] rounded-[1.5rem] p-5">
                        <span className="text-[10px] font-extrabold text-[#82a38e] uppercase tracking-widest block mb-2">Gate Instructions</span>
                        <p className="text-[13px] font-semibold text-[#4a6b56] leading-relaxed">{resource.specialInstructions}</p>
                     </div>
                   )}
                 </div>
              </div>

              {/* Action Area */}
              <div className="pt-8 border-t border-[#e8f0eb] mt-4 space-y-4">
                 {claimCount > 0 && resource.status === 'Active' && (
                    <div className="flex items-center justify-center gap-2.5 text-[#d97706] bg-[#fffbeb] py-2.5 rounded-full border border-[#fde68a]">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f59e0b]"></span>
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {claimCount} {claimCount === 1 ? 'org has' : 'orgs have'} requested this
                      </span>
                    </div>
                 )}

                 <button 
                   onClick={executeClaimNode} 
                   disabled={isClaiming || resource.status !== 'Active' || hasClaimed}
                   className={`w-full py-4 rounded-full text-[15px] font-extrabold shadow-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
                     hasClaimed || resource.status !== 'Active' 
                       ? 'bg-[#f4f7f4] text-[#82a38e] border border-[#e8f0eb] cursor-not-allowed' 
                       : 'bg-[#10b981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5'
                   }`}
                 >
                    {resource.status !== 'Active' ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        Already Claimed
                      </>
                    ) : hasClaimed ? (
                      <>
                        <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Request Pending Review
                      </>
                    ) : isClaiming ? (
                      <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
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