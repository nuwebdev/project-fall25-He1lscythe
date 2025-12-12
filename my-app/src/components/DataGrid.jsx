import { useEffect, useState } from "react";
import ApiService from "../services/api";

const DataGrid = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [dg, setDataGrid] = useState([]);
  const toPercent = (num) => (num * 100).toFixed(2) + '%';

  useEffect(() => {
    const fetchData = async () => {
      const result = await ApiService.getDataGrid(userId);
      setDataGrid([
        { label: "Total games", value: result.total_games },
        { label: "Highest score", value: result.highest_score.toLocaleString() },
        { label: "Lowest score", value: result.lowest_score.toLocaleString() },
        { label: "Win rate", value: toPercent(result.win_rate) },
        { label: "Lose rate", value: toPercent(result.lose_rate) },
        { label: "Tsumo rate", value: toPercent(result.tsumo_rate) },
        
        { label: "Draw tenpai rate", value: toPercent(result.draw_tenpai_rate) },
        { label: "Exhaustive draw rate", value: toPercent(result.exhaustive_draw_rate) },
        { label: "Fuulu rate", value: toPercent(result.fuulu_rate) },
        { label: "Reach rate", value: toPercent(result.reach_rate) },
        { label: "Average rank", value: result.average_rank.toFixed(2) },
        { label: "Dama Rate", value: toPercent(result.dama_rate) },

        { label: "Average win score", value: result.average_win_score.toFixed(0).toLocaleString() },
        { label: "Average lose score", value: result.average_lose_score.toFixed(0).toLocaleString() },
        { label: "Busting rate", value: toPercent(result.busting_rate) }
      ]);
      setLoading(false);
    }
    fetchData();
  }, [userId]);
  
  return (
    <div className="w-full mx-auto py-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        Statistics
      </h2>
      
      {/* 3x5 */}
      <div className="grid grid-cols-3 gap-4">
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (dg.map((item, index) => (
          <div 
            key={index}
            className="flex justify-between items-center px-2"
          >
            <span className="text-md text-gray-500 mb-1">{item.label || "-"}: </span>
            <span className="text-lg font-bold text-gray-800">{item.value || "-"}</span>
          </div>
          )
        ))}
      </div>
    </div>
  );
};

export default DataGrid;