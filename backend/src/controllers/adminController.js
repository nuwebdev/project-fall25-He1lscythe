import prisma from '../prisma.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, status: true },
      orderBy: { id: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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
};

export const deleteGameSession = async (req, res) => {
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
};