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
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <header className={`fixed top-0 w-full z-[100] transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-white/95 backdrop-blur-md border-b border-[#e8f0eb] py-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)]' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-[#064e3b] text-white rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(6,78,59,0.2)]">
              <HeroIcon />
            </div>
            <span className="text-[19px] font-extrabold tracking-tight text-[#064e3b]">SurplusShare</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-[14.5px] font-bold text-[#064e3b] transition-colors">Home</a>
              {['Leaderboard', 'Features', 'Impact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-[14.5px] font-bold text-[#4a6b56] hover:text-[#10b981] transition-colors">{item}</a>
              ))}
            </nav>
            <div className="flex items-center gap-3 border-l border-[#e8f0eb] pl-8">
              {user ? (
                <>
                  <button onClick={() => navigate(user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard')} className="bg-[#10b981] text-white px-6 py-2.5 rounded-full text-[14.5px] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 transition-all duration-300">Dashboard</button>
                  <button onClick={handleLogout} className="bg-[#f4f7f4] text-[#4a6b56] border border-transparent px-6 py-2.5 rounded-full text-[14.5px] font-bold hover:bg-[#e8f0eb] hover:text-[#064e3b] transition-colors">Sign Out</button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="bg-[#064e3b] text-white px-8 py-2.5 rounded-full text-[14.5px] font-extrabold shadow-sm hover:bg-[#043326] hover:-translate-y-0.5 transition-all duration-300">Sign In</button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2.5 text-[#4a6b56] hover:text-[#064e3b] hover:bg-[#f4f7f4] rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#e8f0eb] px-6 py-6 shadow-xl animate-in slide-in-from-top-2 duration-300 absolute w-full top-full left-0 rounded-b-[2rem]">
            <nav className="flex flex-col gap-5 mb-8">
              {['Home', 'Leaderboard', 'Features', 'Impact'].map((item) => (
                <a 
                  key={item} 
                  href={item === 'Home' ? '#' : `#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[15px] font-extrabold text-[#4a6b56] hover:text-[#10b981]"
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="pt-6 border-t border-[#e8f0eb] flex flex-col gap-3">
              {user ? (
                <>
                  <button onClick={() => navigate(user.role === 'NGO' ? '/ngo/dashboard' : '/supplier/dashboard')} className="w-full py-3.5 bg-[#10b981] text-white rounded-full text-[15px] font-extrabold shadow-[0_4px_14px_rgba(16,185,129,0.3)]">Go to Dashboard</button>
                  <button onClick={handleLogout} className="w-full py-3.5 bg-[#f4f7f4] text-[#4a6b56] rounded-full text-[15px] font-bold">Sign Out</button>
                </>
              ) : (
                <button onClick={() => navigate('/login')} className="w-full py-3.5 bg-[#064e3b] text-white rounded-full text-[15px] font-extrabold shadow-sm">Sign In</button>
              )}
            </div>
          </div>
        )}
      </header>



      {/* Organic Alert Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#064e3b]/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-[420px] w-full shadow-[0_20px_40px_rgb(0,0,0,0.1)] border border-[#e8f0eb] text-center">
            <div className="w-16 h-16 bg-[#fef2f2] text-[#e11d48] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-[#064e3b] mb-2">Switch Account Role?</h3>
            <p className="text-[14.5px] text-[#4a6b56] mb-8 leading-relaxed font-medium">
              You are currently logged in as a <strong className="text-[#064e3b] uppercase tracking-wide">{user?.role}</strong>. To register as a {targetSignupRole === 'ngo' ? 'NGO' : 'Donor'}, you must sign out of your current session. Proceed?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 bg-[#f4f7f4] text-[#4a6b56] rounded-full text-[14.5px] font-bold hover:bg-[#e8f0eb] transition-colors">Cancel</button>
              <button onClick={confirmRoleSwitch} className="flex-1 py-4 bg-[#e11d48] text-white rounded-full text-[14.5px] font-bold hover:bg-[#be123c] shadow-[0_4px_14px_rgba(225,29,72,0.3)] transition-colors hover:-translate-y-0.5">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;