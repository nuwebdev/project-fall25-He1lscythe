import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const datasetDir = '../../dataset';
const files = fs.readdirSync(datasetDir).filter(f => f.endsWith('.json'));
console.log(`Found ${files.length} JSON files`);

const stream = fs.createWriteStream("../import.sql", { flags: "w" }); // "a" = append, "w" = write

stream.write(`-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,
    "role" TEXT NOT NULL DEFAULT 'user',
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_types" (
    "id" SERIAL NOT NULL,
    "type_name" VARCHAR(20) NOT NULL,
    "description" VARCHAR(100),
    "starting_score" INTEGER NOT NULL DEFAULT 25000,
    "ending_score" INTEGER NOT NULL,
    "point_first" INTEGER NOT NULL,
    "point_second" INTEGER NOT NULL,
    "point_third" INTEGER NOT NULL,
    "point_fourth" INTEGER NOT NULL,
    "kiriage" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "game_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "is_detailed" BOOLEAN NOT NULL DEFAULT true,
    "game_type" INTEGER NOT NULL,
    "game_date" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_players" (
    "session_id" UUID NOT NULL,
    "seat" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "final_ranking" INTEGER NOT NULL,
    "final_score" INTEGER NOT NULL,
    "final_point" DECIMAL(6,1) NOT NULL,

    CONSTRAINT "session_players_pkey" PRIMARY KEY ("session_id","seat")
);

-- CreateTable
CREATE TABLE "round_records" (
    "session_id" UUID NOT NULL,
    "idx" INTEGER NOT NULL,
    "wind" INTEGER NOT NULL,
    "dealer" INTEGER NOT NULL,
    "honba" INTEGER NOT NULL DEFAULT 0,
    "kyotaku" INTEGER NOT NULL DEFAULT 0,
    "renchan" BOOLEAN NOT NULL DEFAULT false,
    "ryukyoku" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "round_records_pkey" PRIMARY KEY ("session_id","idx")
);

-- CreateTable
CREATE TABLE "round_player_status" (
    "session_id" UUID NOT NULL,
    "idx" INTEGER NOT NULL,
    "seat" INTEGER NOT NULL,
    "win" BOOLEAN NOT NULL DEFAULT false,
    "tsumo" BOOLEAN NOT NULL DEFAULT false,
    "lose" BOOLEAN NOT NULL DEFAULT false,
    "fuulu" BOOLEAN NOT NULL DEFAULT false,
    "reach" BOOLEAN NOT NULL DEFAULT false,
    "tenpai" BOOLEAN NOT NULL DEFAULT false,
    "fan" INTEGER NOT NULL DEFAULT 0,
    "fu" INTEGER NOT NULL DEFAULT 0,
    "startingscore" INTEGER NOT NULL,
    "deltascore" INTEGER NOT NULL,
    "endingscore" INTEGER NOT NULL,

    CONSTRAINT "round_player_status_pkey" PRIMARY KEY ("session_id","idx","seat")
);

-- Add default accounts
INSERT INTO "users" (username, email, password, open, role, status)
VALUES 
  ('Admin0', 'Admin0@test.xyz', '$2b$10$YnskD/SjQAQgy0uIIb5IT.KXQ9laQec9.De48ZqcSC4mP.pDorsRe', false, 'admin', 'active'),
  ('Player1', 'player1@test.xyz', '$2b$10$YnskD/SjQAQgy0uIIb5IT.KXQ9laQec9.De48ZqcSC4mP.pDorsRe', false, 'user', 'active'),
  ('Player2', 'player2@test.xyz', '$2b$10$JEy9TVyokj5U/Plae1L9J.X8HXdBR9AswFWeTzB8fT6XqafSR3Hn.', false, 'user', 'active'),
  ('Player3', 'player3@test.xyz', '$2b$10$o.dhTD.wvQgcHn9q7QaHle4KVZx3fGohFf01pJgcf8ZOx.P.3E8j.', false, 'user', 'active'),
  ('Player4', 'player4@test.xyz', '$2b$10$.MSj/r4quOoNyzbXA.B45.beRX.Qcdr0FaJ.48G8qpp8QQ/o8Vfi2', false, 'user', 'active'),
  ('YuuNecro', 'YuuNecro@mahjong.xyz', '$2b$10$JgwD.FMK6zQ2/3Rjq7hO8u82Byv6rJ0xycYqEGxQy.5Hxw0sZA7LO', true, 'user', 'active'),
  ('Eucliwood', 'Eucliwood@mahjong.xyz', '$2b$10$JgwD.FMK6zQ2/3Rjq7hO8u82Byv6rJ0xycYqEGxQy.5Hxw0sZA7LO', true, 'user', 'active'),
  ('Hellscythe', 'Hellscythe@mahjong.xyz', '$2b$10$JgwD.FMK6zQ2/3Rjq7hO8u82Byv6rJ0xycYqEGxQy.5Hxw0sZA7LO', true, 'user', 'active'),
  ('Inui', 'Inui@mahjong.xyz', '$2b$10$JgwD.FMK6zQ2/3Rjq7hO8u82Byv6rJ0xycYqEGxQy.5Hxw0sZA7LO', true, 'user', 'active')
ON CONFLICT DO NOTHING;

-- Add default game types
INSERT INTO game_type (type_name, description, starting_score, ending_score, point_first, point_second, point_third, point_fourth, kiriage)
VALUES 
  ('Mリーグルール', '25000持ち30000返し 10-30', 25000, 30000, 30, 10, -10, -30, true),
  ('最高位戦ルール', '30000持ち30000返し 10-30', 30000, 30000, 30, 10, -10, -30, true),
  ('ジャン魂ルール', '25000持ち25000返し 5-15', 25000, 25000, 15, 5, -5, -15, false)
ON CONFLICT DO NOTHING;

-- Add game sessions
`);

let count = 0;

for (const file of files) {
  const filePath = path.join(datasetDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  console.log(`Processing: ${file}`);

  try {
    const usernames = data.session_players.map(p => p.username);
    const users = await prisma.user.findMany({
      where: { username: { in: usernames }}
    });

    const usernameToId = {};
    users.forEach(u => usernameToId[u.username] = u.id);
    
    // check if all username exists
    for (const sp of data.session_players) {
      if (!usernameToId[sp.username]) {
        throw new Error(`User not found: ${sp.username}`);
      }
    }

    // uuid for game session
    const uuid = crypto.randomUUID();

    // create game session
    stream.write('INSERT INTO game_sessions (id, is_detailed, game_type, game_date) VALUES \n');
    stream.write(`    ('${uuid}', ${data.is_detailed}, ${data.game_type}, '${new Date(data.game_date).toISOString()}');\n`);

    // create session players
    const players = [];
    stream.write('INSERT INTO session_players (session_id, seat, user_id, final_ranking, final_score, final_point) VALUES \n    '); 
    data.session_players.forEach((p, idx) => {
      players.push(`('${uuid}', ${idx}, ${usernameToId[p.username]}, ${p.final_ranking}, ${p.final_score}, ${p.final_point})`);
    });
    stream.write(players.join(',\n    ') + ';\n');
    
    if (data.is_detailed && data.round_records?.length > 0) {
      const rounds = [];
      const round_players = [];
      for (const rr of data.round_records) {
        // create round records
        rounds.push(`('${uuid}', ${rr.idx}, ${rr.wind}, ${rr.dealer}, ${rr.honba}, ${rr.kyotaku}, ${rr.renchan}, ${rr.ryukyoku})`);

        // create round players
        for (const rp of rr.players) {
          round_players.push(`('${uuid}', ${rr.idx}, ${rp.seat}, ${rp.win}, ${rp.tsumo}, ${rp.lose}, ${rp.fuulu}, ${rp.reach}, ${rp.reach}, ${rp.fan}, ${rp.fu}, ${rp.startingscore}, ${rp.deltascore}, ${rp.endingscore})`);
        }
      }
      stream.write('INSERT INTO round_records (session_id, idx, wind, dealer, honba, kyotaku, renchan, ryukyoku) VALUES \n    ');
      stream.write(rounds.join(',\n    ') + ';\n');
      stream.write('INSERT INTO round_player_status (session_id, idx, seat, win, tsumo, lose, fuulu, reach, tenpai, fan, fu, startingscore, deltascore, endingscore) VALUES \n    ');
      stream.write(round_players.join(',\n    ') + ';\n');

    }
    count++;
    // break;

  } catch (error) {
    console.error(`  ✗ Failed: ${file} - ${error.message}`);
  } 
}

console.log(`Transfered ${count} files.`);
stream.end();







