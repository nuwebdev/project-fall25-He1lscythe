import prisma from '../prisma.js';

// upload game session
export const uploadGameRecord = async (req, res) => {
  try {
    const { is_detailed, game_type, game_date, session_players, round_records } = req.body;

    if (!game_type || !game_date || !session_players) {
      return res.status(400).json({ message: 'Invalid game data' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // find users in database
      const usernames = session_players.map(p => p.username);
      const users = await tx.user.findMany({
        where: { username: { in: usernames } }
      });

      const usernameToId = {};
      users.forEach(u => usernameToId[u.username] = u.id);

      // check if all users exist
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

      // if is detailed, create round records
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
        for (const rr of round_records) {
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

    res.status(201).json({
      success: true,
      message: 'Game record uploaded successfully',
      session_id: result.id
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (error.message.startsWith('User not found')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: 'Error uploading game record' });
  }
};

// get game session detail by uuid
export const getDetail = async (req, res) => {
  try {
    const { uuid } = req.query;
    if (!uuid) {
      return res.status(400).json({ message: 'UUID required' });
    }

    const result = await prisma.gameSession.findUnique({
      where: { id: uuid },
      include: {
        fk_game_type: true,
        session_players: {
          include: { fk_user_id: true }
        },
        round_records: {
          include: { players: true }
        }
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Get detail error:', error);
    res.status(500).json({ message: 'Error getting game session detail' });
  }
};