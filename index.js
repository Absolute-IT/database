const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

class Database {
	constructor(){
		const filePath = `${path.dirname(require.main.filename)}${path.sep}database.json`;

		if (!fs.existsSync(filePath)) throw `ERROR: No 'database.json' file found in root directory (${filePath}).`;
		
		this.config = JSON.parse(fs.readFileSync(filePath));

		this.source = null;
		this.targets = [];
		for (const settings of this.config.databases){
			const label = settings.label;
			const type = settings.type;

			delete settings.label;
			delete settings.type;

			const connection = mysql.createPool(settings);
			connection.label = label;

			if (type == "source"){
				this.source = connection;
			}else if (type == "target"){
				this.targets.push(connection);
			}
		}
	}

	query(query, parameters = []){
		for (const target of this.targets){
			target.query(query, parameters).catch(error => { console.log(`TARGET ERROR: ${target.label}`); console.log(error); });
		}

		return this.source.query(query, parameters);
	}

	searchQuery(q, c, t = "AND"){
		const qw = q.split(' ').filter(x => x.length).map(x => `%${x}%`);
		return [`(${qw.map((x) => `${c} LIKE ?`).join(` ${t} `)})`, qw];
	}
}

module.exports = new Database();