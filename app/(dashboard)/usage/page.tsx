import { Coins, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
	CostByModelChart,
	CostByProjectChart,
	CostByTeamChart,
	TokenUsageChart,
	TaskVolumeByProjectChart,
} from "./charts";
import { getDashboardData } from "@/lib/mock-data";

function formatCost(cost: number) {
	return `$${cost.toFixed(2)}`;
}

export default function UsagePage() {
	const data = getDashboardData();
	const metrics = data.dailyMetrics;

	const totalCost = metrics.reduce((s, d) => s + d.totalCost, 0);
	const totalTokens = metrics.reduce((s, d) => s + d.totalTokens, 0);
	const totalTasks = metrics.reduce((s, d) => s + d.tasks, 0);
	const avgCostPerTask = totalTasks > 0 ? totalCost / totalTasks : 0;

	const last7 = metrics.slice(-7);
	const prev7 = metrics.slice(-14, -7);
	const current7Cost = last7.reduce((s, d) => s + d.totalCost, 0);
	const prev7Cost = prev7.reduce((s, d) => s + d.totalCost, 0);
	const costChange =
		prev7Cost > 0 ? ((current7Cost - prev7Cost) / prev7Cost) * 100 : 0;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">Usage & Cost</h1>
				<p className="text-sm text-muted-foreground">
					Spending breakdown and token usage over 30 days
				</p>
			</div>

			<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
				<KpiCard
					title="Total Cost"
					value={formatCost(totalCost)}
					change={`${costChange >= 0 ? "+" : ""}${costChange.toFixed(1)}% vs prev 7d`}
					changeType={costChange > 10 ? "negative" : "positive"}
					icon={Coins}
				/>
				<KpiCard
					title="Total Tokens"
					value={`${(totalTokens / 1_000_000).toFixed(1)}M`}
					icon={Zap}
				/>
				<KpiCard
					title="Avg Cost / Task"
					value={formatCost(avgCostPerTask)}
					icon={TrendingUp}
				/>
				<KpiCard
					title="Total Tasks"
					value={String(totalTasks)}
					icon={BarChart3}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					title="Cost by Model"
					description="Spend breakdown across LLM providers"
				>
					<CostByModelChart data={data.models} />
				</ChartCard>
				<ChartCard
					title="Cost by Project"
					description="Top projects by total spend"
				>
					<CostByProjectChart data={data.projects} />
				</ChartCard>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					title="Cost by Team"
					description="Team-level spending"
				>
					<CostByTeamChart data={data.teams} />
				</ChartCard>
				<ChartCard
					title="Token Usage Over Time"
					description="Input vs output tokens per day"
				>
					<TokenUsageChart data={metrics} />
				</ChartCard>
			</div>

			<ChartCard
				title="Task Volume by Project"
				description="Daily tasks stacked by project"
			>
				<TaskVolumeByProjectChart data={metrics} projects={data.projects} />
			</ChartCard>
		</div>
	);
}
