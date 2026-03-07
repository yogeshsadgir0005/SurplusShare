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

const StatusBadge = ({ post }) => {
    // FIX: Force display text to "Active Schedule" for scheduled posts
    let displayStatus = post.status;
    if (post.type === 'Scheduled' && post.status !== 'Expired') {
       displayStatus = 'Active Schedule';
    }

    let colorClass = "bg-[#f4f7f4] text-[#4a6b56]";
    let dotColor = "bg-[#82a38e]";
    
    if (displayStatus === 'Active' || displayStatus === 'Active Schedule') { 
      colorClass = "bg-[#ecfdf5] text-[#059669]"; 
      dotColor = "bg-[#10b981]"; 
    } else if (displayStatus === 'Claimed') { 
      colorClass = "bg-[#eff6ff] text-[#2563eb]"; 
      dotColor = "bg-[#3b82f6]"; 
    } else if (displayStatus === 'Expired') { 
      colorClass = "bg-[#f4f7f4] text-[#82a38e]"; 
      dotColor = "bg-[#cbd5e1]"; 
    }

    return (
      <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-max ${colorClass}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
        {displayStatus}
      </span>
    );
  };

  return (
    <Layout role="Supplier">
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-10">
        
        {/* Sleek Header & Filters */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
           <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">
                <span className="cursor-pointer hover:text-[#10b981] transition-colors" onClick={() => navigate('/supplier/dashboard')}>Dashboard</span>
                <span>/</span>
                <span className="text-[#10b981]">History Log</span>
              </div>
              <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">Donation History</h1>
           </div>

           {/* Organic Segmented Control */}
           <div className="flex bg-[#f4f7f4] p-1.5 rounded-full overflow-x-auto custom-scrollbar border border-[#e8f0eb] w-full md:w-auto">
              {['All', 'Active', 'Claimed', 'Expired'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-full text-[14.5px] transition-all duration-300 whitespace-nowrap ${
                    filter === f 
                      ? 'bg-white text-[#064e3b] font-extrabold shadow-[0_2px_8px_rgba(0,0,0,0.04)]' 
                      : 'text-[#82a38e] font-bold hover:text-[#4a6b56]'
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
        </header>

        {/* Clean Organic Data Table */}
        <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
           <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#f4f7f4] border-b border-[#e8f0eb]">
                  <tr>
                    <th className="px-6 py-5 pl-8 text-[11px] font-extrabold text-[#82a38e] uppercase tracking-widest">Date Posted</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-[#82a38e] uppercase tracking-widest">Food Category</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-[#82a38e] uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-[#82a38e] uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[11px] font-extrabold text-[#82a38e] uppercase tracking-widest text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8f0eb]">
                  {loading ? (
                    // Skeleton Rows for Table
                    [1, 2, 3, 4].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-6 pl-8"><div className="h-4 bg-[#e8f0eb] rounded-full w-24"></div></td>
                        <td className="px-6 py-6">
                           <div className="h-4 bg-[#e8f0eb] rounded-full w-32 mb-2"></div>
                           <div className="h-3 bg-[#f4f7f4] rounded-full w-20"></div>
                        </td>
                        <td className="px-6 py-6"><div className="h-4 bg-[#e8f0eb] rounded-full w-16"></div></td>
                        <td className="px-6 py-6"><div className="h-6 bg-[#f4f7f4] rounded-full w-24"></div></td>
                        <td className="px-6 py-6 flex justify-end pr-8"><div className="h-10 bg-[#f4f7f4] rounded-full w-28"></div></td>
                      </tr>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((post) => (
                      <tr key={post._id} className="hover:bg-[#fbfdfb] transition-colors group">
                        <td className="px-6 py-5 pl-8 whitespace-nowrap text-[14.5px] font-extrabold text-[#064e3b]">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-[15px] font-bold text-[#064e3b] group-hover:text-[#10b981] transition-colors">{post.category}</p>
                           <p className="text-[12px] font-bold text-[#82a38e] mt-0.5">{post.type === 'Scheduled' ? 'Scheduled Drop' : 'One-Time Release'}</p>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-[15px] font-black text-[#064e3b]">
                          {post.weight} <span className="text-[13px] font-bold text-[#82a38e]">kg</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
<StatusBadge post={post} />
                        </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right pr-8">
  {post.type === 'Scheduled' ? (
    <div className="flex items-center justify-end gap-2">
      {post.status === 'Claimed' && (
        <button 
          onClick={() => navigate(`/supplier/details/${post._id}`)} 
          className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[12px] font-extrabold transition-all duration-300 bg-white text-[#064e3b] hover:bg-[#f4f7f4] border border-[#e8f0eb] hover:border-[#d1fae5]"
        >
          View Details
        </button>
      )}
      <button 
        onClick={() => navigate(`/supplier/manage/${post._id}`)} 
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-extrabold transition-all duration-300 bg-[#10b981] text-white hover:bg-[#059669] shadow-[0_4px_14px_rgba(16,185,129,0.3)]"
      >
        <span>Manage Schedule</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  ) : (
    <button 
      onClick={() => navigate(`/supplier/manage/${post._id}`)} 
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-extrabold transition-all duration-300 shadow-sm ${
        post.status === 'Active' 
          ? 'bg-[#10b981] text-white hover:bg-[#059669] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(16,185,129,0.3)]' 
          : 'bg-white text-[#064e3b] hover:bg-[#f4f7f4] border border-[#e8f0eb] hover:border-[#d1fae5]'
      }`}
    >
      <span>{post.status === 'Active' ? 'Manage' : 'View Details'}</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
    </button>
  )}
</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                         <div className="flex flex-col items-center justify-center">
                           <div className="w-16 h-16 bg-[#f4f7f4] rounded-full flex items-center justify-center mb-4 text-[#82a38e]">
                             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                           </div>
                           <p className="text-[16px] font-extrabold text-[#064e3b] mb-1.5">No records found</p>
                           <p className="text-[14.5px] font-medium text-[#4a6b56]">There are no history logs matching the '{filter}' filter.</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(16, 185, 129, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16, 185, 129, 0.3); }
      `}} />
    </Layout>
  );
};

export default HistorySupplier;