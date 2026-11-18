import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  name: string;
  members?: Array<any>;
}

interface TeamsResponse {
  teams: Team[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getJson<TeamsResponse>('/api/teams')
      .then(result => {
        setTeams(result.teams || []);
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
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {loading && <p role="status">Loading...</p>}
        {!loading && error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && teams.length === 0 && <p>No teams yet</p>}
        {!loading && !error && teams.length > 0 && (
          <ul className="list-unstyled">
            {teams.map((item, i) => (
              <li key={i}>{item.name} ({item.members?.length || 0} members)</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
