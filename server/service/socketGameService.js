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

// --- Helper function to calculate averages and winner/loser ---
function calculateAveragesAndWinner(room) {
  const result = {
    averages: {},
    winnerLoserMap: {},
    reactionTimes: {},
  };

  // Calculate averages
  room.players.forEach((player) => {
    const times = room.reactionTimes[player.id];
    if (times && times.length === MAX_CHANCES) {
      const sum = times.reduce((a, b) => a + b, 0);
      result.averages[player.id] = sum / times.length;
      result.reactionTimes[player.id] = times;
    } else {
      result.averages[player.id] = null;
      result.reactionTimes[player.id] = times || null;
    }
  });

  // Determine winner/loser (draw if equal or missing)
  const [p1, p2] = room.players;
  let winnerId = null,
    loserId = null;
  if (p1 && p2) {
    const avg1 = result.averages[p1.id];
    const avg2 = result.averages[p2.id];
    if (avg1 !== null && avg2 !== null) {
      if (avg1 < avg2) {
        winnerId = p1.id;
        loserId = p2.id;
      } else if (avg2 < avg1) {
        winnerId = p2.id;
        loserId = p1.id;
      } else {
        // Draw
        winnerId = null;
        loserId = null;
      }
    }
  }
  result.winnerLoserMap = {
    winner: winnerId,
    loser: loserId,
  };
  return result;
}

function setupSocketGame(io) {
  const rooms = {};
  const waitingQueue = []; // For random matchmaking
  const socketToRoom = {}; // New: Map socket.id -> roomId

  io.on("connection", (socket) => {
    // --- RANDOM MATCHMAKING ---
    socket.on("findRandomMatch", ({ username }) => {
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
        const roomId =
          "room_" + Date.now() + "_" + Math.floor(Math.random() * 10000);

        rooms[roomId] = createGameRoom(roomId);
        const room = rooms[roomId];

        // Add both players to the room
        [player1, player2].forEach((player) => {
          room.players.push({
            id: player.socket.id,
            username: player.username,
          });
          room.scores[player.socket.id] = 0;
          room.reactionTimes[player.socket.id] = [];
          room.chances[player.socket.id] = 0;
          player.socket.join(roomId);
          socketToRoom[player.socket.id] = roomId; // <-- Map socket.id to roomId
        });

        // Notify both players of the match and room assignment
        io.to(roomId).emit("matched", {
          roomId,
          players: room.players.map((p) => p.username),
        });

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
      console.log(
        `Player Pushed: SocketId ${socket.id}, Username ${username}, Room ${roomId}`
      );
      room.scores[socket.id] = 0;
      room.reactionTimes[socket.id] = [];
      room.chances[socket.id] = 0;
      socket.join(roomId);
      socketToRoom[socket.id] = roomId; // <-- Map socket.id to roomId

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

            // --- NEW LOGIC: Calculate averages and winner/loser ---
            const { averages, winnerLoserMap, reactionTimes } =
              calculateAveragesAndWinner(room);

            io.to(roomId).emit("gameOver", {
              reactionTimes,
              averages,
              players: room.players,
              winnerLoserMap,
            });

            // --- INSERT BEST SCORES LOGIC HERE ---
            // For each player, calculate average reaction time and try to insert into best scores
            room.players.forEach(async (player) => {
              const avg = averages[player.id];
              if (avg !== null) {
                // Use username as email if you don't have email, or adapt as needed
                try {
                  await bestScoresModel.tryInsertBestScore(
                    player.username,
                    avg
                  );
                } catch (err) {
                  console.error(
                    "Error inserting best score for",
                    player.username,
                    err
                  );
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

    socket.on("leaveRoom", () => {
      const roomId = socketToRoom[socket.id];
      if (roomId) {
        socket.leave(roomId);
        delete rooms[roomId];
        delete socketToRoom[socket.id];
        console.log("Room Deleted : ", roomId);
        // Optionally: remove player from room object, clean up if empty, etc.
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      // 1. Get the room id using the socketToRoom map.
      const roomId = socketToRoom[socket.id];
      if (roomId && rooms[roomId]) {
        const room = rooms[roomId];

        // Find the disconnected player and the remaining player
        const disconnectedPlayer = room.players.find((p) => p.id === socket.id);
        const remainingPlayer = room.players.find((p) => p.id !== socket.id);

        // 2. Remove the player with the disconnected socket id.
        room.players = room.players.filter((p) => p.id !== socket.id);
        delete room.scores[socket.id];
        delete room.reactionTimes[socket.id];
        delete room.chances[socket.id];

        // 3. Send playerLeft event to the other player in the same room.
        if (room.players.length === 1 && remainingPlayer) {
          io.to(roomId).emit("playerLeft", {
            leftPlayerId: socket.id,
            leftPlayerUsername: disconnectedPlayer
              ? disconnectedPlayer.username
              : null,
            winnerId: remainingPlayer.id,
            winnerUsername: remainingPlayer.username,
          });

          // --- NEW LOGIC: Send gameOver with winner/loser and nulls for disconnected ---
          const winnerId = remainingPlayer.id;
          const loserId = socket.id;
          const reactionTimes = {};
          const averages = {};
          reactionTimes[winnerId] = room.reactionTimes[winnerId] || [];
          reactionTimes[loserId] = null;
          averages[winnerId] =
            reactionTimes[winnerId].length === MAX_CHANCES
              ? reactionTimes[winnerId].reduce((a, b) => a + b, 0) /
                reactionTimes[winnerId].length
              : null;
          averages[loserId] = null;

          io.to(roomId).emit("gameOver", {
            reactionTimes,
            averages,
            players: [remainingPlayer, disconnectedPlayer],
            winnerLoserMap: {
              winner: winnerId,
              loser: loserId,
              reason: "opponent_disconnected",
            },
          });

          // 5. Delete the room.
          delete rooms[roomId];

          // 6. Delete the socket to room mappings for both the players in the room.
          delete socketToRoom[socket.id];
          delete socketToRoom[remainingPlayer.id];
        } else if (room.players.length === 0) {
          // If no players left, just clean up
          delete rooms[roomId];
          delete socketToRoom[socket.id];
        } else {
          // More than 2 players (shouldn't happen in this game), just remove mapping for this socket
          delete socketToRoom[socket.id];
        }
      } else {
        // If not in a room, just remove from waiting queue and mapping
        const idx = waitingQueue.findIndex(
          (entry) => entry.socket.id === socket.id
        );
        if (idx !== -1) {
          waitingQueue.splice(idx, 1);
        }
        if (socketToRoom[socket.id]) {
          delete socketToRoom[socket.id];
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
