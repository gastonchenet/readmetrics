import Elysia, { NotFoundError, t } from "elysia";
import Svg from "../classes/Svg";
import path from "node:path";
import User from "../classes/User";

export default new Elysia({ prefix: "/collaborators" }).get(
	"/",
	async ({ set }) => {
		const rawCollaborators = await User.getCollaborators();

		if (!rawCollaborators) {
			set.status = "Not Found";
			throw new NotFoundError("User not found");
		}

		rawCollaborators.repositories.nodes[0].collaborators.nodes.forEach(
			(collaborator) => {
				console.log(collaborator);
			}
		);

		const content = `<h2 class="header">Collaborators</h2>
    <div>
      
    </div>`;

		return new Svg({
			HTMLContent: content,
			stylesheet: path.join(process.cwd(), "public/styles/collaborators.css"),
			filename: "collaborators.svg",
			width: 480,
			height: 210,
		});
	},
	{
		response: t.File({
			type: "image/svg",
		}),
	}
);
