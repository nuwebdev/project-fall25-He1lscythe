import { useEffect, useState, useMemo, useCallback, } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../contexts/AuthContext.jsx';
import ApiService from '../services/api.js';

const Toast = ({ message }) => {
  return (
    <div className="inline-block bg-blue-600/20 border border-red-400/50 text-white p-3 mt-4 rounded-lg text-lg">
      {message}
    </div>
  );
}

const DateTimeInput = ({ label, value, onChange }) => {
  return (
    <div className="flex flex-col mx-auto mb-4 mr-10">
      {label && <label className="font-semibold mb-3">{label}</label>}
        <DatePicker
          selected={value}
          onChange={onChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={10}
          dateFormat="yyyy/MM/dd HH:mm"
          className="border-2 border-gray-600 rounded py-1 text-center"
        />
    </div>
  );
};

const baseScoreCalculate = ({ fan, fu, roundup = true }) => {
  if (fan >= 13) return 8000;
  if (fan >= 11) return 6000;
  if (fan >= 8) return 4000;
  if (fan >= 6) return 3000;
  if (fan === 5 
    || (fan === 4 && fu === 30 && roundup)
    || (fan === 3 && fu === 60 && roundup)
  ) return 2000;
  return Math.min(2000, Math.pow(2, fan + 2) * fu);
};

const saveGameDataToFile = (gameData) => {
  const json = JSON.stringify(gameData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date(gameData.game_date)
    .toISOString()
    .slice(0, 16)
    .replace('T', '_')
    .replace(':', '-');
  a.download = `gamerecord_${dateStr}.json`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const ImportButton = ({ onImport }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImport(data);
      } catch (error) {
        console.error('Invalid JSON file:', error);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    
    e.target.value = '';
  };

  return (
    <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white px-4 py-2">
      Import
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
};

// <OneKyoku />
const OneKyoku = ({
  index = 1,
  id,
  renChan,
  ryukyoku,
  kyokuIdx,
  kyokuHonba,
  kiriage,
  onDelete,
  onToggleRenChan,
  onToggleRyukyoku,
  onToggleReachCount,
  kyotaku,
  previousScores = [25000, 25000, 25000, 25000],
  onScoreChange,
  onPlayerStateChange
}) => {
  const [playersReach, setReach] = useState([false, false, false, false]);
  const [playersFuulu, setFuulu] = useState([false, false, false, false]);
  const [playersTenpai, setTenpai] = useState([false, false, false, false]);
  const [playersWin, setWin] = useState([false, false, false, false]);
  const [playersLose, setLose] = useState([false, false, false, false]);
  const [playersTsumo, setTsumo] = useState([false, false, false, false]);
  const [playersFan, setFan] = useState([1, 1, 1, 1]);
  const [playersFu, setFu] = useState([30, 30, 30, 30]);

  const scoreChanges = useMemo(() => {
    const sc = [0, 0, 0, 0];
    const dealerIdx = kyokuIdx % 4;

    // 1. Reach penalty
    playersReach.forEach((reach, i) => {
      if (reach) sc[i] -= 1000;
    });

    // if ryukyoku return reach + ryukyoku
    if (ryukyoku) {
      const tenpaiCount = playersTenpai.filter(Boolean).length;
      if (tenpaiCount === 1) {
        playersTenpai.forEach((t, i) => {
          sc[i] += t ? 3000 : -1000;
        });
      } else if (tenpaiCount === 2) {
        playersTenpai.forEach((t, i) => {
          sc[i] += t ? 1500 : -1500;
        });
      } else if (tenpaiCount === 3) {
        playersTenpai.forEach((t, i) => {
          sc[i] += t ? 1000 : -3000;
        });
      }

      return sc;
    }

    // non-ryukyoku: win/lose
    const winIndices = playersWin.map((w, i) => (w ? i : -1)).filter(i => i !== -1);
    const loseIndex = playersLose.findIndex(Boolean);

    // someone win, 1/more
    if (winIndices.length > 0) {
      winIndices.forEach(winIdx => {
        const baseScore = baseScoreCalculate({
          fan: playersFan[winIdx],
          fu: playersFu[winIdx],
          roundup: kiriage
        });
        const isDealer = winIdx === dealerIdx;
        const isTsumo = playersTsumo[winIdx];

        if (isTsumo) {
          if (isDealer) {
            // dealer tsumo, non-dealer 2 * base
            const payment = Math.ceil((baseScore * 2) / 100) * 100;
            for (let i = 0; i < 4; i++) {
              if (i !== winIdx) {
                sc[i] -= payment;
                sc[winIdx] += payment;
              }
            }
          } else {
            // non-dealer tsumo, dealer 2 * base, other 1 * base
            const dealerPayment = Math.ceil((baseScore * 2) / 100) * 100;
            const otherPayment = Math.ceil(baseScore / 100) * 100;

            sc[dealerIdx] -= dealerPayment;
            sc[winIdx] += dealerPayment;

            for (let i = 0; i < 4; i++) {
              if (i !== winIdx && i !== dealerIdx) {
                sc[i] -= otherPayment;
                sc[winIdx] += otherPayment;
              }
            }
          }

          // Honba
          for (let i = 0; i < 4; i++) {
            if (i !== winIdx) {
              sc[i] -= kyokuHonba * 100;
              sc[winIdx] += kyokuHonba * 100;
            }
          }
        } else if (loseIndex !== -1) {
          const payment = Math.ceil((baseScore * (isDealer ? 6 : 4)) / 100) * 100;
          sc[loseIndex] -= payment;
          sc[winIdx] += payment;

          // honba
          sc[loseIndex] -= kyokuHonba * 300;
          sc[winIdx] += kyokuHonba * 300;
        }
      });

      // reach bonus & kyotaku
      if (winIndices.length > 0) {
        // if someone lose
        const reachBonus = (playersReach.filter(Boolean).length + (kyotaku || 0)) * 1000;
        if (loseIndex !== -1) {
          let closestWinner = winIndices[0];
          if (winIndices.length > 1) {
            const distances = winIndices.map(winIdx => ({ idx: winIdx, dist: (winIdx - loseIndex + 4) % 4 }));
            distances.sort((a, b) => a.dist - b.dist);
            closestWinner = distances[0].idx;
          }
          sc[closestWinner] += reachBonus;
        } else {
          // if tsumo(no one lose, and only one wins)
          sc[winIndices[0]] += reachBonus;
        }
      }
    }

    return sc;
  }, [
    playersReach,   playersTenpai,   playersWin,   playersLose,
    playersTsumo,   playersFan,      playersFu,
    kyokuIdx,       kyokuHonba,      ryukyoku,     kyotaku,
    kiriage
  ]);

  const currentScores = useMemo(() => previousScores.map((p, i) => p + (scoreChanges[i] || 0)), [previousScores, scoreChanges]);

  useEffect(() => {
    onScoreChange(id, scoreChanges);
  }, [id, scoreChanges, onScoreChange]);

  const handleLoseClick = (clickedIndex, checked) => {
    setLose(prev => {
      const newLose = prev.map((l, i) => (i === clickedIndex ? checked : l));

      if (checked) {
        // if lose, cancel win, cancel all tsumo
        setWin(prevWin => prevWin.map((w, i) => (i === clickedIndex ? false : w)));
        setTsumo([false, false, false, false]);
      }

      return newLose;
    });
  };

  useEffect(() => {
    onPlayerStateChange(id, {
      playersReach,
      playersFuulu,
      playersTenpai,
      playersWin,
      playersLose,
      playersTsumo,
      playersFan,
      playersFu
    });
  }, [
    id, 
    playersReach, playersFuulu, playersTenpai, 
    playersWin, playersLose, playersTsumo, 
    playersFan, playersFu, 
    onPlayerStateChange
  ]);

  const handleWinClick = (clickedIndex, checked) => {
    setWin(prev => {
      const newWin = [...prev];
      // atmost 3 players win
      if (checked) {
        const winCount = prev.filter(Boolean).length;
        if (winCount >= 3) { return prev; }
      }

      newWin[clickedIndex] = checked;      
      if (checked) {
        // if win, cancel lose
        setLose(prevLose => prevLose.map((l, i) => (i === clickedIndex ? false : l)));

        // if other win + tsumo, cancel tsumo
        setTsumo(prev => prev.map((t, i) => (i === clickedIndex ? t : false)));
      } else {
        // if cancel win, cancel tsumo. reset fan, fu
        setTsumo(prev => prev.map((t, i) => (i === clickedIndex ? false : t)));
        setFu(prevFu => prevFu.map((f, i) => (i === clickedIndex ? 30 : f)));
        setFan(prevFan => prevFan.map((f, i) => (i === clickedIndex ? 1 : f)));
      }

      return newWin;
    });
  };

  const handleTsumoClick = (clickedIndex, checked) => {
    setTsumo(prev => {
      const newT = prev.map((t, i) => (i === clickedIndex ? checked : false));

      if (checked) {
        // if tsumo, cancel all lose, cancel others win
        setLose([false, false, false, false]);
        setWin(prevWin => prevWin.map((w, i) => (i === clickedIndex ? prevWin[i] : false)));
      }

      return newT;
    });
  };

  const handleReachChange = (clickedIndex, checked) => {
    setReach(prev => prev.map((r, i) => (i === clickedIndex ? checked : r)));
    if (checked) {
      setFuulu(prev => prev.map((f, i) => (i === clickedIndex ? false : f)));
      setTenpai(prev => prev.map((t, i) => (i === clickedIndex ? true : t)));
    }
  };

  useEffect(() => {
    const reachCount = playersReach.filter(Boolean).length;
    onToggleReachCount(id, reachCount);
  }, [playersReach]);

  const handleFuuluChange = (clickedIndex, checked) => {
    setFuulu(prev => prev.map((f, i) => (i === clickedIndex ? checked : f)));
    if (checked) {
      setReach(prev => prev.map((r, i) => (i === clickedIndex ? false : r)));
    }
  };

  const handleRyukyokuChange = (checked) => {
    onToggleRyukyoku(id, checked);
    if (checked) {
      setWin([false, false, false, false]);
      setLose([false, false, false, false]);
      setTsumo([false, false, false, false]);
      setTenpai(playersReach);
    } else {
      setTenpai([false, false, false, false]);
    }
  };

  const handleFanChange = (playerIdx, value) => {
    setFan(prev => prev.map((f, i) => (i === playerIdx ? Number(value) : f)));
  };

  const handleFuChange = (playerIdx, value) => {
    setFu(prev => prev.map((f, i) => (i === playerIdx ? Number(value) : f)));
  };

  const kyokuName = ["東1", "東2", "東3", "東4", "南1", "南2", "南3", "南4", "西1", "西2", "西3", "西4"];
  return (
    <div key={id} id={id} className="mx-auto flex justify-center py-1.5 odd:bg-stone-200">
      <div className="w-1/5 flex flex-wrap">
        <div className="px-1.5 py-2.5">
          {index}. {kyokuName[kyokuIdx]}局 {kyokuHonba}本场 供託{kyotaku}
        </div>

        <label className="flex items-center gap-1 mx-1.5">
          <input type="checkbox" checked={renChan} onChange={(e) => onToggleRenChan(id, e.target.checked)} />
          <span>連荘</span>
        </label>

        <label className="flex items-center gap-1 mx-1.5">
          <input type="checkbox" checked={ryukyoku} onChange={(e) => handleRyukyokuChange(e.target.checked)} />
          <span>流局</span>
        </label>

        <button className="text-xs font-semibold my-1 ml-3 p-1" onClick={() => onDelete(id)}>
          Delete
        </button>
      </div>

      {Array.from({ length: 4 }, (_, i) => (
        <div key={`${id}-status-${i}`} className="w-1/5 flex px-2">
          <div className="w-1/3 flex flex-col items-start mr-1">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={playersReach[i]} onChange={(e) => handleReachChange(i, e.target.checked)} />
              <span>Reach</span>
            </label>

            {ryukyoku ? (
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={playersTenpai[i]} 
                onChange={() => setTenpai(prev => prev.map((v, idx) => (idx === i ? !v : v)))} />
                <span>Tenpai</span>
                {i === kyokuIdx % 4 && <span className="ml-1 text-md text-red-600">親</span>}
              </label>
            ) : (
              <>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={playersWin[i]} 
                    onChange={(e) => handleWinClick(i, e.target.checked)} />
                  <span>Win</span>
                  {i === kyokuIdx % 4 && <span className="ml-1 text-md text-red-600">親</span>}
                </label>

                {playersWin[i] ? (
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={playersTsumo[i]} onChange={(e) => handleTsumoClick(i, e.target.checked)} />
                    <span>Tsumo</span>
                  </label>
                ) : (
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={playersLose[i]} onChange={(e) => handleLoseClick(i, e.target.checked)} />
                    <span>Lose</span>
                  </label>
                )}
              </>
            )}

            <label className="flex items-center gap-1">
              <input type="checkbox" checked={playersFuulu[i]} 
                onChange={(e) => handleFuuluChange(i, e.target.checked)} />
              <span>Fuulu</span>
            </label>
          </div>

          <div className="w-1/3 flex flex-col justify-between">
            <div className={`flex flex-col items-center gap-1 ${playersWin[i] ? 'visible' : 'invisible'}`}>
              <select value={playersFan[i]} onChange={(e) => handleFanChange(i, e.target.value)} className="border rounded text-sm">
                {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(f => (<option key={`fan-${f}`} value={f}>{f}番</option>))}
              </select>
              <select value={playersFu[i]} onChange={(e) => handleFuChange(i, e.target.value)} className="border rounded text-sm">
                {[20,25,30,40,50,60,70,80,90,100,110].map(f => (<option key={`fu-${f}`} value={f}>{f}符</option>))}
              </select>
            </div>

            <div className={`my-1.5 font-semibold ${scoreChanges[i] < 0 ? 'text-red-500' : ''}`}>
              {scoreChanges[i] > 0 ? `+${scoreChanges[i]}` : scoreChanges[i] === 0 ? '±0' : scoreChanges[i]}
            </div>
          </div>

          <div className="w-1/3 text-sm font-semibold flex flex-col justify-center">
            {currentScores[i]}
          </div>
        </div>
      ))}
    </div>
  );
};


const WholeGame = ({ playersName, rules, gameDateTime }) => {
  const navigate = useNavigate();
  const [kyokuList, setKyokuList] = useState([]);
  const [scoreChangesMap, setScoreChangesMap] = useState({});
  const [playerStatesMap, setPlayerStatesMap] = useState({});
  const [gameData, setGameData] = useState({});
  const [jsFileImported, setImported] = useState(false);
  const initialScores = rules.id === 2
    ? [30000, 30000, 30000, 30000]
    : [25000, 25000, 25000, 25000];
  // console.log(kyokuList); 

  const { user } = useAuth();
  const [errors, setErrors] = useState({});
  const [succeed, setSucceed] = useState({});
  const [loading, setLoading] = useState(false);
  

  // recalculate honba kyoku etc
  const recalKyokuList = (arr) => {
    if (arr.length === 0) return [];

    const idxs = arr.reduce((acc, item, index) => {
      if (index === 0) return [[0, 0, 0]];
      const { 
        renChan: prevRenChan, 
        ryukyoku: prevRyukyoku,
        reachCount: prevReachCount
      } = arr[index - 1];
      const [prevKyokuIdx, prevKyokuHonba, prevKyotaku] = acc[index - 1];
      const newKyokuIdx = prevRenChan ? prevKyokuIdx : prevKyokuIdx + 1;
      const newKyokuHonba = (prevRenChan || prevRyukyoku) ? prevKyokuHonba + 1 : 0;
      const newKyotaku = prevRyukyoku ? prevKyotaku + prevReachCount  : 0;

      return [...acc, [newKyokuIdx, newKyokuHonba, newKyotaku]];
    }, [[]]);

    return arr.map((item, index) => ({
      ...item,
      kyokuIdx: idxs[index][0],
      kyokuHonba: idxs[index][1],
      kyotaku: idxs[index][2],
    }));
  };

  // triggers on add or delete
  useEffect(() => {
    setKyokuList(prev => recalKyokuList(prev))
  }, [kyokuList.length]);

  const addKyoku = () => {
    const newKyoku = {
      id: Date.now(),
      kyokuIdx: 0,
      kyokuHonba: 0,
      kyotaku: 0,
      reachCount: 0,
      renChan: false,
      ryukyoku: false,
      kiriage: rules.kiriage
    };
    setKyokuList(prev => [...prev, newKyoku]);
  };

  const deleteKyoku = (id) => {
    setKyokuList(prev => prev.filter(item => item.id !== id));
    setScoreChangesMap(prev => {
      const newMap = {...prev};
      delete newMap[id];
      return newMap;
    });
  };

  const toggleRenChan = (id, checked) => {
    setKyokuList(prev => {
      const newArr = prev.map(item =>
        item.id === id ? { ...item, renChan: checked } : item
      );
      return recalKyokuList(newArr);
    });
  };

  const toggleRyukyoku = (id, checked) => {
    setKyokuList(prev => {
      const newArr = prev.map(item =>
        item.id === id ? { ...item, ryukyoku: checked } : item
      );
      return recalKyokuList(newArr);
    });
  };

  const toggleReachCount = (id, newReachCount) => {
    setKyokuList(prev => {
      const newArr = prev.map(item =>
        item.id === id ? { ...item, reachCount: newReachCount } : item
      );
      return recalKyokuList(newArr);
    });
  }

  const handleScoreChange = useCallback((kyokuId, changes) => {
    setScoreChangesMap(prev => ({
      ...prev,
      [kyokuId]: changes
    }));
  }, []);

  const getCumulativeScores = (upToIndex) => {
    let scores = [...initialScores];
    for (let i = 0; i <= upToIndex; i++) {
      const kyoku = kyokuList[i];
      if (kyoku && scoreChangesMap[kyoku.id]) {
        const changes = scoreChangesMap[kyoku.id];
        scores = scores.map((s, idx) => s + (changes[idx] || 0));
      }
    }
    return scores;
  };

  const getFinalScoresAndRanking = () => {
    if (kyokuList.length === 0) return { 
      scores: initialScores, 
      rankings: [1, 1, 1, 1],
      points: [0, 0, 0, 0]
    };
    const scores = getCumulativeScores(kyokuList.length - 1);
    if (kyokuList[kyokuList.length - 1].ryukyoku) {
      let maxIdx = [];
      let maxs = undefined;
      for (let i = 0; i < scores.length; i++) {
        if (maxs === undefined || scores[i] > maxs) {
          maxs = scores[i];
          maxIdx = [i];
        } else if (scores[i] === maxs) {
          maxIdx.push(i);
        }
      }
      
      let k = ((kyokuList[kyokuList.length - 1].kyotaku 
              + kyokuList[kyokuList.length - 1].reachCount)) * 1000;
      let n = maxIdx.length;
      for (let i = 0; i < maxIdx.length; i++) {
        let x = Math.ceil(k / n / 100) * 100;
        scores[maxIdx[i]] += x;
        k -= x;
        n -= 1;
      }
    }
    const rankings = scores.map(score => scores.filter(s => s > score).length + 1);

    const rankingPoints = [
      rules.point_first, rules.point_second, 
      rules.point_third, rules.point_fourth
    ];

    const points = scores.map((score, i) => {
      const ranking = rankings[i];
      const sameRankCount = rankings.filter(r => r === ranking).length;
      
      let avgRankingPoint = 0;
      for (let j = 0; j < sameRankCount; j++) {
        avgRankingPoint += rankingPoints[ranking - 1 + j];
      }
      avgRankingPoint /= sameRankCount;
      
      let point = (score - rules.ending_score) / 1000 + avgRankingPoint;
      
      if (ranking === 1) {
        const firstPlaceCount = rankings.filter(r => r === 1).length;
        point += (rules.ending_score - rules.starting_score) * 4 / 1000 / firstPlaceCount;
      }
      
      return point;
    });
    // return scores;
    return {scores, rankings, points};
  };

  const {
    scores: finalScores, 
    rankings: finalRankings, 
    points: finalPoints
  } = getFinalScoresAndRanking();
  // console.log(finalScores);
  // console.log(finalRankings);

  const handlePlayerStateChange = useCallback((kyokuId, states) => {
    setPlayerStatesMap(prev => ({
      ...prev,
      [kyokuId]: states
    }));
  }, []);
  
  const handleSubmitWholeGame = async (submit = true) => {
    if (jsFileImported === false && Object.keys(gameData).length === 0) {
      if (initialScores.reduce((a, b) => a + b, 0) 
        !== finalScores.reduce((a, b) => a + b, 0)) {
          return setErrors({ submiterror: 'Check if the form is completed.' });
      } 
      
      if (playersName.filter(name => name === user?.username).length !== 1) {
        return setErrors({ submiterror: 'You should enter your name to one and only one of the seat.' });
      }
    }

    setErrors({});
    setLoading(true);

    try {
      const roundRecords = kyokuList.map((kyoku, index) => {
        const states = playerStatesMap[kyoku.id] || {};
        const prevScores = index === 0 ? initialScores : getCumulativeScores(index - 1);
        const changes = scoreChangesMap[kyoku.id] || [0, 0, 0, 0];
        const currScores = index === kyokuList.length - 1 
          ? finalScores 
          : [0, 1, 2, 3].map(seat => (prevScores[seat] + changes[seat]));

        return {
          idx: index,
          wind: Math.floor(kyoku.kyokuIdx / 4),
          dealer: kyoku.kyokuIdx % 4,
          honba: kyoku.kyokuHonba,
          kyotaku: kyoku.kyotaku,
          renchan: kyoku.renChan,
          ryukyoku: kyoku.ryukyoku,
          players: [0, 1, 2, 3].map(seat => ({
            seat,
            win: states.playersWin?.[seat] || false,
            tsumo: states.playersTsumo?.[seat] || false,
            lose: states.playersLose?.[seat] || false,
            fuulu: states.playersFuulu?.[seat] || false,
            reach: states.playersReach?.[seat] || false,
            tenpai: states.playersTenpai?.[seat] || false,
            fan: states.playersFan?.[seat] || 1,
            fu: states.playersFu?.[seat] || 30,
            startingscore: prevScores[seat],
            deltascore: changes[seat] || 0,
            endingscore: currScores[seat] || 0
          }))
        };
      });
      
      // console.log(roundRecords);
      // console.log(kyokuList);
      if (jsFileImported === false && Object.keys(gameData).length === 0) {
        setGameData({
          is_detailed: true,
          game_type: rules.id,
          game_date: gameDateTime.toISOString(),
          session_players: [0, 1, 2, 3].map((seat, idx) => ({
            seat,
            username: playersName[seat] === "" ? `Player${idx + 1}` : playersName[seat],
            final_ranking: finalRankings[seat],
            final_score: finalScores[seat],
            final_point: finalPoints[seat]
          })),
          round_records: roundRecords
        });
      }

      if (submit) {
        console.log('Submitting:', gameData);
        const result = await ApiService.uploadGameSession(gameData);
        console.log('API result:', result);
        if (result.success) {
          setSucceed({submitsucceed: result.message});
          console.log('Setting succeed state');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setErrors({server: result.error || 'Upload failed.'});
        }
      } else {
        saveGameDataToFile(gameData);
      }
    } catch (error) {
      console.error(error);
      setErrors({ submiterror: error.message || 'Submit failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (data) => {
    // console.log('Imported data:', data);
    setGameData(data);
    setImported(true);
  };
  // console.log(gameData);
  // console.log(jsFileImported);

  return (
    <div>
      <div className='flex divide-x divide-black border border-black mt-10 ml-8 mr-8'>
        <div className="w-1/5 flex items-center justify-center p-4 space-x-6">
          <ImportButton onImport={handleImport} />
          <div>局</div>
        </div>
        {playersName.map((pName, idx) => (
          <div key={`player-${idx}`} className="w-1/5 flex flex-col items-stretch">
            <div className="h-2/3 flex justify-center items-center w-full border-b border-black py-2.5">
              {pName || `Player${idx + 1}`}
            </div>
            <div className="h-1/3 flex items-center w-full h-full">
              <div className="text-sm px-2 flex-1 text-center">status</div>
              <div className="text-sm px-2 flex-1 text-center">delta score</div>
              <div className="text-sm px-2 flex-1 text-center">current score</div>
            </div>
          </div>
        ))}
      </div>
      <div className="max-h-[50vh] overflow-y-auto ml-8 mr-3.5 [scrollbar-gutter:stable]">
      {kyokuList.map((item, index) => {
        const prevScores = index === 0 ? initialScores : getCumulativeScores(index - 1);
        return (
          <OneKyoku 
          key={item.id} 
          index={index + 1}
          id={item.id} 
          renChan={item.renChan}
          ryukyoku={item.ryukyoku}
          kyokuIdx={item.kyokuIdx}
          kyokuHonba={item.kyokuHonba}
          kiriage={rules.kiriage}
          onDelete={deleteKyoku}
          onToggleRenChan={toggleRenChan}
          onToggleRyukyoku={toggleRyukyoku}
          onToggleReachCount={toggleReachCount}
          kyotaku={item.kyotaku}
          previousScores={prevScores}
          onScoreChange={handleScoreChange}
          onPlayerStateChange={handlePlayerStateChange}
          />
        );
      })}
      </div>
      <button className="block mx-auto m-4" onClick={addKyoku} >Add</button>
      

      {/* final score */}
      {kyokuList.length > 0 && (
        <>
          <div className="flex divide-x divide-black border border-black mt-10 ml-8 mr-8 bg-blue-50">
            <div className="w-1/5 flex items-center justify-center p-4 font-bold">最終得点</div>
            {playersName.map((pName, idx) => {
              return (
                <div key={`final-${idx}`} className="w-1/5 flex flex-col items-center justify-center p-4 gap-y-2">
                  <div className="text-lg font-bold flex gap-x-8">
                    <span>{finalScores[idx]}</span>
                  </div>
                  <div className="text-lg font-bold flex gap-x-16">
                    <span>{finalRankings[idx]} 位</span>
                    <span className={`${finalPoints[idx] < 0 ? 'text-red-500' : ''}`}>
                      {finalPoints[idx].toFixed(1)} Pts</span>
                  </div>
                  
                </div>
              );
            })}
          </div>

        </>
      )}
      {(kyokuList.length > 0 || jsFileImported === true) && (
        <>
          <div className={`${(errors.submiterror ? 'visible' : 'invisible')} inline-block bg-red-500/20 border border-red-400/50 text-white p-1 my-4 rounded-lg text-md`}>
            {errors.submiterror}
          </div>
          <div className="space-x-8">
            <button className="" onClick={() => handleSubmitWholeGame(false)} >Save</button>
            <button className="" onClick={() => handleSubmitWholeGame(true)} >Submit</button>
          </div>
          {succeed.submitsucceed && <Toast message={succeed.submitsucceed} />}
        </>
      )}
      
      
    </div>
  );
};


const UploadPage = () => {
  const winds = ["東", "南", "西", "北"];
  const [playersName, setPlayersName] = useState(["", "", "", ""]);
  const [rules, setRules] = useState(1);
  const [ruleList, setRuleList] = useState([]);
  const [ruleDetail, setRuleDetail] = useState({});
  const [gameDateTime, setGameDateTime] = useState(new Date());
  // console.log(startingScore);

  useEffect(() => {
    async function fetchRulesList() {
      const result = await ApiService.getGameTypeList();
      setRuleList(result);
    }
    fetchRulesList();
  }, []);
  // console.log(ruleList);
  // console.log(rules);
  // console.log(ruleDetail);

  useEffect(() => {
    async function fetchRuleData() {
      const result = await ApiService.getGameTypeDetail(rules);
      setRuleDetail(result);
    }
    fetchRuleData();
  }, [rules]); 

  const handlePlayerChange = (index, e) => {
    setPlayersName(prev => prev.map((v, i) => (i === index ? e.target.value : v)));
  }
  // console.log(playersName);

  return (
    <div className="w-full max-w-[1800px] mx-auto min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 pt-4 pb-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">pending</h1>
      </div>
      
      <div className="flex flex-wrap">
        {/* Date & time */}
        <DateTimeInput
          label="Date and Time" 
          value={gameDateTime} 
          onChange={setGameDateTime}
        />

        {/* Detailed game settings */}
        <div className="mx-auto flex flex-wrap justify-center">
          {/* Starting score */}
          <div className="flex flex-col mx-3">
            <div className="mb-2">
              Rule Selection
            </div>
            <select
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="border border-gray-400 rounded-lg px-3 py-2"
            >
              {ruleList?.length > 0 
              ? ruleList.map((item) => (
                <option key={`rules-${item.id}`} value={item.id}>{item.type_name}</option>
              )) 
              : <option value={1} className="invisible">Mリーグルール</option>}
            </select>
          </div>
          <div className="h-auto my-auto">
            {(ruleDetail?.description || <span className="h-auto">25000持ち30000返し 10-30</span>)}
          </div>
        {/*  */}
        </div>
      </div>

      {/* Players name */}
      <div className="w-full max-w-4xl 2xl:max-w-none mx-auto flex flex-wrap justify-center">
        {winds.map((item, index) => (
          <div key={winds[index]} className="flex flex-col mx-12">
            <div className="font-semibold my-2">
              {item} 家
            </div>
            <input type="text" key={`player-${index}`} id={`player-${index}`} 
              onChange={(e) => {handlePlayerChange(index, e)}} 
              className="border-2 border-gray-600 rounded py-1 text-center" />
          </div>
        ))}
      </div>

      {/* KyokuList */}
      <WholeGame playersName={playersName} rules={ruleDetail} gameDateTime={gameDateTime} />
    </div>
  );
};

export default UploadPage;