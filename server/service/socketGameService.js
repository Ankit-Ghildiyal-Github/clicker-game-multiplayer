const { Server } = require("socket.io");
// If you want to use uuid for unique room ids, uncomment the next line and install uuid package
// const { v4: uuidv4 } = require("uuid");

const bestScoresModel = require("../models/bestScores.model.js"); // <-- Added import

const GRID_SIZE = 5;
const MAX_CHANCES = 5;

function getRandomCell(gridSize) {
  const row = Math.floor(Math.random() * gridSize);
  const col = Math.floor(Math.random() * gridSize);
  return { row, col };
}

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
  const waitingQueue = []; // For random matchmaking

  io.on("connection", (socket) => {
    // --- RANDOM MATCHMAKING ---
    socket.on("findRandomMatch", ({ username }) => {
      console.log("Waiting queue : ", waitingQueue);
      // Check if already in queue
      if (waitingQueue.find((entry) => entry.socket.id === socket.id)) {
        return;
      }
      console.log(username, " pushed in waiting queue");
      waitingQueue.push({ socket, username });

      if (waitingQueue.length >= 2) {
        // Match two players
        const player1 = waitingQueue.shift();
        const player2 = waitingQueue.shift();

        // Generate a unique roomId (use uuid or timestamp)
        // const roomId = uuidv4();
        const roomId = "room_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

        rooms[roomId] = createGameRoom(roomId);
        const room = rooms[roomId];

        // Add both players to the room
        [player1, player2].forEach((player) => {
          room.players.push({ id: player.socket.id, username: player.username });
          room.scores[player.socket.id] = 0;
          room.reactionTimes[player.socket.id] = [];
          room.chances[player.socket.id] = 0;
          player.socket.join(roomId);
        });

        // Notify both players of the match and room assignment
        io.to(roomId).emit("matched", { roomId, players: room.players.map((p) => p.username) });

        // Start the game
        room.state = "running";
        room.round = 1;
        setTimeout(() => {
          startNewRound(io, roomId, room);
        }, 1000);
        io.to(roomId).emit("gameStart");
      } else {
        // Notify the user they're waiting for a match
        socket.emit("waitingForMatch");
      }
    });

    // --- JOIN BY ROOM ID ---
    socket.on("joinRoom", ({ roomId, username }) => {
      // Ensure the room exists
      if (!rooms[roomId]) {
        rooms[roomId] = createGameRoom(roomId);
      }
      const room = rooms[roomId];

      // Prevent duplicate joins by the same socket
      if (room.players.find((p) => p.id === socket.id)) {
        socket.emit("alreadyInRoom");
        return;
      }

      // Atomically check and add player if room is not full
      if (room.players.length >= 2) {
        socket.emit("roomAlreadyFilled");
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

            // --- INSERT BEST SCORES LOGIC HERE ---
            // For each player, calculate average reaction time and try to insert into best scores
            room.players.forEach(async (player) => {
              const times = room.reactionTimes[player.id];
              if (times && times.length === MAX_CHANCES) {
                const sum = times.reduce((a, b) => a + b, 0);
                const avg = sum / times.length;
                // Use username as email if you don't have email, or adapt as needed
                try {
                  await bestScoresModel.tryInsertBestScore(player.username, avg);
                } catch (err) {
                  console.error("Error inserting best score for", player.username, err);
                }
              }
            });
            // --- END BEST SCORES LOGIC ---
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
      // Remove from waiting queue if present
      const idx = waitingQueue.findIndex((entry) => entry.socket.id === socket.id);
      if (idx !== -1) {
        waitingQueue.splice(idx, 1);
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