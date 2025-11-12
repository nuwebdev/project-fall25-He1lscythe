import React from 'react';
import rec from './Gamedata';

const MatchHistoryComp = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Match History
      </h2>
      
      <div className="space-y-4">
        {rec.map((match, index) => {
          const players = match.record;
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-6">
                  <span className="font-bold text-gray-700">
                    Match {rec.length - index}:
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className={players[0].name === 'YuuNecro' ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                      {players[0].name}:
                    </span>
                    <span className="font-mono font-medium text-gray-900">
                      {players[0].score.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={players[1].name === 'YuuNecro' ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                      {players[1].name}:
                    </span>
                    <span className="font-mono font-medium text-gray-900">
                      {players[1].score.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <span className="text-sm text-gray-500">
                  {match.date}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="font-bold text-gray-700 invisible">
                  Match {rec.length - index}:
                </span>
                
                <div className="flex items-center gap-2">
                  <span className={players[2].name === 'YuuNecro' ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                    {players[2].name}:
                  </span>
                  <span className="font-mono font-medium text-gray-900">
                    {players[2].score.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={players[3].name === 'YuuNecro' ? 'text-blue-600 font-semibold' : 'text-gray-700'}>
                    {players[3].name}:
                  </span>
                  <span className="font-mono font-medium text-gray-900">
                    {players[3].score.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchHistoryComp;