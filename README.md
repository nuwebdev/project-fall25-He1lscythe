"# project-fall25-He1lscythe" 

# Framework

```
final/
├── my-app/ (front-end: react + vite + tailwind)
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
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/ (backend: node.js + postgresql + prisma)                     
    ├── server.js                    
    ├── package.json
    ├── prisma
    │   ├── schema.prisma             schema
    │   └── seed.js                   default data
    └── .env                       
```

