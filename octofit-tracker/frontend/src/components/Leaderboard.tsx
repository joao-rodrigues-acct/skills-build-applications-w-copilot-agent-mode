import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface LeaderboardItem {
  rank: number;
  teamName: string;
  totalPoints: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardItem[];
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then(result => {
        setLeaderboard(result.leaderboard || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load data');
        setLoading(false);
      });
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {loading && <p role="status">Loading...</p>}
        {!loading && error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && leaderboard.length === 0 && <p>No rankings yet</p>}
        {!loading && !error && leaderboard.length > 0 && (
          <ul className="list-unstyled">
            {leaderboard.map((item, i) => (
              <li key={i}>{item.rank}. {item.teamName}: {item.totalPoints} points</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
