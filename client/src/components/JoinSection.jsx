import React from "react";
import styles from "../styles/JoinSectionStyles";

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