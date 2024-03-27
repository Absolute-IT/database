declare module "database" {
	import { Pool } from "mysql2/promise";

	export class Database {
		config: Object;
		source: Pool;

		constructor();
		query(query: string, parameters?: any[]): Promise<any[]>;
	}

	const database: Database;
	export default database;
}