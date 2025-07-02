const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected`, socket.id);

  socket.on("user-online", (user) => {
    onlineUsers.set(socket.id, user);
    io.emit("update-online-users", Array.from(onlineUsers.values()));
  });

  // join group room
  socket.on("join-group", (groupId) => {
    socket.join(`group-${groupId}`);
  });

  // send message
  socket.on("send-message", ({ groupId, message }) => {
    io.to(`group-${groupId}`).emit("receive-message", {
      text: message.text,
      userId: message.userId,
      username: message.username,
      groupId,
      createdAt: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("update-online-users", Array.from(onlineUsers.values()));
  });
});

const authRoutes = require("./routes/auth.routes");
const groupRoutes = require("./routes/group.routes");
const messageRoutes = require("./routes/message.routes");
const userRoutes = require("./routes/user.routes");
const uploadRoutes = require("./routes/upload.routes");
const path = require("path");

app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use("/uploads", express.static("uploads"));
app.use("/", authRoutes);
app.use("/", groupRoutes);
app.use("/", messageRoutes);
app.use("/", userRoutes);
app.use("/", uploadRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port 5000");
});
