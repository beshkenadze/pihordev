import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/mock-data";

function formatElapsed(startedAt: string) {
	const ms = Date.now() - new Date(startedAt).getTime();
	const minutes = Math.floor(ms / 60000);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	return `${hours}h ${minutes % 60}m`;
}

function formatCost(cost: number) {
	return `$${cost.toFixed(2)}`;
}

const STATUS_CONFIG: Record<
	string,
	{ label: string; variant: "default" | "secondary" | "outline"; dotClass: string }
> = {
	running: {
		label: "Running",
		variant: "default",
		dotClass: "bg-emerald-500 animate-pulse",
	},
	idle: {
		label: "Idle",
		variant: "secondary",
		dotClass: "bg-yellow-500",
	},
	waiting_for_input: {
		label: "Waiting",
		variant: "outline",
		dotClass: "bg-blue-500 animate-pulse",
	},
};

export default function LiveAgentsPage() {
	const data = getDashboardData();
	const agents = data.liveAgents;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Live Agents
					</h1>
					<p className="text-sm text-muted-foreground">
						Currently running agent sessions
					</p>
				</div>
				<Badge variant="outline" className="gap-1.5">
					<Activity className="h-3 w-3" />
					{agents.length} active
				</Badge>
			</div>

			{agents.length === 0 ? (
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<p className="text-muted-foreground">No agents running</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{agents.map((agent) => {
						const config = STATUS_CONFIG[agent.status];
						return (
							<Card key={agent.taskId}>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="space-y-1 min-w-0">
											<CardTitle className="text-sm font-medium truncate">
												{agent.taskTitle}
											</CardTitle>
											<p className="text-xs text-muted-foreground font-mono">
												{agent.projectName}
											</p>
										</div>
										<Badge variant={config.variant} className="gap-1.5 shrink-0">
											<span
												className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
											/>
											{config.label}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="grid grid-cols-2 gap-3 text-xs">
										<div>
											<p className="text-muted-foreground">Model</p>
											<p className="font-mono font-medium">{agent.model}</p>
										</div>
										<div>
											<p className="text-muted-foreground">Elapsed</p>
											<p className="font-mono font-medium">
												{formatElapsed(agent.startedAt)}
											</p>
										</div>
										<div>
											<p className="text-muted-foreground">Tokens</p>
											<p className="font-mono font-medium">
												{(agent.tokens / 1000).toFixed(0)}K
											</p>
										</div>
										<div>
											<p className="text-muted-foreground">Cost</p>
											<p className="font-mono font-medium">
												{formatCost(agent.cost)}
											</p>
										</div>
										{agent.currentTool && (
											<div className="col-span-2">
												<p className="text-muted-foreground">Current Tool</p>
												<p className="font-mono font-medium">
													<span className="inline-flex items-center gap-1">
														<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
														{agent.currentTool}
													</span>
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
