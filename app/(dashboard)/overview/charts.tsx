"use client";

import {
	BarChart,
	Bar,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import type { DailyMetrics } from "@/lib/types";

function formatDate(dateStr: string) {
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DailyTasksChart({ data }: { data: DailyMetrics[] }) {
	const chartData = data.map((d) => ({
		date: formatDate(d.date),
		completed: d.completedTasks,
		failed: d.failedTasks,
	}));

	return (
		<ResponsiveContainer width="100%" height={260}>
			<BarChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					dataKey="date"
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					interval="preserveStartEnd"
				/>
				<YAxis
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					width={32}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: "hsl(var(--popover))",
						border: "1px solid hsl(var(--border))",
						borderRadius: "var(--radius)",
						fontSize: 12,
					}}
				/>
				<Bar
					dataKey="completed"
					stackId="tasks"
					fill="oklch(0.7 0.15 160)"
					radius={[0, 0, 0, 0]}
					name="Completed"
				/>
				<Bar
					dataKey="failed"
					stackId="tasks"
					fill="oklch(0.65 0.2 25)"
					radius={[2, 2, 0, 0]}
					name="Failed"
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

export function CostTrendChart({ data }: { data: DailyMetrics[] }) {
	const chartData = data.map((d) => ({
		date: formatDate(d.date),
		cost: Math.round(d.totalCost * 100) / 100,
	}));

	return (
		<ResponsiveContainer width="100%" height={260}>
			<AreaChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					dataKey="date"
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					interval="preserveStartEnd"
				/>
				<YAxis
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					width={48}
					tickFormatter={(v) => `$${v}`}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: "hsl(var(--popover))",
						border: "1px solid hsl(var(--border))",
						borderRadius: "var(--radius)",
						fontSize: 12,
					}}
					formatter={(value) => [`$${Number(value).toFixed(2)}`, "Cost"]}
				/>
				<Area
					type="monotone"
					dataKey="cost"
					stroke="oklch(0.65 0.2 250)"
					fill="oklch(0.65 0.2 250 / 0.15)"
					strokeWidth={2}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
