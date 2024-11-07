import Elysia, { t } from "elysia";
import Svg from "../classes/Svg";
import User from "../classes/User";
import path from "node:path";
import urlToBase64 from "../utils/urlToBase64";

const AVATAR_SIZE = 30;
const CONTRIBUTORS_PER_ROW = 15;
const GRID_GAP = 5;

export default new Elysia({ prefix: "/contributors" }).get(
	"/",
	async ({ set, params }) => {
		const user = await User.getContributors(params.repo_name);

		if (!user) {
			set.status = "Not Found";
			throw new Error("Repository or user not found");
		}

		const contributors = user.nodes.map((contributor) => ({
			avatarUrl: contributor.avatarUrl,
		}));

		const columns = Math.ceil(contributors.length / CONTRIBUTORS_PER_ROW);

		const content = `<div class="contributors" style="grid-template-columns:repeat(${CONTRIBUTORS_PER_ROW}, 1fr);gap:${GRID_GAP}px">
			${(
				await Promise.all(
					contributors.map(
						async (contributor) =>
							`<img src="${await urlToBase64(
								contributor.avatarUrl
							)}" class="avatar" style="height:${AVATAR_SIZE}px;width:${AVATAR_SIZE}px" />`
					)
				)
			).join("")}
		</div>`;

		return new Svg({
			HTMLContent: content,
			width:
				AVATAR_SIZE * CONTRIBUTORS_PER_ROW +
				GRID_GAP * (CONTRIBUTORS_PER_ROW - 1) +
				19.2,
			height: columns * AVATAR_SIZE + GRID_GAP * (columns - 1) + 19.2,
			stylesheet: path.join(process.cwd(), "public/styles/contributors.scss"),
			filename: "contributors.svg",
		});
	},
	{
		params: t.Object({
			repo_name: t.String(),
		}),
	}
);
