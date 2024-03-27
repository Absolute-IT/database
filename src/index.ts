import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createPool, Pool, OkPacket, RowDataPacket } from "mysql2/promise";

class Database {
	config: Object;
	source: Pool;

	constructor() {
		const filePath = path.join(process.cwd(), `database.json`);

		if (!existsSync(filePath)) throw `ERROR: No 'database.json' file found in root directory (${filePath}).`;

		this.config = JSON.parse(String(readFileSync(filePath)));
		this.source = createPool(this.config);
	}

	query(query: string, parameters: any[] = []): Promise<any[]> {
		return this.source.query(query, parameters)
		.then(([results, fields]) => {
			// Have to convert these return types for easier manipulation.
			// Can't use lambda functions on the results because OkPacket is a potential return type.
			if ("length" in results) {
				let final: any[] = [];
				// Results is an array.
				for (const result of results as OkPacket[] | RowDataPacket[]) {
					if ((result as OkPacket).insertId !== undefined) {
						// This is an OkPacket.
						final.push(result as any);
					} else {
						// This is a RowDataPacket.
						final.push(result as any[]);
					}
				}

				return final;
			} else {
				// Results is not an array.
				if ((results as OkPacket).insertId !== undefined) {
					// This is an OkPacket.
					return [results] as any[];
				} else {
					// This is a RowDataPacket.
					return results as unknown as any[];
				}
			}
		});
	}
}

export default new Database();
