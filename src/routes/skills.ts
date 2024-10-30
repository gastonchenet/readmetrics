import Elysia, { NotFoundError, t } from "elysia";
import path from "node:path";
import User from "../classes/User";
import Svg from "../classes/Svg";
import formatBytes from "../utils/formatBytes";
import loadIcon from "../utils/loadIcon";
import makeProgressBar from "../utils/makeProgressBar";

export default new Elysia({ prefix: "/skills" }).get(
	"/",
	async ({ set }) => {
		const user = await User.getSkills();

		if (!user) {
			set.status = "Not Found";
			throw new NotFoundError("User not found");
		}

		const colors: Record<string, string> = {};
		const primaryLanguages: Record<string, number> = {};
		const languages: Record<string, number> = {};

		let totalPrimarySize = 0;
		let totalSize = 0;

		for (const node of user.repositories.nodes) {
			const language = node.primaryLanguage;
			if (!language) continue;

			totalPrimarySize += 1;

			if (language) {
				if (primaryLanguages[language.name]) {
					primaryLanguages[language.name] += 1;
				} else {
					primaryLanguages[language.name] = 1;
				}
			}
		}

		for (const repo of user.repositories.nodes) {
			for (const lang of repo.languages.edges) {
				totalSize += lang.size;

				if (!colors[lang.node.name]) colors[lang.node.name] = lang.node.color;

				if (languages[lang.node.name]) {
					languages[lang.node.name] += lang.size;
				} else {
					languages[lang.node.name] = lang.size;
				}
			}
		}

		const primaryLanguagesProps = Object.entries(primaryLanguages).map(
			([lang, size]) => ({
				lang,
				prop: size / totalPrimarySize,
				color: colors[lang],
			})
		);

		const languagesProps = Object.entries(languages).map(([lang, size]) => ({
			lang,
			size,
			prop: size / totalSize,
			color: colors[lang],
		}));

		const content = `<h2 class="title">
			${user.name}'s skills
		</h2>
		<p class="label">
			${await loadIcon("starred")}
			<span>Most used languages</span>
		</p>
		${makeProgressBar(languagesProps)}
		<div class="language-container">
			${languagesProps
				.slice(0, 4)
				.map(
					({ lang, prop, size, color }) => `<p class="language">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12px" width="12px">
					<ellipse cx="6" cy="6" rx="6" ry="6" fill="${color}" />
				</svg>
				<span><b>${(Math.round(prop * 1000) / 10).toLocaleString("en")}%</b></span>
				<span>${lang}</span>
				<span class="size">${formatBytes(size)}</span>
			</p>`
				)
				.join("")}
		</div>
		<p class="label">
			${await loadIcon("repo")}
			<span>Most used project main languages</span>
		</p>
		${makeProgressBar(primaryLanguagesProps)}
		<div class="language-container grid">
			${primaryLanguagesProps
				.slice(0, 12)
				.map(
					({ lang, color, prop }) => `<p class="language">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12px" width="12px">
					<ellipse cx="6" cy="6" rx="6" ry="6" fill="${color}" />
				</svg>
				<span><b>${(Math.round(prop * 1000) / 10).toLocaleString("en")}%</b></span>
				<span>${lang}</span>
			</p>`
				)
				.join("")}
		</div>`;

		return new Svg({
			HTMLContent: content,
			stylesheet: path.join(process.cwd(), "public/styles/skills.css"),
			filename: "skills.svg",
			width: 480,
			height: 340,
		});
	},
	{
		response: t.File({
			type: "image/svg",
		}),
	}
);
