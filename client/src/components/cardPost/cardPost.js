import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './cardPost.css';
import SliderEvent from '../events/SliderEvent';
import { useLocation } from 'react-router-dom';

const POSTS_PER_PAGE = 12;

export default function CardPost() {
  const [userZipCode, setUserZipCode] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasEvents, setHasEvents] = useState(false);
  const observerRef = useRef(null);
  const location = useLocation();

  const categoryOptions = [
    'All', 'Furniture', 'Electronics', 'Games', 'Clothing', 'Books',
    'Appliances', 'Toys', 'Tools', 'Sports Equipment', 'Food', 'Other'
  ];

  const extractCity = (location) => location?.split(' - ')[0]?.trim() || 'Unknown';

  useEffect(() => {
    const checkEvents = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/events`);
        const data = await res.json();
        setHasEvents(Array.isArray(data) && data.length > 0);
      } catch (err) {
        console.error('Error checking events:', err);
        setHasEvents(false);
      }
    };
    checkEvents();
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${process.env.REACT_APP_API_URL}/Posting/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const [profile] = await res.json();
          if (profile) {}
        } else if (res.status === 401) {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Profile error', err);
      }
    };
    getProfile();
  }, []);

  const fetchPostsPage = useCallback(async (pageNum) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/posts?page=${pageNum}&limit=${POSTS_PER_PAGE}`, { headers });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const { posts: newPosts = [] } = await res.json();
      setHasMore(newPosts.length === POSTS_PER_PAGE);
      setPosts(prev => {
        const ids = new Set(prev.map(p => p.post_id));
        const uniqueNewPosts = newPosts.filter(p => !ids.has(p.post_id));
        return [...prev, ...uniqueNewPosts];
      });
    } catch (err) {
      console.error('Fetch posts error', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPostsPage(1);
  }, [fetchPostsPage]);
useEffect(() => {
  const shouldRefetch = location.state?.refetchPosts;
  if (shouldRefetch) {
    setPosts([]); // clear stale data
    setPage(1);
    fetchPostsPage(1);
  }
}, [location.state, fetchPostsPage]);
  const locationOptions = useMemo(() => {
    return ['All', ...new Set(posts.map(p => extractCity(p.location)).filter(Boolean))];
  }, [posts]);

const filteredAndSorted = useMemo(() => {
  return posts
    .filter(p => selectedCategory === 'All' || (p.features?.[0] || 'Other') === selectedCategory)
    .filter(p => selectedLocation === 'All' || extractCity(p.location) === selectedLocation)
    .filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const da = new Date(a.created_at), db = new Date(b.created_at);
      return sortOrder === 'Newest' ? db - da : da - db;
    });
}, [posts, selectedCategory, selectedLocation, searchQuery, sortOrder]);

  const loadMoreRef = useCallback((node) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
          const nextPage = prev + 1;
          fetchPostsPage(nextPage);
          return nextPage;
        });
      }
    });
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasMore, fetchPostsPage]);

  const LoadingSpinner = () => (
    <div className="flex justify-center my-8">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <section className="min-h-screen bg-gray-100 py-12 px-4">
      {error && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <button onClick={() => fetchPostsPage(page)} className="mt-2 px-4 py-2 bg-red-600 text-white rounded">
            Try Again
          </button>
        </div>
      )}

      {hasEvents && (
        <div className="bg-gray-100 mb-12">
          <div className="container">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/60 z-10 pointer-events-none" />
              <SliderEvent />
            </div>
            <div className="text-center mt-1">
              <Link to="/events" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300">
                View All Events
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto text-center mt-0 mb-6">
        <div className="flex flex-wrap justify-center gap-6">
          <Select label="Category" value={selectedCategory} onChange={setSelectedCategory} options={categoryOptions} />
          <Select label="Location" value={selectedLocation} onChange={setSelectedLocation} options={locationOptions} />
          <Select label="Sort by Time" value={sortOrder} onChange={setSortOrder} options={['Newest', 'Oldest']} />
          <div>
            <label className="block text-sm text-green-900 mb-1">Search Title:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g.chair"
              className="border px-3 py-1 rounded shadow-sm w-40"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 mx-auto">
        {filteredAndSorted.map(post => (
          <Link to={`/posts/${post.post_id}`} key={post.post_id}>
            <div className="group relative bg-white shadow rounded-xl overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105 hover:ring-2 hover:ring-green-700 w-full h-80 pt-4">
{post.availability && (
  <div className={`absolute top-0 left-0 m-2 px-2 py-1 text-xs font-bold rounded-br-md z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
    post.availability === 'available'
      ? 'bg-green-600 text-white'
      : post.availability === 'reserved'
      ? 'bg-yellow-500 text-white'
      : 'bg-gray-500 text-white'
  }`}>
    {post.availability.toUpperCase()}
  </div>
)}

              <div className="w-full h-2/3 flex items-center justify-center bg-white">
                {post.attached_photo_url ? (
                  <img
                    src={post.attached_photo_url}
                    alt={post.title}
                    className="object-cover w-3/5 h-full rounded-lg transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/fallback.jpg";
                    }}
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 
                        002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">{post.title}</h3>
                <p className="text-sm text-zinc-600">
                  <span className="font-medium">Location:</span> {extractCity(post.location)}
                </p>
                <p className="text-sm text-gray-400">
                  <span className="font-medium">Posted:</span> {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore ? (
        <div ref={loadMoreRef}>
          <LoadingSpinner />
        </div>
      ) : !isLoading && filteredAndSorted.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No posts found matching your criteria.
        </div>
      ) : null}
    </section>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm text-green-900 mb-1">{label}:</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded px-3 py-1 shadow-sm"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
