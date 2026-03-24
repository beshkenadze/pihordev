import { ZenStackClient } from "@zenstackhq/orm";
import { PostgresDialect } from "@zenstackhq/orm/dialects/postgres";
import pg from "pg";
import { schema } from "../node_modules/.zenstack/schema";

export type { ZenStackClient };

export function createDbClient(connectionString?: string) {
	const url = connectionString ?? process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is required");
	}

	return new ZenStackClient(schema, {
		dialect: new PostgresDialect({
			pool: new pg.Pool({ connectionString: url }),
		}),
	});
}
