import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  type: string;
  minutes: number;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getJson<ActivitiesResponse>('/api/activities')
      .then(result => {
        setActivities(result.activities || []);
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
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {loading && <p role="status">Loading...</p>}
        {!loading && error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && activities.length === 0 && <p>No activities yet</p>}
        {!loading && !error && activities.length > 0 && (
          <ul className="list-unstyled">
            {activities.map((item, i) => (
              <li key={i}>{item.type}: {item.minutes} minutes</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
