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
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}
      >
        <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
        </svg>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
    );
  };

  return (
    <aside className="flex flex-col h-full overflow-y-auto">
      <div className="p-8 flex items-center gap-3 cursor-pointer" onClick={() => { navigate('/'); if(closeSidebar) closeSidebar(); }}>
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-100">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">SURPLUS<span className="text-indigo-600">SHARE</span></span>
      </div>

      {customSidebarContent ? (
        <div className="flex-grow">{customSidebarContent}</div>
      ) : (
        <>
          <nav className="flex-grow px-6 space-y-2 mt-4">
            <SidebarItem path="/ngo/dashboard" label="Dashboard" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <SidebarItem path="/ngo/listings" label="Find Food" icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs border border-indigo-200 uppercase">{user?.ngoDetails?.name?.charAt(0)}</div>
                <div className="flex-grow overflow-hidden">
                  <p className="text-xs font-black text-slate-900 truncate">{user?.ngoDetails?.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified NGO</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-all">Sign Out</button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default SidebarNGO;