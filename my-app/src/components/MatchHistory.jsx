import React from 'react';
import rec from './Gamedata';

const MatchHistory = ({ usrName = "YuuNecro" }) => {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="w-full container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 my-8">Match History</h1>
      </div>
        
      <div className="w-full">
        {rec.map((match, index) => {
        const players = match.record;
        
        return (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 odd:bg-stone-300">
            <div className="flex items-center justify-between">
              <div className="">
                <span className="font-bold text-black">
                  Match {rec.length - index}:
                </span>
              </div>
              <div className="w-full flex flex-wrap">
                {players.map((p) => (
                  <div className={`
                  w-full md:w-1/2 flex-shrink-0 text-left pl-3
                  ${p.name === usrName 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-700'}
                  `}>
                      {p.name}: [{p.score}]
                  </div>
                ))}
              </div>
                
              <span className="text-sm text-black">
                {match.date}
              </span>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default MatchHistory;