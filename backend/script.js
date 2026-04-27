require("dotenv").config();

const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const mongoose = require("mongoose")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const rateLimit = require("express-rate-limit")
const mongoSanitize = require("express-mongo-sanitize")
const http = require("http")
const { Server } = require("socket.io")

const socketHandler = require("./socket/socketHandler")
const authRoute = require("./routes/auth")
const blogRoute = require("./routes/post")
const messageRoute = require("./routes/message")

const Post = require("./models/post")
const User = require("./models/user")

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
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later" }
}))

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

// Dynamic Sitemap Generation (For SEO)
app.get("/sitemap.xml", async (req, res) => {
  try {
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Static endpoints
    const staticUrls = ['/', '/login', '/register/details'];
    staticUrls.forEach(url => {
        sitemap += `  <url>\n    <loc>https://blogboi.fun${url}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });
    
    // Dynamic posts
    const posts = await Post.find().select('_id updatedAt');
    posts.forEach(post => {
        sitemap += `  <url>\n    <loc>https://blogboi.fun/post/${post._id}</loc>\n    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Dynamic profiles
    const users = await User.find().select('_id updatedAt');
    users.forEach(user => {
        const date = user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString();
        sitemap += `  <url>\n    <loc>https://blogboi.fun/user/${user._id}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    sitemap += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).end();
  }
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