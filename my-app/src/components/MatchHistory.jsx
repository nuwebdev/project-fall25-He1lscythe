import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import ApiService from '../services/api.js';

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const FilterModal = ({ filters, setFilters }) => {
  const [isOpen, setFIsOpen] = useState(false);
  const [ranking, setRanking] = useState(filters.ranking || '');
  const [gametype, setGametype] = useState(filters.gametype || []);
  // console.log(gametype);

  const handleConfirm = () => {
    setFilters({ ...filters, ranking });
    setFIsOpen(false);
  };

  const isChecked = (value) => gametype.length === 0 || gametype.includes(value);

  const handleCheckbox = (value) => {
    let newGametype;
    
    if (gametype.length === 0) {
      newGametype = [1, 2, 3].filter(v => v !== value);
    } else if (gametype.includes(value)) {
      if (gametype.length === 1) return;
      const filtered = gametype.filter(v => v !== value);
      newGametype = filtered.length === 3 ? [] : filtered;
    } else {
      const added = [...gametype, value];
      newGametype = added.length === 3 ? [] : added;
    }
    
    setGametype(newGametype);
    setFilters({ ...filters, gametype: newGametype });
  };

  return (
    <div className='flex justify-between mx-3 mb-2'>
      <div className='invisible'>date pending</div>
      <fieldset className='flex items-center'>
        {/* <legend className="text-sm text-gray-600 mb-2">Game Type</legend> */}
        <div className="flex gap-3">
          {[
            { value: 1, label: 'Mリーグ' },
            { value: 2, label: '最高位戦' },
            { value: 3, label: 'ジャン魂' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked(option.value)}
                onChange={() => handleCheckbox(option.value)}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        onClick={() => setFIsOpen(true)}
        className="flex items-center px-4 py-2 bg-transparent text-black hover:bg-blue-600 gap-1"
      >
        <Filter className="w-4 h-4 p-0" />
        <span>Filter</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setFIsOpen(false)}
          />

          <div className="relative bg-white rounded-lg shadow-xl w-96 max-w-[90%]">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Filter</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <fieldset>
                <legend className="text-sm text-gray-600 mb-2">Ranking</legend>
                <div className="flex flex-wrap gap-6">
                  {[
                    { value: '', label: 'All' },
                    { value: '1', label: '1st' },
                    { value: '2', label: '2nd' },
                    { value: '3', label: '3rd' },
                    { value: '4', label: '4th' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="ranking"
                        value={option.value}
                        checked={ranking === option.value}
                        onChange={(e) => setRanking(e.target.value)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="px-6 py-3 border-t flex justify-end">
              <button
                onClick={handleConfirm}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MatchHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams();
  const isAdmin = user?.role === 'admin';

  const targetUserId = paramId || (isAdmin ? null : user?.id);
  const targetUsername = location.state?.username || (paramId ? null : user?.username);

  const [loading, setLoading] = useState(true);
  const [gsRecords, setRecords] = useState([]);
  const [filters, setFilters] = useState({ ranking: '', gametype: '' });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const resultGS = await ApiService.getGameSession({ 
          ranking: filters.ranking, 
          gametype: filters.gametype,
          ...(targetUserId && { id: targetUserId }) 
        });
        setRecords(resultGS);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters, targetUserId]);
  // console.log(gsRecords);

  const handleViewGame = (id) => {
    navigate(`/game/${id}`);
  };

  const handleDelete = async (gameId) => {
    if (!confirm('Sure to delete this game session?')) {
      return;
    }
    setDeleting(gameId);
    try {
      await ApiService.adminDeleteGameSession(gameId);
      setRecords(gsRecords.filter(g => g.id !== gameId));
    } catch (error) {
      console.error(error);
      alert('Failed to delete game session');
    } finally {
      setDeleting(null);
    }
  };

  const getTitle = () => {
    if (paramId && targetUsername) {
      return `${targetUsername}'s Games`;
    }
    if (isAdmin && !paramId) {
      return 'All Games (Admin)';
    }
    return 'Match History';
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="w-full container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 my-8">{getTitle()}</h1>
      </div>
      <FilterModal filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="flex mx-auto items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="w-full px-4">
          {gsRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No games found</div>
          ) : (
            gsRecords.map((match, index) => {
            const players = match.session_players;
          
            return (
              <div key={`match-${index}`} className="border border-gray-200 rounded-lg p-4 odd:bg-stone-300">
                <div className="flex items-center justify-between">
                  <div className="">
                    <span className="text-black">
                      {match.fk_game_type.type_name.replace("ルール", "")}
                    </span>
                  </div>
                  <div className="w-full flex flex-wrap">
                    {players.map((p, idx) => (
                      <div key={`m-${index}-p-${idx}`} className={`
                      w-full md:w-1/2 flex-shrink-0 text-left pl-3
                      ${(targetUserId 
                          ? p.user_id === parseInt(targetUserId)
                          : p.fk_user_id?.username === user?.username) 
                      ? 'text-blue-600' 
                      : 'text-gray-700'}
                      `}>
                          {p.fk_user_id.username}: [{p.final_score}]
                      </div>
                    ))}
                  </div>
                    
                  <span className="text-sm text-black flex items-center gap-2">
                    {isAdmin ? (
                      <button 
                        onClick={() => handleDelete(match.id)}
                        disabled={deleting === match.id}
                        className={`p-1.5 shrink-0 rounded transition ${
                          deleting === match.id 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {deleting === match.id ? 'Deleting...' : 'Delete'}
                      </button>
                    ) : (
                      <button onClick={() => handleViewGame(match.id)} 
                        className="p-1.5 shrink-0 bg-transparent border-1 border-blue-500"
                      >
                        Detail
                      </button>
                    )}
                    <span className="break-words">{formatDate(match.game_date)}</span>
                  </span>

                </div>
              </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;