/**
 * useMultiplayerSocket.js
 *
 * Custom React hook to encapsulate all multiplayer socket.io logic for the Reaction Grid Game.
 * Now also updates the litCell state in the main component when the server emits newLitCell.
 * Handles roomAlreadyFilled event and exposes error message setter.
 */

import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(
  `${window.location.protocol}//${window.location.hostname}:5000`
);

function leaveRoom() {
  if (socket && socket.connected) {
    socket.emit("leaveRoom");
  }
}

export default function useMultiplayerSocket({
  enabled,
  resetKey,
  setPlayers,
  setGameStarted,
  setGameEnded,
  setMyReactionTimes,
  setOpponentReactionTimes,
  setRound,
  setLitCell,
  setWaitingMsg,
  setWinner,
  setMyAvg,
  setOpponentAvg,
  setMatchedRoomId,
  setRoomId,
  setJoined,
  setIsRandomMatching,
  setErrorMsg, // <-- Added for error handling
}) {
  useEffect(() => {
    if (!enabled) return;

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
      setLitCell(null); // Reset litCell at game start
    });

    socket.on("newLitCell", ({ litCell, round }) => {
      setRound(round);
      setLitCell(litCell);
    });

    socket.on("playerReacted", ({ playerId, reactionTime }) => {
      if (playerId === socket.id) {
        setMyReactionTimes((prev) => [...prev, reactionTime]);
      } else {
        setOpponentReactionTimes((prev) => [...prev, reactionTime]);
      }
    });

    // --- UPDATED GAME OVER HANDLER ---
    socket.on("gameOver", ({ reactionTimes, averages, players: serverPlayers, winnerLoserMap }) => {
      setGameEnded(true);
      setGameStarted(false);

      const myId = socket.id;
      let opponent = null;
      let myTimes = [];
      let opponentTimes = [];
      let myAvgVal = null;
      let opponentAvgVal = null;

      if (serverPlayers && Array.isArray(serverPlayers)) {
        opponent = serverPlayers.find((p) => p.id !== myId);
        myTimes = reactionTimes?.[myId] ?? [];
        opponentTimes = opponent ? reactionTimes?.[opponent.id] ?? [] : [];
        myAvgVal = averages?.[myId] ?? null;
        opponentAvgVal = opponent ? averages?.[opponent.id] ?? null : null;
      }

      // If a player disconnected, their reactionTimes and avg may be null
      setMyReactionTimes(myTimes === null ? [] : myTimes);
      setOpponentReactionTimes(opponentTimes === null ? [] : opponentTimes);
      setMyAvg(myAvgVal);
      setOpponentAvg(opponentAvgVal);

      // Determine winner from winnerLoserMap
      if (winnerLoserMap) {
        if (winnerLoserMap.winner === myId) {
          setWinner("me");
        } else if (winnerLoserMap.loser === myId) {
          setWinner("opponent");
        } else if (winnerLoserMap.winner === null && winnerLoserMap.loser === null) {
          setWinner("draw");
        } else {
          setWinner(null);
        }
      } else {
        setWinner(null);
      }

      setLitCell(null); // Clear litCell at game over
      leaveRoom();
    });

    socket.on("playerLeft", () => {
      alert("Opponent left the game.");
      setGameStarted(false);
      setGameEnded(true);
      setWaitingMsg("");
      setWinner(null);
      setMyAvg(null);
      setOpponentAvg(null);
      setLitCell(null); // Clear litCell if player leaves
      leaveRoom();
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

    // --- Handle roomAlreadyFilled event ---
    socket.on("roomAlreadyFilled", () => {
      if (setErrorMsg) {
        setErrorMsg("Room already filled. Please try another Room ID.");
      }
      setJoined(false);
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
      socket.off("roomAlreadyFilled");
    };
    // eslint-disable-next-line
  }, [
    enabled,
    resetKey,
    setPlayers,
    setGameStarted,
    setGameEnded,
    setMyReactionTimes,
    setOpponentReactionTimes,
    setRound,
    setLitCell,
    setWaitingMsg,
    setWinner,
    setMyAvg,
    setOpponentAvg,
    setMatchedRoomId,
    setRoomId,
    setJoined,
    setIsRandomMatching,
    setErrorMsg, // <-- Added
  ]);

  // Expose socket for emits
  return socket;
}