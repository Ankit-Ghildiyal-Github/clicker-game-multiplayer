/**
 * ReactionGridGame.jsx
 *
 * Main game logic and state orchestration for the Reaction Grid Game.
 * This version uses the custom useMultiplayerSocket hook for multiplayer socket logic.
 * UI is modularized into JoinSection, GameGrid, and GameOverPanel.
 * 
 * Updated: Calls /api/best-scores/insert in solo mode when the average is calculated.
 */

import React, { useState, useEffect, useRef } from "react";
import JoinSection from "../components/JoinSection";
import GameGrid from "../components/GameGrid";
import GameOverPanel from "../components/GameOverPanel";
import useMultiplayerSocket from "../hooks/useMultiplayerSocket";

const GRID_SIZE = 5;
const MAX_CHANCES = 5;

const SOLO_MODE = "solo";
const MULTI_ROOM_MODE = "room";
const MULTI_RANDOM_MODE = "random";

const ReactionGridGame = ({ initialUsername }) => {
  // Core game state
  const [username, setUsername] = useState(initialUsername || "");
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [litCell, setLitCell] = useState(null);
  const [myReactionTimes, setMyReactionTimes] = useState([]);
  const [opponentReactionTimes, setOpponentReactionTimes] = useState([]);
  const [round, setRound] = useState(1);
  const [gameEnded, setGameEnded] = useState(false);

  // Game mode state
  const [gameMode, setGameMode] = useState(null);

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

  // --- SOLO MODE state ---
  const [soloLitTimeout, setSoloLitTimeout] = useState(null);
  const soloStartTimeRef = useRef(null);

  // --- Multiplayer socket logic via custom hook ---
  const socket = useMultiplayerSocket({
    enabled: gameMode !== SOLO_MODE,
    resetKey,
    setPlayers,
    setGameStarted,
    setGameEnded,
    setMyReactionTimes,
    setOpponentReactionTimes,
    setRound,
    setLitCell, // <-- Pass setLitCell to the hook
    setWaitingMsg,
    setWinner,
    setMyAvg,
    setOpponentAvg,
    setMatchedRoomId,
    setRoomId,
    setJoined,
    setIsRandomMatching,
  });

  // Autofill username if initialUsername changes (e.g., on prop update)
  useEffect(() => {
    if (initialUsername && !username) {
      setUsername(initialUsername);
    }
    // Only run on mount or if initialUsername changes
    // eslint-disable-next-line
  }, [initialUsername]);

  // --- SOLO MODE logic ---
  useEffect(() => {
    if (gameMode === SOLO_MODE && gameStarted && !gameEnded) {
      // Start the round: after a random delay, light a cell
      if (round <= MAX_CHANCES) {
        const delay = 700 + Math.random() * 1300; // 700ms to 2000ms
        const timeout = setTimeout(() => {
          // Pick a random cell
          const row = Math.floor(Math.random() * GRID_SIZE);
          const col = Math.floor(Math.random() * GRID_SIZE);
          setLitCell({ row, col });
          soloStartTimeRef.current = Date.now();
        }, delay);
        setSoloLitTimeout(timeout);
      }
    }
    return () => {
      if (soloLitTimeout) clearTimeout(soloLitTimeout);
    };
    // eslint-disable-next-line
  }, [gameMode, gameStarted, round, resetKey]);

  // --- Insert best score in solo mode when game ends and average is calculated ---
  useEffect(() => {
    // Only trigger if in solo mode, game ended, and myAvg is a valid number
    if (
      gameMode === SOLO_MODE &&
      gameEnded &&
      typeof myAvg === "number" &&
      username
    ) {
      // Call the /api/best-scores/insert API
      const insertBestScore = async () => {
        try {
          const response = await fetch("/api/best-scores/insert", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: username,
              average_time: myAvg,
            }),
          });
          // Optionally, you can handle the response here (e.g., show a toast)
          // const data = await response.json();
          // console.log(data.message);
        } catch (err) {
          // Optionally, handle error (e.g., show a toast)
          // console.error("Failed to insert best score:", err);
        }
      };
      insertBestScore();
    }
    // Only run when these change
    // eslint-disable-next-line
  }, [gameMode, gameEnded, myAvg, username]);

  // --- Handlers ---
  const handleJoinRoom = () => {
    if (username && roomId) {
      setGameMode(MULTI_ROOM_MODE);
      socket.emit("joinRoom", { roomId, username });
      setJoined(true);
      setIsRandomMatching(false);
      setWaitingMsg("");
    }
  };

  const handleFindRandomMatch = () => {
    if (username) {
      setGameMode(MULTI_RANDOM_MODE);
      socket.emit("findRandomMatch", { username });
      setIsRandomMatching(true);
      setJoined(false);
      setWaitingMsg("Looking for a random player...");
      setRoomId("");
      setMatchedRoomId(null);
    }
  };

  const handleStartSolo = () => {
    setGameMode(SOLO_MODE);
    setGameStarted(true);
    setGameEnded(false);
    setMyReactionTimes([]);
    setOpponentReactionTimes([]);
    setRound(1);
    setLitCell(null);
    setWinner(null);
    setMyAvg(null);
    setOpponentAvg(null);
    setJoined(true);
    setWaitingMsg("");
  };

  const handleCellClick = (row, col) => {
    if (gameEnded) return;

    if (gameMode === SOLO_MODE) {
      if (litCell && row === litCell.row && col === litCell.col) {
        const reactionTime = Date.now() - soloStartTimeRef.current;
        setMyReactionTimes((prev) => [...prev, reactionTime]);
        setLitCell(null);
        if (round < MAX_CHANCES) {
          setRound((prev) => prev + 1);
        } else {
          // Game over in solo mode
          setGameEnded(true);
          setGameStarted(false);
          const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
          const myAvgVal = avg([...myReactionTimes, reactionTime]);
          setMyAvg(myAvgVal);
        }
      }
    } else {
      if (!gameStarted || gameEnded) return;
      if (litCell && row === litCell.row && col === litCell.col) {
        const activeRoomId = matchedRoomId || roomId;
        socket.emit("cellClicked", { roomId: activeRoomId, row, col });
        setLitCell(null);
      }
    }
  };

  const handlePlayAgain = () => {
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
    setGameMode(null);
    setResetKey(prev => prev + 1);
  };

  return (
    <div>
      {/* Use the modular JoinSection component for all join/start UI */}
      {!joined && !isRandomMatching ? (
        <JoinSection
          username={username}
          setUsername={setUsername}
          roomId={roomId}
          setRoomId={setRoomId}
          joined={joined}
          isRandomMatching={isRandomMatching}
          waitingMsg={waitingMsg}
          onJoinRoom={handleJoinRoom}
          onFindRandomMatch={handleFindRandomMatch}
          onStartSolo={handleStartSolo}
        />
      ) : (
        <div>
          {gameMode !== SOLO_MODE && (
            <div>
              <strong>Players:</strong> {players.join(", ")}
            </div>
          )}
          {gameStarted ? (
            <>
              <div>Round: {round} / {MAX_CHANCES}</div>
              {/* Use the modular GameGrid component */}
              <GameGrid
                gridSize={GRID_SIZE}
                litCell={litCell}
                onCellClick={handleCellClick}
                gameEnded={gameEnded}
              />
              <div>
                <strong>Your Reaction Times:</strong> {myReactionTimes.join(", ")}
              </div>
              {gameMode !== SOLO_MODE && (
                <div>
                  <strong>Opponent Reaction Times:</strong> {opponentReactionTimes.join(", ")}
                </div>
              )}
            </>
          ) : gameEnded ? (
            <GameOverPanel
              mode={gameMode}
              myReactionTimes={myReactionTimes}
              opponentReactionTimes={opponentReactionTimes}
              myAvg={myAvg}
              opponentAvg={opponentAvg}
              winner={winner}
              onPlayAgain={handlePlayAgain}
            />
          ) : (
            <div>
              {waitingMsg ? (
                <div style={{ marginTop: 10, color: "#888" }}>{waitingMsg}</div>
              ) : (
                <div>
                  {gameMode === SOLO_MODE
                    ? "Get ready for your next round..."
                    : "Waiting for another player..."}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReactionGridGame;