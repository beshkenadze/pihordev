"use client";

import {
	LineChart,
	Line,
	AreaChart,
	Area,
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import type { DailyMetrics, ModelMetrics, TaskRecord } from "@/lib/types";

const tooltipStyle = {
	backgroundColor: "hsl(var(--popover))",
	border: "1px solid hsl(var(--border))",
	borderRadius: "var(--radius)",
	fontSize: 12,
};

const COLORS = [
	"oklch(0.65 0.2 250)",
	"oklch(0.7 0.15 160)",
	"oklch(0.7 0.2 40)",
	"oklch(0.65 0.15 310)",
];

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

export function LatencyChart({ data }: { data: DailyMetrics[] }) {
	const chartData = data.map((d) => ({
		date: formatDate(d.date),
		p50: Math.round(d.p50CompletionTimeMs / 1000),
		p95: Math.round(d.p95CompletionTimeMs / 1000),
	}));

	return (
		<ResponsiveContainer width="100%" height={260}>
			<LineChart data={chartData}>
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
					width={40}
					tickFormatter={(v) => `${v}s`}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`${v}s`, ""]}
				/>
				<Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
				<Line
					type="monotone"
					dataKey="p50"
					stroke="oklch(0.65 0.2 250)"
					strokeWidth={2}
					dot={false}
					name="P50"
				/>
				<Line
					type="monotone"
					dataKey="p95"
					stroke="oklch(0.7 0.2 40)"
					strokeWidth={2}
					dot={false}
					name="P95"
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}

export function SuccessRateChart({ data }: { data: DailyMetrics[] }) {
	const chartData = data.map((d) => ({
		date: formatDate(d.date),
		rate:
			d.tasks > 0
				? Math.round((d.completedTasks / d.tasks) * 1000) / 10
				: 100,
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
					width={40}
					domain={[60, 100]}
					tickFormatter={(v) => `${v}%`}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`${v}%`, "Success Rate"]}
				/>
				<Area
					type="monotone"
					dataKey="rate"
					stroke="oklch(0.7 0.15 160)"
					fill="oklch(0.7 0.15 160 / 0.15)"
					strokeWidth={2}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}

export function CompletionDistributionChart({
	tasks,
}: { tasks: TaskRecord[] }) {
	const buckets = [
		{ label: "<1m", min: 0, max: 60000 },
		{ label: "1-2m", min: 60000, max: 120000 },
		{ label: "2-5m", min: 120000, max: 300000 },
		{ label: "5-10m", min: 300000, max: 600000 },
		{ label: ">10m", min: 600000, max: Number.POSITIVE_INFINITY },
	];

	const chartData = buckets.map((b) => ({
		range: b.label,
		count: tasks.filter(
			(t) =>
				t.status === "completed" &&
				t.durationMs >= b.min &&
				t.durationMs < b.max,
		).length,
	}));

	return (
		<ResponsiveContainer width="100%" height={260}>
			<BarChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					dataKey="range"
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
				/>
				<YAxis
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					width={32}
				/>
				<Tooltip contentStyle={tooltipStyle} />
				<Bar dataKey="count" radius={[4, 4, 0, 0]} name="Tasks">
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

export function ModelComparisonChart({ data }: { data: ModelMetrics[] }) {
	const chartData = data.map((m) => ({
		name: m.name,
		avgTime: Math.round(m.avgCompletionTimeMs / 1000),
		successRate: m.successRate,
	}));

	return (
		<ResponsiveContainer width="100%" height={260}>
			<BarChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					dataKey="name"
					tick={{ fontSize: 10 }}
					className="fill-muted-foreground"
				/>
				<YAxis
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					width={40}
					tickFormatter={(v) => `${v}s`}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v, name) => [
						name === "avgTime" ? `${v}s` : `${v}%`,
						name === "avgTime" ? "Avg Time" : "Success Rate",
					]}
				/>
				<Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
				<Bar
					dataKey="avgTime"
					fill="oklch(0.65 0.2 250)"
					radius={[4, 4, 0, 0]}
					name="Avg Time (s)"
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}
