import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return <CapabilityCard 
    title="Activities" 
    description="Track student activity minutes and points."
    apiPath="/api/activities"
    dataKey="activities"
    emptyText="No activities yet"
    renderItem={(item) => `${item.type}: ${item.minutes} minutes`}
  />;
}
