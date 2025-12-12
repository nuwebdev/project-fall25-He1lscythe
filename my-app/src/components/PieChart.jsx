import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RankingPieChart = ({ gsData, userId }) => {
  const rankingData = useMemo(() => {
    const rankingCount = { 1: 0, 2: 0, 3: 0, 4: 0 };

    gsData.forEach(item => {
      rankingCount[item.session_players.find(p => p.user_id === userId).final_ranking]++;
    });
    
    const data = [
      { name: '1st', value: rankingCount[1], percentage: (rankingCount[1] / gsData.length * 100).toFixed(2) },
      { name: '2nd', value: rankingCount[2], percentage: (rankingCount[2] / gsData.length * 100).toFixed(2) },
      { name: '3rd', value: rankingCount[3], percentage: (rankingCount[3] / gsData.length * 100).toFixed(2) },
      { name: '4th', value: rankingCount[4], percentage: (rankingCount[4] / gsData.length * 100).toFixed(2) },
    ];
    
    return data;
  }, [gsData]);
  
  const COLORS = {
      '1st': '#28a745',
      '2nd': '#17a2b8', 
      '3rd': '#6c757d',
      '4th': '#dc3545'
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
      <>
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
      </>
    );
  };
  
  return (
    <div className="w-full mx-auto p-6 mb-4 border-2">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Rankings
      </h2>
      
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