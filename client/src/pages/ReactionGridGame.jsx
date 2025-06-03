import React, { useState, useEffect, useRef } from "react";

const GRID_SIZE = 5;
const MAX_CHANCES = 5;
const DELAY_MS = 3000;

function getRandomCell() {
  const row = Math.floor(Math.random() * GRID_SIZE);
  const col = Math.floor(Math.random() * GRID_SIZE);
  return { row, col };
}

const ReactionGridGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [litCell, setLitCell] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [lastReactionTime, setLastReactionTime] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [chances, setChances] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const countdownIntervalRef = useRef(null);
  const litTimeRef = useRef(Date.now());

  // Light up a new cell after a delay, with countdown
  const lightUpNewCell = () => {
    setWaiting(true);
    setReactionTime(null);
    setLitCell(null); // Hide any lit cell during waiting
    setCountdown(DELAY_MS / 1000);

    // Start countdown interval
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    let secondsLeft = DELAY_MS / 1000;
    setCountdown(secondsLeft);
    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
      }
    }, 1000);

    setTimeout(() => {
      setCountdown(null);
      const newCell = getRandomCell();
      setLitCell(newCell);
      litTimeRef.current = Date.now();
      setWaiting(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }, DELAY_MS);
  };

  // Start the game
  const handleStartGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setLastReactionTime(null);
    setReactionTime(null);
    setWaiting(false);
    setChances(0);
    setReactionTimes([]);
    setLitCell(null); // Hide any lit cell before delay
    lightUpNewCell(); // Delay before first cell
  };

  // Reset to initial state (show Start Game button)
  const handleResetGame = () => {
    setGameStarted(false);
    setGameEnded(false);
    setLitCell(null);
    setReactionTime(null);
    setLastReactionTime(null);
    setWaiting(false);
    setChances(0);
    setReactionTimes([]);
    setCountdown(null);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setGameStarted(false);
      setLitCell(null);
      setReactionTime(null);
      setLastReactionTime(null);
      setWaiting(false);
      setChances(0);
      setReactionTimes([]);
      setGameEnded(false);
      setCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Handler for cell click
  const handleCellClick = (row, col) => {
    if (waiting || gameEnded) return;
    if (row === litCell.row && col === litCell.col) {
      const now = Date.now();
      const rt = now - litTimeRef.current;
      setReactionTime(rt);
      setLastReactionTime(rt);
      setReactionTimes(prev => {
        const updated = [...prev, rt];
        if (updated.length >= MAX_CHANCES) {
          setGameEnded(true);
          setLitCell(null);
        } else {
          setTimeout(() => {
            lightUpNewCell();
          }, 500); // short pause before next round
        }
        return updated;
      });
      setChances(prev => prev + 1);
    }
  };

  return (
    <div>
      <h2>Reaction Grid Game</h2>
      {!gameStarted ? (
        <button
          onClick={handleStartGame}
          style={{
            padding: "12px 32px",
            fontSize: "1.2rem",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Start Game
        </button>
      ) : gameEnded ? (
        <div style={{ marginTop: 20 }}>
          <h3>Game Over!</h3>
          <div>
            <strong>Your Reaction Times:</strong>
            <ol>
              {reactionTimes.map((rt, idx) => (
                <li key={idx}>{rt} ms</li>
              ))}
            </ol>
            <strong>
              Average:{" "}
              {reactionTimes.length > 0
                ? (
                    reactionTimes.reduce((a, b) => a + b, 0) /
                    reactionTimes.length
                  ).toFixed(2)
                : 0}{" "}
              ms
            </strong>
          </div>
          <button
            onClick={handleResetGame}
            style={{
              padding: "10px 24px",
              fontSize: "1rem",
              background: "#2196f3",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "20px"
            }}
          >
            Play Again
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            Chance: {chances + 1} / {MAX_CHANCES}
          </div>
          {waiting && (
            <div
              style={{
                marginTop: 16,
                fontSize: "1.5rem",
                color: "#ff9800",
                background: "#fff3e0",
                border: "1px solid #ff9800",
                borderRadius: "8px",
                padding: "12px 20px",
                display: "inline-block",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(255,152,0,0.08)",
                marginBottom: 16
              }}
            >
              New cell getting Lit in{" "}
              <span style={{ fontSize: "2rem", color: "#e65100" }}>
                {countdown !== null ? countdown : 0}
              </span>{" "}
              second{countdown === 1 ? "" : "s"}
              {lastReactionTime !== null && (
                <div style={{ fontSize: "1rem", color: "#888", marginTop: 8, fontWeight: "normal" }}>
                  <small>Last Reaction Time: {lastReactionTime} ms</small>
                </div>
              )}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`, gap: "8px" }}>
            {Array.from({ length: GRID_SIZE }).map((_, row) =>
              Array.from({ length: GRID_SIZE }).map((_, col) => {
                const isLit = litCell && row === litCell.row && col === litCell.col && !waiting && !gameEnded;
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
                    disabled={waiting || gameEnded}
                  >
                    {isLit ? "👆" : ""}
                  </button>
                );
              })
            )}
          </div>
          <div style={{ marginTop: 20 }}>
            {reactionTime !== null && (
              <div>
                <strong>Reaction Time:</strong> {reactionTime} ms
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReactionGridGame;
