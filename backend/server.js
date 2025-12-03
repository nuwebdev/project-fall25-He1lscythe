import express, { json } from 'express';
import cors from 'cors';
import { hash, compare, genSalt } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const { sign, verify } = jwt;

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(json());

// generate jwt token
const generateToken = (userId) => {
  return sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1y' }
  );
};

// authenticate token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Error: no token');
      throw new Error();
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    console.log('user found:', user ? user.username : 'null');
    
    if (!user) {
      console.log('Error: user not exist');
      throw new Error();
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    req.token = token;
    next();
  } catch (error) {
    console.log('Authentication failed: ', error.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};


// register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // encrypt
    const hashedPassword = await hash(password, 10);

    // create user, put into sql
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        open: true,
      }
    });

    const token = generateToken(user.id);

    // password with empty, and other paras back to front end
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating account' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: username },
          { username: username }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Username/email not exist.' });
    }

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Password or usename incorrect' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account has been banned' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login success',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});


app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});


app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, open } = req.body;
    const updateData = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (open !== undefined) updateData.open = open;

    if (username || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: req.user.id } },
            {
              OR: [
                username ? { username: username } : {},
                email ? { email: email } : {}
              ]
            }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username or email already taken' 
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

app.get('/api/gametype/detail', async(req, res) => {
  try {
    const { id } = req.query;
    const gametype = await prisma.gameType.findFirst({
      where: {id: parseInt(id)}
    });

    res.status(200).json(gametype);
  } catch (error) {
    res.status(500).json({ message: 'Error when getting gametype' });
  }
});

app.get('/api/gametype/list', async(req, res) => {
  try {
    const result = await prisma.gameType.findMany({
      select: {
        id: true,
        type_name: true
      }
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error when getting gametype' });
  }
});

app.post('/api/upload/gamerecord', authMiddleware, async(req, res) => {
  try {
    const {
      is_detailed,
      game_type,
      game_date,
      session_players,
      round_records
    } = req.body;

    if (!game_type || !game_date || !session_players) {
      return res.status(400).json({ message: 'Invalid game data' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const usernames = session_players.map(p => p.username);
      const users = await tx.user.findMany({
        where: { username: { in: usernames } }
      });
      
      const usernameToId = {};
      users.forEach(u => usernameToId[u.username] = u.id);

      for (const sp of session_players) {
        if (!usernameToId[sp.username]) {
          throw new Error(`User not found: ${sp.username}`);
        }
      }

      const gameSession = await tx.gameSession.create({
        data: {
          is_detailed,
          game_type,
          game_date: new Date(game_date)
        }
      });

      const sessionId = gameSession.id;

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

      if (is_detailed && round_records && round_records.length > 0) {
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

        await tx.roundPlayers.createMany({
          data: roundPlayersData
        });
      }
      
      return gameSession;
    });

    res.status(201).json({ 
      success: true, 
      message: 'Game record uploaded successfully',
      session_id: result.id 
    });
  } catch (error) {
    console.error('Game record upload error:', error);
    
    if (error.message.startsWith('User not found')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: 'Error uploading game record, server busy.' });
  }
});

//const { userId, page = '1', limit = '100', from, to, ranking, gametype } = req.query;
//GET /api/stats/games?userId=xxx&page=1&limit=100&from=2023-01-01&to=2025-11-30
app.get('/api/player/gamesession', authMiddleware, async (req, res) => {
  try {
    const { id, limit, ranking, gametype, from, to } = req.query;
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && id === undefined) throw new Error('User id required.');

    const rankingArray = ranking ? ranking.split(',').map(Number) : null;
    const gameTypeArray = gametype ? gametype.split(',').map(Number) : null;
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
        ...(from || to ? {
          game_date: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to) })
          }
        } : {})
      },
      select: {
        id: true,
        is_detailed: true,
        game_type: true,
        game_date: true,
        session_players: {
          select: {
            seat: true,
            user_id: true,
            final_ranking: true,
            final_score: true,
            final_point: true,
            fk_user_id: {
              select: {
                username: true
              }
            }
          }
        },
        fk_game_type: {
          select: {
            type_name: true
          }
        }
      },
      orderBy: {
        game_date: 'desc'
      },
      ...(limit && {take: parseInt(limit)})
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Game sessions get error:', error);
    
    if (error.message.startsWith('User not found')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: 'Error get game session, server busy.' });
  }
});

app.get('/api/player/roundplayers', authMiddleware, async (req, res) => {
  try {
    const { id, limit } = req.query;
    // console.log('back:', req.query);
    if (id === undefined) throw new Error(`User id required.`);
    const result = await prisma.roundPlayers.findMany({
      where: {
        fk_session_player: {
          user_id: parseInt(id)
        }
      },
      orderBy: {
        fk_round_record: {
          fk_session_id: {
            game_date: 'desc'
          }
        }
      },
      ...(limit && {take: parseInt(limit)}),
      select: {
        session_id: true,
        win: true,
        tsumo: true,
        lose: true,
        fuulu: true,
        reach: true,
        tenpai: true,
        deltascore: true,
        fk_round_record: {
          select: {
            ryukyoku: true,
            fk_session_id: {
              select: {
                game_date: true
              }
            }
          }
        }
      }
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Game sessions get error:', error);
    
    if (error.message.startsWith('User not found')) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: 'Error get game session, server busy.' });
  }
});

app.get('/api/gamesession/detail', async (req, res) => {
  try {
    const { uuid } = req.query;
    if (!uuid || uuid === undefined) throw new Error(`Uuid required.`);
    const result = await prisma.gameSession.findUnique({
      where: {
        id: uuid
      },
      include: {
        fk_game_type: true,
        session_players: true,
        round_records: {
          include: {
            players: true
          }
        }
      }
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Game session detail get error:', error);
    res.status(500).json({ success: false, message: 'Error get game session detail, server busy.' });
  }
});

app.get('/api/player/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(200).json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: 'insensitive'
        },
        open: true
      },
      select: {
        id: true,
        username: true
      },
      take: 10
    });
    // console.log('user:', users);

    res.status(200).json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        open: true
      }
    });

    if (!user || !user.open) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error getting user' });
  }
});


// ============ Admin ============

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { id: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});


app.put('/api/admin/user/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "active" | "banned"
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own account' });
    }
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status }
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status' });
  }
});

app.get('/api/admin/user/:id/games', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.gameSession.findMany({
      where: {
        session_players: {
          some: { user_id: parseInt(id) }
        }
      },
      select: {
        id: true,
        is_detailed: true,
        game_type: true,
        game_date: true,
        session_players: {
          select: {
            seat: true,
            user_id: true,
            final_ranking: true,
            final_score: true,
            final_point: true,
            fk_user_id: {
              select: { username: true }
            }
          }
        },
        fk_game_type: {
          select: { type_name: true }
        }
      },
      orderBy: { game_date: 'desc' }
    });
    
    res.json(result);
  } catch (error) {
    console.error('Admin get user games error:', error);
    res.status(500).json({ message: 'Error fetching user games' });
  }
});

app.delete('/api/admin/gamesession/:uuid', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { uuid } = req.params;
    
    await prisma.$transaction([
      prisma.roundPlayers.deleteMany({ where: { session_id: uuid } }),
      prisma.roundRecords.deleteMany({ where: { session_id: uuid } }),
      prisma.sessionPlayers.deleteMany({ where: { session_id: uuid } }),
      prisma.gameSession.delete({ where: { id: uuid } })
    ]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting game session' });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});