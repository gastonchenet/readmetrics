import { Database } from "bun:sqlite";

const db = new Database("database.db");

db.run(
	`CREATE TABLE IF NOT EXISTS User (
    username TEXT PRIMARY KEY,
    views INTEGER DEFAULT 0
  )`
);

class User {
	public username!: string;
	public views!: number;
}

export default function viewProfile(username: string) {
	const stmt = db.query(
		`SELECT *
    FROM User
    WHERE username = ?`
	);

	const user = stmt.as(User).get(username);

	if (!user) {
		db.query(
			`INSERT INTO User (username)
      VALUES (?)`
		).run(username);
	} else {
		db.query(
			`UPDATE User
      SET views = views + 1
      WHERE username = ?`
		).run(username);
	}

	return (user?.views ?? 0) + 1;
}
