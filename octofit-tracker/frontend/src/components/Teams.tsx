import { CapabilityCard } from './CapabilityCard.js';
export default function Teams() {
  return <CapabilityCard 
    title="Teams" 
    description="Manage teams and members."
    apiPath="/api/teams"
    dataKey="teams"
    emptyText="No teams yet"
    renderItem={(item) => `${item.name} (${item.members?.length || 0} members)`}
  />;
}
