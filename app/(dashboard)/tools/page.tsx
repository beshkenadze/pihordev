import { Wrench, Cpu, BarChart3, Zap } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import {
	ToolUsageChart,
	ToolSuccessChart,
	ModelDistributionChart,
	ToolUsageOverTimeChart,
	TokensPerTaskChart,
} from "./charts";
import { getDashboardData } from "@/lib/mock-data";

export default function ToolsPage() {
	const data = getDashboardData();

	const totalInvocations = data.tools.reduce((s, t) => s + t.invocations, 0);
	const avgToolSuccess =
		data.tools.reduce((s, t) => s + t.successRate, 0) / data.tools.length;
	const topTool = [...data.tools].sort(
		(a, b) => b.invocations - a.invocations,
	)[0];
	const topModel = [...data.models].sort((a, b) => b.tasks - a.tasks)[0];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Tools & Agents
				</h1>
				<p className="text-sm text-muted-foreground">
					Tool usage patterns and model distribution
				</p>
			</div>

			<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
				<KpiCard
					title="Total Tool Calls"
					value={totalInvocations.toLocaleString()}
					icon={Wrench}
				/>
				<KpiCard
					title="Tool Success Rate"
					value={`${avgToolSuccess.toFixed(1)}%`}
					changeType="positive"
					icon={BarChart3}
				/>
				<KpiCard
					title="Top Tool"
					value={topTool.name}
					icon={Zap}
				/>
				<KpiCard
					title="Top Model"
					value={topModel.name.split("-").slice(0, 2).join("-")}
					icon={Cpu}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					title="Tool Usage"
					description="Total invocations per tool"
				>
					<ToolUsageChart data={data.tools} />
				</ChartCard>
				<ChartCard
					title="Tool Success Rate"
					description="Success rate by tool"
				>
					<ToolSuccessChart data={data.tools} />
				</ChartCard>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<ChartCard
					title="Model Distribution"
					description="Tasks by LLM model"
				>
					<ModelDistributionChart data={data.models} />
				</ChartCard>
				<ChartCard
					title="Tool Usage Over Time"
					description="Daily tool invocations by type"
				>
					<ToolUsageOverTimeChart data={data.dailyToolUsage} />
				</ChartCard>
			</div>

			<ChartCard
				title="Tokens per Task by Model"
				description="Average token consumption comparison"
			>
				<TokensPerTaskChart data={data.models} />
			</ChartCard>
		</div>
	);
}
