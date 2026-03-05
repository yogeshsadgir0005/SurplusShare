import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/axios';
import Navbar from '../components/Navbar';

// --- NEW: Helper function to format large numbers (e.g., 1.2M+, 450k+)
const formatMetric = (num) => {
  if (num === 0) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k+';
  return num.toString();
};

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Modal & Logic State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [targetSignupRole, setTargetSignupRole] = useState(null);

  // --- NEW: State for real-time metrics
  const [metrics, setMetrics] = useState({
    kilosSaved: 0,
    mealsRedirected: 0,
    donorsCount: 0,
    ngosCount: 0
  });

  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // 1. Define Leaderboard fetch
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/posts/leaderboard');
        setLeaderboard(data);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
    };

    // 2. Define Metrics fetch
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/posts/landing-metrics');
        setMetrics(data);
      } catch (err) {
        console.error("Metrics fetch error:", err);
      }
    };

    // 3. Execute both
    fetchLeaderboard();
    fetchMetrics();

    // Cleanup listener on unmount
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
    <div className="min-h-screen bg-[#fbfdfb] text-[#064e3b] font-sans selection:bg-[#ecfdf5] selection:text-[#059669] overflow-x-hidden">

      <Navbar />

      <main className="relative">
        {/* Organic Hero Section */}
        <section className="pt-24 md:pt-30 lg:pt-34 pb-16 lg:pb-32 px-6 lg:px-8 border-b border-[#e8f0eb] bg-[#f4f7f4]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <div className="space-y-8 text-center lg:text-left">


              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#064e3b] leading-[1.1] tracking-tight">
                Enterprise Logistics for <br className="hidden lg:block" />
                <span className="text-[#10b981]">Surplus Food.</span>
              </h1>

              <p className="text-base lg:text-lg text-[#4a6b56] leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                SurplusShare provides a secure, reliable infrastructure connecting commercial food donors directly to verified NGO networks to minimize waste efficiently.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={handleNgoAction}
                  className="w-full sm:w-auto px-8 py-4 bg-[#10b981] text-white rounded-full font-extrabold text-[15px] shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-[#059669] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {user?.role === 'NGO' ? 'NGO Dashboard' : 'Register as NGO'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
                <button
                  onClick={handleSupplierAction}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#064e3b] border border-[#e8f0eb] rounded-full font-extrabold text-[15px] shadow-sm hover:bg-[#fbfdfb] hover:border-[#d1fae5] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {user?.role === 'Supplier' ? 'Donor Dashboard' : 'Register as Donor'}
                </button>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0 px-4 sm:px-8 lg:px-0">
              <div className="relative bg-white p-2 rounded-[2rem] shadow-[0_15px_40px_rgb(0,0,0,0.04)] border border-[#e8f0eb]">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070"
                  className="rounded-[1.5rem] object-cover aspect-[4/3] w-full"
                  alt="Logistics Impact"
                />
                {/* Floating Organic Stat Card */}
                <div className="absolute -bottom-6 -left-4 lg:-bottom-8 lg:-left-8 bg-white p-5 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e8f0eb] flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#ecfdf5] rounded-full flex items-center justify-center text-[#10b981] shadow-inner">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  </div>
                  <div>
                    {[
                      { val: formatMetric(metrics.mealsRedirected), label: "Meals Preserved" },
                    ].map((stat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="text-2xl font-black text-[#064e3b] leading-none mb-1">{stat.val}</div>
                        <div className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
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
              <h2 className="text-3xl font-extrabold text-[#064e3b] tracking-tight mb-4">Top Network Contributors</h2>
              <p className="text-[#4a6b56] text-[15px] font-medium max-w-2xl mx-auto">Recognizing the organizations leading the initiative in surplus food redistribution.</p>
            </div>

            {leaderboard.length > 0 ? (
              <div className="max-w-4xl mx-auto">
                {/* Top 3 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {podiumData[0] && (
                    <div className="order-2 sm:order-1 bg-[#f4f7f4] border border-[#e8f0eb] rounded-[2rem] p-6 text-center relative overflow-hidden flex flex-col items-center justify-center transition-all hover:shadow-md">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#82a38e]"></div>
                      <span className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-4">Rank 2</span>
                      <div className="w-14 h-14 bg-white border border-[#e8f0eb] rounded-full shadow-sm flex items-center justify-center text-[#4a6b56] font-black text-lg mb-4">{podiumData[0].name.charAt(0)}</div>
                      <h4 className="text-[15px] font-extrabold text-[#064e3b] mb-1.5 truncate w-full">{podiumData[0].name}</h4>
                      <p className="text-lg font-black text-[#4a6b56]">{podiumData[0].totalDonated} kg</p>
                    </div>
                  )}
                  {podiumData[1] && (
                    <div className="order-1 sm:order-2 bg-[#ecfdf5] border border-[#d1fae5] rounded-[2rem] p-8 text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center sm:-mt-4">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#10b981]"></div>
                      <span className="text-[11px] font-extrabold text-[#059669] uppercase tracking-wider mb-4 flex items-center gap-1.5"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> Rank 1</span>
                      <div className="w-20 h-20 bg-white border border-[#d1fae5] rounded-full shadow-sm flex items-center justify-center text-[#10b981] font-black text-2xl mb-4">{podiumData[1].name.charAt(0)}</div>
                      <h4 className="text-[17px] font-extrabold text-[#064e3b] mb-1.5 truncate w-full">{podiumData[1].name}</h4>
                      <p className="text-2xl font-black text-[#059669]">{podiumData[1].totalDonated} kg</p>
                    </div>
                  )}
                  {podiumData[2] && (
                    <div className="order-3 sm:order-3 bg-[#fbfdfb] border border-[#e8f0eb] rounded-[2rem] p-6 text-center relative overflow-hidden flex flex-col items-center justify-center transition-all hover:shadow-md">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#4a6b56]"></div>
                      <span className="text-[11px] font-extrabold text-[#4a6b56] uppercase tracking-wider mb-4">Rank 3</span>
                      <div className="w-14 h-14 bg-[#f4f7f4] border border-[#e8f0eb] rounded-full shadow-sm flex items-center justify-center text-[#064e3b] font-black text-lg mb-4">{podiumData[2].name.charAt(0)}</div>
                      <h4 className="text-[15px] font-extrabold text-[#064e3b] mb-1.5 truncate w-full">{podiumData[2].name}</h4>
                      <p className="text-lg font-black text-[#4a6b56]">{podiumData[2].totalDonated} kg</p>
                    </div>
                  )}
                </div>

                {/* Clean List Data */}
                <div className="bg-white border border-[#e8f0eb] rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                  <div className="divide-y divide-[#e8f0eb]">
                    {listData.map((donor, idx) => (
                      <div key={donor.id} className="flex items-center justify-between p-5 sm:px-8 hover:bg-[#fbfdfb] transition-colors">
                        <div className="flex items-center gap-5 min-w-0">
                          <span className="text-[14.5px] font-extrabold text-[#82a38e] w-6">#{idx + 4}</span>
                          <div className="w-12 h-12 bg-[#f4f7f4] rounded-full flex items-center justify-center text-[#064e3b] font-black text-[15px] shrink-0">{donor.name.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-extrabold text-[#064e3b] truncate">{donor.name}</p>
                            <p className="text-[12px] font-bold text-[#82a38e] truncate mt-0.5">{donor.city}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[15px] font-black text-[#064e3b]">{donor.totalDonated} <span className="text-[12px] font-bold text-[#82a38e]">kg</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-[#82a38e] font-extrabold text-[15px]">
                Aggregating network data...
              </div>
            )}
          </div>
        </section>

        {/* B2B Features Section */}
        <section id="features" className="py-20 lg:py-32 bg-[#fbfdfb] border-y border-[#e8f0eb]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-[#064e3b] tracking-tight mb-4">Dual-Sided Infrastructure</h2>
              <p className="text-[#4a6b56] text-[15px] font-medium max-w-2xl mx-auto">Purpose-built interfaces to handle the specific operational needs of both donors and receivers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                <div className="w-14 h-14 bg-[#ecfdf5] text-[#10b981] rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="text-xl font-extrabold text-[#064e3b] mb-5">NGO Control Center</h3>
                <ul className="space-y-4">
                  {['Real-time proximity matching', 'One-click claim protocol', 'Automated routing & directions'].map((li, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#4a6b56] text-[14.5px] font-bold">
                      <svg className="w-5 h-5 text-[#10b981] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_15px_40px_rgb(0,0,0,0.04)]">
                <div className="w-14 h-14 bg-[#f4f7f4] text-[#064e3b] rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-xl font-extrabold text-[#064e3b] mb-5">Donor Command System</h3>
                <ul className="space-y-4">
                  {['Centralized claim approvals', 'Automated recurring drops', 'Comprehensive impact analytics'].map((li, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#4a6b56] text-[14.5px] font-bold">
                      <svg className="w-5 h-5 text-[#10b981] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Metrics Section */}
        <section id="impact" className="py-20 lg:py-24 bg-[#064e3b] text-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 text-center divide-x-0 md:divide-x divide-white/10">
              {/* --- NEW: Map over the real-time metrics state --- */}
              {[
                { val: formatMetric(metrics.kilosSaved), label: "Kg Saved" },
                { val: formatMetric(metrics.mealsRedirected), label: "Meals Preserved" },
                { val: formatMetric(metrics.donorsCount), label: "Verified Donors" },
                { val: formatMetric(metrics.ngosCount), label: "NGO Partners" }
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-4xl lg:text-5xl font-black text-white tracking-tight">{stat.val}</div>
                  <div className="text-[12px] font-extrabold text-[#10b981] uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#e8f0eb] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#064e3b] text-white p-2 rounded-full">
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 22V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className="text-[18px] font-extrabold text-[#064e3b] tracking-tight">SurplusShare</span>
          </div>
          <p className="text-[14px] font-medium text-[#82a38e]">© 2026 Logistics Network. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Security'].map(l => (
              <span key={l} className="text-[14px] font-bold text-[#4a6b56] hover:text-[#10b981] cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* Organic Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#064e3b]/20 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-[420px] w-full shadow-[0_20px_40px_rgb(0,0,0,0.1)] border border-[#e8f0eb] text-center">
            <div className="w-16 h-16 bg-[#fef2f2] text-[#e11d48] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-extrabold text-[#064e3b] mb-2">Switch Account Role?</h3>
            <p className="text-[14.5px] text-[#4a6b56] mb-8 leading-relaxed font-medium">
              You are currently authenticated as a <strong className="text-[#064e3b] uppercase tracking-wide">{user?.role}</strong>. To register as a {targetSignupRole === 'ngo' ? 'NGO' : 'Donor'}, you must log out of your current session. Proceed?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-4 bg-[#f4f7f4] text-[#4a6b56] rounded-full text-[14.5px] font-bold hover:bg-[#e8f0eb] transition-colors">
                Cancel
              </button>
              <button onClick={confirmRoleSwitch} className="flex-1 py-4 bg-[#e11d48] text-white rounded-full text-[14.5px] font-bold hover:bg-[#be123c] shadow-[0_4px_14px_rgba(225,29,72,0.3)] transition-colors hover:-translate-y-0.5">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;