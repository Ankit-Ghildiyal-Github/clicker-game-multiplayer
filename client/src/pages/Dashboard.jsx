import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function UserDashboard() {
  const location = useLocation();
  const email = location.state?.email;
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
            setAge(data.userDetails.age);
          }
        }
      } catch (err) {
        // Ignore if not found
      }
    };
    fetchUserDetails();
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    if (!username || !age || !email) {
      setError("Please fill all fields.");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email, username, age: Number(age) }),
      });
      if (!res.ok) throw new Error("Failed to save details");
      setMessage("Details saved successfully!");
    } catch (err) {
      setError("Failed to save details.");
    }
    setLoading(false);
  };

  if (!email) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          borderRadius: "18px",
          padding: "2.5rem 2rem 2rem 2rem",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginBottom: "1.2rem", fontWeight: 700, fontSize: "2rem", color: "#4f46e5" }}>
          📝 User Dashboard
        </h2>
        <p style={{ color: "#64748b", fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          Add or update your details below.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={{ fontWeight: 500, color: "#334155" }}>Email:</label>
            <div style={{ color: "#475569", marginTop: 2 }}>{email}</div>
          </div>
          <div>
            <label style={{ fontWeight: 500, color: "#334155" }}>Username:</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                marginTop: 4,
              }}
              required
            />
          </div>
          <div>
            <label style={{ fontWeight: 500, color: "#334155" }}>Age:</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                marginTop: 4,
              }}
              min={1}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "0.7rem",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            {loading ? "Saving..." : "Save Details"}
          </button>
        </form>
        {message && <div style={{ color: "#16a34a", marginTop: "1rem" }}>{message}</div>}
        {error && <div style={{ color: "#dc2626", marginTop: "1rem" }}>{error}</div>}
      </div>
    </div>
  );
}

export default UserDashboard;