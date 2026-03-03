import { useNavigate, useLocation } from 'react-router-dom';

const SidebarSupplier = ({ closeSidebar, isCollapsed, isPinned, togglePin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // Organic Sidebar Item
  const SidebarItem = ({ label, path, icon }) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return (
      <div 
        title={isCollapsed ? label : ''}
        onClick={() => { navigate(path); if(closeSidebar && window.innerWidth < 1024) closeSidebar(); }}
        className={`flex items-center ${isCollapsed ? 'justify-center w-12 h-12 mx-auto p-0' : 'gap-3.5 px-5 py-3'} rounded-full cursor-pointer transition-all duration-300 mb-1.5 ${
          active 
            ? 'bg-[#ecfdf5] text-[#059669] shadow-sm' 
            : 'text-[#4a6b56] hover:bg-[#f0f4f1] hover:text-[#064e3b]'
        }`}
      >
        <svg className={`w-[22px] h-[22px] shrink-0 transition-colors duration-300 ${active ? 'text-[#10b981]' : 'text-[#82a38e] group-hover:text-[#4a6b56]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? "2.5" : "2"}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
        {!isCollapsed && <span className={`text-[14.5px] whitespace-nowrap fade-in ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>}
      </div>
    );
  };

  const HeroIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <aside className="flex flex-col h-full bg-white overflow-hidden w-full shrink-0 relative">
      
      {/* Logo Header */}
      <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-8'} border-b border-[#e8f0eb] cursor-pointer shrink-0 transition-all duration-500`} onClick={() => { navigate('/'); if(closeSidebar && window.innerWidth < 1024) closeSidebar(); }}>
        <div className="w-10 h-10 bg-[#064e3b] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(6,78,59,0.2)] shrink-0">
           <HeroIcon />
        </div>
        {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden fade-in">
              <span className="text-[17px] font-extrabold tracking-tight text-[#064e3b] leading-tight">SurplusShare</span>
              <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider mt-0.5">Supplier Hub</span>
            </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-grow px-3 py-5 sm:px-5 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <SidebarItem label="Dashboard" path="/supplier/dashboard" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        <SidebarItem label="Post Food drop" path="/supplier/post" icon="M12 4v16m8-8H4" />
        <SidebarItem label="Schedule Drops" path="/supplier/schedule" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <SidebarItem label="History Log" path="/supplier/history" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <SidebarItem label="Settings" path="/supplier/settings" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-3 sm:p-5 mt-auto border-t border-[#e8f0eb] bg-[#fbfdfb] shrink-0">
         <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5 px-2'} mb-5 transition-all`}>
           <div className="w-10 h-10 rounded-full bg-[#e8f0eb] flex items-center justify-center font-bold text-[#059669] text-sm shrink-0 shadow-inner">
               {user?.supplierDetails?.legalName?.charAt(0) || 'S'}
           </div>
           {!isCollapsed && (
             <div className="flex-grow min-w-0 fade-in">
                <p className="text-[14.5px] font-bold text-[#064e3b] truncate leading-tight">{user?.supplierDetails?.legalName}</p>
                <p className="text-xs font-semibold text-[#4a6b56] truncate mt-0.5">{user?.supplierDetails?.businessType}</p>
             </div>
           )}
         </div>

         {/* Sign Out Button */}
         <button 
           title={isCollapsed ? "Sign Out" : ""}
           onClick={() => {localStorage.clear(); navigate('/');}} 
           className={`w-full py-3 bg-white border border-[#e8f0eb] rounded-full text-[14.5px] font-bold text-[#e11d48] hover:bg-[#fef2f2] transition-colors shadow-sm flex items-center justify-center ${isCollapsed ? 'px-0' : ''}`}
         >
           {isCollapsed ? (
              <svg className="w-[22px] h-[22px] shrink-0 text-[#e11d48]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
           ) : (
              <span className="fade-in flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </span>
           )}
         </button>

         {/* Collapse/Pin Button */}
         <button 
            onClick={togglePin} 
            className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2 px-5 py-2.5'} text-[#82a38e] hover:text-[#064e3b] hover:bg-[#f0f4f1] rounded-full text-sm font-bold mt-4 transition-all duration-300 w-full`}
          >
              <svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${!isPinned ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {!isCollapsed && <span className="fade-in">{isPinned ? 'Collapse Menu' : 'Pin Menu'}</span>}
          </button>
      </div>
    </aside>
  );
};

export default SidebarSupplier;