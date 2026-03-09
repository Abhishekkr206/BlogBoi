require("dotenv").config();

const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const http = require("http")
const { Server } = require("socket.io")

const socketHandler = require("./socket/socketHandler")
const authRoute = require("./routes/auth")
const blogRoute = require("./routes/post")
const messageRoute = require("./routes/message")

require('./config/redis');

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL

console.log("Server starting...");
console.log("PORT:", PORT);

// Middleware
app.use(morgan("dev"))
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cookieParser())
app.use(express.json())

// CORS Configuration for Production
app.use(cors({
  origin: [
    "https://blogboi.vercel.app",
    "https://blogboi.fun",
    "http://localhost:5173"  // Keep for local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      "https://blogboi.vercel.app",
      "https://blogboi.fun",
      "http://localhost:5173" // Keep for local development
    ],
    credentials: true
  }
});

socketHandler(io)

// Routes
app.use("/auth", authRoute);
app.use("/blog", blogRoute);
app.use("/chat", messageRoute);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running", status: "OK" });
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("MongoDB connected successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});