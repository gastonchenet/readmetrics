import Elysia from "elysia";
import User from "../classes/User";

export default new Elysia({ prefix: "/topics" }).get(
	"/",
	async ({ set }) => {},
	{}
);
