import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return <CapabilityCard 
    title="Leaderboard" 
    description="Compare team point totals."
    apiPath="/api/leaderboard"
    dataKey="leaderboard"
    emptyText="No rankings yet"
    renderItem={(item) => `${item.rank}. ${item.teamName}: ${item.totalPoints} points`}
  />;
}
