export interface DailyMetrics {
	date: string;
	tasks: number;
	completedTasks: number;
	failedTasks: number;
	totalTokens: number;
	inputTokens: number;
	outputTokens: number;
	totalCost: number;
	avgCompletionTimeMs: number;
	p50CompletionTimeMs: number;
	p95CompletionTimeMs: number;
	errors: number;
}

export interface TaskRecord {
	id: string;
	title: string;
	projectName: string;
	teamName: string;
	model: string;
	status: "completed" | "failed" | "running" | "queued";
	tokens: number;
	cost: number;
	durationMs: number;
	createdAt: string;
	errorType?: string;
	errorMessage?: string;
}

export interface ProjectMetrics {
	name: string;
	tasks: number;
	cost: number;
	tokens: number;
	successRate: number;
	avgCompletionTimeMs: number;
}

export interface TeamMetrics {
	name: string;
	members: number;
	tasks: number;
	cost: number;
}

export interface ModelMetrics {
	name: string;
	tasks: number;
	tokens: number;
	cost: number;
	successRate: number;
	avgCompletionTimeMs: number;
}

export interface ToolMetrics {
	name: string;
	invocations: number;
	successRate: number;
}

export interface DailyToolUsage {
	date: string;
	bash: number;
	read: number;
	write: number;
	edit: number;
	grep: number;
	glob: number;
}

export interface ErrorRecord {
	id: string;
	taskId: string;
	taskTitle: string;
	projectName: string;
	type: "timeout" | "sandbox_crash" | "llm_error" | "tool_failure" | "rate_limit";
	message: string;
	timestamp: string;
}

export interface LiveAgent {
	taskId: string;
	taskTitle: string;
	projectName: string;
	model: string;
	status: "running" | "idle" | "waiting_for_input";
	tokens: number;
	cost: number;
	startedAt: string;
	lastActivityAt: string;
	currentTool?: string;
}

export interface DashboardData {
	dailyMetrics: DailyMetrics[];
	tasks: TaskRecord[];
	projects: ProjectMetrics[];
	teams: TeamMetrics[];
	models: ModelMetrics[];
	tools: ToolMetrics[];
	dailyToolUsage: DailyToolUsage[];
	errors: ErrorRecord[];
	liveAgents: LiveAgent[];
	orgName: string;
}
