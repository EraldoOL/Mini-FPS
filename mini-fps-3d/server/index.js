const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "../public")));

const players = {};

io.on("connection", socket => {
  console.log("Novo jogador: " + socket.id);
  players[socket.id] = {
    x: 0, y: 0, z: 0,
    rotation: 0,
    health: 100
  };

  socket.emit("init", { id: socket.id, players });
  socket.broadcast.emit("newPlayer", { id: socket.id, data: players[socket.id] });

  socket.on("update", data => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...data };
      socket.broadcast.emit("updatePlayer", { id: socket.id, data });
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("removePlayer", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});