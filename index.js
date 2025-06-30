const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`User connected`, socket.id);

  // join group room
  socket.on("join-group", (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`${socket.id} joined group-${groupId}`);
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
    console.log(`User disconnected: `, socket.id);
  });
});

const authRoutes = require("./routes/auth.routes");
const groupRoutes = require("./routes/group.routes");
const messageRoutes = require("./routes/message.routes");
const userRoutes = require("./routes/user.routes");
const path = require("path");

app.use(express.json());
app.use(express.static(path.resolve("./public")));
app.use("/", authRoutes);
app.use("/", groupRoutes);
app.use("/", messageRoutes);
app.use("/", userRoutes);

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
