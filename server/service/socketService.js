const socketio = require("socket.io");
let io;

// Initialize socket.io
exports.setupSocket = (socketServer) => {
  io = socketServer;

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join section room
    socket.on("join-section", (sectionId) => {
      socket.join(`section-${sectionId}`);
      console.log(`User joined section ${sectionId}`);
    });

    // Join admin room
    socket.on("join-admin", () => {
      socket.join("admin-room");
      console.log("Admin connected");
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

// Notify specific user
exports.notifyUser = (userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data);
};

// Notify multiple users
exports.notifyUsers = (userIds, event, data) => {
  userIds.forEach((userId) => {
    io.to(`user-${userId}`).emit(event, data);
  });
};

// Notify entire section
exports.notifySection = (sectionId, event, data) => {
  io.to(`section-${sectionId}`).emit(event, data);
};

// Notify all admins
exports.notifyAdmins = (event, data) => {
  io.to("admin-room").emit(event, data);
};

// Get io instance
exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
