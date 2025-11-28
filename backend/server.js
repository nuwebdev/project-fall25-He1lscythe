// server.js - 主服务器文件
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();


const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// generate jwt token
const generateToken = (userId) => {
  return jwt.sign(
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
      console.log('错误: 没有 token');
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
    const hashedPassword = await bcrypt.hash(password, 10);

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

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Password or usename incorrect' });
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

    res.json(gametype);
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

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error when getting gametype' });
  }
});

app.put('/api/upload/gamerecord', authMiddleware, async(req, res) => {
  try {
    
    // pending
  } catch (error) {
    console.error('Game record upload error:', error);
    res.status(500).json({ message: 'Error uploading game record' });
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