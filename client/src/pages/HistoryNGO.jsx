import { useState, useEffect } from 'react';
import api from '../services/axios';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const HistoryNGO = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  
  // Search and Pagination States
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/posts/ngo/history');
        setHistory(data);
      } catch (error) {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // 1. Filter Logic
  const filteredHistory = history.filter(row => {
      const q = search.toLowerCase();
      return (
          row.id.toLowerCase().includes(q) ||
          row.supplier.toLowerCase().includes(q) ||
          row.items.toLowerCase().includes(q) ||
          row.status.toLowerCase().includes(q)
      );
  });

  // 2. Pagination Logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  // Print Receipt functionality
  const handlePrintReceipt = (row) => {
      // Basic browser print trigger for receipt functionality
      window.print();
  };

  return (
    <Layout role="NGO">
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-10 print:m-0 print:p-0">
        
        {/* Header & Search */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-2 print:hidden">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">Rescue History</h1>
            <p className="text-[15px] font-medium text-[#4a6b56] mt-1">A complete log of your past food claims and pickups.</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search records..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-80 bg-white border border-[#e8f0eb] rounded-full pl-12 pr-5 py-3 text-[14.5px] font-bold text-[#064e3b] outline-none focus:ring-4 focus:ring-[#10b981]/20 transition-all placeholder:text-[#82a38e] shadow-[0_4px_15px_rgb(0,0,0,0.02)]"
            />
            <svg className="absolute left-5 top-3.5 w-5 h-5 text-[#82a38e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </header>

        {/* Organic Data Table */}
        <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden print:border-none print:shadow-none transition-all duration-500 hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-[#f4f7f4] border-b border-[#e8f0eb] text-[11px] uppercase tracking-widest text-[#82a38e] font-extrabold print:bg-white">
                            <th className="p-5 pl-8">ID / Date</th>
                            <th className="p-5">Supplier</th>
                            <th className="p-5">Category</th>
                            <th className="p-5">Weight</th>
                            <th className="p-5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8f0eb]">
                        {loading ? (
                            <tr><td colSpan="5" className="p-12 text-center text-[#82a38e] font-bold animate-pulse">Loading history data...</td></tr>
                        ) : currentItems.length === 0 ? (
                             <tr><td colSpan="5" className="p-12 text-center text-[#4a6b56] font-semibold">No records found matching your search.</td></tr>
                        ) : (
                            currentItems.map((row) => (
                                <tr key={row.rawId} className="hover:bg-[#fbfdfb] transition-colors group">
                                    <td className="p-5 pl-8">
                                        <p className="text-[14.5px] font-extrabold text-[#064e3b]">#{row.id}</p>
                                        <p className="text-[12px] font-bold text-[#82a38e] mt-0.5">{row.date}</p>
                                    </td>
                                    <td className="p-5">
                                        <p className="text-[15px] font-bold text-[#064e3b] group-hover:text-[#10b981] transition-colors">{row.supplier}</p>
                                    </td>
                                    <td className="p-5 text-[14.5px] text-[#4a6b56] font-semibold">{row.items}</td>
                                    <td className="p-5 text-[15px] text-[#064e3b] font-black">{row.weight}</td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-max ${row.status === 'Completed' ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#fef2f2] text-[#e11d48]'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Completed' ? 'bg-[#3b82f6]' : 'bg-[#ef4444]'}`}></div>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Organic Pagination */}
            {!loading && filteredHistory.length > 0 && (
                <div className="p-6 border-t border-[#e8f0eb] bg-[#fbfdfb] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13.5px] text-[#4a6b56] font-bold print:hidden">
                    <span>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length} entries</span>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-5 py-2.5 rounded-full bg-white border border-[#e8f0eb] text-[#064e3b] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f4f7f4] hover:text-[#10b981] hover:border-[#d1fae5] transition-all duration-300"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-5 py-2.5 rounded-full bg-white border border-[#e8f0eb] text-[#064e3b] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f4f7f4] hover:text-[#10b981] hover:border-[#d1fae5] transition-all duration-300"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>

      {/* Global Print & Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(16, 185, 129, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(16, 185, 129, 0.3); }

        @media print {
            body * { visibility: hidden; }
            main, main * { visibility: visible; }
            main { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
            aside { display: none !important; }
        }
      `}} />
    </Layout>
  );
};

export default HistoryNGO;