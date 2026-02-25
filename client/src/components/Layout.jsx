import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarNGO from './SidebarNGO';
import SidebarSupplier from './SidebarSupplier';

const Layout = ({ role, children, customSidebarContent }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const HeroIcon = () => (
    <svg className="w-5 h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className={`flex min-h-screen font-sans bg-slate-50 ${role === 'NGO' ? 'selection:bg-indigo-100' : 'selection:bg-emerald-100'}`}>
      
      {/* Mobile Header: Fixed at Z-50 */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-slate-200 h-16 z-50 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        
        {/* Logo Container */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm">
            <HeroIcon />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            SurplusShare
          </span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 rounded-md transition-colors ${isSidebarOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          )}
        </button>
      </div>

      {/* Sidebar Drawer: Elevated to Z-[100] for mobile */}
      <div className={`
        fixed inset-y-0 z-[100] w-72 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:left-0 lg:border-r lg:border-slate-200 shadow-2xl lg:shadow-none
      `}>
        {role === 'NGO' ? (
          <SidebarNGO customSidebarContent={customSidebarContent} closeSidebar={() => setIsSidebarOpen(false)} />
        ) : (
          <SidebarSupplier closeSidebar={() => setIsSidebarOpen(false)} />
        )}
      </div>

      {/* Background Overlay: Fixed at Z-[90] */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-72 p-4 sm:p-8 lg:p-10 pt-20 lg:pt-10 min-w-0 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;