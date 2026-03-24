import { CheckCircle2, Clock, Gauge, TrendingDown } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
	LatencyChart,
	SuccessRateChart,
	CompletionDistributionChart,
	ModelComparisonChart,
} from "./charts";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getDashboardData } from "@/lib/mock-data";

function formatDuration(ms: number) {
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function PerformancePage() {
	const data = getDashboardData();
	const metrics = data.dailyMetrics;

	const totalTasks = metrics.reduce((s, d) => s + d.tasks, 0);
	const totalCompleted = metrics.reduce((s, d) => s + d.completedTasks, 0);
	const successRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
	const avgP50 =
		metrics.reduce((s, d) => s + d.p50CompletionTimeMs, 0) / metrics.length;
	const avgP95 =
		metrics.reduce((s, d) => s + d.p95CompletionTimeMs, 0) / metrics.length;
	const avgCompletion =
		metrics.reduce((s, d) => s + d.avgCompletionTimeMs, 0) / metrics.length;

	const slowestTasks = [...data.tasks]
		.filter((t) => t.status === "completed")
		.sort((a, b) => b.durationMs - a.durationMs)
		.slice(0, 8);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Performance</h1>
				<p className="text-sm text-muted-foreground">
					Agent speed and reliability metrics
				</p>
			</div>

			<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
				<KpiCard
					title="Success Rate"
					value={`${successRate.toFixed(1)}%`}
					changeType={successRate > 90 ? "positive" : "negative"}
					icon={CheckCircle2}
					sparklineData={metrics.slice(-7).map(
						(d) => d.tasks > 0 ? (d.completedTasks / d.tasks) * 100 : 0,
					)}
				/>
				<KpiCard
					title="Avg Completion"
					value={formatDuration(avgCompletion)}
					icon={Clock}
				/>
				<KpiCard
					title="P50 Latency"
					value={formatDuration(avgP50)}
					icon={Gauge}
				/>
				<KpiCard
					title="P95 Latency"
					value={formatDuration(avgP95)}
					icon={TrendingDown}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					title="Completion Time (P50 / P95)"
					description="Daily latency percentiles"
				>
					<LatencyChart data={metrics} />
				</ChartCard>
				<ChartCard
					title="Success Rate Over Time"
					description="Daily task success rate"
				>
					<SuccessRateChart data={metrics} />
				</ChartCard>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					title="Completion Time Distribution"
					description="Task duration histogram"
				>
					<CompletionDistributionChart tasks={data.tasks} />
				</ChartCard>
				<ChartCard
					title="Performance by Model"
					description="Average completion time comparison"
				>
					<ModelComparisonChart data={data.models} />
				</ChartCard>
			</div>

			<ChartCard title="Slowest Tasks">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Task</TableHead>
							<TableHead>Project</TableHead>
							<TableHead>Model</TableHead>
							<TableHead className="text-right">Duration</TableHead>
							<TableHead className="text-right">Tokens</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{slowestTasks.map((task) => (
							<TableRow key={task.id}>
								<TableCell className="text-xs max-w-48 truncate">
									{task.title}
								</TableCell>
								<TableCell className="text-xs font-mono text-muted-foreground">
									{task.projectName}
								</TableCell>
								<TableCell className="text-xs font-mono">
									{task.model}
								</TableCell>
								<TableCell className="text-right font-mono text-xs">
									{formatDuration(task.durationMs)}
								</TableCell>
								<TableCell className="text-right font-mono text-xs">
									{(task.tokens / 1000).toFixed(0)}K
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ChartCard>
		</div>
	);
}
