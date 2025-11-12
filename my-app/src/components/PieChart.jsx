import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import rec from './Gamedata';

const RankingPieChart = () => {
  const rankingData = useMemo(() => {
    const rankingCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
    
    rec.forEach(item => {
      const yuuRecord = item.record.find(player => player.name === 'YuuNecro');
      if (yuuRecord) {
        rankingCount[yuuRecord.ranking]++;
      }
    });
    
    const data = [
      { name: '1st', value: rankingCount[1], percentage: (rankingCount[1] / rec.length * 100).toFixed(1) },
      { name: '2nd', value: rankingCount[2], percentage: (rankingCount[2] / rec.length * 100).toFixed(1) },
      { name: '3rd', value: rankingCount[3], percentage: (rankingCount[3] / rec.length * 100).toFixed(1) },
      { name: '4th', value: rankingCount[4], percentage: (rankingCount[4] / rec.length * 100).toFixed(1) },
    ];
    
    return data;
  }, []);
  
  const COLORS = {
    '1st': '#FFD700',
    '2nd': '#C0C0C0',
    '3rd': '#CD7F32',
    '4th': '#6B7280',
  };

  const renderCombinedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percentage }) => {
    const RADIAN = Math.PI / 180;
    
    // inside %
    const innerRadius2 = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x1 = cx + innerRadius2 * Math.cos(-midAngle * RADIAN);
    const y1 = cy + innerRadius2 * Math.sin(-midAngle * RADIAN);
    
    // outside labelline
    const outerRadius2 = outerRadius + 40;
    const x2 = cx + outerRadius2 * Math.cos(-midAngle * RADIAN);
    const y2 = cy + outerRadius2 * Math.sin(-midAngle * RADIAN);
    
    return (
      <g>
        {/* % */}
        <text 
          x={x1} 
          y={y1} 
          fill="white" 
          textAnchor="middle"
          dominantBaseline="central"
          className="text-base font-bold"
        >
          {`${percentage}%`}
        </text>
        
        {/* labelline */}
        <text 
          x={x2} 
          y={y2} 
          fill={COLORS[name]}
          textAnchor={x2 > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="text-sm font-bold"
        >
          {name}
        </text>
      </g>
    );
  };
  
  const totalGames = rec.length;
  
  return (
    <div className="w-full mx-auto p-6 mb-4 border-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
        YuuNecro rankings
      </h2>
      <p className="text-xs text-gray-800 mb-6 text-center">
        (based on recent {totalGames} games)</p>
      
      {/* piechart */}
      <div className="flex justify-center items-center">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={rankingData}
              isAnimationActive={false}
              cx="50%"
              cy="50%"
              labelLine={{
                stroke: '#888',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
              label={renderCombinedLabel}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {rankingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
};

export default RankingPieChart;