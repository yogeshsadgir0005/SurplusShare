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

  const StatCard = ({ label, value, unit, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center md:items-start text-center md:text-left hover:shadow-md transition-shadow">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl md:text-3xl font-black ${color}`}>{value}</span>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );

  return (
    <Layout role="NGO">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
              <span>Platform</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-indigo-600">Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">Dashboard</h1>
          </div>
          <button 
            onClick={() => navigate('/ngo/listings')} 
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Find Food
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>)
          ) : (
            <>
              <StatCard label="Active Claims" value={dashboardData.stats.activeClaims} unit="Shipments" color="text-indigo-600" />
              <StatCard label="Total Meals" value={dashboardData.stats.mealsProvided} unit="Meals" color="text-emerald-600" />
              <StatCard label="Food Saved" value={dashboardData.stats.savedKgs} unit="Kgs" color="text-slate-900" />
            </>
          )}
        </div>

        <section className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
            <span className="hidden xs:inline px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase">Live</span>
          </div>
          <div className="space-y-4">
            {dashboardData.feed.map((act, i) => (
              <div 
                 key={i} 
                 onClick={() => act._id && navigate(`/ngo/food/${act._id}`)}
                 className={`flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all group ${act._id ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden min-w-0">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-[10px] uppercase ${i === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-slate-400 border border-slate-200'}`}>{act.supplier.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className={`text-sm font-black transition-colors truncate ${act._id ? 'group-hover:text-indigo-600 text-slate-900' : 'text-slate-900'}`}>{act.supplier}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{act.action}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.time}</p>
                  <p className={`text-[8px] md:text-[9px] font-black mt-1 uppercase ${act.status === 'Available' || act.status === 'Approved' ? 'text-emerald-500' : 'text-slate-300'}`}>{act.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DashboardNGO;