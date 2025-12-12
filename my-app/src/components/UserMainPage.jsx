import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import RankingTrendChart from './Trending.jsx';
import RankingPieChart from './PieChart.jsx';
import DataGrid from './DataGrid.jsx';

const UserMainPage = ({ userId, username: initUsername }) => {
  const [gameSessionRecords, setSRecords] = useState([]);
  const [username, setUsername] = useState(initUsername);
  const [loading, setLoading] = useState(true);
  const [comparepoints, setcp] = useState({});

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
        const resultcp = await ApiService.comparePoints({ id1: 6, id2: 7 });
        setcp(resultcp);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, initUsername]);
  console.log(comparepoints);

  return (
    <div className="w-full bg-gray-100 pt-4">
      <h1 className="items-center font-bold mb-8">Ⓒ {username || 'Player'}</h1>
      <div className="flex py-2">
        {loading ? (
          <div className="flex mx-auto items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="w-3/5 flex flex-col px-24">
              <div><RankingTrendChart gsData={gameSessionRecords} username={username} /></div>
              <div><DataGrid userId={userId} /></div>
            </div>
            <div className="w-2/5">
              <RankingPieChart gsData={gameSessionRecords} userId={userId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserMainPage;