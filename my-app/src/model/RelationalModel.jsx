import React from 'react';
import { Link } from 'react-router-dom';

const Table = ({ name, tableName, columns, color }) => (
  <div className={`rounded-lg shadow-lg border-2 ${color}`}>
    <div className={`px-4 py-2 font-bold ${color.replace('border', 'bg')}`}>
      {name}
      <span className="text-xs ml-2 opacity-80">({tableName})</span>
    </div>
    <div className="bg-white">
      {columns.map((col, i) => (
        <div key={i} className={`px-3 py-1.5 text-sm flex items-center gap-2 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          {col.pk && <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 rounded font-bold">PK</span>}
          {col.fk && (
            <span className="relative group">
              <span className="text-xs bg-blue-400 text-blue-900 px-1.5 rounded font-bold cursor-help">FK</span>
              <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                → {col.fk}
              </span>
            </span>
          )}
          {col.uk && <span className="text-xs bg-purple-400 text-purple-900 px-1.5 rounded font-bold">UK</span>}
          <span className="font-medium">{col.name}</span>
          <span className="text-gray-400 text-xs ml-auto">{col.type}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function MahjongSchema() {
  const users = [
    { name: 'id', type: 'INT', pk: true },
    { name: 'username', type: 'VARCHAR(50)', uk: true },
    { name: 'email', type: 'VARCHAR(50)', uk: true },
    { name: 'password', type: 'VARCHAR(255)' },
    { name: 'open', type: 'BOOLEAN' },
    { name: 'role', type: 'VARCHAR' },
    { name: 'status', type: 'VARCHAR' },
  ];

  const gameTypes = [
    { name: 'id', type: 'INT', pk: true },
    { name: 'type_name', type: 'VARCHAR(20)', uk: true },
    { name: 'description', type: 'VARCHAR(100)' },
    { name: 'starting_score', type: 'INT' },
    { name: 'ending_score', type: 'INT' },
    { name: 'point_first', type: 'INT' },
    { name: 'point_second', type: 'INT' },
    { name: 'point_third', type: 'INT' },
    { name: 'point_fourth', type: 'INT' },
    { name: 'kiriage', type: 'BOOLEAN' },
  ];

  const gameSessions = [
    { name: 'id', type: 'UUID', pk: true },
    { name: 'is_detailed', type: 'BOOLEAN' },
    { name: 'game_type', type: 'INT', fk: 'game_types.id' },
    { name: 'game_date', type: 'TIMESTAMPTZ' },
  ];

  const sessionPlayers = [
    { name: 'session_id', type: 'UUID', pk: true, fk: 'game_sessions.id' },
    { name: 'seat', type: 'INT', pk: true },
    { name: 'user_id', type: 'INT', fk: 'users.id' },
    { name: 'final_ranking', type: 'INT' },
    { name: 'final_score', type: 'INT' },
    { name: 'final_point', type: 'DECIMAL(6,1)' },
  ];

  const roundRecords = [
    { name: 'session_id', type: 'UUID', pk: true, fk: 'game_sessions.id' },
    { name: 'idx', type: 'INT', pk: true },
    { name: 'wind', type: 'INT' },
    { name: 'dealer', type: 'INT' },
    { name: 'honba', type: 'INT' },
    { name: 'kyotaku', type: 'INT' },
    { name: 'renchan', type: 'BOOLEAN' },
    { name: 'ryukyoku', type: 'BOOLEAN' },
  ];

  const roundPlayers = [
    { name: 'session_id', type: 'UUID', pk: true, fk: 'round_records.session_id' },
    { name: 'idx', type: 'INT', pk: true, fk: 'round_records.idx' },
    { name: 'seat', type: 'INT', pk: true, fk: 'session_players.seat' },
    { name: 'win', type: 'BOOLEAN' },
    { name: 'tsumo', type: 'BOOLEAN' },
    { name: 'lose', type: 'BOOLEAN' },
    { name: 'fuulu', type: 'BOOLEAN' },
    { name: 'reach', type: 'BOOLEAN' },
    { name: 'tenpai', type: 'BOOLEAN' },
    { name: 'startingscore', type: 'INT' },
    { name: 'deltascore', type: 'INT' },
    { name: 'endingscore', type: 'INT' },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Link to="/login" className="text-sm text-blue-500 hover:text-blue-700 hover:underline">
        back to login
      </Link>
      <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">🀄 Mahjong Score Record Management App</h1>
      <p className="text-center text-sm mb-4">Relational Model</p>
      
      <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
        <Table name="User" tableName="users" columns={users} color="border-emerald-500" />
        <Table name="GameType" tableName="game_types" columns={gameTypes} color="border-amber-500" />
        <Table name="GameSession" tableName="game_sessions" columns={gameSessions} color="border-sky-500" />
        
        <Table name="SessionPlayers" tableName="session_players" columns={sessionPlayers} color="border-violet-500" />
        <Table name="RoundRecords" tableName="round_records" columns={roundRecords} color="border-rose-500" />
        <Table name="RoundPlayers" tableName="round_player_status" columns={roundPlayers} color="border-cyan-500" />
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-bold text-xs">PK</span>
          <span className="text-slate-600">Primary Key</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-400 text-blue-900 px-2 py-0.5 rounded font-bold text-xs">FK</span>
          <span className="text-slate-600">Foreign Key (hover to view reference)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-purple-400 text-purple-900 px-2 py-0.5 rounded font-bold text-xs">UK</span>
          <span className="text-slate-600">Unique Key</span>
        </div>
      </div>
    </div>
  );
}