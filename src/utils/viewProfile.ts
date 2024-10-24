import { Database } from "bun:sqlite";

const db = new Database("database.db");

db.run(
	`CREATE TABLE IF NOT EXISTS User (
    views INTEGER DEFAULT 0
  )`
);

class User {
	public views!: number;
}

export default function viewProfile(username: string) {
	const stmt = db.query(
		`SELECT *
    FROM User`
	);

	const user = stmt.as(User).get(username);

	if (!user) {
		db.query(
			`INSERT INTO User (views)
      VALUES (1)`
		).run(username);
	} else {
		db.query(
			`UPDATE User
      SET views = views + 1`
		).run(username);
	}

	return (user?.views ?? 0) + 1;
}
