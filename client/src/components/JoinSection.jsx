/**
 * JoinSection.jsx
 * 
 * This component handles all user input and actions for joining a room,
 * finding a random match, or starting a solo game. It is designed to be
 * modular and reusable, receiving all necessary state and handlers as props.
 * 
 * Props:
 * - username: string
 * - setUsername: function
 * - roomId: string
 * - setRoomId: function
 * - joined: boolean
 * - isRandomMatching: boolean
 * - waitingMsg: string
 * - onJoinRoom: function
 * - onFindRandomMatch: function
 * - onStartSolo: function
 */

import React from "react";

const styles = {
  card: {
    maxWidth: 400,
    margin: "40px auto",
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
};

const JoinSection = ({
  username,
  setUsername,
  roomId,
  setRoomId,
  joined,
  isRandomMatching,
  waitingMsg,
  onJoinRoom,
  onFindRandomMatch,
  onStartSolo
}) => {
  // Only use the username prop and setUsername for input control
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  return (
    <div style={styles.card}>
      <div style={styles.heading}>Join a Game</div>
      <div>
        <div style={styles.label}>Your Name</div>
        <input
          style={{
            ...styles.input,
            ...(joined || isRandomMatching ? styles.inputDisabled : {}),
          }}
          placeholder="Enter your name"
          value={username}
          onChange={handleUsernameChange}
          disabled={joined || isRandomMatching}
          autoFocus
        />
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
            ...((!username || !roomId || joined || isRandomMatching) ? styles.buttonDisabled : {}),
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
            ...((!username || joined || isRandomMatching) ? styles.buttonDisabled : {}),
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
            ...((!username || joined || isRandomMatching) ? styles.buttonDisabled : {}),
          }}
          onClick={onStartSolo}
          disabled={!username || joined || isRandomMatching}
        >
          Solo
        </button>
      </div>
      {waitingMsg && <div style={styles.waitingMsg}>{waitingMsg}</div>}
    </div>
  );
};

export default JoinSection;