import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactionGridGame from './ReactionGridGame';
import Navbar from '../components/Navbar';

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
      <Navbar showDashboardLink={true} email={email} />

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