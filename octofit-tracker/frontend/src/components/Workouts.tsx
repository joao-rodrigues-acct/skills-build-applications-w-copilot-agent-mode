import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return <CapabilityCard 
    title="Workout suggestions" 
    description="Recommend workouts from activity patterns."
    apiPath="/api/workouts/suggestions/mona@example.com"
    dataKey="suggestions"
    emptyText="No workout suggestions available"
    renderItem={(item) => `${item.title}: ${item.reason}`}
  />;
}
