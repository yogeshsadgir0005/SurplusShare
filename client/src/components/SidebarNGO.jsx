import { useNavigate, useLocation } from 'react-router-dom';

const SidebarNGO = ({ customSidebarContent, closeSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const SidebarItem = ({ label, icon, path }) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return (
      <div 
        onClick={() => { navigate(path); if(closeSidebar) closeSidebar(); }}
        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
          active 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <svg className={`w-5 h-5 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {customSidebarContent ? (
        <div className="flex-grow pt-4">
           <SidebarItem path="/ngo/dashboard" label="Back" icon="M10 19l-7-7 7-7m-7 7h18" />
          {customSidebarContent}
        
        </div>
         
      ) : (
        <>
          <nav className="flex-grow px-4 py-6 space-y-1">
            <SidebarItem path="/ngo/dashboard" label="Dashboard" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <SidebarItem path="/ngo/listings" label="Find Food Resources" icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </nav>

          {/* Clean User Profile Card */}
          <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50/50 shrink-0">
           
            <button 
              onClick={handleLogout} 
              className="w-full py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default SidebarNGO;