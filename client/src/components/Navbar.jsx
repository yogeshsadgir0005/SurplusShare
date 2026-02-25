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
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-200 ${isScrolled || isMenuOpen ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm">
              <HeroIcon />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">SurplusShare</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-sm font-medium text-slate-900">Home</a>
              {['Leaderboard', 'Features', 'Impact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{item}</a>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-8">
              {user ? (
                <>
                  <button onClick={() => navigate(user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">Dashboard</button>
                  <button onClick={handleLogout} className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Sign Out</button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-800 transition-colors">Sign In</button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 shadow-lg animate-in slide-in-from-top-2 duration-200 absolute w-full top-full left-0">
            <nav className="flex flex-col gap-4 mb-6">
              {['Home', 'Leaderboard', 'Features', 'Impact'].map((item) => (
                <a 
                  key={item} 
                  href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {user ? (
                <>
                  <button onClick={() => navigate(user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard')} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm">Go to Dashboard</button>
                  <button onClick={handleLogout} className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold">Sign Out</button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm">Sign In</button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logic Exposer for Landing Page */}
      <div id="smart-ctas" className="hidden" data-ngo={handleNgoClick} data-supplier={handleSupplierClick}></div>

      {/* SaaS Standard Alert Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Switch Account Role?</h3>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              You are currently logged in as a <strong>{user?.role}</strong>. To register as a {targetSignupRole === 'ngo' ? 'NGO' : 'Donor'}, you must sign out of your current session. Proceed?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={confirmRoleSwitch} className="flex-1 py-2.5 px-4 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 shadow-sm transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;