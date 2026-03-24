"use client";

import {
	BarChart,
	Bar,
	AreaChart,
	Area,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import type { DailyMetrics, ModelMetrics, ProjectMetrics, TeamMetrics } from "@/lib/types";

const COLORS = [
	"oklch(0.65 0.2 250)",
	"oklch(0.7 0.15 160)",
	"oklch(0.7 0.2 40)",
	"oklch(0.65 0.15 310)",
	"oklch(0.75 0.1 80)",
];

const tooltipStyle = {
	backgroundColor: "hsl(var(--popover))",
	border: "1px solid hsl(var(--border))",
	borderRadius: "var(--radius)",
	fontSize: 12,
};

function formatDate(dateStr: string) {
	const d = new Date(dateStr);
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CostByModelChart({ data }: { data: ModelMetrics[] }) {
	const chartData = data
		.sort((a, b) => b.cost - a.cost)
		.map((m) => ({ name: m.name, cost: m.cost }));

	return (
		<ResponsiveContainer width="100%" height={260}>
			<BarChart data={chartData} layout="vertical">
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					type="number"
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					tickFormatter={(v) => `$${v}`}
				/>
				<YAxis
					type="category"
					dataKey="name"
					tick={{ fontSize: 10 }}
					className="fill-muted-foreground"
					width={120}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`$${Number(v).toFixed(2)}`, "Cost"]}
				/>
				<Bar dataKey="cost" radius={[0, 4, 4, 0]}>
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

export function CostByProjectChart({ data }: { data: ProjectMetrics[] }) {
	const chartData = data
		.sort((a, b) => b.cost - a.cost)
		.map((p) => ({ name: p.name, cost: p.cost }));

	return (
		<ResponsiveContainer width="100%" height={260}>
			<BarChart data={chartData} layout="vertical">
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					type="number"
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					tickFormatter={(v) => `$${v}`}
				/>
				<YAxis
					type="category"
					dataKey="name"
					tick={{ fontSize: 10 }}
					className="fill-muted-foreground"
					width={120}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`$${Number(v).toFixed(2)}`, "Cost"]}
				/>
				<Bar dataKey="cost" radius={[0, 4, 4, 0]}>
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

export function CostByTeamChart({ data }: { data: TeamMetrics[] }) {
	return (
		<ResponsiveContainer width="100%" height={260}>
			<PieChart>
				<Pie
					data={data}
					dataKey="cost"
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
					{data.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Pie>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`$${Number(v).toFixed(2)}`, "Cost"]}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
}

export function TokenUsageChart({ data }: { data: DailyMetrics[] }) {
	const chartData = data.map((d) => ({
		date: formatDate(d.date),
		input: Math.round(d.inputTokens / 1000),
		output: Math.round(d.outputTokens / 1000),
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
					tickFormatter={(v) => `${v}K`}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`${v}K`, ""]}
				/>
				<Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
				<Area
					type="monotone"
					dataKey="input"
					stackId="tokens"
					stroke="oklch(0.65 0.2 250)"
					fill="oklch(0.65 0.2 250 / 0.3)"
					name="Input Tokens (K)"
				/>
				<Area
					type="monotone"
					dataKey="output"
					stackId="tokens"
					stroke="oklch(0.7 0.15 160)"
					fill="oklch(0.7 0.15 160 / 0.3)"
					name="Output Tokens (K)"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}

export function TaskVolumeByProjectChart({
	data,
	projects,
}: { data: DailyMetrics[]; projects: ProjectMetrics[] }) {
	const chartData = data.map((d) => {
		const entry: Record<string, string | number> = { date: formatDate(d.date) };
		for (const p of projects) {
			entry[p.name] = Math.round(d.tasks * (0.1 + Math.random() * 0.3));
		}
		return entry;
	});

	return (
		<ResponsiveContainer width="100%" height={300}>
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
					width={32}
				/>
				<Tooltip contentStyle={tooltipStyle} />
				<Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
				{projects.map((p, i) => (
					<Area
						key={p.name}
						type="monotone"
						dataKey={p.name}
						stackId="volume"
						stroke={COLORS[i % COLORS.length]}
						fill={`${COLORS[i % COLORS.length]} / 0.3)`
							.replace("oklch(", "oklch(")
							.replace(")", " / 0.3)")}
					/>
				))}
			</AreaChart>
		</ResponsiveContainer>
	);
}
