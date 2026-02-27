import { useNavigate, useLocation } from 'react-router-dom';

const SidebarSupplier = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const SidebarItem = ({ label, path, icon }) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return (
      <div 
        onClick={() => { navigate(path); if(closeSidebar) closeSidebar(); }}
        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
          active 
            ? 'bg-emerald-50 text-emerald-800' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
        <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
      </div>
    );
  };

  const HeroIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <aside className="flex flex-col h-full bg-white overflow-y-auto">
      
      {/* Consistent Logo Header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200 cursor-pointer shrink-0" onClick={() => { navigate('/'); if(closeSidebar) closeSidebar(); }}>
        <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm">
           <HeroIcon />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">SurplusShare</span>
      </div>

      <nav className="flex-grow px-4 py-6 space-y-1">
        <SidebarItem label="Dashboard" path="/supplier/dashboard" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        <SidebarItem label="Post Food drop" path="/supplier/post" icon="M12 4v16m8-8H4" />
        <SidebarItem label="Schedule Drops" path="/supplier/schedule" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <SidebarItem label="History Log" path="/supplier/history" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </nav>

      {/* Clean User Profile Card */}
      <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50/50 shrink-0">
         <div className="flex items-center gap-3 mb-4 px-2">
         
           <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.supplierDetails?.legalName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.supplierDetails?.businessType}</p>
           </div>
         </div>
         <button 
           onClick={() => {localStorage.clear(); navigate('/');}} 
           className="w-full py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center justify-center"
         >
           Sign Out
         </button>
      </div>
    </aside>
  );
};

export default SidebarSupplier;