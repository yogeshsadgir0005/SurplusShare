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

  const StatMiniCard = ({ label, value, unit, icon, color }) => (
    <div className="bg-white border border-slate-200 p-5 lg:p-6 rounded-3xl shadow-sm flex items-center gap-4 lg:gap-5">
      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl ${color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl lg:text-2xl font-black text-slate-900">{value}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout role="Supplier">
      <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
              <span>Overview</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-emerald-600">Live</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter leading-none">Dashboard</h1>
          </div>
          
          {!loading && (
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl flex items-center gap-3 w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-800 tracking-tight">
                {metrics.mealsDonated === 0 ? "Make your first donation today." : `${metrics.mealsDonated} meals shared so far.`}
              </p>
            </div>
          )}
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatMiniCard 
            label="Total Impact" 
            value={metrics.mealsDonated} 
            unit="Meals" 
            color="bg-slate-900"
            icon="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
          <StatMiniCard 
            label="Food Saved" 
            value={metrics.totalWeight} 
            unit="Kilograms" 
            color="bg-emerald-600"
            icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
          <StatMiniCard 
            label="Active Listings" 
            value={activePosts.length} 
            unit="Posts" 
            color="bg-indigo-600"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <button onClick={() => navigate('/supplier/post')} className="flex items-center gap-5 p-5 bg-slate-900 text-white rounded-3xl hover:bg-emerald-600 transition-all group shadow-lg">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 text-emerald-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
            </div>
            <div className="text-left">
              <span className="block text-sm font-black uppercase tracking-widest">Share Food</span>
              <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-100 uppercase tracking-widest">One-time post</span>
            </div>
          </button>

          <button onClick={() => navigate('/supplier/schedule')} className="flex items-center gap-5 p-5 bg-white border border-slate-200 rounded-3xl hover:border-emerald-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div className="text-left">
              <span className="block text-sm font-black text-slate-900 uppercase tracking-widest">Schedule Drops</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daily recurring</span>
            </div>
          </button>

          <button onClick={() => navigate('/supplier/history')} className="flex items-center gap-5 p-5 bg-white border border-slate-200 rounded-3xl hover:border-indigo-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div className="text-left">
              <span className="block text-sm font-black text-slate-900 uppercase tracking-widest">History</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">View past activity</span>
            </div>
          </button>
        </div>

        {/* Active Posts Section */}
        <section className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
              Active Food Posts
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{activePosts.length} Live</span>
            </h3>
            <button onClick={() => navigate('/supplier/post')} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest w-fit">Create New Post +</button>
          </div>

          <div className="space-y-3">
            {activePosts.map((post, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 lg:p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300 group cursor-pointer" 
                onClick={() => navigate(`/supplier/manage/${post._id}`)}
              >
                <div className="flex items-center gap-4 lg:gap-5 min-w-0">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-400 text-[10px] shrink-0 group-hover:text-emerald-500 transition-colors">
                    {post.category.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 tracking-tight truncate">{post.category}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.weight}kg</span>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden xs:inline">{post.type} Post</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 lg:gap-6 shrink-0 ml-4">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{post.claims?.length || 0} Claims</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </div>
                </div>
              </div>
            ))}
            
            {!activePosts.length && (
              <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-center px-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">No active food posts at the moment</p>
                <button onClick={() => navigate('/supplier/post')} className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest shadow-sm">
                  Initialize First Release
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardSupplier;