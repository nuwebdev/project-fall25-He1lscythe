import React from 'react';
import { Link } from 'react-router-dom';

const Entity = ({ name, x, y, color, fields }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect width="160" height={32 + fields.length * 22 + 5} rx="8" fill="white" stroke={color} strokeWidth="2" />
    <rect width="160" height="32" rx="8" fill={color} />
    <rect y="24" width="160" height="8" fill={color} />
    <text x="80" y="22" textAnchor="middle" fill="white" fontWeight="bold" fontSize="13">{name}</text>
    {fields.map((f, i) => (
      <g key={i} transform={`translate(0, ${36 + i * 22})`}>
        <text x="10" y="14" fontSize="11" fill="#374151">
          {f.key && <tspan fill={f.key === 'PK' ? '#ca8a04' : '#2563eb'} fontWeight="bold">{f.key} </tspan>}
          {f.name}
        </text>
        <text x="150" y="14" textAnchor="end" fontSize="10" fill="#9ca3af">{f.type}</text>
      </g>
    ))}
  </g>
);

const Relation = ({ x1, y1, x2, y2, label, fromMany, toMany }) => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const angleReverse = angle + 180;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="2" />
      {!fromMany && <circle cx={x1} cy={y1} r="4" fill="#94a3b8" />}
      {fromMany && (
        <g transform={`translate(${x1}, ${y1}) rotate(${angle})`}>
          <line x1="-6" y1="-6" x2="6" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="-6" y1="6" x2="6" y2="0" stroke="#94a3b8" strokeWidth="2" />
        </g>
      )}
      {toMany && (
        <g transform={`translate(${x2}, ${y2}) rotate(${angleReverse})`}>
          <line x1="6" y1="-6" x2="-6" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <line x1="6" y1="6" x2="-6" y2="0" stroke="#94a3b8" strokeWidth="2" />
        </g>
      )}
      <rect x={midX - 24} y={midY - 10} width="48" height="20" rx="4" fill="white" stroke="#cbd5e1" />
      <text x={midX} y={midY + 4} textAnchor="middle" fontSize="10" fill="#64748b">{label}</text>
    </g>
  );
};

export default function ERDiagram() {
  const users = [
    { name: 'id', type: 'INT', key: 'PK' },
    { name: 'username', type: 'VARCHAR', key: 'UK' },
    { name: 'email', type: 'VARCHAR', key: 'UK' },
    { name: 'password', type: 'VARCHAR' },
    { name: 'open', type: 'BOOL' },
    { name: 'role', type: 'VARCHAR' },
    { name: 'status', type: 'VARCHAR' },
  ];

  const gameTypes = [
    { name: 'id', type: 'INT', key: 'PK' },
    { name: 'type_name', type: 'VARCHAR', key: 'UK' },
    { name: 'description', type: 'VARCHAR' },
    { name: 'starting_score', type: 'INT' },
    { name: 'ending_score', type: 'INT' },
    { name: 'point_*', type: 'INT ×4' },
    { name: 'kiriage', type: 'BOOL' },
  ];

  const gameSessions = [
    { name: 'id', type: 'UUID', key: 'PK' },
    { name: 'is_detailed', type: 'BOOL' },
    { name: 'game_type', type: 'INT', key: 'FK' },
    { name: 'game_date', type: 'TIMESTAMPTZ' },
  ];

  const sessionPlayers = [
    { name: 'session_id', type: 'UUID', key: 'PK' },
    { name: 'seat', type: 'INT', key: 'PK' },
    { name: 'user_id', type: 'INT', key: 'FK' },
    { name: 'final_ranking', type: 'INT' },
    { name: 'final_score', type: 'INT' },
    { name: 'final_point', type: 'DECIMAL' },
  ];

  const roundRecords = [
    { name: 'session_id', type: 'UUID', key: 'PK' },
    { name: 'idx', type: 'INT', key: 'PK' },
    { name: 'wind', type: 'INT' },
    { name: 'dealer', type: 'INT' },
    { name: 'honba', type: 'INT' },
    { name: 'kyotaku', type: 'INT' },
    { name: 'renchan', type: 'BOOL' },
    { name: 'ryukyoku', type: 'BOOL' },
  ];

  const roundPlayers = [
    { name: 'session_id', type: 'UUID', key: 'PK' },
    { name: 'idx', type: 'INT', key: 'PK' },
    { name: 'seat', type: 'INT', key: 'PK' },
    { name: 'win/tsumo/lose', type: 'BOOL' },
    { name: 'fuulu/reach/tenpai', type: 'BOOL' },
    { name: 'start/delta/end score', type: 'INT' },
  ];

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 pt-4">
      <Link to="/login" className="text-sm text-blue-500 hover:text-blue-700 hover:underline">
        back to login
      </Link>
      <h1 className="text-xl font-bold text-center mb-1 text-slate-800">🀄 Mahjong Score Record Management</h1>
      <p className="text-center text-sm mb-4">Entity-Relationship Diagram</p>
      
      <svg viewBox="0 0 800 600" className="w-full max-w-6xl mx-auto bg-stone-300 rounded-xl shadow-lg">
        {/* Relations */}
        {/* users → session_players */}
        <Relation x1={140} y1={215} x2={140} y2={295} label="1:N" toMany />
        {/* game_types → game_sessions */}
        <Relation x1={400} y1={215} x2={400} y2={275} label="1:N" toMany />
        {/* game_sessions → round_records */}
        <Relation x1={480} y1={340} x2={575} y2={200} label="1:N" toMany />
        {/* round_records → round_player_status */}
        <Relation x1={660} y1={275} x2={660} y2={395} label="1:N" toMany />
        {/* session_players → round_player_status */}
        <Relation x1={220} y1={410} x2={575} y2={480} label="1:N" toMany />
         {/* game_sessions → session_players */}
        <Relation x1={320} y1={350} x2={225} y2={370} label="1:N" toMany />
         {/*  */}
        
        {/* Entities */}
        <Entity name="users" x={60} y={20} color="#10b981" fields={users} />
        <Entity name="game_types" x={320} y={20} color="#f59e0b" fields={gameTypes} />
        <Entity name="game_sessions" x={320} y={280} color="#3b82f6" fields={gameSessions} />
        <Entity name="session_players" x={60} y={300} color="#8b5cf6" fields={sessionPlayers} />
        <Entity name="round_records" x={580} y={60} color="#ec4899" fields={roundRecords} />
        <Entity name="round_player_status" x={580} y={400} color="#06b6d4" fields={roundPlayers} />

        {/* Legend */}
        <g transform="translate(20, 500)">
          <rect width="200" height="90" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
          <text x="20" y="20" fontSize="11" fontWeight="bold" fill="#475569">Legend</text>
          <circle cx="15" cy="40" r="4" fill="#94a3b8" />
          <text x="30" y="44" fontSize="10" fill="#64748b">─ 一 (1)</text>
          <g transform="translate(105, 40)">
            <line x1="-6" y1="-6" x2="6" y2="0" stroke="#94a3b8" strokeWidth="2" />
            <line x1="-6" y1="6" x2="6" y2="0" stroke="#94a3b8" strokeWidth="2" />
          </g>
          <text x="120" y="44" fontSize="10" fill="#64748b">─ 一 (N)</text>
          <text x="10" y="60" fontSize="9" fill="#ca8a04" fontWeight="bold">PK</text>
          <text x="30" y="60" fontSize="9" fill="#64748b">Primary Key</text>
          <text x="10" y="80" fontSize="9" fill="#2563eb" fontWeight="bold">FK</text>
          <text x="30" y="80" fontSize="9" fill="#64748b">Foreign Key</text>
          <text x="100" y="60" fontSize="9" fill="#7c3aed" fontWeight="bold">UK</text>
          <text x="120" y="60" fontSize="9" fill="#64748b">Unique</text>
        </g>
      </svg>
    </div>
  );
}