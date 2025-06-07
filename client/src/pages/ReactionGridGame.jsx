import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const GRID_SIZE = 5;
const MAX_CHANCES = 5;

const socket = io("http://localhost:5000"); // Adjust port as needed

const ReactionGridGame = () => {
  // Core game state
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

  // Random matchmaking state
  const [isRandomMatching, setIsRandomMatching] = useState(false);
  const [matchedRoomId, setMatchedRoomId] = useState(null);
  const [waitingMsg, setWaitingMsg] = useState("");

  // Winner state
  const [winner, setWinner] = useState(null);
  const [myAvg, setMyAvg] = useState(null);
  const [opponentAvg, setOpponentAvg] = useState(null);

  // Used to force a full reset of all state on Play Again
  const [resetKey, setResetKey] = useState(0);

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
      setWaitingMsg("");
      setWinner(null);
      setMyAvg(null);
      setOpponentAvg(null);
    });

    socket.on("newLitCell", ({ litCell, round }) => {
      setLitCell(litCell);
      setRound(round);
    });

    socket.on("playerReacted", ({ playerId, username: reactedUsername, reactionTime }) => {
      if (playerId === socket.id) {
        setMyReactionTimes((prev) => [...prev, reactionTime]);
      } else {
        setOpponentReactionTimes((prev) => [...prev, reactionTime]);
      }
    });

    socket.on("gameOver", ({ reactionTimes, players: serverPlayers }) => {
      setGameEnded(true);
      setGameStarted(false);

      // Find my and opponent's id
      const myId = socket.id;
      const opponent = serverPlayers.find((p) => p.id !== myId);
      const myTimes = reactionTimes[myId] || [];
      const opponentTimes = opponent ? reactionTimes[opponent.id] || [] : [];

      setMyReactionTimes(myTimes);
      setOpponentReactionTimes(opponentTimes);

      // Calculate averages
      const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      const myAvgVal = avg(myTimes);
      const opponentAvgVal = avg(opponentTimes);

      setMyAvg(myAvgVal);
      setOpponentAvg(opponentAvgVal);

      // Determine winner
      if (myAvgVal !== null && opponentAvgVal !== null) {
        if (myAvgVal < opponentAvgVal) {
          setWinner("me");
        } else if (myAvgVal > opponentAvgVal) {
          setWinner("opponent");
        } else {
          setWinner("draw");
        }
      } else {
        setWinner(null);
      }
    });

    socket.on("playerLeft", () => {
      alert("Opponent left the game.");
      setGameStarted(false);
      setGameEnded(true);
      setWaitingMsg("");
      setWinner(null);
      setMyAvg(null);
      setOpponentAvg(null);
    });

    socket.on("waitingForMatch", () => {
      setIsRandomMatching(true);
      setWaitingMsg("Waiting for another player to join...");
    });

    socket.on("matched", ({ roomId, players: matchedPlayers }) => {
      setMatchedRoomId(roomId);
      setRoomId(roomId);
      setPlayers(matchedPlayers);
      setJoined(true);
      setIsRandomMatching(false);
      setWaitingMsg("");
    });

    return () => {
      socket.off("playersUpdate");
      socket.off("gameStart");
      socket.off("newLitCell");
      socket.off("playerReacted");
      socket.off("gameOver");
      socket.off("playerLeft");
      socket.off("waitingForMatch");
      socket.off("matched");
    };
  // eslint-disable-next-line
  }, [players, resetKey]);

  const handleJoinRoom = () => {
    if (username && roomId) {
      socket.emit("joinRoom", { roomId, username });
      setJoined(true);
      setIsRandomMatching(false);
      setWaitingMsg("");
    }
  };

  const handleFindRandomMatch = () => {
    if (username) {
      socket.emit("findRandomMatch", { username });
      setIsRandomMatching(true);
      setJoined(false);
      setWaitingMsg("Looking for a random player...");
      setRoomId("");
      setMatchedRoomId(null);
    }
  };

  const handleCellClick = (row, col) => {
    if (!gameStarted || gameEnded) return;
    if (litCell && row === litCell.row && col === litCell.col) {
      const activeRoomId = matchedRoomId || roomId;
      socket.emit("cellClicked", { roomId: activeRoomId, row, col });
      setLitCell(null);
    }
  };

  const handlePlayAgain = () => {
    // Reset all state to initial values and increment resetKey to force useEffect to re-run
    setUsername("");
    setRoomId("");
    setJoined(false);
    setPlayers([]);
    setGameStarted(false);
    setLitCell(null);
    setMyReactionTimes([]);
    setOpponentReactionTimes([]);
    setRound(1);
    setGameEnded(false);
    setIsRandomMatching(false);
    setMatchedRoomId(null);
    setWaitingMsg("");
    setWinner(null);
    setMyAvg(null);
    setOpponentAvg(null);
    setResetKey(prev => prev + 1);
  };

  const renderJoinSection = () => (
    <div>
      <input
        placeholder="Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={joined || isRandomMatching}
      />
      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        disabled={joined || isRandomMatching}
      />
      <button onClick={handleJoinRoom} disabled={!username || !roomId || joined || isRandomMatching}>
        Join Room
      </button>
      <span style={{ margin: "0 10px" }}>or</span>
      <button onClick={handleFindRandomMatch} disabled={!username || joined || isRandomMatching}>
        Find Random Match
      </button>
      {waitingMsg && <div style={{ marginTop: 10, color: "#888" }}>{waitingMsg}</div>}
    </div>
  );

  const renderGameOver = () => (
    <div>
      <h3>Game Over!</h3>
      <div>
        <strong>Your Reaction Times:</strong> {myReactionTimes.join(", ")}
      </div>
      <div>
        <strong>Opponent Reaction Times:</strong> {opponentReactionTimes.join(", ")}
      </div>
      <div>
        <strong>Your Average:</strong> {myAvg !== null ? myAvg.toFixed(2) + " ms" : "N/A"}
      </div>
      <div>
        <strong>Opponent Average:</strong> {opponentAvg !== null ? opponentAvg.toFixed(2) + " ms" : "N/A"}
      </div>
      <div style={{ marginTop: 10, fontWeight: "bold", fontSize: "1.2em" }}>
        {winner === "me" && "🎉 You won!"}
        {winner === "opponent" && "😢 You lost!"}
        {winner === "draw" && "🤝 It's a draw!"}
        {winner === null && ""}
      </div>
      <button style={{ marginTop: 20 }} onClick={handlePlayAgain}>
        Play Again
      </button>
    </div>
  );

  return (
    <div>
      {!joined && !isRandomMatching ? (
        renderJoinSection()
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
            renderGameOver()
          ) : (
            <div>
              {waitingMsg ? (
                <div style={{ marginTop: 10, color: "#888" }}>{waitingMsg}</div>
              ) : (
                <div>Waiting for another player...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReactionGridGame;