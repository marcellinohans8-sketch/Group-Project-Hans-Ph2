if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = createServer(app);

// ✅ FIX: semua origin (dev + prod)
const allowedOrigins = [
  "https://eyougle.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175", // ← INI YANG KAMU PAKAI SEKARANG
];

// ✅ Express CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Socket.io CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ================= ROUTES =================
const port = process.env.PORT || 3000;
const errorHandler = require("./middlewares/errorHandler");
const AuthController = require("./controller/AuthController");
const auth = require("./middlewares/authentication");
const socketIo = require("./helpers/socketio");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// PUBLIC
app.post("/register", AuthController.Register);
app.post("/login", AuthController.Login);

// ❌ JANGAN GLOBAL
// app.use(auth);

// ✅ contoh protected
app.get("/profile", auth, (req, res) => {
  res.json({ message: "Protected route" });
});

app.use(errorHandler);

// ================= SOCKET =================
socketIo(io);

// DEBUG
io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);
});

// ================= START =================
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
