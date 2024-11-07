import Elysia, { NotFoundError, t } from "elysia";
import Svg from "../classes/Svg";
import path from "node:path";
import User from "../classes/User";
import urlToBase64 from "../utils/urlToBase64";
import loadIcon from "../utils/loadIcon";

export default new Elysia({ prefix: "/followers" }).get(
	"/",
	async ({ set }) => {
		const rawFollowers = await User.getFollowers();

		if (!rawFollowers) {
			set.status = "Not Found";
			throw new NotFoundError("User not found");
		}

		const content = `<h2 class="header">Followers</h2>
    <div>
			<p class="line">
				${await loadIcon("following")}
				<span><b>${rawFollowers.followers.totalCount}</b> total followers </span>
			</p>
			<div class="followers">
				${(
					await Promise.all(
						rawFollowers.followers.nodes.map(
							async (follower) =>
								`<img src="${await urlToBase64(
									follower.avatarUrl
								)}" class="avatar" />`
						)
					)
				).join("")}
			</div>
    </div>`;

		return new Svg({
			HTMLContent: content,
			stylesheet: path.join(process.cwd(), "public/styles/followers.scss"),
			filename: "followers.svg",
			width: 480,
			height: 160,
		});
	},
	{
		response: t.File({
			type: "image/svg",
		}),
	}
);
