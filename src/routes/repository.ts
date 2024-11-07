import Elysia, { NotFoundError, t } from "elysia";
import User from "../classes/User";
import contributors from "./contributors";

export default new Elysia({ prefix: "/repository/:repo_name" })
	.use(contributors)
	.get(
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
