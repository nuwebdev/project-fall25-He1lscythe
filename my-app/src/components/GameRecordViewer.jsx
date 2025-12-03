import React, {useState, useEffect} from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ApiService from '../services/api';

const OneKyokuViewer = ({
  index,
  kyokuIdx,
  kyokuHonba,
  kyotaku,
  renchan,
  ryukyoku,
  players = [],
  dealerSeat
}) => {
  const kyokuName = ["東1", "東2", "東3", "東4", "南1", "南2", "南3", "南4", "西1", "西2", "西3", "西4"];

  return (
    <div className="mx-auto flex justify-center py-1.5 odd:bg-stone-200">
      <div className="w-1/5 flex flex-wrap">
        <div className="flex items-center gap-1 mx-1.5">
          {index}. {kyokuName[kyokuIdx] || `?${kyokuIdx}`}局 {kyokuHonba}本場 供託{kyotaku}
        </div>

        <label className="flex items-center gap-1 mx-1.5">
          <input type="checkbox" checked={renchan} disabled className="accent-gray-500" />
          <span>連荘</span>
        </label>

        <label className="flex items-center gap-1 mx-1.5">
          <input type="checkbox" checked={ryukyoku} disabled className="accent-gray-500" />
          <span>流局</span>
        </label>
      </div>

      {players.map((player, i) => (
        <div key={i} className="w-1/5 flex px-2">
          <div className="w-1/3 flex flex-col items-start mr-1">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={player.reach} disabled />
              <span>Reach</span>
            </label>

            {ryukyoku ? (
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={player.tenpai} disabled />
                <span>Tenpai</span>
                {player.seat === dealerSeat && <span className="ml-1 text-md text-red-600">親</span>}
              </label>
            ) : (
              <>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={player.win} disabled />
                  <span>Win</span>
                  {player.seat === dealerSeat && <span className="ml-1 text-md text-red-600">親</span>}
                </label>

                {player.win ? (
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={player.tsumo} disabled />
                    <span>Tsumo</span>
                  </label>
                ) : (
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={player.lose} disabled />
                    <span>Lose</span>
                  </label>
                )}
              </>
            )}

            <label className="flex items-center gap-1">
              <input type="checkbox" checked={player.fuulu} disabled />
              <span>Fuulu</span>
            </label>
          </div>

          <div className="w-1/3 flex flex-col justify-between">
            <div className={`flex flex-col items-center gap-1 ${player.win ? 'visible' : 'invisible'}`}>
              <div className="border rounded text-sm px-2 py-0.5">{player.fan || 1}番</div>
              <div className="border rounded text-sm px-2 py-0.5">{player.fu || 30}符</div>
            </div>

            <div className={`my-1.5 font-semibold ${player.deltascore < 0 ? 'text-red-500' : ''}`}>
              {player.deltascore > 0 ? `+${player.deltascore}` : player.deltascore === 0 ? '±0' : player.deltascore}
            </div>
          </div>

          <div className="w-1/3 text-sm font-semibold flex flex-col justify-center">
            {player.endingscore?.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};


const GameRecordViewer = () => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('zh-CN', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false
    });
  };
  console.log(gameData);

  useEffect(() => {
    if (!uuid) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const result = await ApiService.getGameSessionDetail({ uuid });
        setGameData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uuid]);

  if (!uuid) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">No UUID provided</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Failed to load game data</div>
      </div>
    );
  }

  const {
    game_date,
    fk_game_type,
    session_players = [],
    round_records = []
  } = gameData;

  const playerNames = session_players.map(p => p.fk_user_id?.username || `Player${p.seat + 1}`);
  const winds = ["東", "南", "西", "北"];

  return (
    <div className="w-full max-w-[1800px] mx-auto bg-gradient-to-br from-purple-100 to-pink-100 pt-6 pb-10">
      <div className="flex justify-between w-3/4 mx-auto">
        <button onClick={() => navigate('/matchhistory')} 
          className="self-center bg-gray-300/80"
        >
          back
        </button>
        <h1 className="text-4xl font-bold text-gray-800 my-2">対局記録</h1>
        <div className='invisible'>1</div>
      </div>

      <div className="flex flex-wrap mb-4">
        <div className="flex flex-col mx-auto mb-4 mr-10">
          <label className="font-semibold mb-3">Date and Time</label>
          <div className="border-2 border-gray-600 rounded py-1 px-3 text-center bg-white">
            {formatDate(game_date)}
          </div>
        </div>
        <div className="mx-auto flex flex-wrap justify-center">
          <div className="flex flex-col mx-3">
            <div className="mb-2">Rule</div>
            <div className="border border-gray-400 rounded-lg px-3 py-2 bg-white">
              {fk_game_type?.type_name || '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl 2xl:max-w-none mx-auto flex flex-wrap justify-center mb-4">
        {session_players.map((player, idx) => (
          <div key={idx} className="flex flex-col mx-12">
            <div className="font-semibold my-2">{winds[idx]} 家</div>
            <div className="border-2 border-gray-600 rounded py-1 px-4 text-center bg-white min-w-[120px]">
              {player.fk_user_id?.username || `Player${idx + 1}`}
            </div>
          </div>
        ))}
      </div>

      <div className="flex divide-x divide-black border border-black mt-10 ml-8 mr-8">
        <div className="w-1/5 flex items-center justify-center p-4 space-x-6">
          <div>局</div>
        </div>
        {playerNames.map((pName, idx) => (
          <div key={idx} className="w-1/5 flex flex-col items-stretch">
            <div className="h-2/3 flex justify-center items-center w-full border-b border-black py-2.5">
              {pName}
            </div>
            <div className="h-1/3 flex items-center w-full">
              <div className="text-sm px-2 flex-1 text-center">status</div>
              <div className="text-sm px-2 flex-1 text-center">delta score</div>
              <div className="text-sm px-2 flex-1 text-center">current score</div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-h-[50vh] overflow-y-auto ml-8 mr-3.5 [scrollbar-gutter:stable]">
        {round_records.map((round, idx) => {
          const sortedRoundPlayers = [...(round.players || [])].sort((a, b) => a.seat - b.seat);
          return (
            <OneKyokuViewer
              key={idx}
              index={idx + 1}
              kyokuIdx={round.wind * 4 + round.dealer}
              kyokuHonba={round.honba}
              kyotaku={round.kyotaku}
              renchan={round.renchan}
              ryukyoku={round.ryukyoku}
              players={sortedRoundPlayers}
              dealerSeat={round.dealer}
            />
          );
        })}
        {round_records.length === 0 && (
          <div className="text-center py-8 text-gray-500">詳細記録なし</div>
        )}
      </div>

      {/* 最终得点 */}
      <div className="flex divide-x divide-black border border-black mt-10 ml-8 mr-8 bg-blue-50">
        <div className="w-1/5 flex items-center justify-center p-4 font-bold">最終得点</div>
        {session_players.map((player, idx) => {
          const point = parseFloat(player.final_point) || 0;
          return (
            <div key={idx} className="w-1/5 flex flex-col items-center justify-center p-4 gap-y-2">
              <div className="text-lg font-bold flex gap-x-8">
                <span>{player.final_score?.toLocaleString()}</span>
              </div>
              <div className="text-lg font-bold flex gap-x-16">
                <span>{player.final_ranking} 位</span>
                <span className={point < 0 ? 'text-red-500' : ''}>
                  {point > 0 ? '+' : ''}{point.toFixed(1)} Pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameRecordViewer;
