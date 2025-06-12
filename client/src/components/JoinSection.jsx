/**
 * JoinSection.jsx
 * 
 * This component handles all user input and actions for joining a room,
 * finding a random match, or starting a solo game. It is designed to be
 * modular and reusable, receiving all necessary state and handlers as props.
 * 
 * Props:
 * - username: string
 * - roomId: string
 * - setRoomId: function
 * - joined: boolean
 * - isRandomMatching: boolean
 * - waitingMsg: string
 * - onJoinRoom: function
 * - onFindRandomMatch: function
 * - onStartSolo: function
 */

import React, { useEffect, useState } from "react";

// --- Styles ---
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 32,
    marginTop: 40,
    flexWrap: "wrap",
  },
  leaderboardCard: {
    minWidth: 260,
    maxWidth: 300,
    padding: "24px 18px",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    marginBottom: 16,
  },
  leaderboardHeading: {
    fontSize: 20,
    fontWeight: 700,
    color: "#2a3a4d",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: "0.5px",
  },
  leaderboardList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  leaderboardItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 15,
    color: "#333",
  },
  leaderboardRank: {
    fontWeight: 600,
    color: "#4f8cff",
    marginRight: 8,
    minWidth: 22,
    textAlign: "right",
  },
  leaderboardName: {
    flex: 1,
    fontWeight: 500,
    color: "#222",
    marginLeft: 4,
    marginRight: 8,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  leaderboardTime: {
    fontFamily: "monospace",
    color: "#6edb8f",
    fontWeight: 600,
    minWidth: 60,
    textAlign: "right",
  },
  card: {
    maxWidth: 400,
    minWidth: 320,
    margin: "0 auto",
    padding: "32px 24px",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 8,
    color: "#222",
    textAlign: "center",
    letterSpacing: "0.5px",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    outline: "none",
    transition: "border-color 0.2s",
    marginBottom: 8,
  },
  inputDisabled: {
    background: "#f5f5f5",
    color: "#aaa",
    borderColor: "#eee",
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  button: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    border: "none",
    fontWeight: 600,
    fontSize: 16,
    background: "linear-gradient(90deg, #4f8cff 0%, #6edb8f 100%)",
    color: "#fff",
    cursor: "pointer",
    transition: "background 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 8px rgba(79,140,255,0.08)",
  },
  buttonDisabled: {
    background: "#e0e0e0",
    color: "#aaa",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  or: {
    color: "#aaa",
    fontWeight: 500,
    margin: "0 6px",
    fontSize: 14,
  },
  waitingMsg: {
    marginTop: 16,
    color: "#888",
    textAlign: "center",
    fontSize: 15,
    fontStyle: "italic",
  },
  leaderboardEmpty: {
    color: "#aaa",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 12,
    fontSize: 15,
  },
  usernameDisplay: {
    fontSize: 18,
    fontWeight: 500,
    color: "#2a3a4d",
    background: "#f5f7fa",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 8,
    border: "1px solid #eee",
    textAlign: "left",
    letterSpacing: "0.2px",
  },
};

// --- Leaderboard Component ---
function BestScoresLeaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch("/api/best-scores")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setScores(data.bestScores || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setScores([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={styles.leaderboardCard}>
      <div style={styles.leaderboardHeading}>🏆 Best Reaction Times</div>
      {loading ? (
        <div style={styles.leaderboardEmpty}>Loading...</div>
      ) : scores.length === 0 ? (
        <div style={styles.leaderboardEmpty}>No scores yet</div>
      ) : (
        <ol style={styles.leaderboardList}>
          {scores.map((score, idx) => (
            <li key={score.id || idx} style={styles.leaderboardItem}>
              <span style={styles.leaderboardRank}>{idx + 1}.</span>
              <span style={styles.leaderboardName}>
                {score.email.length > 16
                  ? score.email.slice(0, 13) + "..."
                  : score.email}
              </span>
              <span style={styles.leaderboardTime}>
                {Number(score.average_time).toFixed(2)} ms
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// --- Main JoinSection ---
const JoinSection = ({
  username,
  roomId,
  setRoomId,
  joined,
  isRandomMatching,
  waitingMsg,
  onJoinRoom,
  onFindRandomMatch,
  onStartSolo,
}) => {
  // Username is now display-only, not editable

  return (
    <div style={styles.container}>
      <BestScoresLeaderboard />
      <div style={styles.card}>
        <div style={styles.heading}>Join a Game</div>
        <div>
          <div style={styles.label}>Your Name</div>
          <div style={styles.usernameDisplay}>{username}</div>
        </div>
        <div>
          <div style={styles.label}>Room ID</div>
          <input
            style={{
              ...styles.input,
              ...(joined || isRandomMatching ? styles.inputDisabled : {}),
            }}
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            disabled={joined || isRandomMatching}
          />
        </div>
        <div style={styles.buttonRow}>
          <button
            style={{
              ...styles.button,
              ...((!username || !roomId || joined || isRandomMatching)
                ? styles.buttonDisabled
                : {}),
            }}
            onClick={onJoinRoom}
            disabled={!username || !roomId || joined || isRandomMatching}
          >
            Join Room
          </button>
          <span style={styles.or}>or</span>
          <button
            style={{
              ...styles.button,
              ...((!username || joined || isRandomMatching)
                ? styles.buttonDisabled
                : {}),
            }}
            onClick={onFindRandomMatch}
            disabled={!username || joined || isRandomMatching}
          >
            Random Match
          </button>
          <span style={styles.or}>or</span>
          <button
            style={{
              ...styles.button,
              ...((!username || joined || isRandomMatching)
                ? styles.buttonDisabled
                : {}),
            }}
            onClick={onStartSolo}
            disabled={!username || joined || isRandomMatching}
          >
            Solo
          </button>
        </div>
        {waitingMsg && <div style={styles.waitingMsg}>{waitingMsg}</div>}
      </div>
    </div>
  );
};

export default JoinSection;