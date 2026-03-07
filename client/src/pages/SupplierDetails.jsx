import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/axios';
import Layout from '../components/Layout';

const SupplierDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get('/posts/supplier');
        const currentPost = data.find(p => p._id === id);
        setPost(currentPost);
      } catch (error) {
        toast.error('Failed to load details');
      } finally {
        setTimeout(() => setIsLoading(false), 600);
      }
    };
    fetchPost();
  }, [id]);

  if (isLoading || !post) {
    return (
      <Layout role="Supplier">
        <div className="max-w-[1000px] mx-auto space-y-6 lg:space-y-8 animate-pulse">
          <div className="h-10 bg-[#e8f0eb] rounded-full w-1/4 mb-8"></div>
          <div className="h-48 bg-white rounded-[2rem] border border-[#e8f0eb]"></div>
          <div className="h-64 bg-white rounded-[2rem] border border-[#e8f0eb]"></div>
        </div>
      </Layout>
    );
  }

  // Filter and sort claims to only show Approved/Completed, newest first
  const successfulClaims = post.claims
    ?.filter(c => ['Approved', 'Completed'].includes(c.status))
    .sort((a, b) => {
      const dateA = new Date(parseInt(a._id.toString().substring(0, 8), 16) * 1000);
      const dateB = new Date(parseInt(b._id.toString().substring(0, 8), 16) * 1000);
      return dateB - dateA;
    }) || [];

  return (
    <Layout role="Supplier">
      <div className="max-w-[1000px] mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#e8f0eb] pb-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">
              <span className="cursor-pointer hover:text-[#10b981] transition-colors" onClick={() => navigate(-1)}>Back</span>
              <span>/</span>
              <span className="font-mono text-[#10b981]">{post._id}</span>
            </div>
            <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">Pickup History</h1>
          </div>
      {/* FIX: Smart Badge for the Details Page */}
          <div className={`px-4 py-2 rounded-full text-[12px] font-extrabold uppercase tracking-wider flex items-center gap-2 ${(post.status === 'Active' || post.type === 'Scheduled') ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#eff6ff] text-[#2563eb]'}`}>
            <div className={`w-2 h-2 rounded-full ${(post.status === 'Active' || post.type === 'Scheduled') ? 'bg-[#10b981] animate-ping' : 'bg-[#3b82f6]'}`}></div>
            {post.type === 'Scheduled' ? 'Active Schedule' : post.status}
          </div>
        </header>

        {/* Post Summary Card */}
        <section className="bg-white border border-[#e8f0eb] rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
           <h3 className="text-xl font-extrabold text-[#064e3b] mb-6 border-b border-[#e8f0eb] pb-4">Drop Configuration</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-[#f4f7f4] p-5 rounded-[1.5rem] border border-[#e8f0eb]">
                <p className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">Category</p>
                <p className="text-[16px] font-black text-[#064e3b]">{post.category}</p>
              </div>
              <div className="bg-[#f4f7f4] p-5 rounded-[1.5rem] border border-[#e8f0eb]">
                <p className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">Total Volume</p>
                <p className="text-[16px] font-black text-[#064e3b]">{post.weight} kg</p>
              </div>
              <div className="bg-[#f4f7f4] p-5 rounded-[1.5rem] border border-[#e8f0eb]">
                <p className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">Type</p>
                <p className="text-[16px] font-black text-[#064e3b]">{post.type}</p>
              </div>
              <div className="bg-[#f4f7f4] p-5 rounded-[1.5rem] border border-[#e8f0eb]">
                <p className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">Packaging</p>
                <p className="text-[16px] font-black text-[#064e3b]">{post.packaging ? "Packaged" : "Bulk"}</p>
              </div>
           </div>
        </section>

        {/* Claim History Ledger */}
        <section className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
          <div className="p-6 border-b border-[#e8f0eb] bg-[#fbfdfb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#064e3b] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Pickup Ledger
              </h3>
              <p className="text-[13px] font-medium text-[#4a6b56] mt-1">Record of all successful NGO claims for this drop.</p>
            </div>
            <div className="bg-[#ecfdf5] text-[#10b981] px-4 py-1.5 rounded-full text-[12px] font-extrabold uppercase tracking-wider border border-[#d1fae5] shrink-0 w-max">
              {successfulClaims.length} Total Pickups
            </div>
          </div>

          <div className="divide-y divide-[#e8f0eb]">
            {successfulClaims.length > 0 ? (
              successfulClaims.map((claim) => {
                // Extracting exact creation date from the MongoDB _id hex
                const claimDate = new Date(parseInt(claim._id.toString().substring(0, 8), 16) * 1000).toLocaleDateString('en-US', { 
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                });

                return (
                  <div key={claim._id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:bg-[#fbfdfb] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#ecfdf5] border border-[#d1fae5] text-[#10b981] flex items-center justify-center font-black text-[16px] shrink-0">
                        {claim.ngoName?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-extrabold text-[#064e3b]">{claim.ngoName}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[12px] font-bold text-[#82a38e] flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            {claim.ngoPhone}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto bg-[#f4f7f4] sm:bg-transparent p-4 sm:p-0 rounded-[1rem] border border-[#e8f0eb] sm:border-none">
                       <span className="text-[13px] font-extrabold text-[#064e3b]">{claimDate}</span>
                       <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${claim.status === 'Completed' ? 'text-[#10b981]' : 'text-[#d97706]'}`}>
                         {claim.status === 'Completed' ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                         ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                         )}
                         {claim.status === 'Completed' ? 'Picked Up' : 'Awaiting Pickup'}
                       </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-[#f4f7f4] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#82a38e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <p className="text-[15px] font-extrabold text-[#064e3b] mb-1">No pickup history yet</p>
                <p className="text-[14px] font-medium text-[#4a6b56] max-w-xs">Once NGOs start successfully picking up this scheduled drop, they will be logged here.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default SupplierDetails;