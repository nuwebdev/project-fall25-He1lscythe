import { hash, compare } from 'bcryptjs';
import prisma from '../prisma.js';
import { generateToken } from '../utils/token.js';

// register
export const register = async (req, res) => {
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
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      const msg = existingUser.email === email 
        ? 'Email already registered' 
        : 'Username already taken';
      return res.status(400).json({ message: msg });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, open: true }
    });

    const token = generateToken(user.id);
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
};

// login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: username }, { username: username }]
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Username/email not exist.' });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password or username incorrect' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Account has been banned' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: 'Login success', token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// get curr user
export const getMe = (req, res) => {
  res.json({ user: req.user });
};

// update profile (except password)
export const updateProfile = async (req, res) => {
  try {
    const { username, email, open } = req.body;
    const updateData = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (open !== undefined) updateData.open = open;

    if (Object.keys(updateData).length === 0) {
      return res.status(201).json({ message: 'No fields to update' });
    }

    // check repeat
    if (username || email) {
      const existing = await prisma.user.findFirst({
        where: {
          id: { not: req.user.id },
          OR: [
            username && {username},
            email && {email}
          ].filter(Boolean)
        }
      });

      if (existing) {
        return res.status(400).json({ message: 'Username or email already taken' });
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
};