import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import Layout from '../components/Layout';

const HistorySupplier = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/posts/supplier');
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchHistory();
  }, []);

  const filteredData = filter === 'All' ? posts : posts.filter(p => p.status === filter);

  const StatusBadge = ({ status }) => {
    const styles = {
      Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      Claimed: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      Expired: 'bg-rose-50 text-rose-600 border-rose-100'
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout role="Supplier">
      <div className="max-w-6xl mx-auto">
        {/* Responsive Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
           <div>
              <button 
                onClick={() => navigate('/supplier/dashboard')} 
                className="mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">Donation History</h1>
           </div>

           {/* Filter Tabs - Scrollable on mobile if needed */}
           <div className="flex bg-slate-200/50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
              {['All', 'Active', 'Claimed', 'Expired'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`px-5 lg:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </header>

        {/* Data Table Card */}
        <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Posted</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Food Category</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((post) => (
                      <tr key={post._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 text-xs font-black text-slate-900">{new Date(post.createdAt).toLocaleDateString()}</td>
                        <td className="p-6">
                           <p className="text-sm font-black text-slate-900">{post.category}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{post.type === 'Scheduled' ? 'Scheduled' : 'One-Time'}</p>
                        </td>
                        <td className="p-6 text-sm font-black text-slate-700">{post.weight} kg</td>
                        <td className="p-6"><StatusBadge status={post.status} /></td>
                        <td className="p-6 text-right">
                           <button 
                             onClick={() => navigate(`/supplier/manage/${post._id}`)} 
                             className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 ${post.status === 'Active' ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                           >
                              <span>{post.status === 'Active' ? 'Manage' : 'View'}</span>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!loading && !filteredData.length && (
                <div className="py-32 flex flex-col items-center justify-center bg-white px-6 text-center">
                   <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6 border border-dashed border-slate-200">
                     <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                   </div>
                   <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching history records found</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default HistorySupplier;