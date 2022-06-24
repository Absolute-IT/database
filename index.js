require('dotenv').config({ path: "/home/ubuntu/.env" });

const mysql = require("mysql2/promise");

const connection = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: "main",
	flags: "-FOUND_ROWS",
	charset: "utf8mb4_0900_ai_ci",
	multipleStatements: true,
	connectionLimit: 10,
	queueLimit: 0,
	timezone: "+00:00"
});

connection.searchQuery = (q, c, t = "AND") => {
	const qw = q.split(' ').filter(x => x.length).map(x => `%${x}%`);
	return [`(${qw.map((x) => `${c} LIKE ?`).join(` ${t} `)})`, qw];
};

module.exports = connection;