import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardNGO = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeClaims: { value: 0, label: 'shipments', trend: '+0% this month' },
      mealsProvided: { value: 0, label: 'meals', trend: '+0% this month' },
      foodRescued: { value: 0, label: 'kg', trend: '+0% this month' },
      networkGrowth: { value: 0, label: 'partners', trend: '+0% this month' }
    },
    chartData: [], 
    upcomingPickups: [],
    networkActivity: [],
    goals: {
        monthlyRescue: { label: 'Monthly Rescue Target', current: 0, target: '2,000', unit: 'meals', percent: 0, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3M5 9h14' },
        networkPartners: { label: 'Network Partners', current: 0, target: '50', unit: 'suppliers', percent: 0, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        zeroWaste: { label: 'Zero-Waste Score', current: 0, target: '100', unit: '%', percent: 0, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        communityImpact: { label: 'Community Impact', current: 0, target: '5,000', unit: 'people', percent: 0, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/posts/ngo/metrics');
        
        setDashboardData(prev => {
          const apiStats = data?.stats || {};
          return {
            ...prev,
            stats: {
              activeClaims: { ...prev.stats.activeClaims, value: apiStats.activeClaims?.value ?? 0, trend: apiStats.activeClaims?.trend ?? prev.stats.activeClaims.trend },
              mealsProvided: { ...prev.stats.mealsProvided, value: apiStats.mealsProvided?.value ?? 0, trend: apiStats.mealsProvided?.trend ?? prev.stats.mealsProvided.trend },
              foodRescued: { ...prev.stats.foodRescued, value: apiStats.foodRescued?.value ?? 0, trend: apiStats.foodRescued?.trend ?? prev.stats.foodRescued.trend },
              networkGrowth: { ...prev.stats.networkGrowth, value: apiStats.networkGrowth?.value ?? 0, trend: apiStats.networkGrowth?.trend ?? prev.stats.networkGrowth.trend }
            },
            chartData: data?.chartData || [],
            upcomingPickups: data?.upcomingPickups || [],
            networkActivity: (data?.networkActivity || data?.feed || []).map((item, i) => ({
                id: item.id || item._id || i,
                initial: item.supplier?.charAt(0) || item.name?.charAt(0) || 'U',
                name: item.supplier || item.name || 'Unknown Partner',
                action: item.action || 'Updated network status',
                time: item.time || 'Recently',
                status: item.status || 'Standby'
            })),
            goals: data?.goals ? {
                monthlyRescue: { ...prev.goals.monthlyRescue, ...data.goals.monthlyRescue },
                networkPartners: { ...prev.goals.networkPartners, ...data.goals.networkPartners },
                zeroWaste: { ...prev.goals.zeroWaste, ...data.goals.zeroWaste },
                communityImpact: { ...prev.goals.communityImpact, ...data.goals.communityImpact },
            } : prev.goals
          };
        });
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setLoading(false); 
      }
    };
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    let colorClass = "bg-slate-50 text-slate-500";
    let dotColor = "bg-slate-400";
    
    if (s === 'approved') { colorClass = "bg-[#ecfdf5] text-[#059669]"; dotColor = "bg-[#10b981]"; }
    if (s === 'pending') { colorClass = "bg-[#fffbeb] text-[#d97706]"; dotColor = "bg-[#f59e0b]"; }
    if (s === 'completed') { colorClass = "bg-[#eff6ff] text-[#2563eb]"; dotColor = "bg-[#3b82f6]"; }
    if (s === 'rejected') { colorClass = "bg-[#fef2f2] text-[#e11d48]"; dotColor = "bg-[#ef4444]"; }

    return (
      <span className={`px-3 py-1 text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5 rounded-full ${colorClass}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
        {status}
      </span>
    );
  };

  const TrendIndicator = ({ trend }) => {
    if (!trend) return null;
    const isNegative = trend.startsWith('-');
    const colorClass = isNegative ? 'text-[#e11d48]' : 'text-[#059669]';
    return (
        <p className={`text-sm font-bold ${colorClass} flex items-center gap-1 transition-colors`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {isNegative ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
            </svg> 
            {trend}
        </p>
    );
  };

  return (
    <Layout role="NGO">
      <div className="relative z-10 space-y-6 lg:space-y-8 max-w-[1400px] mx-auto pb-10 transition-all duration-500">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight transition-colors">Dashboard</h1>
              <span className="px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1 rounded-full bg-[#ecfdf5] text-[#10b981]">
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
                 NGO
              </span>
            </div>
            <p className="text-[#059669] text-sm font-medium transition-colors">Track your claims, impact metrics, and network activity.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => toast('No new notifications', { icon: '🔔', style: { borderRadius: '100px'} })} className="relative p-2.5 px-3 transition-all duration-300 bg-[#ecfdf5] text-[#059669] hover:bg-[#d1fae5] rounded-full">
                <div className="absolute top-1.5 right-2.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-white"></div>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <button onClick={() => navigate('/ngo/listings')} className="px-6 py-2.5 transition-all duration-300 font-bold bg-[#10b981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] rounded-full flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
             New Claim
            </button>
          </div>
        </header>

        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => navigate('/ngo/claims')} className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group p-6 flex flex-col justify-between h-[160px] cursor-pointer">
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-sm font-bold mb-1 transition-colors text-[#059669]">Active Claims</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black text-[#064e3b]">{loading ? '...' : dashboardData?.stats?.activeClaims?.value?.toLocaleString()}</h3>
                  </div>
               </div>
               <div className="w-12 h-12 flex items-center justify-center transition-all duration-500 rounded-full border-none shadow-sm bg-[#ecfdf5] text-[#10b981]">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
               </div>
            </div>
            <div className="relative z-10"><TrendIndicator trend={dashboardData?.stats?.activeClaims?.trend} /></div>
          </div>

          <div onClick={() => navigate('/ngo/impact')} className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group p-6 flex flex-col justify-between h-[160px] cursor-pointer">
            <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-sm font-bold mb-1 transition-colors text-[#059669]">Meals Provided</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black text-[#064e3b]">{loading ? '...' : dashboardData?.stats?.mealsProvided?.value?.toLocaleString()}</h3>
                  </div>
               </div>
               <div className="w-12 h-12 flex items-center justify-center transition-all duration-500 rounded-full border-none shadow-sm bg-[#fff1f2] text-[#e11d48]">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
               </div>
            </div>
            <div className="relative z-10"><TrendIndicator trend={dashboardData?.stats?.mealsProvided?.trend} /></div>
          </div>

          <div onClick={() => navigate('/ngo/impact')} className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group p-6 flex flex-col justify-between h-[160px] cursor-pointer">
             <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-sm font-bold mb-1 transition-colors text-[#059669]">Food Rescued</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black text-[#064e3b]">{loading ? '...' : dashboardData?.stats?.foodRescued?.value?.toLocaleString()}</h3>
                  </div>
               </div>
               <div className="w-12 h-12 flex items-center justify-center transition-all duration-500 rounded-full border-none shadow-sm bg-[#fffbeb] text-[#d97706]">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
               </div>
            </div>
            <div className="relative z-10"><TrendIndicator trend={dashboardData?.stats?.foodRescued?.trend} /></div>
          </div>

          <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group p-6 flex flex-col justify-between h-[160px] cursor-default">
             <div className="flex justify-between items-start relative z-10">
               <div>
                  <p className="text-sm font-bold mb-1 transition-colors text-[#059669]">Network Growth</p>
                  <div className="flex items-baseline gap-2">
                     <h3 className="text-4xl font-black text-[#064e3b]">{loading ? '...' : dashboardData?.stats?.networkGrowth?.value?.toLocaleString()}</h3>
                  </div>
               </div>
               <div className="w-12 h-12 flex items-center justify-center transition-all duration-500 rounded-full border-none shadow-sm bg-[#eef2ff] text-[#4f46e5]">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
               </div>
            </div>
            <div className="relative z-10"><TrendIndicator trend={dashboardData?.stats?.networkGrowth?.trend} /></div>
          </div>
        </div>

        {/* Middle Section: Chart and Upcoming Pickups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Impact Overview Graph */}
            <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group p-6 lg:p-8 lg:col-span-2 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-extrabold text-[#064e3b]">Impact Overview</h3>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#059669]">
                            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div> Meals
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-[#059669]">
                            <div className="w-3 h-3 rounded-full opacity-60 bg-[#34d399]"></div> Weight (kg)
                        </div>
                    </div>
                </div>
                <div className="flex-grow w-full h-[320px]">
                    {loading ? (
                         <div className="w-full h-full flex items-center justify-center font-semibold text-[#059669]">Loading chart data...</div>
                    ) : dashboardData?.chartData?.length === 0 ? (
                         <div className="w-full h-full flex items-center justify-center font-semibold border-2 border-dashed rounded-3xl border-[#e8f0eb] text-[#059669]">No impact data available yet.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: "#10b981", fontSize: 13, fontWeight: 600, opacity: 0.6}} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: "#10b981", fontSize: 13, fontWeight: 600, opacity: 0.6}} />
                                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)', fontWeight: 'bold', padding: '12px 20px' }} />
                                <Area type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorMeals)" />
                                <Area type="monotone" dataKey="weight" stroke="#34d399" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Upcoming Pickups */}
            <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group flex flex-col">
                <div className="p-6 lg:p-8 border-b border-black/5 flex justify-between items-center">
                    <h3 className="text-xl font-extrabold text-[#064e3b]">Active Radar</h3>
                    <span className="px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 rounded-full bg-[#fef2f2] text-[#e11d48]">
                        <div className="w-2 h-2 rounded-full animate-ping bg-[#ef4444]"></div> Live
                    </span>
                </div>
                
                <div className="flex-grow p-4 lg:p-6 space-y-4">
                    {loading ? (
                         <div className="py-10 text-sm font-semibold text-center text-[#059669]">Scanning network...</div>
                    ) : dashboardData?.upcomingPickups?.length === 0 ? (
                        <div className="py-10 text-sm font-semibold text-center text-[#059669]">No upcoming pickups scheduled.</div>
                    ) : dashboardData.upcomingPickups.map((pickup, idx) => (
                        <div key={pickup.id || idx} onClick={() => navigate(`/ngo/food/${pickup.id}`)} className="p-5 rounded-[1.5rem] transition-all duration-300 cursor-pointer flex items-start gap-4 bg-black/[0.02] hover:bg-black/[0.04]">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${pickup.isRed || pickup.urgent ? 'bg-[#fef2f2] text-[#e11d48]' : 'bg-white text-slate-700 shadow-sm'}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div className="space-y-1.5 min-w-0 flex-1 mt-0.5">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[16px] font-extrabold truncate text-[#064e3b]">{pickup.title}</p>
                                    {pickup.urgent && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wide shrink-0 bg-[#fef2f2] text-[#e11d48]">Urgent</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 text-xs font-bold text-[#059669] opacity-80">
                                    <span className="flex items-center gap-1.5 truncate">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {pickup.time}
                                    </span>
                                </div>
                                <p className="text-sm font-black pt-1 text-[#064e3b]">{pickup.amount}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Bottom Section: Network Activity and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Network Activity Table/List */}
            <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group lg:col-span-2 flex flex-col">
                <div className="p-6 lg:p-8 border-b border-black/5 flex justify-between items-center">
                    <h3 className="text-xl font-extrabold text-[#064e3b]">Network Log</h3>
                    <span className="text-sm font-bold text-[#059669]">{dashboardData?.networkActivity?.length || 0} events</span>
                </div>
                
                <div className="flex-grow h-[400px] overflow-y-auto custom-scrollbar p-4">
                    {loading ? (
                         <div className="p-10 text-sm font-semibold text-center text-[#059669]">Loading network activity...</div>
                    ) : dashboardData?.networkActivity?.length === 0 ? (
                        <div className="p-10 text-sm font-semibold text-center text-[#059669]">No recent activity on the network.</div>
                    ) : dashboardData.networkActivity.map((activity, idx) => (
                        <div 
                          key={activity.id || idx} 
                          onClick={() => navigate(`/ngo/food/${activity.id}`)}
                          className="p-5 mb-2 rounded-[1.5rem] flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-black/[0.03]"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 flex items-center justify-center font-black text-lg shrink-0 rounded-full bg-white shadow-sm text-[#064e3b]">
                                    {activity.initial}
                                </div>
                                <div>
                                    <h4 className="text-[16px] font-extrabold mb-0.5 transition-colors text-[#064e3b]">{activity.name}</h4>
                                    <p className="text-sm font-bold opacity-80 text-[#059669]">{activity.action}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2.5 shrink-0 ml-4">
                                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 text-[#059669]">{activity.time}</span>
                                {getStatusBadge(activity.status)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Goals & Targets */}
            <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group flex flex-col">
                <div className="p-6 lg:p-8 border-b border-black/5 flex justify-between items-center">
                    <h3 className="text-xl font-extrabold text-[#064e3b]">Milestones</h3>
                </div>
                <div className="p-6 lg:p-8 space-y-8 flex-grow">
                    {Object.keys(dashboardData?.goals || {}).map((key, index) => {
                        const goal = dashboardData.goals[key];
                        const currentVal = typeof goal.current === 'number' ? goal.current.toLocaleString() : goal.current;
                        
                        return (
                            <div key={index} className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-full shadow-sm bg-[#ecfdf5] text-[#10b981]">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={goal.icon} />
                                            </svg>
                                        </div>
                                        <span className="text-[15px] font-extrabold text-[#064e3b]">{goal.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#059669]">
                                        {loading ? '...' : currentVal} / {goal.target}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow h-3 overflow-hidden rounded-full bg-[#ecfdf5]">
                                        <div className="h-full transition-all duration-1000 ease-out bg-[#10b981]" style={{ width: `${goal.percent}%` }}></div>
                                    </div>
                                    <span className="text-sm font-black w-10 text-right text-[#064e3b]">{goal.percent}%</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.2); }
      `}} />
    </Layout>
  );
};

export default DashboardNGO;