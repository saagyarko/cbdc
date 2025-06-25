// src/app/dashboard/page.tsx
"use client";

import { OverviewStats } from '@/components/dashboard/overview-stats';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { RecentFraudAlerts } from '@/components/dashboard/recent-fraud-alerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, Pie, Cell, LineChart, PieChart } from 'recharts';

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const pieChartData = [
  { name: 'USD CBDC', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'EUR CBDC', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'GBP CBDC', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'JPY CBDC', value: 200, fill: 'hsl(var(--chart-4))' },
];


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <OverviewStats />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-3">
          <RecentFraudAlerts />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Transaction Volume Over Time</CardTitle>
            <CardDescription>Monthly transaction volume (USD equivalent).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="desktop" stroke={chartConfig.desktop.color} strokeWidth={2} dot={false} name="Volume (M)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>CBDC Distribution</CardTitle>
            <CardDescription>Distribution of transaction volume by CBDC type.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} className="mt-4" />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
