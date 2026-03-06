import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/axios';
import Layout from '../components/Layout';

const ListingsNGO = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data);
        setFilteredPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    let results = posts;

    if (activeCategory !== 'All') {
      results = results.filter(p => p.category === activeCategory);
    }

    if (search) {
      const query = search.toLowerCase();
      results = results.filter(p => {
        const supplierName = p.supplierId?.supplierDetails?.legalName?.toLowerCase() || '';
        const street = p.pickupAddress?.toLowerCase() || '';
        const city = p.city?.toLowerCase() || '';
        const district = p.district?.toLowerCase() || '';
        const state = p.state?.toLowerCase() || '';
        
        return (
          supplierName.includes(query) ||
          street.includes(query) ||
          city.includes(query) ||
          district.includes(query) ||
          state.includes(query) ||
          "india".includes(query) 
        );
      });
    }

    setFilteredPosts(results);
  }, [search, activeCategory, posts]);

  // Organic Theme Skeleton
  const Skeleton = () => (
    <div className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden animate-pulse">
      <div className="h-48 bg-[#f4f7f4]"></div>
      <div className="p-6 space-y-5">
        <div className="h-4 bg-[#e8f0eb] rounded-full w-2/3"></div>
        <div className="h-3 bg-[#e8f0eb] rounded-full w-1/2"></div>
        <div className="grid grid-cols-2 gap-4 pt-4">
           <div className="h-16 bg-[#f4f7f4] rounded-[1.5rem]"></div>
           <div className="h-16 bg-[#f4f7f4] rounded-[1.5rem]"></div>
        </div>
      </div>
    </div>
  );

  // Floating Organic Sidebar
  const customFilterSidebar = (isCollapsed) => (
    <div className="space-y-8 pb-8 pt-2">
      


      {/* Categories */}
      <section>
        {!isCollapsed && <h4 className="text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-3 px-3 fade-in">Food Categories</h4>}
        <div className="flex flex-col gap-1.5 px-2">
          {['All', 'Prepared Meals', 'Bakery/Grains', 'Produce', 'Dairy', 'Meat/Protein'].map((cat) => {
              const isMatch = activeCategory === cat;
              return (
                <button 
                  key={cat}
                  title={isCollapsed ? cat : ""}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center ${isCollapsed ? 'justify-center mx-auto w-12 h-12 p-0' : 'justify-between px-5 py-3 w-full'} rounded-full text-[14.5px] transition-all duration-300 ${isMatch ? 'bg-[#ecfdf5] text-[#059669] font-bold shadow-sm' : 'text-[#4a6b56] font-semibold hover:bg-[#f4f7f4] hover:text-[#064e3b]'}`}
                >
                  {isCollapsed ? (
                      <span className="font-extrabold text-[11px] leading-none uppercase tracking-tighter">
                          {cat === 'All' ? 'ALL' : cat.split(/[\s/]+/).map(w => w[0]).join('').substring(0,2)}
                      </span>
                  ) : (
                      <div className="flex items-center justify-between w-full fade-in">
                        <span className="truncate">{cat}</span>
                        {isMatch && <svg className="w-5 h-5 shrink-0 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                  )}
                </button>
              )
          })}
        </div>
      </section>

      {/* Location Services Widget */}
      <section className={`transition-all duration-500 px-2 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100'}`}>
        <div className="bg-[#f4f7f4] rounded-[1.5rem] p-5 fade-in">
          <h4 className="text-xs font-extrabold text-[#064e3b] mb-1.5 flex items-center gap-2 uppercase tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#059669]"></span>
            </span>
            Location Active
          </h4>
          <p className="text-[13px] font-semibold text-[#4a6b56] mt-2 leading-relaxed">Sorting by distance to <span className="font-extrabold text-[#064e3b]">{user?.ngoDetails?.city || 'your location'}</span>.</p>
        </div>
      </section>
    </div>
  );

  return (
    <Layout role="NGO" customSidebarContent={customFilterSidebar} defaultPinned={true}>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[32px] font-extrabold text-[#064e3b] tracking-tight">Nearby Food Drops</h1>
            <p className="text-[15px] font-medium text-[#4a6b56] mt-1">Discover and claim available food donations in your operational area.</p>
          </div>
          
                <div className="fade-in relative border-2 md:w-[400px] w-[350px] ml-[10px] rounded-4xl border-[#0f996b]">
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name or location..." 
                    className="w-full bg-[#f4f7f4] border-none rounded-full px-5 py-3.5 text-[14.5px] font-bold text-[#109166] outline-none focus:ring-4 focus:ring-[#10b981]/20 transition-all placeholder:text-[#82a38e]"
                  />
                  <svg className="absolute right-5 top-3.5 w-5 h-5 text-[#82a38e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>

          <div className="flex items-center bg-white border border-[#e8f0eb] pl-2 pr-5 py-2 rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
               </div>
               <div className="flex flex-col">
                   <span className="text-[10px] font-extrabold text-[#82a38e] uppercase tracking-wider">Available Drops</span>
                   <span className="text-xl font-black text-[#064e3b] leading-none">{filteredPosts.length}</span>
               </div>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredPosts.map((post) => (
              <div 
                key={post._id} 
                onClick={() => navigate(`/ngo/food/${post._id}`)}
                className="bg-white rounded-[2rem] border border-[#e8f0eb] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col group cursor-pointer overflow-hidden"
              >
                {/* Image Area */}
                <div className="h-48 relative bg-[#f4f7f4] overflow-hidden">
                  {!post.image ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#82a38e] group-hover:scale-105 transition-transform duration-700">
                       <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                       <span className="text-xs font-extrabold uppercase tracking-widest opacity-70">{post.category}</span>
                    </div>
                  ) : (
                    <img src={`${API_BASE_URL}${post.image}`} alt="Surplus" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {post.distance !== null && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-[#064e3b] px-4 py-1.5 rounded-full text-[13px] font-black shadow-sm flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {post.distance.toFixed(1)} km
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col">
                  <div className="mb-5">
                    <p className="text-[11px] font-extrabold text-[#10b981] uppercase tracking-wider mb-1.5">{post.category}</p>
                    <h3 className="text-[18px] font-extrabold text-[#064e3b] truncate group-hover:text-[#10b981] transition-colors">
                      {post.supplierId?.supplierDetails?.legalName || 'Unknown Supplier'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#f4f7f4] rounded-[1.5rem] p-4 border border-[#e8f0eb]">
                       <span className="block text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">Weight</span>
                       <span className="text-[15px] font-black text-[#064e3b]">{post.weight} kg</span>
                    </div>
                    <div className="bg-[#f4f7f4] rounded-[1.5rem] p-4 border border-[#e8f0eb]">
                       <span className="block text-[11px] font-extrabold text-[#82a38e] uppercase tracking-wider mb-1">Packaging</span>
                       <span className={`text-[15px] font-black ${post.packaging ? 'text-[#059669]' : 'text-[#d97706]'}`}>
                          {post.packaging ? 'Packaged' : 'Bulk Cargo'}
                       </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-[#e8f0eb] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <svg className="w-5 h-5 text-[#82a38e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       <span className="text-[13px] font-bold text-[#4a6b56]">Deadline: <span className="font-extrabold text-[#064e3b]">{post.pickupDate || 'ASAP'}</span></span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#10b981] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-[#e8f0eb] px-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <svg className="w-14 h-14 text-[#82a38e] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                <h3 className="text-lg font-extrabold text-[#064e3b] mb-1.5">No Drops found</h3>
                <p className="text-[15px] font-medium text-[#4a6b56] mb-5">We couldn't find any food shipments matching your search for "{search}".</p>
                <button 
                  onClick={() => {setSearch(''); setActiveCategory('All');}} 
                  className="px-6 py-2.5 bg-[#ecfdf5] text-[#059669] font-bold rounded-full hover:bg-[#d1fae5] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListingsNGO;