"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A radar chart with a grid filled";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 285 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 203 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 264 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartRadarGridFill() {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Radar Chart - Grid Filled</CardTitle>
        <CardDescription>
          Showing total visitors for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid className="fill-(--color-desktop) opacity-20" />
            <PolarAngleAxis dataKey="month" />
            <Radar
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          January - June 2024
        </div>
      </CardFooter>
    </Card>
  );
}
