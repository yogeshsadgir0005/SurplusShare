import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/axios';
import Navbar from '../components/Navbar';

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Modal & Logic State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [targetSignupRole, setTargetSignupRole] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/posts/leaderboard');
        setLeaderboard(data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
    };
    fetchLeaderboard();

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

  const handleNgoAction = () => {
    if (!user) {
      navigate('/signup/ngo');
    } else if (user.role === 'NGO') {
      navigate('/ngo/dashboard');
    } else {
      setTargetSignupRole('ngo');
      setShowLogoutModal(true);
    }
  };

  const handleSupplierAction = () => {
    if (!user) {
      navigate('/signup/supplier');
    } else if (user.role === 'Supplier') {
      navigate('/supplier/dashboard');
    } else {
      setTargetSignupRole('supplier');
      setShowLogoutModal(true);
    }
  };

  const podiumData = [leaderboard[1], leaderboard[0], leaderboard[2]];
  const listData = leaderboard.slice(3, 5);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100 overflow-x-hidden">
      
      {/* Dynamic Navbar Component */}
      <Navbar />

      <main className="relative">
        {/* Hero Section */}
        <section className="pt-32 md:pt-48 lg:pt-60 pb-20 lg:pb-40 overflow-hidden px-6 lg:px-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] bg-emerald-50 rounded-full blur-[100px] lg:blur-[150px] opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[100px] lg:blur-[150px] opacity-60"></div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-7 space-y-8 lg:space-y-12 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Live Now v1.0</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
                Working <br /> To End <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600">Food Waste.</span>
              </h1>
              <p className="text-lg lg:text-xl font-bold text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                SurplusShare connects food donors directly to verified NGOs. We help minimize hunger by making food sharing easy and fast.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 lg:gap-6 pt-4">
                <button 
                  onClick={handleNgoAction}
                  className="w-full sm:w-auto px-8 lg:px-10 py-5 lg:py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  {user?.role === 'NGO' ? 'NGO Dashboard' : 'Register as an NGO'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
                <button 
                  onClick={handleSupplierAction}
                  className="w-full sm:w-auto px-8 lg:px-10 py-5 lg:py-6 bg-white text-slate-900 border-2 border-slate-100 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  {user?.role === 'Supplier' ? 'Donor Dashboard' : 'Register as a Restaurant'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative mt-10 lg:mt-0 px-6 lg:px-0">
              <div className="relative z-10 bg-slate-900 p-3 lg:p-4 rounded-[3.5rem] lg:rounded-[4rem] shadow-2xl rotate-2 lg:rotate-3">
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070" className="rounded-[2.5rem] lg:rounded-[3.5rem] grayscale-[30%] hover:grayscale-0 transition-all duration-700 aspect-[4/5] object-cover" alt="Impact"/>
                <div className="absolute -bottom-6 -left-6 lg:-bottom-10 lg:-left-10 bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-[180px] lg:max-w-[240px]">
                   <div className="text-3xl lg:text-5xl font-black text-emerald-600 tracking-tighter mb-2">1.2M+</div>
                   <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Meals shared globally this year.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="py-20 lg:py-40 bg-white border-y border-slate-100 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 lg:mb-24">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase mb-6">Top 5 Heroes</h2>
              <p className="text-slate-400 font-bold max-w-xl mx-auto text-sm lg:text-base">Celebrating the donors who have contributed the most food to the community.</p>
            </div>

            {leaderboard.length > 0 ? (
              <>
                <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-12 lg:gap-8 mb-20 lg:h-72">
                  {/* 2nd Place */}
                  {podiumData[0] && (
                    <div className="order-2 lg:order-1 flex flex-col items-center">
                      <div className="w-14 h-14 lg:w-16 lg:h-16 bg-slate-200 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-slate-500 font-black mb-4">{podiumData[0].name.charAt(0)}</div>
                      <div className="w-32 lg:w-32 h-28 lg:h-40 bg-gradient-to-t from-slate-200 to-slate-100 rounded-2xl lg:rounded-t-2xl border-t-4 border-slate-300 flex flex-col items-center justify-center lg:justify-start pt-2 lg:pt-6 shadow-inner">
                        <span className="text-2xl lg:text-3xl font-black text-slate-400">2</span>
                        <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 px-2 text-center truncate w-full">{podiumData[0].name}</span>
                        <span className="text-[10px] lg:text-xs font-black text-slate-700">{podiumData[0].totalDonated}kg</span>
                      </div>
                    </div>
                  )}
                  {/* 1st Place */}
                  {podiumData[1] && (
                    <div className="order-1 lg:order-2 flex flex-col items-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-amber-100 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-amber-600 font-black mb-4 text-xl">{podiumData[1].name.charAt(0)}</div>
                      <div className="w-40 lg:w-36 h-36 lg:h-56 bg-gradient-to-t from-amber-200 to-amber-100 rounded-2xl lg:rounded-t-2xl border-t-4 border-amber-400 flex flex-col items-center justify-center lg:justify-start pt-2 lg:pt-6 shadow-inner relative">
                        <span className="text-4xl lg:text-5xl font-black text-amber-500">1</span>
                        <span className="text-[9px] lg:text-[10px] font-black text-amber-800 uppercase tracking-widest mt-2 px-2 text-center truncate w-full">{podiumData[1].name}</span>
                        <span className="text-xs lg:text-sm font-black text-slate-900">{podiumData[1].totalDonated}kg</span>
                      </div>
                    </div>
                  )}
                  {/* 3rd Place */}
                  {podiumData[2] && (
                    <div className="order-3 lg:order-3 flex flex-col items-center">
                      <div className="w-14 h-14 lg:w-16 lg:h-16 bg-orange-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-orange-600 font-black mb-4">{podiumData[2].name.charAt(0)}</div>
                      <div className="w-32 lg:w-32 h-24 lg:h-32 bg-gradient-to-t from-orange-200/50 to-orange-100 rounded-2xl lg:rounded-t-2xl border-t-4 border-orange-300 flex flex-col items-center justify-center lg:justify-start pt-2 lg:pt-6 shadow-inner">
                        <span className="text-2xl lg:text-3xl font-black text-orange-400">3</span>
                        <span className="text-[8px] lg:text-[9px] font-black text-orange-800 uppercase tracking-widest mt-2 px-2 text-center truncate w-full">{podiumData[2].name}</span>
                        <span className="text-[10px] lg:text-xs font-black text-slate-700">{podiumData[2].totalDonated}kg</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="max-w-3xl mx-auto space-y-3 px-4 sm:px-0">
                  {listData.map((donor, idx) => (
                    <div key={donor.id} className="flex items-center justify-between p-4 lg:p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4 lg:gap-5 min-w-0">
                        <div className="w-6 font-black text-slate-300 text-base lg:text-lg">#{idx + 4}</div>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center font-black text-[10px] text-slate-500 shrink-0">{donor.name.charAt(0)}</div>
                        <div className="min-w-0">
                          <p className="text-xs lg:text-sm font-black text-slate-900 truncate">{donor.name}</p>
                          <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{donor.city}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm lg:text-base font-black text-slate-900">{donor.totalDonated}kg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
                Aggregating Leaderboard Data...
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-40 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
             <div className="text-center mb-16 lg:mb-32">
                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-6">Made For Both Sides</h2>
                <p className="text-slate-400 font-bold max-w-xl mx-auto text-sm lg:text-base">Easy-to-use dashboards designed specifically for food donors and NGOs.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
                <div className="bg-white p-10 lg:p-16 rounded-[3rem] lg:rounded-[4rem] border border-slate-200 shadow-sm group hover:border-indigo-500 transition-all duration-500">
                   <div className="w-16 h-16 lg:w-20 lg:h-20 bg-indigo-50 text-indigo-600 rounded-2xl lg:rounded-[2rem] flex items-center justify-center mb-8 lg:mb-10">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                   </div>
                   <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-6">For NGOs</h3>
                   <ul className="space-y-4 lg:space-y-6">
                      {['Find food closest to you', 'Claim food instantly', 'Easy pickup coordination'].map((li, i) => (
                        <li key={i} className="flex items-center gap-4 text-slate-500 font-bold text-sm lg:text-base">
                           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>
                           {li}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="bg-white p-10 lg:p-16 rounded-[3rem] lg:rounded-[4rem] border border-slate-200 shadow-sm group hover:border-emerald-500 transition-all duration-500">
                   <div className="w-16 h-16 lg:w-20 lg:h-20 bg-emerald-50 text-emerald-600 rounded-2xl lg:rounded-[2rem] flex items-center justify-center mb-8 lg:mb-10">
                      <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                   </div>
                   <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-6">For Food Donors</h3>
                   <ul className="space-y-4 lg:space-y-6">
                      {['Track your total donations', 'Schedule daily food drops', 'Safe and secure process'].map((li, i) => (
                        <li key={i} className="flex items-center gap-4 text-slate-500 font-bold text-sm lg:text-base">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></div>
                           {li}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 lg:py-40 bg-slate-900 text-white overflow-hidden relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
           <div className="max-w-7xl mx-auto px-10 relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 text-center">
                 {[
                   { val: "450k+", label: "Kgs Saved" },
                   { val: "1.2M", label: "Meals Shared" },
                   { val: "850", label: "Food Donors" },
                   { val: "2.4k", label: "NGO Partners" }
                 ].map((stat, i) => (
                   <div key={i} className="space-y-2 lg:space-y-4">
                      <div className="text-4xl lg:text-7xl font-black tracking-tighter text-emerald-400">{stat.val}</div>
                      <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{stat.label}</div>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 lg:py-20">
         <div className="max-w-7xl mx-auto px-10 flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-900 text-white p-2 rounded-xl">
                 <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </div>
               <span className="text-xl font-black tracking-tighter uppercase">SurplusShare</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] text-center">© 2026 Global Food Sharing Network</p>
            <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
               {['Privacy', 'Legal', 'Safety', 'Press'].map(l => (
                 <span key={l} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">{l}</span>
               ))}
            </div>
         </div>
      </footer>

      {/* Role-Switch Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-3">Log Out & Continue?</h3>
            <p className="text-xs lg:text-sm font-bold text-slate-500 mb-8 leading-relaxed">
              You are currently logged in as a <strong>{user?.role}</strong>. To register as a {targetSignupRole === 'ngo' ? 'NGO' : 'Restaurant'}, we need to log you out first. Do you want to proceed?
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmRoleSwitch} className="flex-[1.5] py-4 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">Yes, Log Out</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;