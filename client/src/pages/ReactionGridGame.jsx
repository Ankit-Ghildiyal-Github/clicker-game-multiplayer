import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const GRID_SIZE = 5;
const MAX_CHANCES = 5;

const socket = io("http://localhost:5000"); // Adjust port as needed

const ReactionGridGame = () => {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [litCell, setLitCell] = useState(null);
  const [myReactionTimes, setMyReactionTimes] = useState([]);
  const [opponentReactionTimes, setOpponentReactionTimes] = useState([]);
  const [round, setRound] = useState(1);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    socket.on("playersUpdate", ({ players }) => {
      setPlayers(players);
    });
    socket.on("gameStart", () => {
      setGameStarted(true);
      setGameEnded(false);
      setMyReactionTimes([]);
      setOpponentReactionTimes([]);
      setRound(1);
    });
    socket.on("newLitCell", ({ litCell, round }) => {
      setLitCell(litCell);
      setRound(round);
    });
    socket.on("playerReacted", ({ playerId, username, reactionTime }) => {
      if (username === players[0]) {
        setMyReactionTimes((prev) => [...prev, reactionTime]);
      } else {
        setOpponentReactionTimes((prev) => [...prev, reactionTime]);
      }
    });
    socket.on("gameOver", ({ reactionTimes, players }) => {
      setGameEnded(true);
      setGameStarted(false);
      setMyReactionTimes(reactionTimes[socket.id] || []);
      setOpponentReactionTimes(
        players
          .filter((p) => p.id !== socket.id)
          .map((p) => reactionTimes[p.id] || [])[0] || []
      );
    });
    socket.on("playerLeft", () => {
      alert("Opponent left the game.");
      setGameStarted(false);
      setGameEnded(true);
    });
    return () => {
      socket.off("playersUpdate");
      socket.off("gameStart");
      socket.off("newLitCell");
      socket.off("playerReacted");
      socket.off("gameOver");
      socket.off("playerLeft");
    };
  }, [players]);

  const handleJoinRoom = () => {
    if (username && roomId) {
      socket.emit("joinRoom", { roomId, username });
      setJoined(true);
    }
  };

  const handleCellClick = (row, col) => {
    if (!gameStarted || gameEnded) return;
    if (litCell && row === litCell.row && col === litCell.col) {
      socket.emit("cellClicked", { roomId, row, col });
      setLitCell(null); // Prevent double click
    }
  };

  // ... Render logic for room join, player list, grid, reaction times, etc.

  return (
    <div>
      {!joined ? (
        <div>
          <input
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <div>
          <div>
            <strong>Players:</strong> {players.join(", ")}
          </div>
          {gameStarted ? (
            <>
              <div>Round: {round} / {MAX_CHANCES}</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`, gap: "8px" }}>
                {Array.from({ length: GRID_SIZE }).map((_, row) =>
                  Array.from({ length: GRID_SIZE }).map((_, col) => {
                    const isLit = litCell && row === litCell.row && col === litCell.col;
                    return (
                      <button
                        key={`${row}-${col}`}
                        onClick={() => handleCellClick(row, col)}
                        style={{
                          width: 60,
                          height: 60,
                          background: isLit ? "yellow" : "#eee",
                          border: "1px solid #ccc",
                          fontSize: "1.2rem",
                          cursor: isLit ? "pointer" : "default",
                          transition: "background 0.2s"
                        }}
                        disabled={!isLit || gameEnded}
                      >
                        {isLit ? "👆" : ""}
                      </button>
                    );
                  })
                )}
              </div>
              <div>
                <strong>Your Reaction Times:</strong> {myReactionTimes.join(", ")}
              </div>
              <div>
                <strong>Opponent Reaction Times:</strong> {opponentReactionTimes.join(", ")}
              </div>
            </>
          ) : gameEnded ? (
            <div>
              <h3>Game Over!</h3>
              <div>
                <strong>Your Reaction Times:</strong> {myReactionTimes.join(", ")}
              </div>
              <div>
                <strong>Opponent Reaction Times:</strong> {opponentReactionTimes.join(", ")}
              </div>
            </div>
          ) : (
            <div>Waiting for another player...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReactionGridGame;