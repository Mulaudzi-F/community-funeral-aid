require("dotenv").config();
const app = require("./app");
const http = require("http");
const socketio = require("socket.io");
const { setupSocket } = require("./service/socketService");

// Load environment variables

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
