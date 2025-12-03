import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);


  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await ApiService.searchUser(query);
        setResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);
//   console.log(results);
//   console.log('entered:', query);

  const handleSelect = (user) => {
    navigate(`/user/${user.id}`, { state: {username: user.username} });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 pt-4">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Search Players</h1>

        <div className="relative max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search username..."
              className="w-full px-5 py-3 pr-12 text-lg border-2 border-gray-300 rounded-xl 
              focus:border-purple-500 focus:outline-none transition-colors bg-white shadow-sm"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>

          {query.trim() && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
              {results.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto">
                  {results.map((user) => (
                    <li key={user.id}>
                      <button
                        onClick={() => handleSelect(user)}
                        className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 
                        transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {user.username}
                          </div>
                        </div>

                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : !loading ? (
                <div className="px-5 py-4 text-gray-500 text-center">
                  No users found for "{query}"
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;