// src/components/dashboard/overview-card.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { OverviewStat } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OverviewCardProps {
  stat: OverviewStat;
}

export function OverviewCard({ stat }: OverviewCardProps) {
  const { title, value, icon: Icon, change, changeType, description } = stat;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline">{value}</div>
        {change && (
          <p className={cn(
            "text-xs mt-1",
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          )}>
            <span className="inline-flex items-center">
              {changeType === 'positive' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {change}
            </span>
            <span className="text-muted-foreground"> vs last period</span>
          </p>
        )}
        <CardDescription className="text-xs text-muted-foreground mt-1">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
