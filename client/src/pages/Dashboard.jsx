import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/DashboardStyles.css";

function UserDashboard() {
  const location = useLocation();
  const email = location.state?.email;
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const nameInputRef = useRef(null);

  // Fetch user details on mount using email
  useEffect(() => {
    if (!email) return;
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/user-details/${encodeURIComponent(email)}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.userDetails) {
            setUsername(data.userDetails.username);
            setNewUsername(data.userDetails.username);
            setAge(data.userDetails.age);
            setTokens(data.userDetails.tokens ?? 0);
          }
        }
      } catch (err) {
        setError("Failed to fetch user details.");
      }
    };
    fetchUserDetails();
  }, [email]);

  useEffect(() => {
    if (editMode && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editMode]);

  const handleEditClick = () => {
    setEditMode(true);
    setMessage("");
    setError("");
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setNewUsername(username);
    setMessage("");
    setError("");
  };

  const handleSaveName = async () => {
    if (!newUsername || !email) {
      setError("Name cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email, username: newUsername, age: Number(age) }),
      });
      if (!res.ok) throw new Error("Failed to update name");
      setUsername(newUsername);
      setEditMode(false);
      setMessage("Name updated successfully!");
    } catch (err) {
      setError("Failed to update name.");
    }
    setLoading(false);
  };

  const handleNameInputKeyDown = (e) => {
    if (!editMode) return;
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (!email) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
      margin: 0,
      padding: 0,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Navbar at the top, with landing page link */}
      <Navbar showDashboardLink={false} email={email} />
      <div className="dashboard-container">
        <div className="dashboard-title">User Dashboard</div>
        <div className="field-row">
          <span className="field-label">Name:</span>
          <input
            ref={nameInputRef}
            className="field-value"
            type="text"
            value={editMode ? newUsername : username}
            readOnly={!editMode}
            onChange={e => setNewUsername(e.target.value)}
            onKeyDown={handleNameInputKeyDown}
            style={
              editMode
                ? {
                    background: "#fff",
                    border: "1px solid #3182ce"
                  }
                : {}
            }
          />
          {!editMode && (
            <button className="edit-btn" onClick={handleEditClick}>
              Edit
            </button>
          )}
          {editMode && (
            <>
              <button
                className="save-btn"
                onClick={handleSaveName}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="cancel-btn"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </div>
        <div className="field-row">
          <span className="field-label">Email:</span>
          <input className="field-value" type="text" value={email} readOnly />
        </div>
        <div className="field-row">
          <span className="field-label">Age:</span>
          <input className="field-value" type="text" value={age} readOnly />
        </div>
        <div className="field-row">
          <span className="field-label">Tokens:</span>
          <input className="field-value" type="text" value={tokens} readOnly />
          <button
            className="buy-tokens-btn"
            onClick={() => { /* Dummy for now */ }}
          >
            Buy Tokens
          </button>
        </div>
        {message && (
          <div style={{ color: "#22c55e", marginTop: "10px", textAlign: "center" }}>{message}</div>
        )}
        {error && (
          <div style={{ color: "#e53e3e", marginTop: "10px", textAlign: "center" }}>{error}</div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;