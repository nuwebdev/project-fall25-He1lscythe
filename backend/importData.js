import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function importGameData() {
  const datasetDir = '../dataset';
  
  const files = fs.readdirSync(datasetDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files`);

  for (const file of files) {
    const filePath = path.join(datasetDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    console.log(`Processing: ${file}`);

    try {
      await prisma.$transaction(async (tx) => {
        // 1. 查找所有用户 ID
        const usernames = data.session_players.map(p => p.username);
        const users = await tx.user.findMany({
          where: { username: { in: usernames } }
        });

        const usernameToId = {};
        users.forEach(u => usernameToId[u.username] = u.id);

        // 检查所有用户是否存在
        for (const sp of data.session_players) {
          if (!usernameToId[sp.username]) {
            throw new Error(`User not found: ${sp.username}`);
          }
        }

        // 2. 创建 GameSession
        const gameSession = await tx.gameSession.create({
          data: {
            is_detailed: data.is_detailed,
            game_type: data.game_type,
            game_date: new Date(data.game_date)
          }
        });

        const sessionId = gameSession.id;

        // 3. 创建 SessionPlayers
        await tx.sessionPlayers.createMany({
          data: data.session_players.map(sp => ({
            session_id: sessionId,
            seat: sp.seat,
            user_id: usernameToId[sp.username],
            final_ranking: sp.final_ranking,
            final_score: sp.final_score,
            final_point: sp.final_point
          }))
        });

        // 4. 创建 RoundRecords
        if (data.is_detailed && data.round_records?.length > 0) {
          await tx.roundRecords.createMany({
            data: data.round_records.map(rr => ({
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

          // 5. 创建 RoundPlayers
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
                tenpai: player.tenpai,
                startingscore: player.startingscore,
                deltascore: player.deltascore,
                endingscore: player.endingscore
              });
            }
          }

          await tx.roundPlayers.createMany({
            data: roundPlayersData
          });
        }

        console.log(`  ✓ Imported session: ${sessionId}`);
      });
    } catch (error) {
      console.error(`  ✗ Failed: ${file} - ${error.message}`);
    }
  }
}

importGameData()
  .then(() => console.log('Import completed'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());