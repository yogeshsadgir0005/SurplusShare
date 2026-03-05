import { useNavigate, useLocation } from 'react-router-dom';

const SidebarNGO = ({ customSidebarContent, closeSidebar, isCollapsed, isPinned, togglePin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'NGO Admin', email: 'admin@ngo.org', initials: 'NK' };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const SidebarItem = ({ label, icon, path }) => {
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
         <div className="w-10 h-10 bg-[#ecfdf5] text-[#10b981] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.15)] shrink-0">
            <HeroIcon />
         </div>
         {!isCollapsed && (
             <div className="flex flex-col whitespace-nowrap overflow-hidden fade-in">
               <span className="text-[17px] font-extrabold tracking-tight text-[#064e3b] leading-tight">SurplusShare</span>
               <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider mt-0.5">NGO Portal</span>
             </div>
         )}
      </div>

      {/* Main Middle Section */}
      <div className="flex-grow flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {customSidebarContent ? (
             <div className="p-3 sm:p-5 flex flex-col">
               <SidebarItem path="/ngo/dashboard" label="Back to Home" icon="M10 19l-7-7 7-7m-7 7h18" />
               <div className={`mt-4 border-t border-[#e8f0eb] ${isCollapsed ? 'pt-2' : 'pt-4'}`}>
                 {typeof customSidebarContent === 'function' ? customSidebarContent(isCollapsed) : customSidebarContent}
               </div>
             </div>
          ) : (
             <nav className="px-3 py-5 sm:px-5 space-y-1">
                <SidebarItem path="/ngo/dashboard" label="Dashboard" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                <SidebarItem path="/ngo/listings" label="Find Food" icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                <SidebarItem path="/ngo/claims" label="My Claims" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            
                <SidebarItem path="/ngo/history" label="History" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       <SidebarItem path="/ngo/settings" label="Settings" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 
             </nav>
          )}
      </div>

      {/* Bottom Section */}
      <div className="p-3 sm:p-5 mt-auto border-t border-[#e8f0eb] bg-[#fbfdfb] shrink-0">
        <nav className="mb-4">
            <div 
            title="Sign Out"
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center w-12 h-12 mx-auto p-0' : 'gap-3.5 px-5 py-3'} rounded-full cursor-pointer transition-all duration-300 text-[#e11d48] hover:bg-[#fef2f2] font-semibold mt-1`}
          >
            <svg className="w-[22px] h-[22px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="text-[14.5px] whitespace-nowrap fade-in">Sign Out</span>}
          </div>
        </nav>

        {/* Profile Info */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pt-5 border-t border-[#e8f0eb]`}>
           <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5'} w-full overflow-hidden`}>
              <div className="w-10 h-10 rounded-full bg-[#e8f0eb] flex items-center justify-center font-bold text-[#059669] text-sm shrink-0 shadow-inner">
                  {user?.initials || 'NK'}
              </div>
              {!isCollapsed && (
                  <div className="flex flex-col whitespace-nowrap overflow-hidden fade-in min-w-0">
                      <span className="text-[14.5px] font-bold text-[#064e3b] leading-tight truncate">{user?.name || 'NGO Admin'}</span>
                      <span className="text-xs font-semibold text-[#4a6b56] truncate">{user?.email || 'admin@ngo.org'}</span>
                  </div>
              )}
           </div>
        </div>
        
        {/* Collapse/Pin Button */}
        <button 
          onClick={togglePin} 
          className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-2 px-5 py-2.5'} text-[#82a38e] hover:text-[#064e3b] hover:bg-[#f0f4f1] rounded-full text-sm font-bold mt-6 transition-all duration-300 ${!isCollapsed ? 'w-full' : ''}`}
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

export default SidebarNGO;