import React, { createContext, useContext } from "react";
import useMultiplayerSocket from "../hooks/useMultiplayerSocket";

// Create the context
const SocketContext = createContext(null);

/**
 * SocketProvider
 * 
 * Wrap your app with this provider and pass all the props required by useMultiplayerSocket.
 * This will make the socket instance available throughout your component tree.
 * 
 * Example usage:
 * <SocketProvider
 *   enabled={enabled}
 *   resetKey={resetKey}
 *   setPlayers={setPlayers}
 *   setGameStarted={setGameStarted}
 *   setGameEnded={setGameEnded}
 *   setMyReactionTimes={setMyReactionTimes}
 *   setOpponentReactionTimes={setOpponentReactionTimes}
 *   setRound={setRound}
 *   setLitCell={setLitCell}
 *   setWaitingMsg={setWaitingMsg}
 *   setWinner={setWinner}
 *   setMyAvg={setMyAvg}
 *   setOpponentAvg={setOpponentAvg}
 *   setMatchedRoomId={setMatchedRoomId}
 *   setRoomId={setRoomId}
 *   setJoined={setJoined}
 *   setIsRandomMatching={setIsRandomMatching}
 *   setErrorMsg={setErrorMsg}
 * >
 *   <App />
 * </SocketProvider>
 */
export function SocketProvider({
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
  setErrorMsg,
  children,
}) {
  const socket = useMultiplayerSocket({
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
    setErrorMsg,
  });

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to use the socket context
export function useSocket() {
  return useContext(SocketContext);
}