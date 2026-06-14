const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// In-memory room storage
// rooms[roomId] = { code, language, users: { socketId: { username, color } } }
const rooms = {};

const COLORS = [
  "#FF6B6B","#4ECDC4","#45B7D1","#96CEB4",
  "#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F",
  "#BB8FCE","#85C1E9",
];

// ─── Judge0 Integration (FREE — no API key needed) ───────────────────────────
// Uses the official free public Judge0 instance at ce.judge0.com
// Docs: https://ce.judge0.com
const JUDGE0_URL = "https://ce.judge0.com";

const LANGUAGE_IDS = {
  javascript: 63,
  python:     71,
  cpp:        54,
  c:          50,
  java:       62,
  go:         60,
  rust:       73,
  typescript: 74,
};

app.post("/api/execute", async (req, res) => {
  const { code, language } = req.body;
  const languageId = LANGUAGE_IDS[language];

  if (!languageId) {
    return res.json({ stdout: "", stderr: `Language '${language}' not supported.`, compile_output: "" });
  }

  try {
    // Step 1: Submit the code
    const submitRes = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false`,
      { source_code: code, language_id: languageId, stdin: "" },
      { headers: { "Content-Type": "application/json" } }
    );

    const token = submitRes.data.token;
    if (!token) throw new Error("No token returned from Judge0");

    // Step 2: Poll until result is ready (status id 1=In Queue, 2=Processing)
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000)); // wait 1 second
      const pollRes = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        { headers: { "Content-Type": "application/json" } }
      );
      result = pollRes.data;
      if (result.status?.id > 2) break; // done
    }

    const { stdout, stderr, compile_output, status } = result;
    res.json({
      stdout: stdout || "",
      stderr: stderr || "",
      compile_output: compile_output || "",
      status: status?.description || "Done",
    });
  } catch (err) {
    res.json({
      stdout: "",
      stderr: err.response?.data?.message || err.message || "Judge0 service unavailable. Check your internet connection.",
      compile_output: "",
      status: "Error",
    });
  }
});

// ─── Room API ─────────────────────────────────────────────────────────────────
app.get("/api/room/:roomId", (req, res) => {
  const room = rooms[req.params.roomId];
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ code: room.code, language: room.language });
});

// ─── Socket.io ───────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        code: "// Start coding...\n",
        language: "javascript",
        users: {},
      };
    }

    const color = COLORS[Object.keys(rooms[roomId].users).length % COLORS.length];
    rooms[roomId].users[socket.id] = { username, color };

    // Send current state to new joiner
    socket.emit("room-state", {
      code: rooms[roomId].code,
      language: rooms[roomId].language,
      users: rooms[roomId].users,
    });

    // Notify others
    socket.to(roomId).emit("user-joined", {
      socketId: socket.id,
      username,
      color,
      users: rooms[roomId].users,
    });

    socket.data.roomId = roomId;
    socket.data.username = username;

    console.log(`${username} joined room ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code }) => {
    if (rooms[roomId]) rooms[roomId].code = code;
    socket.to(roomId).emit("code-update", { code });
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (rooms[roomId]) rooms[roomId].language = language;
    socket.to(roomId).emit("language-update", { language });
  });

  socket.on("cursor-move", ({ roomId, position }) => {
    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      username: socket.data.username,
      color: rooms[roomId]?.users[socket.id]?.color,
      position,
    });
  });

  socket.on("disconnect", () => {
    const { roomId, username } = socket.data;
    if (roomId && rooms[roomId]) {
      delete rooms[roomId].users[socket.id];
      io.to(roomId).emit("user-left", {
        socketId: socket.id,
        username,
        users: rooms[roomId].users,
      });
      // Clean up empty rooms
      if (Object.keys(rooms[roomId].users).length === 0) {
        delete rooms[roomId];
      }
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
