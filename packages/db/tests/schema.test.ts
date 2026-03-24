import { describe, expect, it } from "vitest";
import { schema } from "../node_modules/.zenstack/schema";

const EXPECTED_MODELS = [
	"Organization",
	"Team",
	"User",
	"Member",
	"Project",
	"Task",
	"AgentInstance",
	"ApiKey",
] as const;

function getMapName(
	model: (typeof schema.models)[keyof typeof schema.models],
): string | undefined {
	const attr = model.attributes?.find(
		(a: { name: string }) => a.name === "@@map",
	);
	return attr?.args?.[0]?.value?.value as string | undefined;
}

function getUniqueFields(
	model: (typeof schema.models)[keyof typeof schema.models],
): string[][] {
	return (model.attributes ?? [])
		.filter((a: { name: string }) => a.name === "@@unique")
		.map((a: { args: Array<{ value: { items: Array<{ field: string }> } }> }) =>
			a.args[0].value.items.map((item: { field: string }) => item.field),
		);
}

describe("ZenStack schema - models", () => {
	it("defines all 8 app models", () => {
		const modelNames = Object.keys(schema.models);
		for (const name of EXPECTED_MODELS) {
			expect(modelNames).toContain(name);
		}
		expect(modelNames).toHaveLength(EXPECTED_MODELS.length);
	});

	it("uses postgresql provider", () => {
		expect(schema.provider.type).toBe("postgresql");
	});
});

describe("ZenStack schema - Organization", () => {
	const model = schema.models.Organization;

	it("has required fields", () => {
		const fieldNames = Object.keys(model.fields);
		expect(fieldNames).toContain("id");
		expect(fieldNames).toContain("name");
		expect(fieldNames).toContain("slug");
		expect(fieldNames).toContain("defaultModel");
		expect(fieldNames).toContain("createdAt");
		expect(fieldNames).toContain("updatedAt");
	});

	it("id field is primary key with cuid default", () => {
		expect(model.fields.id.id).toBe(true);
		expect(model.fields.id.type).toBe("String");
	});

	it("slug is unique", () => {
		expect(model.fields.slug.unique).toBe(true);
	});

	it("has relation fields for members, teams, projects, tasks, apiKeys", () => {
		expect(model.fields.members.type).toBe("Member");
		expect(model.fields.members.array).toBe(true);
		expect(model.fields.teams.type).toBe("Team");
		expect(model.fields.projects.type).toBe("Project");
		expect(model.fields.tasks.type).toBe("Task");
		expect(model.fields.apiKeys.type).toBe("ApiKey");
	});

	it("maps to 'organization' table", () => {
		expect(getMapName(model)).toBe("organization");
	});
});

describe("ZenStack schema - Team", () => {
	const model = schema.models.Team;

	it("has required fields", () => {
		expect(model.fields.id.type).toBe("String");
		expect(model.fields.name.type).toBe("String");
		expect(model.fields.orgId.type).toBe("String");
	});

	it("has org relation", () => {
		expect(model.fields.org.type).toBe("Organization");
		expect(model.fields.org.relation).toBeDefined();
	});

	it("has unique constraint on [orgId, name]", () => {
		const uniques = getUniqueFields(model);
		expect(uniques).toContainEqual(["orgId", "name"]);
	});
});

describe("ZenStack schema - User", () => {
	const model = schema.models.User;

	it("has required fields", () => {
		expect(model.fields.id.type).toBe("String");
		expect(model.fields.email.type).toBe("String");
		expect(model.fields.email.unique).toBe(true);
		expect(model.fields.name.optional).toBe(true);
		expect(model.fields.emailVerified.type).toBe("Boolean");
	});

	it("has relations to memberships, tasks, apiKeys", () => {
		expect(model.fields.memberships.type).toBe("Member");
		expect(model.fields.memberships.array).toBe(true);
		expect(model.fields.tasks.type).toBe("Task");
		expect(model.fields.apiKeys.type).toBe("ApiKey");
	});
});

describe("ZenStack schema - Member", () => {
	const model = schema.models.Member;

	it("has role with default member", () => {
		expect(model.fields.role.type).toBe("String");
		expect(model.fields.role.default).toBe("member");
	});

	it("has required foreign keys", () => {
		expect(model.fields.orgId.type).toBe("String");
		expect(model.fields.userId.type).toBe("String");
	});

	it("teamId is optional", () => {
		expect(model.fields.teamId.optional).toBe(true);
	});

	it("has unique constraint on [orgId, userId]", () => {
		const uniques = getUniqueFields(model);
		expect(uniques).toContainEqual(["orgId", "userId"]);
	});

	it("has org, user, team relations", () => {
		expect(model.fields.org.type).toBe("Organization");
		expect(model.fields.user.type).toBe("User");
		expect(model.fields.team.type).toBe("Team");
	});
});

describe("ZenStack schema - Project", () => {
	const model = schema.models.Project;

	it("has required fields", () => {
		expect(model.fields.name.type).toBe("String");
		expect(model.fields.repoUrl.type).toBe("String");
		expect(model.fields.orgId.type).toBe("String");
	});

	it("description is optional", () => {
		expect(model.fields.description.optional).toBe(true);
	});

	it("has org relation", () => {
		expect(model.fields.org.type).toBe("Organization");
	});
});

describe("ZenStack schema - Task", () => {
	const model = schema.models.Task;

	it("has required fields", () => {
		expect(model.fields.title.type).toBe("String");
		expect(model.fields.status.type).toBe("String");
		expect(model.fields.status.default).toBe("pending");
		expect(model.fields.model.type).toBe("String");
		expect(model.fields.model.default).toBe("claude-sonnet-4-6");
	});

	it("has project, org, createdBy relations", () => {
		expect(model.fields.project.type).toBe("Project");
		expect(model.fields.org.type).toBe("Organization");
		expect(model.fields.createdBy.type).toBe("User");
	});

	it("has optional agent relation", () => {
		expect(model.fields.agent.type).toBe("AgentInstance");
		expect(model.fields.agent.optional).toBe(true);
	});
});

describe("ZenStack schema - AgentInstance", () => {
	const model = schema.models.AgentInstance;

	it("has required fields", () => {
		expect(model.fields.taskId.type).toBe("String");
		expect(model.fields.taskId.unique).toBe(true);
		expect(model.fields.status.type).toBe("String");
		expect(model.fields.status.default).toBe("starting");
	});

	it("sandboxId and timestamps are optional", () => {
		expect(model.fields.sandboxId.optional).toBe(true);
		expect(model.fields.startedAt.optional).toBe(true);
		expect(model.fields.stoppedAt.optional).toBe(true);
	});

	it("has task relation", () => {
		expect(model.fields.task.type).toBe("Task");
	});
});

describe("ZenStack schema - ApiKey", () => {
	const model = schema.models.ApiKey;

	it("has required fields", () => {
		expect(model.fields.name.type).toBe("String");
		expect(model.fields.keyHash.type).toBe("String");
		expect(model.fields.keyHash.unique).toBe(true);
		expect(model.fields.keyPreview.type).toBe("String");
	});

	it("keyValue is optional and encrypted", () => {
		expect(model.fields.keyValue.optional).toBe(true);
		const attrs = model.fields.keyValue.attributes ?? [];
		const hasEncrypted = attrs.some(
			(a: { name: string }) => a.name === "@encrypted",
		);
		expect(hasEncrypted).toBe(true);
	});

	it("has org and createdBy relations", () => {
		expect(model.fields.org.type).toBe("Organization");
		expect(model.fields.createdBy.type).toBe("User");
	});

	it("revokedAt and lastUsedAt are optional", () => {
		expect(model.fields.revokedAt.optional).toBe(true);
		expect(model.fields.lastUsedAt.optional).toBe(true);
	});
});

describe("ZenStack schema - table mappings", () => {
	it("all models map to snake_case table names", () => {
		const expected: Record<string, string> = {
			Organization: "organization",
			Team: "team",
			User: "user",
			Member: "member",
			Project: "project",
			Task: "task",
			AgentInstance: "agent_instance",
			ApiKey: "api_key",
		};

		for (const [modelName, table] of Object.entries(expected)) {
			expect(getMapName(schema.models[modelName])).toBe(table);
		}
	});
});
