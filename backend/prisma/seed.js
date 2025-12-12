import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function seedGameTypes() {
  await prisma.gameType.createMany({
    data: [
      {
        type_name: 'Mリーグルール',
        description: '25000持ち30000返し 10-30',
        starting_score: 25000,
        ending_score: 30000,
        point_first: 30,
        point_second: 10,
        point_third: -10,
        point_fourth: -30,
        kiriage: true
      },
      {
        type_name: '最高位戦ルール',
        description: '30000持ち30000返し 10-30',
        starting_score: 30000,
        ending_score: 30000,
        point_first: 30,
        point_second: 10,
        point_third: -10,
        point_fourth: -30,
        kiriage: true
      },
      {
        type_name: 'ジャン魂ルール',
        description: '25000持ち25000返し 5-15',
        starting_score: 25000,
        ending_score: 25000,
        point_first: 15,
        point_second: 5,
        point_third: -5,
        point_fourth: -15,
        kiriage: false
      },
    ],
    skipDuplicates: true,
  })
  console.log('Game types seeded.');
}

async function seedAccounts() {
  const hashedPassword = [];
  for (let i = 0; i < 5; i++) {
    hashedPassword[i] = await bcrypt.hash(`Test000${i}`, 10);
  }

  const defaultPassword = await bcrypt.hash('Password1', 10);

  await prisma.user.createMany({
    data: [
      {
        username: 'Admin0', 
        email: 'Admin0@test.xyz', 
        password: hashedPassword[0], 
        open: false,
        role: 'admin',
        status: 'active' 
      },
      { 
        username: 'Player1', 
        email: 'player1@test.xyz', 
        password: hashedPassword[0], 
        open: false,
        role: 'user',
        status: 'active' 
      },
      { 
        username: 'Player2', 
        email: 'player2@test.xyz', 
        password: hashedPassword[1], 
        open: false,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Player3', 
        email: 'player3@test.xyz', 
        password: hashedPassword[2], 
        open: false,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Player4', 
        email: 'player4@test.xyz', 
        password: hashedPassword[3], 
        open: false,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'YuuNecro', 
        email: 'YuuNecro@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Eucliwood', 
        email: 'Eucliwood@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Hellscythe', 
        email: 'Hellscythe@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Inui', 
        email: 'Inui@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'YuuNecro', 
        email: 'YuuNecro@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Eucliwood', 
        email: 'Eucliwood@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Hellscythe', 
        email: 'Hellscythe@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
      { 
        username: 'Inui', 
        email: 'Inui@mahjong.xyz', 
        password: defaultPassword, 
        open: true,
        role: 'user',
        status: 'active'  
      },
    ],
    skipDuplicates: true,
  })  
  
  console.log('Initial accounts seeded.');
}

async function seedGameSession() {
  const datasetDir = '../dataset';
  const files = fs.readdirSync(datasetDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files`);

  let count = 0;
  for (const file of files) {
    const filePath = path.join(datasetDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    // console.log(`Processing: ${file}`);

    try {
      const { is_detailed, game_type, game_date, session_players, round_records } = data;

      if (!game_type || !game_date || !session_players) {
        throw new Error('Invalid game data');
      }
      
      await prisma.$transaction(async (tx) => {
        // find users in database
        const usernames = data.session_players.map(p => p.username);
        const users = await tx.user.findMany({
          where: { username: { in: usernames }}
        });

        const usernameToId = {};
        users.forEach(u => usernameToId[u.username] = u.id);
        
        // check if all username exists
        for (const sp of session_players) {
          if (!usernameToId[sp.username]) {
            throw new Error(`User not found: ${sp.username}`);
          }
        }

        // create game session
        const gameSession = await tx.gameSession.create({
          data: {
            is_detailed,
            game_type,
            game_date: new Date(game_date)
          }
        });

        const sessionId = gameSession.id;

        // create session players
        await tx.sessionPlayers.createMany({
          data: session_players.map(sp => ({
            session_id: sessionId,
            seat: sp.seat,
            user_id: usernameToId[sp.username],
            final_ranking: sp.final_ranking,
            final_score: sp.final_score,
            final_point: sp.final_point
          }))
        });

        if (is_detailed && round_records?.length > 0) {
          await tx.roundRecords.createMany({
            data: round_records.map(rr => ({
              session_id: sessionId,
              idx: rr.idx,
              wind: rr.wind,
              dealer: rr.dealer,
              honba: rr.honba,
              kyotaku: rr.kyotaku,
              renchan: rr.renchan,
              ryukyoku: rr.ryukyoku
            }))
          });

          const roundPlayersData = [];
          for (const rr of data.round_records) {
            for (const player of rr.players) {
              roundPlayersData.push({
                session_id: sessionId,
                idx: rr.idx,
                seat: player.seat,
                win: player.win,
                tsumo: player.tsumo,
                lose: player.lose,
                fuulu: player.fuulu,
                reach: player.reach,
                startingscore: player.startingscore,
                deltascore: player.deltascore,
                endingscore: player.endingscore
              });
            }
          }

          await tx.roundPlayers.createMany({ data: roundPlayersData });
        }

        return gameSession;
      });
      count++;
    } catch (error) {
      console.error(`  ✗ Failed: ${file} - ${error.message}`);
    }
  }
  console.log(`Transfered ${count} files.`);
}

async function main() {
  await seedGameTypes();
  await seedAccounts();
  await seedGameSession();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())