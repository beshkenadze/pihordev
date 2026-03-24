export const MODEL_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> =
	{
		"claude-sonnet-4-6": { inputPerMillion: 3, outputPerMillion: 15 },
		"claude-opus-4-6": { inputPerMillion: 15, outputPerMillion: 75 },
		"claude-haiku-4-5": { inputPerMillion: 0.8, outputPerMillion: 4 },
		"gpt-5.4": { inputPerMillion: 2.5, outputPerMillion: 10 },
		"gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
		"gemini-3.1-flash": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
		"gemini-3.1-pro": { inputPerMillion: 1.25, outputPerMillion: 5 },
	};

export const DEFAULT_MODEL = "claude-sonnet-4-6";

export const WEBSOCKET_RECONNECT_INTERVAL_MS = 3000;
export const WEBSOCKET_MAX_RECONNECT_ATTEMPTS = 10;
