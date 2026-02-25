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

  // Upgraded SaaS Status Badge
  const StatusBadge = ({ status }) => {
    const styles = {
      Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Claimed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Expired: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <Layout role="Supplier">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Sleek Header & Filters */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
           <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <span className="cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => navigate('/supplier/dashboard')}>Dashboard</span>
                <span>/</span>
                <span className="text-slate-900">History Log</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Donation History</h1>
           </div>

           {/* Professional Segmented Control */}
           <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto no-scrollbar border border-slate-200/60">
              {['All', 'Active', 'Claimed', 'Expired'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    filter === f 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-700 border border-transparent'
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
        </header>

        {/* Clean Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Posted</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Food Category</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    // Skeleton Rows for Table
                    [1, 2, 3, 4].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                        <td className="px-6 py-4">
                           <div className="h-4 bg-slate-100 rounded w-32 mb-1.5"></div>
                           <div className="h-3 bg-slate-50 rounded w-20"></div>
                        </td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-md w-20"></div></td>
                        <td className="px-6 py-4 flex justify-end"><div className="h-8 bg-slate-100 rounded-lg w-20"></div></td>
                      </tr>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((post) => (
                      <tr key={post._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-semibold text-slate-900">{post.category}</p>
                           <p className="text-xs text-slate-500">{post.type === 'Scheduled' ? 'Scheduled Drop' : 'One-Time Release'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {post.weight} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={post.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                           <button 
                             onClick={() => navigate(`/supplier/manage/${post._id}`)} 
                             className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                               post.status === 'Active' 
                                 ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100' 
                                 : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                             }`}
                           >
                              <span>{post.status === 'Active' ? 'Manage' : 'View Details'}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                           </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                         <div className="flex flex-col items-center justify-center">
                           <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                           <p className="text-sm font-medium text-slate-900 mb-1">No records found</p>
                           <p className="text-sm text-slate-500">There are no history logs matching the '{filter}' filter.</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </Layout>
  );
};

export default HistorySupplier;