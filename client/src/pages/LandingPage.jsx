import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactionGridGame from './ReactionGridGame';

function LandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [initialUsername, setInitialUsername] = useState(email);

  useEffect(() => {
    if (!email) {
      navigate('/');
      return;
    }
    const fetchUsername = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/user-details/${encodeURIComponent(email)}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.userDetails && data.userDetails.username) {
            setInitialUsername(data.userDetails.username);
          } else {
            setInitialUsername(email);
          }
        } else {
          setInitialUsername(email);
        }
      } catch {
        setInitialUsername(email);
      }
    };
    fetchUsername();
  }, [email, navigate]);

  // Logout handler: clear state and redirect to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/', { replace: true });
  };

  const handleDashboard = () => {
    navigate('/dashboard', { state: { email } });
  };

  if (!email) return null;

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
        fontFamily: 'Segoe UI, Arial, sans-serif',
      }}
    >
      {/* Navbar */}
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

      <div
        style={{
          background: '#fff',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          borderRadius: '18px',
          padding: '2.5rem 2rem 2rem 2rem',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ marginBottom: '1.2rem', fontWeight: 700, fontSize: '2rem', color: '#4f46e5', letterSpacing: '0.5px' }}>
          👋 Welcome, <span style={{ color: '#1e293b' }}>{initialUsername}</span>!
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: 0 }}>
          You have successfully logged in.<br />
          Enjoy the Reaction Grid Game below!
        </p>
      </div>
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* Pass username if found, otherwise email as initialUsername to ReactionGridGame */}
        <ReactionGridGame initialUsername={initialUsername} />
      </div>
    </div>
  );
}

export default LandingPage;