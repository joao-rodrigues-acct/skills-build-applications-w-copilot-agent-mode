import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface WorkoutSuggestion {
  title: string;
  reason: string;
}

interface WorkoutSuggestionsResponse {
  suggestions: WorkoutSuggestion[];
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getJson<WorkoutSuggestionsResponse>('/api/workouts/suggestions/mona@example.com')
      .then(result => {
        setSuggestions(result.suggestions || []);
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
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {loading && <p role="status">Loading...</p>}
        {!loading && error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && suggestions.length === 0 && <p>No workout suggestions available</p>}
        {!loading && !error && suggestions.length > 0 && (
          <ul className="list-unstyled">
            {suggestions.map((item, i) => (
              <li key={i}>{item.title}: {item.reason}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
