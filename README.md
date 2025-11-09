<p align="center">
  <img src="https://raw.githubusercontent.com/Abhishekkr206/BlogBoi/main/frontend/public/logo.png" width="140" />
  <br/>
  <h1>BlogBoi</h1>
</p>

BlogBoi is a full-stack blogging platform focused on performance, clean UI, and scalable architecture.
It supports full CRUD blog operations, JWT + Google OAuth authentication, Redis caching, and a fully responsive frontend built using React + RTK Query + Tailwind CSS.

---

## Tech Stack

| Layer        | Technologies                                      |
| ------------ | ------------------------------------------------- |
| **Frontend** | React, RTK Query, Tailwind CSS                    |
| **Backend**  | Node.js, Express.js                               |
| **Database** | MongoDB (Cloud)                                   |
| **Cache**    | Redis (Cloud)                                     |
| **Auth**     | JWT + Google OAuth                                |
| **DevOps**   | Docker, AWS Amplify (Frontend), AWS EC2 (Backend) |

---

## Features

* Full CRUD: Create, Read, Update, Delete blog posts
* JWT + Google OAuth authentication
* Redis caching for faster API responses
* Pagination + RTK Query for optimized fetching
* Clean, responsive UI with Tailwind
* Cloudinary media upload support
* Production-ready Docker setup
* Deployed fully on AWS (Amplify + EC2)

---

## Project Structure

```
root
├── frontend/               # React + RTK Query + Tailwind
│   ├── src/
│   │   ├── app/            # Store & apiSlice
│   │   ├── components/     # UI components
│   │   ├── features/       # RTK slices
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Helpers
│   │   └── main.jsx
│   ├── public/
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env
│
├── backend/                # Express API + MongoDB + Redis
│   ├── config/             # DB & Redis configs
│   ├── middleware/         # auth, multer, etc
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── utils/              # OTP, tokens, cloudinary
│   ├── public/
│   ├── script.js           # Server entry point
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml
└── README.md
```

---

## Environment Variables

Create a `.env` file in both `frontend/` and `backend/` directories.

### Backend `.env`

```
PORT=5500
MONGO_URL=

JWT_SECRET=
REFRESH_TOKEN_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_USER=
PASS_USER=

GOOGLE_CLIENT_ID=

REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

### Frontend `.env`

```
VITE_GOOGLE_CLIENT_ID=
```

---

## Running Locally

### 1. Clone the repo

```bash
git clone https://github.com/Abhishekkr206/BlogBoi
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Add `.env` files (as shown above)

### 4. Start backend

```bash
cd backend
nodemon script.js
```

### 5. Start frontend

```bash
cd frontend
npm run dev
```

---

## Run With Docker (Optional)

```bash
docker-compose up --build   # Backend and DB

cd frontend                 # Frontend
npm run dev
```

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Added something"`
4. Push and open a PR

---

## License

This project is licensed under the **MIT License**.

---

## Support

If you like the project, consider giving it a star on GitHub!
Thanks for checking out **BlogBoi**!
