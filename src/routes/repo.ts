import Elysia, { NotFoundError, t } from "elysia";
import User from "../classes/User";

export default new Elysia({ prefix: "/repo/:repo_name" }).get(
	"/",
	async ({ set, params }) => {
		const repository = await User.getRepository(params.repo_name);

		if (!repository) {
			set.status = "Not Found";
			throw new NotFoundError("Repository not found");
		}

		throw new Error("Not implemented yet");
	},
	{
		params: t.Object({
			repo_name: t.String(),
		}),
	}
);
