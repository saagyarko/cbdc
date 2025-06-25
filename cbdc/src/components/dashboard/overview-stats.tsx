// src/components/dashboard/overview-stats.tsx
import { MOCK_OVERVIEW_STATS } from '@/lib/constants';
import { OverviewCard } from './overview-card';

export function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {MOCK_OVERVIEW_STATS.map((stat) => (
        <OverviewCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
}
