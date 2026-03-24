import {
	Activity,
	CheckCircle2,
	Clock,
	Coins,
	ListTodo,
	Zap,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DailyTasksChart, CostTrendChart } from "./charts";
import { getDashboardData } from "@/lib/mock-data";

function formatDuration(ms: number) {
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatCost(cost: number) {
	return `$${cost.toFixed(2)}`;
}

function formatTokens(tokens: number) {
	if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
	if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
	return String(tokens);
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	completed: "default",
	running: "secondary",
	failed: "destructive",
	queued: "outline",
};

export default function OverviewPage() {
	const data = getDashboardData();
	const metrics = data.dailyMetrics;
	const last7 = metrics.slice(-7);
	const prev7 = metrics.slice(-14, -7);

	const totalTasks = metrics.reduce((s, d) => s + d.tasks, 0);
	const totalCompleted = metrics.reduce((s, d) => s + d.completedTasks, 0);
	const totalCost = metrics.reduce((s, d) => s + d.totalCost, 0);
	const totalTokens = metrics.reduce((s, d) => s + d.totalTokens, 0);
	const successRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
	const avgCompletion =
		metrics.reduce((s, d) => s + d.avgCompletionTimeMs, 0) / metrics.length;

	const prevTotalCost = prev7.reduce((s, d) => s + d.totalCost, 0);
	const currentCost = last7.reduce((s, d) => s + d.totalCost, 0);
	const costChange = prevTotalCost > 0
		? ((currentCost - prevTotalCost) / prevTotalCost) * 100
		: 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
				<p className="text-sm text-muted-foreground">
					Last 30 days agent activity
				</p>
			</div>

			<div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				<KpiCard
					title="Total Tasks"
					value={String(totalTasks)}
					icon={ListTodo}
					sparklineData={last7.map((d) => d.tasks)}
				/>
				<KpiCard
					title="Success Rate"
					value={`${successRate.toFixed(1)}%`}
					icon={CheckCircle2}
					changeType={successRate > 90 ? "positive" : "negative"}
					sparklineData={last7.map(
						(d) => d.tasks > 0 ? (d.completedTasks / d.tasks) * 100 : 0,
					)}
				/>
				<KpiCard
					title="Total Cost"
					value={formatCost(totalCost)}
					change={`${costChange >= 0 ? "+" : ""}${costChange.toFixed(1)}% vs prev 7d`}
					changeType={costChange > 10 ? "negative" : costChange < -5 ? "positive" : "neutral"}
					icon={Coins}
					sparklineData={last7.map((d) => d.totalCost)}
				/>
				<KpiCard
					title="Active Agents"
					value={String(data.liveAgents.length)}
					icon={Activity}
				/>
				<KpiCard
					title="Avg Completion"
					value={formatDuration(avgCompletion)}
					icon={Clock}
					sparklineData={last7.map((d) => d.avgCompletionTimeMs)}
				/>
				<KpiCard
					title="Total Tokens"
					value={formatTokens(totalTokens)}
					icon={Zap}
					sparklineData={last7.map((d) => d.totalTokens)}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard title="Daily Tasks" description="Tasks per day over 30 days">
					<DailyTasksChart data={metrics} />
				</ChartCard>
				<ChartCard title="Cost Trend" description="Daily spend over 30 days">
					<CostTrendChart data={metrics} />
				</ChartCard>
			</div>

			<ChartCard title="Recent Tasks">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Task</TableHead>
							<TableHead>Project</TableHead>
							<TableHead>Model</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Cost</TableHead>
							<TableHead className="text-right">Duration</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.tasks.slice(0, 10).map((task) => (
							<TableRow key={task.id}>
								<TableCell className="font-medium text-xs max-w-48 truncate">
									{task.title}
								</TableCell>
								<TableCell className="text-xs font-mono text-muted-foreground">
									{task.projectName}
								</TableCell>
								<TableCell className="text-xs font-mono">
									{task.model}
								</TableCell>
								<TableCell>
									<Badge variant={STATUS_VARIANT[task.status]}>
										{task.status}
									</Badge>
								</TableCell>
								<TableCell className="text-right font-mono text-xs">
									{formatCost(task.cost)}
								</TableCell>
								<TableCell className="text-right font-mono text-xs">
									{formatDuration(task.durationMs)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ChartCard>
		</div>
	);
}
