"use client";

import {
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import type { DailyToolUsage, ModelMetrics, ToolMetrics } from "@/lib/types";

const COLORS = [
	"oklch(0.65 0.2 250)",
	"oklch(0.7 0.15 160)",
	"oklch(0.7 0.2 40)",
	"oklch(0.65 0.15 310)",
	"oklch(0.75 0.1 80)",
	"oklch(0.6 0.2 200)",
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

export function ToolUsageChart({ data }: { data: ToolMetrics[] }) {
	const chartData = [...data].sort((a, b) => b.invocations - a.invocations);

	return (
		<ResponsiveContainer width="100%" height={260}>
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
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					width={50}
				/>
				<Tooltip contentStyle={tooltipStyle} />
				<Bar
					dataKey="invocations"
					radius={[0, 4, 4, 0]}
					name="Invocations"
				>
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

export function ToolSuccessChart({ data }: { data: ToolMetrics[] }) {
	const chartData = [...data].sort((a, b) => a.successRate - b.successRate);

	return (
		<ResponsiveContainer width="100%" height={260}>
			<BarChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" className="stroke-border" />
				<XAxis
					dataKey="name"
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
				/>
				<YAxis
					tick={{ fontSize: 11 }}
					className="fill-muted-foreground"
					width={40}
					domain={[85, 100]}
					tickFormatter={(v) => `${v}%`}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`${Number(v).toFixed(1)}%`, "Success Rate"]}
				/>
				<Bar
					dataKey="successRate"
					radius={[4, 4, 0, 0]}
					name="Success Rate"
				>
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

export function ModelDistributionChart({ data }: { data: ModelMetrics[] }) {
	return (
		<ResponsiveContainer width="100%" height={260}>
			<PieChart>
				<Pie
					data={data}
					dataKey="tasks"
					nameKey="name"
					cx="50%"
					cy="50%"
					outerRadius={90}
					innerRadius={50}
					label={({ name, percent }) =>
						`${(name ?? "").split("-").slice(0, 2).join("-")} ${((percent ?? 0) * 100).toFixed(0)}%`
					}
					labelLine={false}
					fontSize={10}
				>
					{data.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Pie>
				<Tooltip contentStyle={tooltipStyle} />
			</PieChart>
		</ResponsiveContainer>
	);
}

export function ToolUsageOverTimeChart({ data }: { data: DailyToolUsage[] }) {
	const chartData = data.map((d) => ({
		date: formatDate(d.date),
		bash: d.bash,
		read: d.read,
		write: d.write,
		edit: d.edit,
		grep: d.grep,
		glob: d.glob,
	}));

	const tools = ["bash", "read", "write", "edit", "grep", "glob"];

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
				/>
				<Tooltip contentStyle={tooltipStyle} />
				<Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
				{tools.map((tool, i) => (
					<Area
						key={tool}
						type="monotone"
						dataKey={tool}
						stackId="tools"
						stroke={COLORS[i]}
						fill={COLORS[i]}
						fillOpacity={0.3}
					/>
				))}
			</AreaChart>
		</ResponsiveContainer>
	);
}

export function TokensPerTaskChart({ data }: { data: ModelMetrics[] }) {
	const chartData = data.map((m) => ({
		name: m.name,
		tokensPerTask:
			m.tasks > 0 ? Math.round(m.tokens / m.tasks / 1000) : 0,
	}));

	return (
		<ResponsiveContainer width="100%" height={220}>
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
					width={48}
					tickFormatter={(v) => `${v}K`}
				/>
				<Tooltip
					contentStyle={tooltipStyle}
					formatter={(v) => [`${v}K tokens`, "Avg per Task"]}
				/>
				<Bar
					dataKey="tokensPerTask"
					radius={[4, 4, 0, 0]}
					name="Avg Tokens/Task (K)"
				>
					{chartData.map((_, i) => (
						<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}
