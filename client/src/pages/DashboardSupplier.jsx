import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import Layout from '../components/Layout';

const DashboardSupplier = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalWeight: 0, mealsDonated: 0 });
  const [activePosts, setActivePosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          api.get('/posts/metrics'),
          api.get('/posts/supplier')
        ]);
        setMetrics(mRes.data);
        setActivePosts(pRes.data.filter(p => p.status === 'Active'));
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchData();
  }, []);

  // Organic SaaS-style Stat Card
  const StatMiniCard = ({ label, value, unit, icon, iconBg, iconColor }) => (
    <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 p-6 sm:p-8 flex items-start gap-5 group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1.5 transition-colors group-hover:text-[#059669]">{label}</p>
        <p className="text-3xl sm:text-4xl font-black text-[#064e3b]">{value} <span className="text-[16px] font-bold text-[#4a6b56] ml-1">{unit}</span></p>
      </div>
    </div>
  );

  return (
    <Layout role="Supplier">
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">Supplier Dashboard</h1>
            <p className="text-[15px] font-medium text-[#4a6b56] mt-1">Manage your surplus food drops and track your community impact.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => navigate('/supplier/schedule')} className="px-6 py-2.5 bg-white text-[#064e3b] border border-[#e8f0eb] shadow-sm hover:bg-[#f4f7f4] rounded-full text-[14.5px] font-bold transition-all duration-300">
               Schedule Drops
             </button>
             <button onClick={() => navigate('/supplier/post')} className="px-6 py-2.5 transition-all duration-300 font-bold bg-[#10b981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 rounded-full flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
               Post Food
             </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          <StatMiniCard 
            label="Total Donated" 
            value={loading ? '...' : metrics.totalWeight} unit="kg"
            iconBg="bg-[#ecfdf5]" iconColor="text-[#10b981]"
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>}
          />
          <StatMiniCard 
            label="Meals Provided" 
            value={loading ? '...' : metrics.mealsDonated} unit="meals"
            iconBg="bg-[#fff1f2]" iconColor="text-[#e11d48]"
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>}
          />
          <StatMiniCard 
            label="Active Drops" 
            value={loading ? '...' : activePosts.length} unit="live"
            iconBg="bg-[#fffbeb]" iconColor="text-[#d97706]"
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 lg:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold text-[#064e3b]">Active Drops</h3>
            <span className="px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 rounded-full bg-[#ecfdf5] text-[#10b981]">
                <div className="w-2 h-2 rounded-full animate-ping bg-[#059669]"></div> 
                {activePosts.length} Live
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#82a38e] font-extrabold animate-pulse">Loading active shipments...</div>
          ) : activePosts.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-[#f4f7f4] rounded-[1.5rem] border border-[#e8f0eb] shadow-inner shadow-black/[0.01]">
              <div className="w-16 h-16 bg-[#e8f0eb] text-[#82a38e] rounded-full flex items-center justify-center mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <h3 className="text-[16px] font-extrabold text-[#064e3b] mb-1">No Active Drops</h3>
              <p className="text-[14.5px] font-medium text-[#4a6b56] mb-5 max-w-sm">You haven't posted any food drops recently. Ready to make an impact?</p>
              <button onClick={() => navigate('/supplier/post')} className="px-6 py-2.5 bg-[#064e3b] text-white rounded-full font-bold hover:bg-[#043326] transition-colors shadow-sm">
                Create First Drop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activePosts.map(post => (
                <div 
                  key={post._id}
                  onClick={() => navigate(`/supplier/manage/${post._id}`)}
                  className="bg-[#f4f7f4] p-5 rounded-[1.5rem] border border-[#e8f0eb] shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.04)] hover:bg-white hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-[#e8f0eb] text-[#10b981] flex items-center justify-center shrink-0 font-black text-lg shadow-inner">
                      {post.category.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[16px] font-extrabold text-[#064e3b] truncate group-hover:text-[#10b981] transition-colors">{post.category}</p>
                      <p className="text-[13.5px] font-bold text-[#4a6b56] truncate mt-0.5 opacity-90">
                        {post.weight} kg <span className="mx-2 opacity-50 text-[#82a38e]">•</span> {post.type} Post
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[14.5px] font-extrabold text-[#064e3b]">
                        {post.claims?.length || 0} {post.claims?.length === 1 ? 'Claim' : 'Claims'}
                      </p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#82a38e] mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#82a38e] group-hover:bg-[#ecfdf5] group-hover:text-[#10b981] transition-all duration-300 group-hover:translate-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardSupplier;