import { useEffect, useState } from 'react';

type Props = { title: string; description: string; apiPath: string; dataKey: string; emptyText: string; renderItem?: (item: any) => React.ReactNode };

export function CapabilityCard({ title, description, apiPath, dataKey, emptyText, renderItem }: Props) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(apiPath)
      .then(response => {
        if (!response.ok) throw new Error('API error');
        return response.json();
      })
      .then(result => {
        setData(result[dataKey] || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Unable to load data');
        setLoading(false);
      });
  }, [apiPath, dataKey]);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{loading && <p role="status">Loading...</p>}{!loading && error && <div role="alert" className="alert alert-danger">{error}</div>}{!loading && !error && data.length === 0 && <p>{emptyText}</p>}{!loading && !error && data.length > 0 && <ul className="list-unstyled">{data.map((item, i) => <li key={i}>{renderItem ? renderItem(item) : JSON.stringify(item)}</li>)}</ul>}</div></section>;
}
