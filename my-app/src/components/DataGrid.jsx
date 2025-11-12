import React from 'react';

const DataGrid = () => {
  const gridData = [
    { label: "Total Games", value: "50" },
    { label: "Win Rate", value: "30%" },
    { label: "Best Score", value: "60,000" },
    { label: "Average Score", value: "35,420" },
    { label: "Worst Score", value: "5,000" },
    { label: "Score Range", value: "55,000" },
    
    { label: "call rate", value: "34.59%" },
    { label: "Tsumo rate", value: "36.12%" },
    { label: "Draw tenpai rate", value: "46.67" },
    { label: "Deal-in rate", value: "13.53%" },
    { label: "Top 2 Rate", value: "58%" },
    { label: "fuulu rate", value: "34.01%" },
    
    { label: "Current Streak", value: "W2" },
    { label: "Best Streak", value: "W5" },
    { label: "Avg deal-in score", value: 5640 },
    { label: "Last 10 Games", value: "6-4" },
    { label: "Riichi rate", value: "20.09%" },
    { label: "Consistency", value: "78%" },
  ];
  
  return (
    <div className="w-full mx-auto p-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Statistics
      </h2>
      
      {/* 3x6 */}
      <div className="grid grid-cols-3 gap-4">
        {gridData.map((item, index) => (
          <div 
            key={index}
            className="flex justify-between items-center px-2"
          >
            <span className="text-md text-gray-500 mb-1">{item.label}: </span>
            <span className="text-lg font-bold text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataGrid;