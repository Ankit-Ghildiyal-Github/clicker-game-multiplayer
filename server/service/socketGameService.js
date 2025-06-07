const { Server } = require("socket.io");

function getRandomCell(gridSize) {
  const row = Math.floor(Math.random() * gridSize);
  const col = Math.floor(Math.random() * gridSize);
  return { row, col };
}

const GRID_SIZE = 5;
const MAX_CHANCES = 5;
const DELAY_MS = 3000;

function createGameRoom(roomId) {
  return {
    id: roomId,
    players: [],
    scores: {},
    reactionTimes: {},
    chances: {},
    litCell: null,
    litTime: null,
    round: 0,
    state: "waiting", // waiting, running, ended
  };
}

function setupSocketGame(io) {
  const rooms = {};

  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ roomId, username }) => {
      if (!rooms[roomId]) {
        rooms[roomId] = createGameRoom(roomId);
      }
      const room = rooms[roomId];
      if (room.players.length >= 2) {
        socket.emit("roomFull");
        return;
      }
      room.players.push({ id: socket.id, username });
      room.scores[socket.id] = 0;
      room.reactionTimes[socket.id] = [];
      room.chances[socket.id] = 0;
      socket.join(roomId);

      io.to(roomId).emit("playersUpdate", {
        players: room.players.map((p) => p.username),
      });

      if (room.players.length === 2) {
        // Start game for both
        room.state = "running";
        room.round = 1;
        setTimeout(() => {
          startNewRound(io, roomId, room);
        }, 1000);
        io.to(roomId).emit("gameStart");
      }
    });

    socket.on("cellClicked", ({ roomId, row, col }) => {
      const room = rooms[roomId];
      if (!room || room.state !== "running" || !room.litCell) return;
      if (row === room.litCell.row && col === room.litCell.col) {
        const reactionTime = Date.now() - room.litTime;
        room.reactionTimes[socket.id].push(reactionTime);
        room.chances[socket.id] += 1;
        io.to(roomId).emit("playerReacted", {
          playerId: socket.id,
          username: room.players.find((p) => p.id === socket.id).username,
          reactionTime,
        });

        // Check if both players have finished this round
        const allReacted = room.players.every(
          (p) => room.reactionTimes[p.id].length === room.round
        );
        if (allReacted) {
          if (room.round >= MAX_CHANCES) {
            room.state = "ended";
            io.to(roomId).emit("gameOver", {
              reactionTimes: room.reactionTimes,
              players: room.players,
            });
          } else {
            room.round += 1;
            setTimeout(() => {
              startNewRound(io, roomId, room);
            }, 1000);
          }
        }
      }
    });

    socket.on("disconnect", () => {
      // Remove player from all rooms
      for (const roomId in rooms) {
        const room = rooms[roomId];
        room.players = room.players.filter((p) => p.id !== socket.id);
        delete room.scores[socket.id];
        delete room.reactionTimes[socket.id];
        delete room.chances[socket.id];
        if (room.players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit("playerLeft");
        }
      }
    });
  });

  function startNewRound(io, roomId, room) {
    room.litCell = getRandomCell(GRID_SIZE);
    room.litTime = Date.now();
    io.to(roomId).emit("newLitCell", {
      litCell: room.litCell,
      round: room.round,
    });
  }
}

module.exports = setupSocketGame;