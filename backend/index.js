const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const router = require("./router");

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
};

const io = socketio(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(router);

io.on("connect", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join", ({ name, room }, callback) => {
    console.log(`${name} is attempting to join room ${room}`);

    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) {
      console.error("Error on join:", error);
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });

    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name} has joined!`,
    });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }

    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
