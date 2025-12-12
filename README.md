"# project-fall25-He1lscythe" 

# Group members

**Jiacong Li**                        Dawei Feng

# Project Framework

```
final/
├── dataset/       json files of gamesession records for presentation
|                  imported using  npx prisma db seed
├── my-app/ (front-end: react + vite + tailwind) ---> front-end starts from this 
│   │                                       directory using  npm run dev
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx         
│   │   │   ├── Register.jsx      
│   │   │   ├── Navbar.jsx
│   │   │   ├── UserMainPage.jsx
│   │   │   └── other pages ...
│   │   │
│   │   │── model/
│   │   │   ├── ERDiagram.jsx              # 
│   │   │   └── RelationalModel.jsx
│   │   │   
│   │   ├── services/
│   │   │   └── api.js                     # front-end api
│   │   │   │   └── ApiService             # send req, return res
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx            # Authentication
│   │   │                                  # & call ApiService
│   │   ├── admin/                   
│   │   │   ├── AdminUsers.jsx             # Admin views
│   │   │   └── AdminRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/ (backend: node.js + postgresql + prisma) 
    |                     backend starts from this directory using: npm run dev 
    |                                 prisma: npx prisma studio --port 5556
    ├── src
    │   ├── server.js                     # main entry
    │   ├── prisma.js                     # to call prisma client
    │   │
    │   ├── middlewares/
    │   │   ├── auth.js                   # authMiddleware
    │   │   └── admin.js                  # adminMiddleware
    │   │
    │   ├── routes/                       # routers
    │   │   │
    │   │   ├── authRoutes.js             # /api/auth/*
    │   │   ├── userRoutes.js             # /api/user/*
    │   │   ├── gameTypeRoutes.js         # /api/gamestype/*
    │   │   ├── gameSessionRoutes.js      # /api/gamesession/*
    │   │   └── adminRoutes.js            # /api/admin/*
    │   │
    │   ├── controllers/                  # functionalities applied in this file
    │   │   │
    │   │   ├── authController.js         # login, register, get/update profile
    │   │   ├── userController.js         # game session, round records()
    │   │   ├── gameTypeController.js
    │   │   ├── gameSessionController.js
    │   │   └── adminController.js
    │   │                                 
    │   ├── utils/
	│   │   └── token.js                  # generateToken, verifyToken
    │   │
    ├── prisma 
    │   ├── schema.prisma             schema
    │   └── seed.js                   default data (including admin account)
    |
    ├── package.json
    └── .env                       
```

# Goals & plans

Please refer to the [proposal.md](./proposal/proposal.md) and [plans.md](./proposal/plan.md).

# Accomplishments

## Front-end

- [x] login and register page

User views:

- [x] statistics at homepage
- [x] upload page
  - [x] upload you game session records and update in the database

- [x] match history page 
  - [x] filters with game type and ranking
  - [x] view game session details
  - [ ] editable/deletable after uploaded
- [x] search page
  - [x] navigate to target user's page
  - [x] compare points with target user

- [x] user profile page (todo)
  - [x] update username/email/open
  - [ ] update password

Admin views:

- [x] all registered users/admins available
  - [x] be able to ban/active an account
  - [x] view users' game sessions
- [x] game sessions page
  - [x] all game sessions deletable

## Backend

- [x] Node.js applied
- [x] All functionalities from front-end applied
- [x] User and admin authentication applied
- [x] Password stored with encryption and give user token

## Database

- [x] PostgreSQL applied
- [x] Prisma applied as ORM
- [x] ER Diagram & Relational Model for database

# User Guidelines

## Installation guide

### step 1: database setup

use psql or pgAdmin:

```sql
CREATE DATABASE mahjong_db;
```

or via command line:

```bash
psql -U postgres -c "CREATE DATABASE mahjong_db;"
```

### step 2: backend setup

navigate to the backend directory 

```bash
cd backend
npm install
cp .env.eg .env
```

edit `.env` and configure your database connection:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/mahjong_db"
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

prisma

**The prisma version is v6.19.0, it would not work with version later than v7.0!!** 

```bash
npx prisma migrate dev
npx prisma db seed
```

**All initial data would be inserted with seed.js**

run backend server

```
npm run dev
```

the backend will be running at `http://localhost:5000`

### step 3: front-end setup

open a new terminal and navigate to the frontend directory

```bash
cd my-app
npm install
npm run dev
```

the frontend will be running at `http://localhost:5173`

### step 4: Prisma studio

```bash
cd backend
npx prisma studio --port 5556
```

you can view database at `http://localhost:5556`

### For Dbeaver

You can import schema and all data using [mahjong_db.sql](./backend/mahjong_db.sql) without frontend/backend.

## Usage Guide

### E-R Diagram & Relational Model

* Those can be seen from the link shown in login page.

### For User

* User can create account and upload game records with round details.
* User can view game session history with filters.
* User can check session details after uploaded
* User can view statistics at homepage 
* User can search other users'(players) stats page.
* default user accounts: written in `seed.js`.

| username   | password  |
| ---------- | --------- |
| YuuNecro   | Password1 |
| Eucliwood  | Password1 |
| Hellscythe | Password1 |
| Inui       | Password1 |

### For Admin

* can view all users' info
* ban or reactive user's account
* can view any game sessions and delete them
* default admin account
  * Username: Admin0
  * Password: Test0000

# Final report for CS5200

Please refer to [report.pdf](./report/li_final_report.pdf) or [report.md](./report/li_final_report.md)


# New Functionalities

* Pie chart, area chart from recharts.
* `AuthContext.jsx` only focus on authentication state management.

# Use of LLMs

* A lot of explanations on how the class names works, especially about `flex` , element moves unexpectedly after I use `flex` on parent element.
* Complicated logics in `UploadPage.jsx` , one or some of the state in one round changes will effect corresponding rounds and final scores/rankings. Scores changes and players state would be calculated in `<Onekyoku />` based on the buttons and would pass out to `<WholeGame />`, changes would trigger recalculate and new `startingscore` would be passed into next `<Onekyoku />`.

# Acknowledgments/References

* https://game.maj-soul.com/  a platform to play Japanese Mahjong online, where I collect session data after playing.
* https://amae-koromo.sapk.ch/  a mahjong record collection website, where I reference the layout and choose important stats to collect.
* https://nerdcave.com/tailwind-cheat-sheet cheat sheet site for writing tailwind.
* https://www.w3schools.com/REACT/DEFAULT.ASP react tutorial website, especially for using react hooks.
* https://www.w3schools.com/js/default.asp JavaScript tutorial
* https://blog.csdn.net/2402_84971234/article/details/147319353 JWT authorization.
* https://prisma.org.cn/docs/getting-started/prisma-orm/quickstart/postgresql Prisma
* https://zhuanlan.zhihu.com/p/1953579241464661901 Tutorial on using Prisma.
* https://kentcdodds.com/blog/authentication-in-react-applications, https://zhuanlan.zhihu.com/p/67055572, https://developer.aliyun.com/article/1625120 Authentication in react.
* https://recharts.github.io/ used pie chart and area chart with recharts

# Lessons learned

Toooooooooooo much challenges.

* New to JavaScript, html, CSS, front-end tools -- react, backend tools -- node.js, tailwind. -- Spent lots of time reading the tutorial and playing with some examples that I ask Claude to generate. 

* Feel difficult on using react hooks. -- I just used lots of `console.log()` to understand whether hooks are triggered, and how it works.









