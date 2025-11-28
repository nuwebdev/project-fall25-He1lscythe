import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function seedGameTypes() {
  await prisma.gameType.createMany({
    data: [
      {
        type_name: 'Mリーグルール',
        description: '25000持ち30000返し 10-30',
        starting_score: 25000,
        ending_score: 30000,
        point_first: 30,
        point_second: 10,
        point_third: -10,
        point_fourth: -30,
        kiriage: true
      },
      {
        type_name: '最高位戦ルール',
        description: '30000持ち30000返し 10-30',
        starting_score: 30000,
        ending_score: 30000,
        point_first: 30,
        point_second: 10,
        point_third: -10,
        point_fourth: -30,
        kiriage: true
      },
      {
        type_name: 'ジャン魂ルール',
        description: '25000持ち25000返し 5-15',
        starting_score: 25000,
        ending_score: 25000,
        point_first: 15,
        point_second: 5,
        point_third: -5,
        point_fourth: -15,
        kiriage: false
      },
    ],
    skipDuplicates: true,
  })
  
  const hashedPassword = [];
  for (let i = 0; i < 4; i++) {
    hashedPassword[i] = await bcrypt.hash(`Test000${i + 1}`, 10);
  }

  await prisma.user.createMany({
    data: [
      { 
        username: 'Player1', 
        email: 'player1@test.xyz', 
        password: hashedPassword[0], 
        open: false 
      },
      { 
        username: 'Player2', 
        email: 'player2@test.xyz', 
        password: hashedPassword[1], 
        open: false 
      },
      { 
        username: 'Player3', 
        email: 'player3@test.xyz', 
        password: hashedPassword[2], 
        open: false 
      },
      { 
        username: 'Player4', 
        email: 'player4@test.xyz', 
        password: hashedPassword[3], 
        open: false 
      },
    ],
    skipDuplicates: true,
  })  
  
  console.log('Game types seeded')
}

seedGameTypes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())