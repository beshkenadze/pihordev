export type TaskStatus =
	| "pending"
	| "queued"
	| "running"
	| "done"
	| "error"
	| "cancelled";

export type AgentEventType =
	| "tool_call"
	| "llm_request"
	| "llm_response"
	| "error"
	| "completion";

export interface AgentEvent {
	id: string;
	taskId: string;
	type: AgentEventType;
	payload: unknown;
	timestamp: Date;
}

export type WebSocketMessageType =
	| "agent_event"
	| "agent_status"
	| "agent_attention"
	| "steer"
	| "followUp"
	| "abort"
	| "set_model";

export interface WebSocketMessage {
	type: WebSocketMessageType;
	payload: unknown;
}

export type MemberRole = "owner" | "admin" | "member";
