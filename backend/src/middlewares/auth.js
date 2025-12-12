import prisma from '../prisma.js';
import { verifyToken } from '../utils/token.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token');
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      throw new Error('User not exist');
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    req.token = token;
    next();
  } catch (error) {
    console.log('Authentication failed:', error.message);
    res.status(401).json({ message: 'Please authenticate' });
  }
};
