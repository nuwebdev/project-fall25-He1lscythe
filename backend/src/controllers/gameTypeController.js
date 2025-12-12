import prisma from '../prisma.js';

export const getList = async (req, res) => {
  try {
    const result = await prisma.gameType.findMany({
      select: { id: true, type_name: true }
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error getting gametype list' });
  }
};

export const getDetail = async (req, res) => {
  try {
    const { id } = req.query;
    const gametype = await prisma.gameType.findFirst({
      where: { id: parseInt(id) }
    });
    res.json(gametype);
  } catch (error) {
    res.status(500).json({ message: 'Error getting gametype detail' });
  }
};
