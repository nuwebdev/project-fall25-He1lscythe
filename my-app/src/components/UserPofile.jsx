import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import RankingTrendChart from './Trending.jsx';
import RankingPieChart from './PieChart.jsx';
import DataGrid from './DataGrid.jsx';

const UserProfile = ({ userId, username: initUsername }) => {
  const [gameSessionRecords, setSRecords] = useState([]);
  const [roundRecords, setRRecords] = useState([]);
  const [username, setUsername] = useState(initUsername);
  const [loading, setLoading] = useState(true);
//   console.log('username: ', username);

  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!initUsername) {
          const userInfo = await ApiService.getUserById(userId);
          setUsername(userInfo.username);
        }
        const resultGS = await ApiService.getGameSession({ id: userId });
        setSRecords(resultGS);
        const resultRR = await ApiService.getRoundPlayers({ id: userId });
        setRRecords(resultRR);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, initUsername]);

  return (
    <div className="w-full bg-gray-100 pt-4">
      <h1 className="items-center font-bold mb-4">Ⓒ {username || 'Player'}</h1>
      <div className="flex py-2">
        {loading ? (
          <div className="flex mx-auto items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="w-3/5 flex flex-col px-24">
              <div><RankingTrendChart gsData={gameSessionRecords} username={username} /></div>
              <div><DataGrid rrData={roundRecords} gsData={gameSessionRecords} /></div>
            </div>
            <div className="w-2/5">
              <RankingPieChart gsData={gameSessionRecords} username={username} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;