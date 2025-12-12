import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext.jsx';
import ApiService from '../services/api';

const SearchPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [cp, setcp] = useState(null);
  const [compareduser, setcpUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);


  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await ApiService.searchUser(query, user.id);
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

  const handleSelect = (target) => {
    navigate(`/user/${target.id}`, { state: {username: target.username} });
  };

  const handleCompare = async (target) => {
    setcpUser(target);
    const resultcp = await ApiService.comparePoints({ id1: user.id, id2: target.id });
    setQuery('');
    setcp(resultcp);
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
              onChange={(e) => {
                setQuery(e.target.value);
                if (cp) {
                  setcp(null);
                  setcpUser(null);
                }
              }}
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
                      <div
                        onClick={() => handleSelect(user)}
                        className="w-full px-5 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0 relative group"
                        
                      >
                        <div className="flex-1 min-w-0 flex justify-between items-center">
                          <span className="font-semibold text-gray-800 truncate">
                            {user.username}
                          </span>
                          <span className="absolute left-28 top-3 mt-1 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Visit {user.username}'s page
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompare(user);
                            }}
                            className="flex px-3 py-1 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded"
                          >
                            Compare
                          </button>
                        </div>

                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
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

        {cp && (
          <div className="max-w-4xl mx-auto mt-40 p-4 bg-white rounded-2xl shadow-md">
            <h2 className="text-4xl font-semibold mb-2">You vs {compareduser.username}</h2>
            <div className="text-sm mb-4">
              (Your points - competitor's points)
              <br />
              (head-to-head records with competitor)
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto text-center border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2">points / rule types</th>
                    <th className="px-4 py-2">Mリーグルール</th>
                    <th className="px-4 py-2">最高位戦ルール</th>
                    <th className="px-4 py-2">ジャン魂ルール</th>
                    <th className="px-4 py-2">All</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-3 font-medium">Game counts</td>
                    <td className="px-4 py-3">{cp.gt1_pc}</td>
                    <td className="px-4 py-3">{cp.gt2_pc}</td>
                    <td className="px-4 py-3">{cp.gt3_pc}</td>
                    <td className="px-4 py-3">{cp.total_pc}</td>
                  </tr>

                  <tr className="border-t">
                    <td className="px-4 py-3 font-medium">Points differences (Pts)</td>
                    <td className="px-4 py-3">{cp.gt1_score}</td>
                    <td className="px-4 py-3">{cp.gt2_score}</td>
                    <td className="px-4 py-3">{cp.gt3_score}</td>
                    <td className="px-4 py-3">{cp.total_score}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;