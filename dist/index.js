import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createPool } from "mysql2/promise";
class Database {
    config;
    source;
    constructor() {
        const filePath = path.join(process.cwd(), `database.json`);
        if (!existsSync(filePath))
            throw `ERROR: No 'database.json' file found in root directory (${filePath}).`;
        this.config = JSON.parse(String(readFileSync(filePath)));
        this.source = createPool(this.config);
    }
    query(query, parameters = []) {
        return this.source.query(query, parameters)
            .then(([results, fields]) => {
            // Have to convert these return types for easier manipulation.
            // Can't use lambda functions on the results because OkPacket is a potential return type.
            if ("length" in results) {
                let final = [];
                // Results is an array.
                for (const result of results) {
                    if (result.insertId !== undefined) {
                        // This is an OkPacket.
                        final.push(result);
                    }
                    else {
                        // This is a RowDataPacket.
                        final.push(result);
                    }
                }
                return final;
            }
            else {
                // Results is not an array.
                if (results.insertId !== undefined) {
                    // This is an OkPacket.
                    return [results];
                }
                else {
                    // This is a RowDataPacket.
                    return results;
                }
            }
        });
    }
}
export default new Database();
