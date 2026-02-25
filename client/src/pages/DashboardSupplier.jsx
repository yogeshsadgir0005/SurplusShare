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

  // Upgraded SaaS-style Stat Card
  const StatMiniCard = ({ label, value, unit, icon, iconBg, iconColor }) => (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 leading-none">{value}</span>
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout role="Supplier">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Sleek SaaS Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Supplier Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your surplus food releases and track your network impact.</p>
          </div>
          
          {!loading && (
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg flex items-center gap-2.5 w-fit">
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <p className="text-sm font-medium text-emerald-800">
                {metrics.mealsDonated === 0 ? "Ready for your food release." : `${metrics.mealsDonated} meals shared so far.`}
              </p>
            </div>
          )}
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse"></div>)
          ) : (
            <>
              <StatMiniCard 
                label="Total Impact" 
                value={metrics.mealsDonated} 
                unit="Meals" 
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
                icon="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
              <StatMiniCard 
                label="Food Saved" 
                value={metrics.totalWeight} 
                unit="kg" 
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                icon="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
              <StatMiniCard 
                label="Active Listings" 
                value={activePosts.length} 
                unit="Posts" 
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </>
          )}
        </div>

        {/* Clean Quick Actions Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button onClick={() => navigate('/supplier/post')} className="flex items-center gap-4 p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-left group">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            </div>
            <div>
              <span className="block text-sm font-semibold">Share Food</span>
              <span className="block text-xs text-indigo-200">One-time release</span>
            </div>
          </button>

          <button onClick={() => navigate('/supplier/schedule')} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all text-left group">
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <span className="block text-sm font-semibold text-slate-900">Schedule Drops</span>
              <span className="block text-xs text-slate-500">Daily recurring</span>
            </div>
          </button>

          <button onClick={() => navigate('/supplier/history')} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-sm transition-all text-left group">
            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div>
              <span className="block text-sm font-semibold text-slate-900">History Log</span>
              <span className="block text-xs text-slate-500">View past activity</span>
            </div>
          </button>
        </div>

        {/* Clean Data Table for Active Posts */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-slate-900">Active Food Posts</h3>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium">
                {activePosts.length} Live
              </span>
            </div>
            <button onClick={() => navigate('/supplier/post')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors hidden sm:block">
              + New Post
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              [1,2,3].map(i => (
                <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : activePosts.length === 0 ? (
              <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                <p className="text-sm font-medium text-slate-900 mb-1">No active food posts</p>
                <p className="text-sm text-slate-500 mb-4">You currently have no surplus food listed on the network.</p>
                <button onClick={() => navigate('/supplier/post')} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  Initialize Release
                </button>
              </div>
            ) : (
              activePosts.map((post, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between px-6 py-4 transition-colors cursor-pointer hover:bg-slate-50 group" 
                  onClick={() => navigate(`/supplier/manage/${post._id}`)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-600 text-sm group-hover:text-indigo-600 transition-colors">
                      {post.category.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{post.category}</p>
                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {post.weight} kg <span className="mx-1.5 opacity-50">•</span> {post.type} Post
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-slate-900">
                        {post.claims?.length || 0} {post.claims?.length === 1 ? 'Claim' : 'Claims'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardSupplier;