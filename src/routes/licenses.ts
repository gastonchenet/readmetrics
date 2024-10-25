import Elysia, { NotFoundError, t } from "elysia";
import Svg from "../classes/Svg";
import path from "node:path";
import User from "../classes/User";

const BAR_WIDTH = 460;
const FLOAT_ERROR = 1;

export default new Elysia({ prefix: "/licenses" }).get(
	"/",
	async ({ set }) => {
		const licenses = await User.getLicenses();

		if (!licenses) {
			set.status = "Not Found";
			throw new NotFoundError("Licenses not found");
		}

		const content = `<h2 class="header">Licenses</h2>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BAR_WIDTH} 8" width="${BAR_WIDTH}" height="8px">
      
    </svg>`;

		return new Svg({
			HTMLContent: content,
			stylesheet: path.join(process.cwd(), "public/styles/licenses.css"),
			filename: "licenses.svg",
			width: 480,
			height: 270,
		});
	},
	{
		response: t.File({
			type: "image/svg",
		}),
	}
);
