import React from "react";
import { useNavigate } from "react-router-dom";
// Import the socket context hook
import { useSocket } from "../context/SocketContext";

function Navbar({ showDashboardLink, email }) {
  const navigate = useNavigate();
  const socket = useSocket();

  const handleDashboard = () => {
    navigate('/dashboard', { state: { email } });
  };

  const handleHome = () => {
    navigate('/landing', { state: { email } });
  };

  const handleLogout = () => {
    // Emit logout event if socket exists and is connected
    if (socket && socket.connected) {
      socket.emit("logout");
    }
    localStorage.removeItem("token");
    navigate('/', { replace: true });
  };

  return (
    <nav
      style={{
        width: '100%',
        background: '#6366f1',
        padding: '1rem 0.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.07)',
        marginBottom: '2rem',
      }}
    >
      {showDashboardLink ? (
        <button
          onClick={handleDashboard}
          style={{
            background: 'transparent',
            color: '#fff',
            border: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            marginRight: '1.5rem',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'color 0.2s',
          }}
        >
          Dashboard
        </button>
      ) : (
        <button
          onClick={handleHome}
          style={{
            background: 'transparent',
            color: '#fff',
            border: 'none',
            fontWeight: 500,
            fontSize: '1rem',
            marginRight: '1.5rem',
            cursor: 'pointer',
            letterSpacing: '0.5px',
            transition: 'color 0.2s',
          }}
        >
          Game
        </button>
      )}
      <button
        onClick={handleLogout}
        style={{
          background: '#fff',
          color: '#6366f1',
          border: 'none',
          borderRadius: '6px',
          padding: '0.5rem 1.2rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(31, 38, 135, 0.07)',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;