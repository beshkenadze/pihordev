import { AlertTriangle, TrendingUp, Bug, ShieldAlert } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ErrorsOverTimeChart, ErrorsByTypeChart, ErrorsByProjectChart } from "./charts";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/mock-data";

const ERROR_TYPE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	timeout: "outline",
	sandbox_crash: "destructive",
	llm_error: "secondary",
	tool_failure: "default",
	rate_limit: "outline",
};

function formatTimestamp(ts: string) {
	const d = new Date(ts);
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function ErrorsPage() {
	const data = getDashboardData();
	const metrics = data.dailyMetrics;

	const totalErrors = metrics.reduce((s, d) => s + d.errors, 0);
	const totalTasks = metrics.reduce((s, d) => s + d.tasks, 0);
	const errorRate = totalTasks > 0 ? (totalErrors / totalTasks) * 100 : 0;

	const last7 = metrics.slice(-7);
	const prev7 = metrics.slice(-14, -7);
	const currentErrors = last7.reduce((s, d) => s + d.errors, 0);
	const prevErrors = prev7.reduce((s, d) => s + d.errors, 0);
	const errorChange =
		prevErrors > 0 ? ((currentErrors - prevErrors) / prevErrors) * 100 : 0;

	const errorsByType = data.errors.reduce(
		(acc, e) => {
			acc[e.type] = (acc[e.type] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
	const topErrorType = Object.entries(errorsByType).sort(
		(a, b) => b[1] - a[1],
	)[0];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Errors</h1>
				<p className="text-sm text-muted-foreground">
					Failure analysis and error trends
				</p>
			</div>

			<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
				<KpiCard
					title="Total Errors"
					value={String(totalErrors)}
					change={`${errorChange >= 0 ? "+" : ""}${errorChange.toFixed(0)}% vs prev 7d`}
					changeType={errorChange > 0 ? "negative" : "positive"}
					icon={AlertTriangle}
					sparklineData={last7.map((d) => d.errors)}
				/>
				<KpiCard
					title="Error Rate"
					value={`${errorRate.toFixed(1)}%`}
					changeType={errorRate > 15 ? "negative" : "positive"}
					icon={Bug}
				/>
				<KpiCard
					title="Top Error Type"
					value={topErrorType ? topErrorType[0].replace("_", " ") : "—"}
					icon={ShieldAlert}
				/>
				<KpiCard
					title="Errors (7d)"
					value={String(currentErrors)}
					change={`${errorChange >= 0 ? "+" : ""}${errorChange.toFixed(0)}% trend`}
					changeType={errorChange > 0 ? "negative" : "positive"}
					icon={TrendingUp}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					title="Errors Over Time"
					description="Daily error count"
				>
					<ErrorsOverTimeChart data={metrics} />
				</ChartCard>
				<ChartCard
					title="Errors by Type"
					description="Distribution across error categories"
				>
					<ErrorsByTypeChart data={data.errors} />
				</ChartCard>
			</div>

			<ChartCard
				title="Errors by Project"
				description="Error count per project"
			>
				<ErrorsByProjectChart data={data.errors} />
			</ChartCard>

			<ChartCard title="Error Log">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Time</TableHead>
							<TableHead>Task</TableHead>
							<TableHead>Project</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Message</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.errors.map((error) => (
							<TableRow key={error.id}>
								<TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
									{formatTimestamp(error.timestamp)}
								</TableCell>
								<TableCell className="text-xs max-w-40 truncate">
									{error.taskTitle}
								</TableCell>
								<TableCell className="text-xs font-mono text-muted-foreground">
									{error.projectName}
								</TableCell>
								<TableCell>
									<Badge variant={ERROR_TYPE_COLORS[error.type]}>
										{error.type.replace("_", " ")}
									</Badge>
								</TableCell>
								<TableCell className="text-xs text-muted-foreground max-w-64 truncate">
									{error.message}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</ChartCard>
		</div>
	);
}
