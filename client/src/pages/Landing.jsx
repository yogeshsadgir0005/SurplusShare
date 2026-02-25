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
      
      <Navbar />

      <main className="relative">
        {/* Clean SaaS Hero Section */}
        <section className="pt-32 md:pt-40 lg:pt-48 pb-16 lg:pb-32 px-6 lg:px-8 border-b border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-700">Platform Live • v1.0</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                Enterprise Logistics for <br className="hidden lg:block"/>
                <span className="text-indigo-600">Surplus Food.</span>
              </h1>
              
              <p className="text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                SurplusShare provides a secure, reliable infrastructure connecting commercial food donors directly to verified NGO networks to minimize waste efficiently.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={handleNgoAction}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  {user?.role === 'NGO' ? 'NGO Dashboard' : 'Register as NGO'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
                <button 
                  onClick={handleSupplierAction}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  {user?.role === 'Supplier' ? 'Donor Dashboard' : 'Register as Donor'}
                </button>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0 px-4 sm:px-8 lg:px-0">
              <div className="relative bg-white p-2 rounded-2xl shadow-xl border border-slate-200">
                <img 
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070" 
                  className="rounded-xl object-cover aspect-[4/3] w-full" 
                  alt="Logistics Impact"
                />
                {/* Clean Floating Stat Card */}
                <div className="absolute -bottom-6 -left-4 lg:-bottom-8 lg:-left-8 bg-white p-5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                   </div>
                   <div>
                     <div className="text-2xl font-bold text-slate-900 leading-none mb-1">1.2M+</div>
                     <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Meals Processed</p>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Professional Leaderboard Section */}
        <section id="leaderboard" className="py-20 lg:py-32 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Top Network Contributors</h2>
              <p className="text-slate-500 text-base max-w-2xl mx-auto">Recognizing the organizations leading the initiative in surplus food redistribution.</p>
            </div>

            {leaderboard.length > 0 ? (
              <div className="max-w-4xl mx-auto">
                {/* Top 3 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {podiumData[0] && (
                    <div className="order-2 sm:order-1 bg-slate-50 border border-slate-200 rounded-xl p-6 text-center relative overflow-hidden flex flex-col items-center justify-center">
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-300"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Rank 2</span>
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-center text-slate-600 font-bold mb-4">{podiumData[0].name.charAt(0)}</div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1 truncate w-full">{podiumData[0].name}</h4>
                      <p className="text-lg font-semibold text-slate-700">{podiumData[0].totalDonated} kg</p>
                    </div>
                  )}
                  {podiumData[1] && (
                    <div className="order-1 sm:order-2 bg-amber-50 border border-amber-200 rounded-xl p-8 text-center relative overflow-hidden shadow-md flex flex-col items-center justify-center sm:-mt-4">
                      <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> Rank 1</span>
                      <div className="w-16 h-16 bg-white border border-amber-200 rounded-lg shadow-sm flex items-center justify-center text-amber-600 font-bold text-xl mb-4">{podiumData[1].name.charAt(0)}</div>
                      <h4 className="text-base font-bold text-slate-900 mb-1 truncate w-full">{podiumData[1].name}</h4>
                      <p className="text-xl font-bold text-amber-700">{podiumData[1].totalDonated} kg</p>
                    </div>
                  )}
                  {podiumData[2] && (
                    <div className="order-3 sm:order-3 bg-orange-50 border border-orange-200 rounded-xl p-6 text-center relative overflow-hidden flex flex-col items-center justify-center">
                      <div className="absolute top-0 left-0 w-full h-1 bg-orange-300"></div>
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-4">Rank 3</span>
                      <div className="w-12 h-12 bg-white border border-orange-200 rounded-lg shadow-sm flex items-center justify-center text-orange-600 font-bold mb-4">{podiumData[2].name.charAt(0)}</div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1 truncate w-full">{podiumData[2].name}</h4>
                      <p className="text-lg font-semibold text-orange-700">{podiumData[2].totalDonated} kg</p>
                    </div>
                  )}
                </div>

                {/* Clean List Data */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {listData.map((donor, idx) => (
                      <div key={donor.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-sm font-semibold text-slate-400 w-6">#{idx + 4}</span>
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">{donor.name.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{donor.name}</p>
                            <p className="text-xs text-slate-500 truncate">{donor.city}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-slate-900">{donor.totalDonated} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-500 font-medium text-sm">
                Aggregating network data...
              </div>
            )}
          </div>
        </section>

        {/* B2B Features Section */}
        <section id="features" className="py-20 lg:py-32 bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Dual-Sided Infrastructure</h2>
                <p className="text-slate-500 text-base max-w-2xl mx-auto">Purpose-built interfaces to handle the specific operational needs of both donors and receivers.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 lg:p-10 rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-4">NGO Control Center</h3>
                   <ul className="space-y-4">
                      {['Real-time proximity matching', 'One-click claim protocol', 'Automated routing & directions'].map((li, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                           <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                           {li}
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="bg-white p-8 lg:p-10 rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-4">Donor Command System</h3>
                   <ul className="space-y-4">
                      {['Centralized claim approvals', 'Automated recurring drops', 'Comprehensive impact analytics'].map((li, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                           <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                           {li}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </section>

        {/* Clean Metrics Section */}
        <section id="impact" className="py-20 bg-slate-900 text-white">
           <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x-0 md:divide-x divide-slate-800">
                 {[
                   { val: "450k+", label: "Kilos Saved" },
                   { val: "1.2M", label: "Meals Redirected" },
                   { val: "850", label: "Verified Donors" },
                   { val: "2.4k", label: "NGO Partners" }
                 ].map((stat, i) => (
                   <div key={i} className="space-y-2">
                      <div className="text-3xl lg:text-4xl font-bold text-white">{stat.val}</div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</div>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 text-white p-1.5 rounded-lg">
                 <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </div>
               <span className="text-lg font-bold text-slate-900 tracking-tight">SurplusShare</span>
            </div>
            <p className="text-sm font-medium text-slate-500">© 2026 Logistics Network. All rights reserved.</p>
            <div className="flex gap-6">
               {['Privacy', 'Terms', 'Security'].map(l => (
                 <span key={l} className="text-sm font-medium text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">{l}</span>
               ))}
            </div>
         </div>
      </footer>

      {/* SaaS Standard Alert Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Switch Account Role?</h3>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              You are currently authenticated as a <strong>{user?.role}</strong>. To register as a {targetSignupRole === 'ngo' ? 'NGO' : 'Donor'}, you must log out of your current session. Proceed?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmRoleSwitch} className="flex-1 py-2.5 px-4 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 shadow-sm transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;