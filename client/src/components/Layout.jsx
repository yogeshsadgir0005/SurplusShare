import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNGO from './SidebarNGO';
import SidebarSupplier from './SidebarSupplier';

const Layout = ({ role, children, customSidebarContent, defaultPinned = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isPinned, setIsPinned] = useState(defaultPinned); 
  const [isHovered, setIsHovered] = useState(false); 
  const navigate = useNavigate();

  const isVisuallyCollapsed = !isPinned && !isHovered;

  const HeroIcon = () => (
    <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className={`flex min-h-screen font-sans bg-[#f4f7f4] selection:bg-[#ecfdf5] selection:text-[#059669]`}>
      
      {/* Mobile Header: Frosted Organic Glass */}
      <div className="lg:hidden fixed top-0 w-full bg-[#f4f7f4]/90 backdrop-blur-md border-b border-[#e8f0eb] h-16 z-50 flex items-center justify-between px-4 sm:px-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-[#064e3b] text-white rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(6,78,59,0.2)]">
            <HeroIcon />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#064e3b]">
            SurplusShare
          </span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-full transition-colors ${isSidebarOpen ? 'bg-[#e8f0eb] text-[#064e3b]' : 'text-[#4a6b56] hover:bg-[#e8f0eb]'}`}
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          )}
        </button>
      </div>

      {/* Sidebar Drawer: Floating Pill on Desktop */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]
          
          /* Mobile Full-Height Drawer */
          inset-y-0 left-0 bg-white ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} 
          
          /* Desktop Floating Pill */
          lg:translate-x-0 lg:top-4 lg:bottom-4 lg:left-4 lg:rounded-[2rem] lg:border lg:border-[#e8f0eb] lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)]
          
          /* Dynamic Widths */
          ${isVisuallyCollapsed ? 'w-72 lg:w-[88px]' : 'w-72 lg:w-[280px]'} 
        `}
      >
        {role === 'NGO' ? (
          <SidebarNGO 
            customSidebarContent={customSidebarContent} 
            closeSidebar={() => setIsSidebarOpen(false)} 
            isCollapsed={isVisuallyCollapsed} 
            isPinned={isPinned}
            togglePin={() => setIsPinned(!isPinned)}
          />
        ) : (
          <SidebarSupplier 
            closeSidebar={() => setIsSidebarOpen(false)} 
            isCollapsed={isVisuallyCollapsed} 
            isPinned={isPinned}
            togglePin={() => setIsPinned(!isPinned)}
          />
        )}
      </div>

      {/* Background Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#064e3b]/10 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area: Margins account for the floating sidebar width + 16px spacing */}
      <main className={`flex-grow p-4 sm:p-8 lg:p-10 pt-20 lg:pt-8 min-w-0 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isVisuallyCollapsed ? 'lg:ml-[120px]' : 'lg:ml-[312px]'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;