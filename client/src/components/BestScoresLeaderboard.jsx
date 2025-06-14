import React, { useEffect, useState } from "react";
import styles from "../styles/JoinSectionStyles";

const BestScoresLeaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch("/api/best-scores")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setScores(data.bestScores || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setScores([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={styles.container}>
    <div style={styles.card}>
      <div style={styles.leaderboardHeading}>🏆 Best Reaction Times</div>
      {loading ? (
        <div style={styles.leaderboardEmpty}>Loading...</div>
      ) : scores.length === 0 ? (
        <div style={styles.leaderboardEmpty}>No scores yet</div>
      ) : (
        <ol style={styles.leaderboardList}>
          {scores.map((score, idx) => (
            <li key={score.id || idx} style={styles.leaderboardItem}>
              <span style={styles.leaderboardRank}>{idx + 1}.</span>
              <span style={styles.leaderboardName}>
                {score.email.length > 16
                  ? score.email.slice(0, 13) + "..."
                  : score.email}
              </span>
              <span style={styles.leaderboardTime}>
                {Number(score.average_time).toFixed(2)} ms
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
    </div>
  );
};

export default BestScoresLeaderboard;