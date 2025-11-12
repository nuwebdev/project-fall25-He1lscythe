import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot, Area, AreaChart } from 'recharts';
import rec from './Gamedata';

const RankingTrendChart = ({ gCount = 10 }) => {
  const gameCount = Math.min(gCount, rec.length);
    const trendData = useMemo(() => {
    const recentGames = rec.slice(0, gameCount);
    
    const data = recentGames.map((game, index) => {
      const yuuRecord = game.record.find(player => player.name === 'YuuNecro');
      return {
        game: `Game ${gameCount - index}`,
        date: game.date.split(' ')[0],
        shortDate: game.date.split(' ')[0].slice(5),
        ranking: yuuRecord ? yuuRecord.ranking : null,
        score: yuuRecord ? yuuRecord.score : 0,
      };
    }).reverse();
    
    return data;
  }, []);
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-gray-600">Date: {payload[0].payload.date}</p>
          <p className="text-gray-600">
            Ranking: 
            <span className={`font-bold ml-1 ${
              payload[0].value === 1 ? 'text-yellow-500' :
              payload[0].value === 2 ? 'text-gray-400' :
              payload[0].value === 3 ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              #{payload[0].value}
            </span>
          </p>
          <p className="text-gray-600">Score: {payload[0].payload.score.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };
  
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const colors = {
      1: '#FFD700',
      2: '#C0C0C0', 
      3: '#CD7F32',
      4: '#6B7280'
    };
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={6} 
        fill={colors[payload.ranking]} 
        stroke="#fff" 
        strokeWidth={2}
      />
    );
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
        Trend
        <span className="text-xs text-gray-800 ml-5 mb-1 text-center">
        (Last {gameCount} games)
      </span>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="shortDate" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              domain={[0, 5]}
              ticks={[1, 2, 3, 4]}
              reversed
              tick={{ fontSize: 12 }}
              stroke="#666"
              label={{ 
                value: 'Ranking', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#666', fontWeight: 'bold'}
              }}
              tickFormatter={(value) => `#${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="linear" 
              isAnimationActive={false}
              dataKey="ranking" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={<CustomDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RankingTrendChart;