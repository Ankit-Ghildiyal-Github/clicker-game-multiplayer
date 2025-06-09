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
}) => (
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
    <button onClick={onJoinRoom} disabled={!username || !roomId || joined || isRandomMatching}>
      Join Room
    </button>
    <span style={{ margin: "0 10px" }}>or</span>
    <button onClick={onFindRandomMatch} disabled={!username || joined || isRandomMatching}>
      Find Random Match
    </button>
    <span style={{ margin: "0 10px" }}>or</span>
    <button onClick={onStartSolo} disabled={!username || joined || isRandomMatching}>
      Play Solo
    </button>
    {waitingMsg && <div style={{ marginTop: 10, color: "#888" }}>{waitingMsg}</div>}
  </div>
);

export default JoinSection;