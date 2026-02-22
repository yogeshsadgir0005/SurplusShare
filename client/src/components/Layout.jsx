import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added import
import SidebarNGO from './SidebarNGO';
import SidebarSupplier from './SidebarSupplier';

const Layout = ({ role, children, customSidebarContent }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate(); // Initialized navigate

  return (
    <div className={`flex min-h-screen font-sans ${role === 'NGO' ? 'bg-[#F8FAFC] selection:bg-indigo-100' : 'bg-[#F8FAFB] selection:bg-emerald-100'}`}>
      
      {/* Mobile Header: Fixed at Z-50 */}
      <div className="lg:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 h-16 z-50 flex items-center justify-between px-6">
        
        {/* Logo Container: Added navigate and cursor-pointer */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${role === 'NGO' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="text-sm font-black tracking-tighter text-slate-900 uppercase">
            SURPLUS<span className="text-emerald-600">SHARE</span>
          </span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2.5 rounded-xl border transition-all active:scale-90 ${isSidebarOpen ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
          )}
        </button>
      </div>

      {/* Sidebar Drawer: Elevated to Z-[100] for mobile to slide OVER the navbar */}
      <div className={`
        fixed inset-y-0 z-[100] w-80 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
        lg:left-0 lg:right-auto lg:border-r lg:border-slate-200
        right-0 left-auto shadow-2xl lg:shadow-none
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area: Offset correctly for mobile navbar and desktop sidebar */}
      <main className="flex-grow lg:ml-80 p-5 md:p-8 lg:p-12 pt-24 lg:pt-12 min-w-0 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;