import { useNavigate, useLocation } from 'react-router-dom';

const SidebarSupplier = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const SidebarButton = ({ label, path, icon }) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return (
      <div 
        onClick={() => { navigate(path); if(closeSidebar) closeSidebar(); }}
        className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 group ${active ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
      >
        <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500 transition-colors'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
    );
  };

  return (
    <aside className="flex flex-col h-full overflow-y-auto">



      
      <div className="p-8 flex items-center gap-3 cursor-pointer" onClick={() => { navigate('/'); if(closeSidebar) closeSidebar(); }}>
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-xl shadow-emerald-100">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">SURPLUS<span className="text-emerald-600">SHARE</span></span>
      </div>






      <nav className="space-y-3 flex-grow px-8">
        <SidebarButton label="Dashboard" path="/supplier/dashboard" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        <SidebarButton label="Post Food" path="/supplier/post" icon="M12 4v16m8-8H4" />
        <SidebarButton label="Scheduled Drops" path="/supplier/schedule" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <SidebarButton label="History" path="/supplier/history" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </nav>

      <div className="p-8 pt-8 border-t border-slate-100 mt-auto">
         <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white text-xs shadow-xl uppercase">{user?.supplierDetails?.legalName?.charAt(0) || 'S'}</div>
           <div className="flex-grow overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">{user?.supplierDetails?.legalName}</p>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{user?.supplierDetails?.businessType}</p>
           </div>
         </div>
         <button onClick={() => {localStorage.clear(); navigate('/');}} className="w-full py-3.5 border-2 border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all">Sign Out</button>
      </div>
    </aside>
  );
};

export default SidebarSupplier;