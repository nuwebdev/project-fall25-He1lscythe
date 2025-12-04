"# project-fall25-He1lscythe" 

video presentation for v0.2 [LiJiacong-v0.2-videopresentation.mkv](https://northeastern-my.sharepoint.com/:v:/g/personal/li_jiaco_northeastern_edu/ERiOkHP3tzdGuW_ouXjMTFoBVe5Er09nhb2npm2s6nIwfQ?e=Cx8Zcd)

# Project Framework

```
final/
├── my-app/ (front-end: react + vite + tailwind) ---> front-end starts this directory
│   │                                                 using  npm run dev
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx         
│   │   │   ├── Register.jsx      
│   │   │   ├── Navbar.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js               front-end api
│   │   │   │   └── ApiService       send req, return res
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      Authentication
│   │   │                            & call ApiService
│   │   ├── admin/                   
│   │   │   ├── AdminUsers.jsx       Admin views
│   │   │   └── AdminRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/ (backend: node.js + postgresql + prisma) 
                                  prisma: npx prisma studio --port 5556
    ├── server.js                    
    ├── package.json
    ├── prisma 
    │   ├── schema.prisma             schema
    │   └── seed.js                   default data (including admin account)
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
- [x] match history page 
  - [x] filters with game type and ranking
  - [x] view game session details
  - [ ] editable/deletable after uploaded
- [x] search page
- [ ] user profile page (todo)
  - [ ] update username/email/password

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

### backend setup

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

```bash
npx prisma migrate dev
npx prisma db seed
```

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

## Usage Guide

### For User

* User can create account and upload game records with round details.
* User can view game session history with filters.
* User can check session details after uploaded
* User can view statistics at homepage 
* User can search other users'(players) stats page.

### For Admin Account

* can view all users' info
* ban or reactive user's account
* can view any game sessions and delete them
* default admin account
  * Username: Admin0
  * Password: Test0000


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









