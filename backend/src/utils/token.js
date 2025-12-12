import jwt from 'jsonwebtoken';

const { sign, verify } = jwt;
const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId) => {
  return sign({ userId }, SECRET, { expiresIn: '1y' });
};

export const verifyToken = (token) => {
  return verify(token, SECRET);
};