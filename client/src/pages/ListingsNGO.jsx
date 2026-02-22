import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';
import Layout from '../components/Layout';

const ListingsNGO = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const API_BASE_URL = 'http://localhost:5000';

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
      results = results.filter(p => p.supplierId?.supplierDetails?.legalName?.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredPosts(results);
  }, [search, activeCategory, posts]);

  const Skeleton = () => (
    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-56 bg-slate-100"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
      </div>
    </div>
  );

  const customFilterSidebar = (
    <div className="px-8 space-y-10 mt-6 pb-12">
      <section>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Search</h4>
        <div className="relative group">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donors..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
          />
          <svg className="absolute right-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </section>

      <section>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Filter Category</h4>
        <div className="flex flex-col gap-2">
          {['All', 'Prepared Meals', 'Bakery/Grains', 'Produce', 'Dairy', 'Meat/Protein'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center justify-between px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              {cat}
              {activeCategory === cat && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 rounded-3xl p-6 text-white">
        <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Location Tracking</h4>
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="text-xs font-black tracking-tight">Sorting by Distance</p>
        </div>
        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">Showing food closest to {user?.ngoDetails?.city}.</p>
      </section>
    </div>
  );

  return (
    <Layout role="NGO" customSidebarContent={customFilterSidebar}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 lg:mb-16 pb-8 border-b border-slate-200 gap-6">
        <div>
          <div className="flex items-center gap-3 text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Platform</span>
            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
            <span className="text-slate-900">Find Food</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Nearby Food</h2>
        </div>
        <div className="flex flex-col sm:items-end">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Available Resources</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 leading-none">{filteredPosts.length} <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Posts</span></span>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
          {filteredPosts.map((post) => (
            <div 
              key={post._id} 
              onClick={() => navigate(`/ngo/food/${post._id}`)}
              className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-700 lg:hover:-translate-y-3 flex flex-col relative"
            >
              <div className="h-56 sm:h-64 relative overflow-hidden m-3 rounded-[2rem]">
                {post.type === 'Scheduled' || !post.image ? (
                  <div className="h-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex flex-col items-center justify-center p-8 text-center text-white relative">
                     <svg className="w-12 h-12 sm:w-16 sm:h-16 opacity-20 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.64-2.25 1.64-1.74 0-2.1-.96-2.15-1.92H8.05c.07 1.69 1.15 2.92 2.84 3.33V19h2.4v-1.63c1.65-.29 2.91-1.25 2.91-2.94-.01-1.97-1.48-2.67-3.89-3.29z"/></svg>
                     <div className="text-lg sm:text-xl font-black tracking-tight">{post.category}</div>
                  </div>
                ) : (
                  <>
                    <img src={`${API_BASE_URL}${post.image}`} alt="Surplus" className="w-full h-full object-cover lg:group-hover:scale-110 transition-transform duration-[2000ms]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500"></div>
                  </>
                )}

                {post.distance !== null && (
                  <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {Math.round(post.distance)} km
                  </div>
                )}
              </div>

              <div className="p-6 lg:p-8 pt-4 flex-grow flex flex-col">
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors tracking-tighter uppercase">
                    {post.supplierId?.supplierDetails?.legalName}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{post.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8">
                  <div className="bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-2xl group-hover:bg-indigo-50/50 transition-colors">
                     <span className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</span>
                     <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">{post.weight}<span className="text-xs ml-1">kg</span></span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 sm:p-4 rounded-2xl group-hover:bg-indigo-50/50 transition-colors flex flex-col justify-center">
                     <span className="block text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                     <span className={`text-[10px] sm:text-[11px] font-black leading-none ${post.packaging ? 'text-emerald-600' : 'text-rose-500'}`}>{post.packaging ? 'Packaged' : 'Bulk'}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                     <span className="text-[9px] sm:text-[10px] font-black text-rose-500 uppercase tracking-widest">Deadline: {post.pickupDeadline || 'ASAP'}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 lg:group-hover:bg-indigo-600 lg:group-hover:text-white transition-all shadow-sm">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="col-span-full py-20 sm:py-40 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 px-6 text-center">
              <p className="text-lg sm:text-xl font-black text-slate-300 tracking-tight">No matching food available near you.</p>
              <button onClick={() => {setSearch(''); setActiveCategory('All');}} className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-[0.2em] hover:text-indigo-700 transition-colors underline underline-offset-8">Clear Search Filters</button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default ListingsNGO;