"# project-fall25-He1lscythe" 

video presentation for v0.2 [LiJiacong-v0.2-videopresentation.mkv](https://northeastern-my.sharepoint.com/:v:/g/personal/li_jiaco_northeastern_edu/ERiOkHP3tzdGuW_ouXjMTFoBVe5Er09nhb2npm2s6nIwfQ?e=Cx8Zcd)

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

