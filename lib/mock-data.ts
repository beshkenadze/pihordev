import type {
	DailyMetrics,
	DailyToolUsage,
	DashboardData,
	ErrorRecord,
	LiveAgent,
	ModelMetrics,
	ProjectMetrics,
	TaskRecord,
	TeamMetrics,
	ToolMetrics,
} from "./types";

function seededRandom(seed: number) {
	let s = seed;
	return () => {
		s = (s * 16807 + 0) % 2147483647;
		return (s - 1) / 2147483646;
	};
}

const rand = seededRandom(42);
const randBetween = (min: number, max: number) =>
	Math.floor(rand() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) =>
	Math.round((rand() * (max - min) + min) * 100) / 100;

const PROJECTS = [
	"api-gateway",
	"web-dashboard",
	"auth-service",
	"data-pipeline",
	"mobile-app",
];
const TEAMS = ["Platform", "Frontend", "Backend"];
const MODELS = [
	"claude-sonnet-4",
	"claude-opus-4",
	"gpt-4.1",
	"gemini-2.5-pro",
];
const TOOLS = ["bash", "read", "write", "edit", "grep", "glob"];
const ERROR_TYPES = [
	"timeout",
	"sandbox_crash",
	"llm_error",
	"tool_failure",
	"rate_limit",
] as const;
const TASK_TITLES = [
	"Add pagination to user list endpoint",
	"Fix race condition in WebSocket handler",
	"Implement OAuth2 refresh token flow",
	"Refactor database connection pooling",
	"Add unit tests for payment module",
	"Update API docs for v2 endpoints",
	"Fix memory leak in event listener",
	"Implement rate limiting middleware",
	"Add CSV export to analytics dashboard",
	"Fix timezone handling in scheduler",
	"Migrate from REST to GraphQL resolver",
	"Add health check endpoint",
	"Implement retry logic for failed jobs",
	"Fix N+1 query in project listing",
	"Add caching layer for session data",
	"Implement file upload validation",
	"Fix CORS issue on staging",
	"Add input sanitization to forms",
	"Refactor error handling middleware",
	"Implement soft delete for resources",
	"Add audit logging for admin actions",
	"Fix deadlock in concurrent writes",
	"Implement search with full-text index",
	"Add webhook retry with exponential backoff",
	"Fix broken migration rollback script",
	"Implement API key rotation",
	"Add monitoring alerts for error spikes",
	"Fix SSL certificate renewal automation",
	"Implement batch processing endpoint",
	"Add real-time notification system",
];

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
	"claude-sonnet-4": { input: 3, output: 15 },
	"claude-opus-4": { input: 15, output: 75 },
	"gpt-4.1": { input: 2, output: 8 },
	"gemini-2.5-pro": { input: 1.25, output: 10 },
};

function generateDailyMetrics(): DailyMetrics[] {
	const days: DailyMetrics[] = [];
	const now = new Date();

	for (let i = 29; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(date.getDate() - i);
		const dayOfWeek = date.getDay();
		const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
		const baseTasks = isWeekend ? randBetween(3, 8) : randBetween(12, 28);

		const tasks = baseTasks;
		const failedTasks = randBetween(0, Math.max(1, Math.floor(tasks * 0.15)));
		const completedTasks = tasks - failedTasks;
		const inputTokens = randBetween(80000, 350000) * tasks;
		const outputTokens = randBetween(20000, 80000) * tasks;

		days.push({
			date: date.toISOString().split("T")[0],
			tasks,
			completedTasks,
			failedTasks,
			totalTokens: inputTokens + outputTokens,
			inputTokens,
			outputTokens,
			totalCost: randFloat(15, 120) * (isWeekend ? 0.4 : 1),
			avgCompletionTimeMs: randBetween(45000, 180000),
			p50CompletionTimeMs: randBetween(35000, 120000),
			p95CompletionTimeMs: randBetween(200000, 600000),
			errors: failedTasks + randBetween(0, 3),
		});
	}
	return days;
}

function generateTasks(): TaskRecord[] {
	const tasks: TaskRecord[] = [];
	for (let i = 0; i < 30; i++) {
		const model = MODELS[randBetween(0, MODELS.length - 1)];
		const pricing = MODEL_PRICING[model];
		const inputTokens = randBetween(50000, 400000);
		const outputTokens = randBetween(10000, 100000);
		const cost =
			(inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
		const isFailed = rand() < 0.12;

		const createdDate = new Date();
		createdDate.setDate(createdDate.getDate() - randBetween(0, 29));
		createdDate.setHours(randBetween(8, 20), randBetween(0, 59));

		tasks.push({
			id: `task-${String(i + 1).padStart(3, "0")}`,
			title: TASK_TITLES[i % TASK_TITLES.length],
			projectName: PROJECTS[randBetween(0, PROJECTS.length - 1)],
			teamName: TEAMS[randBetween(0, TEAMS.length - 1)],
			model,
			status: isFailed
				? "failed"
				: i < 3
					? "running"
					: "completed",
			tokens: inputTokens + outputTokens,
			cost: Math.round(cost * 100) / 100,
			durationMs: randBetween(30000, 600000),
			createdAt: createdDate.toISOString(),
			errorType: isFailed
				? ERROR_TYPES[randBetween(0, ERROR_TYPES.length - 1)]
				: undefined,
			errorMessage: isFailed ? "Agent exceeded maximum execution time" : undefined,
		});
	}
	return tasks.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}

function generateProjectMetrics(): ProjectMetrics[] {
	return PROJECTS.map((name) => ({
		name,
		tasks: randBetween(20, 80),
		cost: randFloat(50, 500),
		tokens: randBetween(5_000_000, 30_000_000),
		successRate: randFloat(82, 98),
		avgCompletionTimeMs: randBetween(60000, 240000),
	}));
}

function generateTeamMetrics(): TeamMetrics[] {
	return TEAMS.map((name) => ({
		name,
		members: randBetween(2, 5),
		tasks: randBetween(30, 120),
		cost: randFloat(100, 800),
	}));
}

function generateModelMetrics(): ModelMetrics[] {
	return MODELS.map((name) => ({
		name,
		tasks: randBetween(15, 80),
		tokens: randBetween(3_000_000, 25_000_000),
		cost: randFloat(30, 400),
		successRate: randFloat(85, 98),
		avgCompletionTimeMs: randBetween(50000, 200000),
	}));
}

function generateToolMetrics(): ToolMetrics[] {
	const baseCounts = [4200, 3800, 2600, 2100, 1500, 900];
	return TOOLS.map((name, i) => ({
		name,
		invocations: baseCounts[i] + randBetween(-200, 200),
		successRate: randFloat(92, 99.5),
	}));
}

function generateDailyToolUsage(): DailyToolUsage[] {
	const days: DailyToolUsage[] = [];
	const now = new Date();
	for (let i = 29; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(date.getDate() - i);
		const isWeekend = date.getDay() === 0 || date.getDay() === 6;
		const mult = isWeekend ? 0.4 : 1;
		days.push({
			date: date.toISOString().split("T")[0],
			bash: Math.floor(randBetween(100, 200) * mult),
			read: Math.floor(randBetween(80, 180) * mult),
			write: Math.floor(randBetween(50, 120) * mult),
			edit: Math.floor(randBetween(40, 100) * mult),
			grep: Math.floor(randBetween(30, 80) * mult),
			glob: Math.floor(randBetween(15, 50) * mult),
		});
	}
	return days;
}

function generateErrors(): ErrorRecord[] {
	const errors: ErrorRecord[] = [];
	for (let i = 0; i < 15; i++) {
		const date = new Date();
		date.setDate(date.getDate() - randBetween(0, 14));
		date.setHours(randBetween(8, 20), randBetween(0, 59));
		const errorType = ERROR_TYPES[randBetween(0, ERROR_TYPES.length - 1)];
		const messages: Record<string, string> = {
			timeout: "Agent exceeded maximum execution time (300s)",
			sandbox_crash: "Sandbox process exited with signal SIGKILL (OOM)",
			llm_error: "API returned 429: rate limit exceeded",
			tool_failure: "Command failed: npm test (exit code 1)",
			rate_limit: "Provider rate limit: retry after 60s",
		};
		errors.push({
			id: `err-${String(i + 1).padStart(3, "0")}`,
			taskId: `task-${String(randBetween(1, 30)).padStart(3, "0")}`,
			taskTitle: TASK_TITLES[randBetween(0, TASK_TITLES.length - 1)],
			projectName: PROJECTS[randBetween(0, PROJECTS.length - 1)],
			type: errorType,
			message: messages[errorType],
			timestamp: date.toISOString(),
		});
	}
	return errors.sort(
		(a, b) =>
			new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);
}

function generateLiveAgents(): LiveAgent[] {
	const agents: LiveAgent[] = [];
	const statuses = ["running", "running", "running", "idle", "waiting_for_input"] as const;
	const currentTools = ["bash", "read", "write", "edit", undefined];
	for (let i = 0; i < 4; i++) {
		const model = MODELS[randBetween(0, MODELS.length - 1)];
		const pricing = MODEL_PRICING[model];
		const tokens = randBetween(50000, 200000);
		const cost = (tokens * ((pricing.input + pricing.output) / 2)) / 1_000_000;
		const started = new Date();
		started.setMinutes(started.getMinutes() - randBetween(5, 120));

		agents.push({
			taskId: `task-${String(i + 1).padStart(3, "0")}`,
			taskTitle: TASK_TITLES[i],
			projectName: PROJECTS[randBetween(0, PROJECTS.length - 1)],
			model,
			status: statuses[i % statuses.length],
			tokens,
			cost: Math.round(cost * 100) / 100,
			startedAt: started.toISOString(),
			lastActivityAt: new Date(
				started.getTime() + randBetween(1, 30) * 60000,
			).toISOString(),
			currentTool: currentTools[i % currentTools.length],
		});
	}
	return agents;
}

export function getDashboardData(): DashboardData {
	return {
		dailyMetrics: generateDailyMetrics(),
		tasks: generateTasks(),
		projects: generateProjectMetrics(),
		teams: generateTeamMetrics(),
		models: generateModelMetrics(),
		tools: generateToolMetrics(),
		dailyToolUsage: generateDailyToolUsage(),
		errors: generateErrors(),
		liveAgents: generateLiveAgents(),
		orgName: "Acme Corp",
	};
}
