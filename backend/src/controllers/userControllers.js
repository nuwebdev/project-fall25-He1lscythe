import prisma from '../prisma.js';

// get player game sessions
export const getGameSessions = async (req, res) => {
  try {
    const { id, limit, ranking, gametype, from, to } = req.query;
    const isAdmin = req.user?.role === 'admin';
    
    if (!isAdmin && !id) {
      return res.status(400).json({ message: 'User id required.' });
    }

    const rankingArray = ranking?.split(',').map(Number);
    const gameTypeArray = gametype?.split(',').map(Number);

    const result = await prisma.gameSession.findMany({
      where: {
        ...(gameTypeArray && { game_type: { in: gameTypeArray } }),
        ...(id && {
          session_players: {
            some: {
              user_id: parseInt(id),
              ...(rankingArray && { final_ranking: { in: rankingArray } })
            }
          }
        }),
        ...((from || to) && {
          game_date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) })
          }
        })
      },
      include: {
        session_players: {
          include: {
            fk_user_id: {select: {username: true} }
          }
        },
        fk_game_type: { select: {type_name: true} }
      },
      orderBy: { game_date: 'desc' },
      ...(limit && { take: parseInt(limit) })
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Game sessions error:', error);
    res.status(500).json({ message: 'Error getting game sessions' });
  }
};

// get round players by userid
export const getRoundPlayers = async (req, res) => {
  try {
    const { id, limit } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'User id required.' });
    }

    const result = await prisma.roundPlayers.findMany({
      where: {
        fk_session_player: { user_id: parseInt(id) }
      },
      orderBy: {
        fk_round_record: {
          fk_session_id: { game_date: 'desc' }
        }
      },
      ...(limit && { take: parseInt(limit) }),
      include: {
        fk_round_record: {
          include: {
            fk_session_id: {select: { game_date: true } }
          }
        }
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Round players error:', error);
    res.status(500).json({ message: 'Error getting round players' });
  }
};

// get user statistics to perform datagrid
export const getDataGrid = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'User id required.' });
    }

    const [result] = await prisma.$queryRaw`
      WITH round_stats AS (
        SELECT gs.id AS session_id, sp.final_score, sp.final_ranking,
          rps.win, rps.lose, rps.tsumo, rps.tenpai, rps.fuulu, rps.reach,
          rr.ryukyoku, rps.deltascore
        FROM game_sessions gs
        JOIN session_players sp ON gs.id = sp.session_id
        JOIN round_records rr ON gs.id = rr.session_id
        JOIN round_player_status rps ON sp.session_id = rps.session_id
          AND rr.idx = rps.idx AND sp.seat = rps.seat
        WHERE sp.user_id = ${parseInt(id)}
      ),
      session_stats AS (
        SELECT DISTINCT session_id, final_score, final_ranking FROM round_stats
      ),
      session_agg AS (
        SELECT count(*) AS Total_Games,
          max(final_score) AS Highest_Score,
          min(final_score) AS Lowest_Score,
          avg(final_ranking)::float AS Average_Rank,
          count(*) FILTER (WHERE final_score < 0)::float / count(*) AS Busting_Rate
        FROM session_stats
      ),
      round_agg AS (
        SELECT
          count(*) FILTER (WHERE win)::float / count(*) AS Win_Rate,
          count(*) FILTER (WHERE lose)::float / count(*) AS Lose_Rate,
          count(*) FILTER (WHERE tsumo)::float / NULLIF(count(*) FILTER (WHERE win), 0) AS Tsumo_Rate,
          count(*) FILTER (WHERE tenpai AND ryukyoku)::float / NULLIF(count(*) FILTER (WHERE ryukyoku), 0) AS Draw_Tenpai_Rate,
          count(*) FILTER (WHERE ryukyoku)::float / count(*) AS Exhaustive_Draw_Rate,
          count(*) FILTER (WHERE fuulu)::float / count(*) AS Fuulu_Rate,
          count(*) FILTER (WHERE reach)::float / count(*) AS Reach_Rate,
          count(*) FILTER (WHERE win AND NOT reach AND NOT fuulu)::float / NULLIF(count(*) FILTER (WHERE win), 0) AS Dama_Rate,
          abs(avg(deltascore) FILTER (WHERE lose)::int) AS Average_Lose_Score,
          avg(deltascore) FILTER (WHERE win)::int AS Average_Win_Score
        FROM round_stats
      )
      SELECT * FROM session_agg, round_agg;
    `;

    res.status(200).json(result);
  } catch (error) {
    console.error('Data grid error:', error);
    res.status(500).json({ message: 'Error getting datagrid' });
  }
};

// search user
export const search = async (req, res) => {
  try {
    const { q, id } = req.query;
    if (!q?.trim()) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        username: { contains: q, mode: 'insensitive' },
        open: true,
        ...(id && { id: { not: parseInt(id) } })
      },
      select: { id: true, username: true },
      take: 10
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};

// get user by id
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('trying get id: ', id);
    console.log('hereid', id);
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, username: true, open: true }
    });

    if (!user || !user.open) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error getting user' });
  }
};

// head-to-head records(points differences) with competitor
export const comparePoints = async (req, res) => {
  try {
    const {id1, id2} = req.query;
    if (!id1 || !id2) throw new Error('Two user id needed.');
    const [result] = await prisma.$queryRaw`
      WITH target_sessions AS (
        SELECT session_id
        FROM session_players sp
        JOIN game_sessions gs ON sp.session_id = gs.id
        WHERE sp.user_id IN (${parseInt(id1)}, ${parseInt(id2)})
        GROUP BY sp.session_id 
        HAVING count(DISTINCT user_id) = 2
      ),
      base AS (
        SELECT
          gs.game_type,
          sp.final_point *
            CASE WHEN sp.user_id = ${parseInt(id1)} THEN 1
                WHEN sp.user_id = ${parseInt(id2)} THEN -1
                ELSE 0 END AS signed_point
        FROM session_players sp
        JOIN game_sessions gs ON sp.session_id = gs.id
        JOIN target_sessions ts ON sp.session_id = ts.session_id
      )
      SELECT
        SUM(signed_point) FILTER (WHERE game_type = 1) AS gt1_score,
        SUM(signed_point) FILTER (WHERE game_type = 2) AS gt2_score,
        SUM(signed_point) FILTER (WHERE game_type = 3) AS gt3_score,
        SUM(signed_point) AS total_score,
        COUNT(*) FILTER (WHERE game_type = 1) / 4.0 AS gt1_pc,
        COUNT(*) FILTER (WHERE game_type = 2) / 4.0 AS gt2_pc,
        COUNT(*) FILTER (WHERE game_type = 3) / 4.0 AS gt3_pc,
        COUNT(*) / 4.0 AS total_pc
      FROM base;
    `;
    res.status(200).json(result);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error getting user' });
  }
};