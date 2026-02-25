import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import Layout from '../components/Layout';

const DashboardNGO = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: { activeClaims: 0, mealsProvided: 0, savedKgs: 0 },
    feed: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/posts/ngo/metrics');
        setDashboardData(data);
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setTimeout(() => setLoading(false), 500); 
      }
    };
    fetchDashboardData();
  }, []);

  // Upgraded SaaS-style Stat Card with Icons
  const StatCard = ({ label, value, unit, icon, iconBg, iconColor }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
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

const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium">Approved</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-medium">Pending Review</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-xs font-medium">Declined</span>;
      case 'Standby':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-xs font-medium">Standby</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-xs font-medium">{status}</span>;
    }
  };

  return (
    <Layout role="NGO">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Sleek SaaS Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">NGO Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of your claims, impact, and recent network activity.</p>
          </div>
          <button 
            onClick={() => navigate('/ngo/listings')} 
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Find Food
          </button>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse"></div>)
          ) : (
            <>
              <StatCard 
                label="Claims" 
                value={dashboardData.stats.activeClaims} 
                unit="Shipments" 
                iconBg="bg-indigo-50" 
                iconColor="text-indigo-600"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
              />
              <StatCard 
                label="Total Impact" 
                value={dashboardData.stats.mealsProvided} 
                unit="Meals" 
                iconBg="bg-emerald-50" 
                iconColor="text-emerald-600"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>}
              />
              <StatCard 
                label="Food Saved" 
                value={dashboardData.stats.savedKgs} 
                unit="kg" 
                iconBg="bg-amber-50" 
                iconColor="text-amber-600"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>}
              />
            </>
          )}
        </div>

        {/* Clean Data Table for Activity */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-base font-semibold text-slate-900">Network Activity Log</h3>
            <div className="flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-xs font-medium text-slate-600">Live Sync</span>
            </div>
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
            ) : dashboardData.feed.length === 0 ? (
               <div className="px-6 py-12 text-center text-slate-500 text-sm">No recent activity on the network.</div>
            ) : (
               dashboardData.feed.map((act, i) => (
                <div 
                   key={i} 
                   onClick={() => act._id && navigate(`/ngo/food/${act._id}`)}
                   className={`flex items-center justify-between px-6 py-4 transition-colors ${act._id ? 'cursor-pointer hover:bg-slate-50 group' : 'cursor-default'}`}
                >
                  <div className="flex items-center gap-4 overflow-hidden min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-lg border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-600 text-sm">
                       {act.supplier.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate transition-colors ${act._id ? 'group-hover:text-indigo-600 text-slate-900' : 'text-slate-900'}`}>
                        {act.supplier}
                      </p>
                      <p className="text-sm text-slate-500 truncate mt-0.5">{act.action}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                    <p className="text-xs font-medium text-slate-400">{act.time}</p>
                    {getStatusBadge(act.status)}
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

export default DashboardNGO;