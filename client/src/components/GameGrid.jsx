/**
 * GameGrid.jsx
 *
 * Modular component for rendering the clickable reaction grid.
 * Receives all necessary state and handlers as props for maximum reusability.
 *
 * Props:
 * - gridSize: number (number of rows/columns)
 * - litCell: { row: number, col: number } | null (currently lit cell)
 * - onCellClick: function (row, col)
 * - gameEnded: boolean (to disable grid when game is over)
 */
import React from "react";

const GameGrid = ({ gridSize, litCell, onCellClick, gameEnded }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 60px)`, gap: "8px" }}>
    {Array.from({ length: gridSize }).map((_, row) =>
      Array.from({ length: gridSize }).map((_, col) => {
        const isLit = litCell && row === litCell.row && col === litCell.col;
        return (
          <button
            key={`${row}-${col}`}
            onClick={() => onCellClick(row, col)}
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
);

export default GameGrid;