/**
 * GameOverPanel.jsx
 *
 * Modular component for displaying game over/results UI.
 * Handles both solo and multiplayer modes.
 *
 * Props:
 * - mode: "solo" | "room" | "random"
 * - myReactionTimes: array of numbers
 * - opponentReactionTimes: array of numbers (optional, multiplayer only)
 * - myAvg: number | null
 * - opponentAvg: number | null (optional, multiplayer only)
 * - winner: "me" | "opponent" | "draw" | null (optional, multiplayer only)
 * - onPlayAgain: function
 */
import React from "react";

const GameOverPanel = ({
  mode,
  myReactionTimes,
  opponentReactionTimes,
  myAvg,
  opponentAvg,
  winner,
  onPlayAgain
}) => {
  return (
    <div>
      <h3>Game Over!</h3>
      <div>
        <strong>Your Reaction Times:</strong> {myReactionTimes.join(", ")}
      </div>
      <div>
        <strong>Your Average:</strong> {myAvg !== null ? myAvg.toFixed(2) + " ms" : "N/A"}
      </div>
      {mode !== "solo" && (
        <>
          <div>
            <strong>Opponent Reaction Times:</strong> {opponentReactionTimes.join(", ")}
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
        </>
      )}
      <button style={{ marginTop: 20 }} onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
};

export default GameOverPanel;