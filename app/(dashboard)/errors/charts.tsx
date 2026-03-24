"use client";

import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import type { DailyMetrics, ErrorRecord } from "@/lib/types";

const COLORS = [
	"oklch(0.65 0.2 25)",
	"oklch(0.7 0.2 40)",
	"oklch(0.65 0.2 250)",
	"oklch(0.7 0.15 160)",
	"oklch(0.65 0.15 310)",
];

const tooltipStyle = {
	backgroundColor: "hsl(var(--popover))",
	border: "1px solid hsl(var(--border))",
	borderRadius: "var(--radius)",
	fontSize: 12,
};

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function ErrorsOverTimeChart({ data }: { data: DailyMetrics[] }) {
	const chartData = data.map((d) => ({
		date: formatDate(d.date),
		errors: d.errors,
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
				<Tooltip contentStyle={tooltipStyle} />
				<Bar
					dataKey="errors"
					fill="oklch(0.65 0.2 25)"
					radius={[4, 4, 0, 0]}
					name="Errors"
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

export function ErrorsByTypeChart({ data }: { data: ErrorRecord[] }) {
	const grouped = data.reduce(
		(acc, e) => {
			const label = e.type.replace("_", " ");
			acc[label] = (acc[label] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const chartData = Object.entries(grouped)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value);

	return (
		<ResponsiveContainer width="100%" height={260}>
			<PieChart>
				<Pie
					data={chartData}
					dataKey="value"
					nameKey="name"
					cx="50%"
					cy="50%"
					outerRadius={90}
					innerRadius={50}
					label={({ name, percent }) =>
						`${name} ${((percent ?? 0) * 100).toFixed(0)}%`
					}
					labelLine={false}
					fontSize={11}
				>
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Pie>
				<Tooltip contentStyle={tooltipStyle} />
			</PieChart>
		</ResponsiveContainer>
	);
}

export function ErrorsByProjectChart({ data }: { data: ErrorRecord[] }) {
	const grouped = data.reduce(
		(acc, e) => {
			acc[e.projectName] = (acc[e.projectName] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const chartData = Object.entries(grouped)
		.map(([name, errors]) => ({ name, errors }))
		.sort((a, b) => b.errors - a.errors);

	return (
		<ResponsiveContainer width="100%" height={200}>
			<BarChart data={chartData} layout="vertical">
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					type="number"
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
				/>
				<YAxis
					type="category"
					dataKey="name"
					tick={{ fontSize: 10 }}
					className="fill-muted-foreground"
					width={120}
				/>
				<Tooltip contentStyle={tooltipStyle} />
				<Bar dataKey="errors" radius={[0, 4, 4, 0]} name="Errors">
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}
