import { useMemo, useState } from 'react';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext.jsx';

const colors = {
  1: '#28a745',
  2: '#17a2b8', 
  3: '#6c757d',
  4: '#dc3545'
};

const suffix = {1: 'st', 2: 'nd', 3: 'rd', 4: 'th'};

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

const RankingTrendChart = ({ gsData, username }) => {
  const [gCount, setGCount] = useState(20);

  // console.log('game session length:', gsData[19]);
  const gameCount = Math.min(gCount, gsData.length);
  const trendData = useMemo(() => {
    const recentGames = gsData.slice(0, gameCount);
    // console.log('rg', recentGames, 'username', username);

    const data = recentGames.map((game, index) => {
      // console.log('curr idx: ', index);
      return {
        date: game.game_date,
        idx: index,
        type: game.fk_game_type.type_name,
        ranking: game.session_players.find(p => p.fk_user_id.username === username).final_ranking,
        point: game.session_players.find(p => p.fk_user_id.username === username).final_point,
        players: game.session_players.map(p => ({
          seat: p.seat,
          username: p.fk_user_id.username,
          score: p.final_score
        }))
      };
    }).reverse();
    return data;
  }, [gameCount, username]);
  // console.log('trend data 0', trendData[0]);
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800/80 text-white p-3 rounded-lg shadow-lg border border-gray-200">
          {/* <p className="font-semibold text-gray-800">{label}</p> */}
          <p className="space-x-2 text-lg font-semibold">
            <span>{formatDate(payload[0].payload.date)}</span>
            <span>{payload[0].payload.type.replace("ルール", "")}</span>
            <span>{payload[0].payload.ranking}{suffix[payload[0].payload.ranking]}</span>
            <span>{payload[0].payload.point}pt</span>
          </p>
          {payload[0].payload.players.map(p => {
            return (
              <div key={`trend-${payload[0].payload.idx}-${p.seat}`} 
                className={`text-left flex mx-auto pl-3 ${p.username === username && 'underline'}`}>
                <p className="space-x-2">
                  <span>{p.username}</span>
                  <span>[{p.score}]</span>
                </p>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };
  
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={6} 
        fill="#fff"
        stroke={colors[payload.ranking]}
        strokeWidth={3}
      />
    );
  };

  const CustomDotHover = (props) => {
    const { cx, cy, payload } = props;
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={11} 
        fill={colors[payload.ranking]}
      />
    );
  };
  
  return (
    <div className="w-full mx-auto py-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-1 flex justify-between px-8">
        <div>Trend</div>
        <div className="flex items-center text-gray-800 mb-1 text-center space-x-2">
          <button className="w-6 aspect-square rounded-full bg-blue-900 text-amber-300 text-lg font-bold 
            flex items-center justify-center leading-none p-0 border border-amber-300 disabled:bg-gray-300 
            disabled:border-slate-500 disabled:text-slate-500"
            onClick={() => setGCount(n => n + 10)}
            disabled={gCount >= 50}>
            +
          </button>
          <div>
            Last {gameCount} games
          </div>
          <button className="w-6 aspect-square rounded-full bg-blue-900 text-amber-300 text-lg font-bold 
            flex items-center justify-center leading-none p-0 border border-amber-300 disabled:bg-gray-300 
            disabled:border-slate-500 disabled:text-slate-500"
            onClick={() => setGCount(n => n - 10)}
            disabled={gCount <= 10}>
            −
          </button>
        </div>
      </h2>
      
      {/* trend */}
      <div className="flex justify-center items-center">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRanking" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            {/* <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /> */}
            <XAxis 
              dataKey="idx" 
              tick={{ fontSize: 12 }}
              stroke="#666"
              hide={true}
            />
            <YAxis 
              domain={[0, 5]}
              ticks={[1, 2, 3, 4]}
              reversed
              axisLine={false}
              tick={false}
              stroke="#666"
              // label={{ 
              //   value: 'Ranking', 
              //   angle: -90, 
              //   position: 'outsideLeft',
              //   style: { fontSize: 12, fill: '#666', fontWeight: 'bold'}
              // }}
              
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="linear" 
              isAnimationActive={false}
              dataKey="ranking" 
              stroke="#b5c2ce" 
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={<CustomDotHover />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RankingTrendChart;