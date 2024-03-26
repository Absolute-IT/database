import { existsSync, readFileSync } from "node:fs";
import { dirname, sep } from "path";
import { createPool } from "mysql2/promise";

class Database {
	constructor() {
		const filePath = `${dirname(require.main.filename)}${sep}database.json`;

		if (!existsSync(filePath)) throw `ERROR: No 'database.json' file found in root directory (${filePath}).`;

		this.config = JSON.parse(readFileSync(filePath));
		this.source = createPool(this.config);
	}

	query(query, parameters = []) {
		return this.source.query(query, parameters);
	}

	searchQuery(q, c, t = "AND") {
		const qw = q.split(" ").filter((x) => x.length).map((x) => `%${x}%`);
		return [`(${qw.map((x) => `${c} LIKE ?`).join(` ${t} `)})`, qw];
	}
}

export default new Database();
