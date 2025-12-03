const DataGrid = ({ rrData, gsData }) => {
  const gnum = gsData.length;
  const rnum = rrData.length;
  const stats = {
    win: 0,
    lose: 0,
    tsumo: 0,
    fuulu: 0,
    tenpai: 0,
    reach: 0,
    ryukyoku: 0,
    winScore: 0,
    loseScore: 0,
    highestScore: -Infinity,
    lowestScore: Infinity,
    ranking: 0
  };

  const toPercent = (num) => (num * 100).toFixed(2) + '%';

  rrData.forEach(item => {
    if (item.win) { stats.win++; stats.winScore += item.deltascore; }
    if (item.lose) { stats.lose++; stats.loseScore -= item.deltascore; }
    if (item.fuulu) stats.fuulu++;
    if (item.reach) stats.reach++;
    if (item.tsumo) stats.tsumo++;
    if (item.tenpai) stats.tenpai++;
    if (item.fk_round_record.ryukyoku) stats.ryukyoku++;
  });
  // console.log(stats);

  gsData.forEach(item => {
    const p = item.session_players.find(p => p.fk_user_id.username);
    stats.ranking += p.final_ranking;
    if (p.final_score > stats.highestScore) stats.highestScore = p.final_score;
    if (p.final_score < stats.lowestScore) stats.lowestScore = p.final_score;
  });
  // console.log(gsData);

  const gridData = [
    { label: "Total games", value: gnum },
    { label: "Highest score", value: stats.highestScore.toLocaleString() },
    { label: "Lowest score", value: stats.lowestScore.toLocaleString() },
    { label: "Win rate", value: toPercent(stats.win / rnum) },
    { label: "Lose rate", value: toPercent(stats.lose / rnum) },
    { label: "Tsumo rate", value: toPercent( stats.tsumo / stats.win ) },
    
    { label: "Draw tenpai rate", value: toPercent(stats.tenpai / stats.ryukyoku) },
    { label: "Exhaustive draw rate", value: toPercent(stats.ryukyoku / rnum) },
    { label: "Fuulu rate", value: toPercent(stats.fuulu / rnum) },
    { label: "Reach rate", value: toPercent(stats.reach / rnum) },
    { label: "Average win rate", value: toPercent(stats.win / rnum) },
    
    { label: "Average lose rate", value: toPercent(stats.lose / rnum) },
    { label: "Average rank", value: (stats.ranking / gnum).toFixed(2) },
    { label: "Average win score", value: (stats.winScore / stats.win).toFixed(0) },
    { label: "Average lose score", value: (stats.loseScore / stats.lose).toFixed(0) },
  ];
  
  return (
    <div className="w-full mx-auto py-2">
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