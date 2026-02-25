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

  // BUG FIX: Updated Filter logic to search multiple fields
  useEffect(() => {
    let results = posts;

    // 1. Filter by Category
    if (activeCategory !== 'All') {
      results = results.filter(p => p.category === activeCategory);
    }

    // 2. Filter by Search Query (Fixed Logic)
    if (search) {
      const query = search.toLowerCase();
      results = results.filter(p => {
        const supplierName = p.supplierId?.supplierDetails?.legalName?.toLowerCase() || '';
        const street = p.pickupAddress?.toLowerCase() || '';
        const city = p.city?.toLowerCase() || '';
        const district = p.district?.toLowerCase() || '';
        const state = p.state?.toLowerCase() || '';
        
        // Check if query matches any of these fields
        return (
          supplierName.includes(query) ||
          street.includes(query) ||
          city.includes(query) ||
          district.includes(query) ||
          state.includes(query) ||
          "india".includes(query) // Optional: since all posts are in India
        );
      });
    }

    setFilteredPosts(results);
  }, [search, activeCategory, posts]);

  const Skeleton = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-100"></div>
      <div className="p-5 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        <div className="grid grid-cols-2 gap-4 pt-4">
           <div className="h-12 bg-slate-100 rounded-lg"></div>
           <div className="h-12 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  const customFilterSidebar = (
    <div className="px-6 space-y-8 mt-4 pb-8">
      <section>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Search</h4>
        <div className="relative group">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or location..." 
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder:text-slate-400"
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Categories</h4>
        <div className="flex flex-col gap-1.5">
          {['All', 'Prepared Meals', 'Bakery/Grains', 'Produce', 'Dairy', 'Meat/Protein'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
            >
              {cat}
              {activeCategory === cat && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Location Services Active
        </h4>
        <p className="text-xs text-slate-500 mt-2">Sorting by logistics distance to <span className="font-medium text-slate-700">{user?.ngoDetails?.city || 'your location'}</span>.</p>
      </section>
    </div>
  );

  return (
    <Layout role="NGO" customSidebarContent={customFilterSidebar}>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-5 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nearby Food Resources</h1>
          <p className="text-sm text-slate-500 mt-1">Discover and claim available food donations in your operational area.</p>
        </div>
        <div className="flex items-center bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
          <div className="flex flex-col items-end">
             <span className="text-xs font-medium text-slate-500">Available Loads</span>
             <span className="text-lg font-bold text-indigo-600 leading-none">{filteredPosts.length}</span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <div 
              key={post._id} 
              onClick={() => navigate(`/ngo/food/${post._id}`)}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col group"
            >
              <div className="h-40 relative bg-slate-100 border-b border-slate-100">
                {post.type === 'Scheduled' || !post.image ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                     <span className="text-sm font-medium">{post.category}</span>
                  </div>
                ) : (
                  <img src={`${API_BASE_URL}${post.image}`} alt="Surplus" className="w-full h-full object-cover" />
                )}

                {post.distance !== null && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200/50 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {post.distance.toFixed(1)} km
                  </div>
                )}
              </div>

              <div className="p-5 flex-grow flex flex-col">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">{post.category}</p>
                  <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                    {post.supplierId?.supplierDetails?.legalName || 'Unknown Supplier'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                     <span className="block text-xs text-slate-500 mb-0.5">Total Weight</span>
                     <span className="text-sm font-semibold text-slate-900">{post.weight} kg</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                     <span className="block text-xs text-slate-500 mb-0.5">Packaging</span>
                     <span className={`text-sm font-semibold ${post.packaging ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {post.packaging ? 'Packaged' : 'Bulk Cargo'}
                     </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                     <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     <span>Deadline: <span className="font-medium text-slate-900">{post.pickupDeadline || 'ASAP'}</span></span>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 px-6 text-center">
              <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No resources found</h3>
              <p className="text-sm text-slate-500 mb-4">We couldn't find any food shipments matching your search for "{search}".</p>
              <button 
                onClick={() => {setSearch(''); setActiveCategory('All');}} 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default ListingsNGO;