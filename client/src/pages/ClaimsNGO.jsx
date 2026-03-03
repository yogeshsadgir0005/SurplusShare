import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const ClaimsNGO = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [claims, setClaims] = useState([]);

  const fetchClaims = async () => {
    try {
      const { data } = await api.get('/posts/ngo/my-claims'); 
      setClaims(data);
    } catch (error) {
      toast.error('Failed to fetch claims data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleMarkCompleted = async (id) => {
      try {
          await api.put(`/posts/ngo/claims/${id}/complete`);
          toast.success("Food marked as successfully picked up!");
          // Update the local state to instantly reflect the 'Completed' status
          setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Completed' } : c));
      } catch (error) {
          toast.error(error.response?.data?.message || "Action failed");
      }
  };

  const filteredClaims = activeTab === 'All' ? claims : claims.filter(c => c.status === activeTab);

  // Organic Theme Colors for Badges
  const getStatusColor = (status) => {
      if (status === 'Approved') return 'bg-[#ecfdf5] text-[#059669]';
      if (status === 'Pending') return 'bg-[#fffbeb] text-[#d97706]';
      if (status === 'Completed') return 'bg-[#eff6ff] text-[#2563eb]';
      if (status === 'Rejected') return 'bg-[#fef2f2] text-[#e11d48]';
      return 'bg-[#f4f7f4] text-[#4a6b56]';
  };

  return (
    <Layout role="NGO">
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-10">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">My Claims</h1>
            <p className="text-[15px] font-medium text-[#4a6b56] mt-1">Manage and track your active food rescue requests.</p>
          </div>
          <button onClick={() => navigate('/ngo/listings')} className="px-6 py-2.5 bg-[#10b981] text-white rounded-full font-bold shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            New Request
          </button>
        </header>

        {/* Elevated Organic Tabs */}
        <div className="flex items-center gap-6 border-b border-[#e8f0eb] pb-px overflow-x-auto custom-scrollbar">
          {['All', 'Approved', 'Pending', 'Completed', 'Rejected'].map(tab => (
            <button 
                key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[14.5px] border-b-[3px] transition-all whitespace-nowrap ${activeTab === tab ? 'border-[#10b981] text-[#064e3b] font-extrabold' : 'border-transparent text-[#82a38e] font-bold hover:text-[#4a6b56]'}`}
            >
                {tab}
            </button>
          ))}
        </div>

        {/* Claims Grid */}
        {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-56 bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.02)]"></div>)}
            </div>
        ) : filteredClaims.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-[#e8f0eb] rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <svg className="w-14 h-14 text-[#82a38e] mb-4 mx-auto opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                <h3 className="text-lg font-extrabold text-[#064e3b] mb-1.5">No Claims Found</h3>
                <p className="text-[15px] font-medium text-[#4a6b56]">You don't have any claims under this status.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {filteredClaims.map((claim) => (
                    <div key={claim.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden flex flex-col group">
                        
                        {/* Dynamic Side Border Accent */}
                        <div className={`absolute top-0 left-0 w-2.5 h-full transition-colors ${
                            claim.status === 'Approved' ? 'bg-[#10b981]' : 
                            claim.status === 'Pending' ? 'bg-[#f59e0b]' : 
                            claim.status === 'Completed' ? 'bg-[#3b82f6]' :
                            claim.status === 'Rejected' ? 'bg-[#ef4444]' : 'bg-[#e8f0eb]'
                        }`}></div>
                        
                        <div className="flex justify-between items-start mb-6 pl-3">
                            <div className="min-w-0 pr-4">
                                <h3 className="text-xl sm:text-[22px] font-extrabold text-[#064e3b] truncate group-hover:text-[#10b981] transition-colors">{claim.supplier}</h3>
                                <p className="text-[14px] text-[#4a6b56] font-semibold flex items-center gap-1.5 mt-1.5 truncate">
                                    <svg className="w-4 h-4 shrink-0 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="truncate">{claim.address}</span>
                                </p>
                            </div>
                            
                            {/* Organic Status Badge */}
                            <span className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-2 ${getStatusColor(claim.status)}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    claim.status === 'Approved' ? 'bg-[#10b981]' : 
                                    claim.status === 'Pending' ? 'bg-[#f59e0b]' : 
                                    claim.status === 'Completed' ? 'bg-[#3b82f6]' :
                                    claim.status === 'Rejected' ? 'bg-[#ef4444]' : 'bg-[#82a38e]'
                                }`}></div>
                                {claim.status}
                            </span>
                        </div>

                        {/* Inner Data Container */}
                        <div className="bg-[#f4f7f4] rounded-[1.5rem] p-5 mb-6 border border-[#e8f0eb] ml-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider">Items Overview</span>
                                <span className="font-black text-[#064e3b] text-[15px]">{claim.weight} kg <span className="text-[#10b981] ml-1">{claim.category}</span></span>
                            </div>
                            <div className="h-px bg-[#e8f0eb] my-4"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] font-extrabold text-[#82a38e] uppercase tracking-wider">Pickup Schedule</span>
                                <span className="font-bold text-[#064e3b] text-[14px] flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {claim.date}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pl-3 mt-auto">
                            <button onClick={() => navigate(`/ngo/food/${claim.id}`)} className="flex-1 py-3.5 bg-white border border-[#e8f0eb] text-[#064e3b] rounded-full text-[14.5px] font-bold hover:bg-[#f4f7f4] hover:border-[#d1fae5] transition-all duration-300 shadow-sm hover:shadow">
                                View Details
                            </button>
                            {claim.status === 'Approved' && (
                                <button onClick={() => handleMarkCompleted(claim.id)} className="flex-1 py-3.5 bg-[#10b981] text-white rounded-full text-[14.5px] font-bold shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 transition-all duration-300">
                                    Mark as Picked Up
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16, 185, 129, 0.4); }
      `}} />
    </Layout>
  );
};

export default ClaimsNGO;