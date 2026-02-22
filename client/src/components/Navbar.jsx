import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [targetSignupRole, setTargetSignupRole] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const confirmRoleSwitch = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    navigate(`/signup/${targetSignupRole}`);
  };

  const handleNgoClick = () => {
    if (user?.role === 'NGO') return navigate('/ngo/dashboard');
    if (user?.role === 'Supplier') { setTargetSignupRole('ngo'); setShowLogoutModal(true); return; }
    navigate('/signup/ngo');
  };

  const handleSupplierClick = () => {
    if (user?.role === 'Supplier') return navigate('/supplier/dashboard');
    if (user?.role === 'NGO') { setTargetSignupRole('supplier'); setShowLogoutModal(true); return; }
    navigate('/signup/supplier');
  };

  const HeroIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-500 ${isScrolled || isMenuOpen ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-900 text-white p-2 lg:p-2.5 rounded-2xl shadow-2xl group-hover:rotate-12 transition-transform duration-500">
              <HeroIcon />
            </div>
            <span className="text-xl lg:text-2xl font-black tracking-tighter text-slate-900 uppercase">Surplus<span className="text-emerald-600">Share</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <nav className="flex items-center gap-10">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Home</a>
              {['Leaderboard', 'Features', 'Impact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">{item}</a>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button onClick={() => navigate(user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard')} className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-700 transition-all active:scale-95">Dashboard</button>
                  <button onClick={handleLogout} className="bg-slate-100 text-slate-600 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-50 hover:text-rose-600 transition-all">Log Out</button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95">Log In</button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-100 p-8 space-y-8 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-6">
              {['Home', 'Leaderboard', 'Features', 'Impact'].map((item) => (
                <a 
                  key={item} 
                  href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="pt-8 border-t border-slate-50 flex flex-col gap-4">
              {user ? (
                <>
                  <button onClick={() => navigate(user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard')} className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">Dashboard</button>
                  <button onClick={handleLogout} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">Log Out</button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">Log In</button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logic Exposer for Landing Page */}
      <div id="smart-ctas" className="hidden" data-ngo={handleNgoClick} data-supplier={handleSupplierClick}></div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Log Out & Continue?</h3>
            <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
              You are currently logged in as a <strong>{user?.role}</strong>. To register as a {targetSignupRole === 'ngo' ? 'NGO' : 'Restaurant'}, we need to log you out first.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmRoleSwitch} className="flex-[1.5] py-4 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200">Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;