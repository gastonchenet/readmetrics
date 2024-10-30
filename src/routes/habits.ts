import Elysia, { t } from "elysia";
import Svg from "../classes/Svg";

export default new Elysia({ prefix: "/habits" }).get(
	"/",
	async ({ set }) => {
		console.log("Habits");

		return new Svg({
			HTMLContent: "Habits",
			filename: "habits.svg",
			stylesheet: "",
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
