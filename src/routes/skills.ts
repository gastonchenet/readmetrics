import Elysia, { NotFoundError, t } from "elysia";
import User from "../classes/User";

const BAR_WIDTH = 460;
const FLOAT_ERROR = 1;

export default new Elysia({ prefix: "/skills" }).get(
	"/",
	async ({ set, params }) => {
		const user = await User.fromUsername(params.username).getSkills();

		if (!user) {
			set.status = "Not Found";
			throw new NotFoundError("User not found");
		}

		const colors: Record<string, string> = {};
		const primaryLanguages: Record<string, number> = {};
		const languages: Record<string, number> = {};

		let totalPrimarySize = 0;
		let totalSize = 0;

		for (const repo of user.repositories.nodes) {
			if (!repo.primaryLanguage) continue;

			totalPrimarySize += 1;

			if (repo.primaryLanguage) {
				if (primaryLanguages[repo.primaryLanguage.name]) {
					primaryLanguages[repo.primaryLanguage.name] += 1;
				} else {
					primaryLanguages[repo.primaryLanguage.name] = 1;
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

		const primaryLanguagesWidth: Record<string, number> = {};
		const languagesWidth: Record<string, number> = {};

		for (const lang in primaryLanguages) {
			primaryLanguagesWidth[lang] =
				(primaryLanguages[lang] / totalPrimarySize) * BAR_WIDTH;
		}

		for (const lang in languages) {
			languagesWidth[lang] = (languages[lang] / totalSize) * BAR_WIDTH;
		}

		const sortedPrimaryLanguages = Object.fromEntries(
			Object.entries(primaryLanguagesWidth).sort((a, b) => b[1] - a[1])
		);

		const sortedLanguages = Object.fromEntries(
			Object.entries(languagesWidth).sort((a, b) => b[1] - a[1])
		);

		const content = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="340">
      <style>${await Bun.file("./svg/style/skills.css").text()}</style>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" class="container">
					<h2 class="title">
						${user.name}'s skills
					</h2>
          <p class="label">
						${await Bun.file("./assets/images/starred.svg").text()}
						<span>Most used languages</span>
					</p>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BAR_WIDTH} 8" width="${BAR_WIDTH}" height="8px">
            ${Object.entries(sortedLanguages)
							.map(
								([lang, width], index) =>
									`<rect x="${Math.max(
										0,
										Object.entries(sortedLanguages)
											.slice(0, index)
											.reduce((acc, [_, value]) => acc + value, 0) - FLOAT_ERROR
									)}" y="0" width="${width + FLOAT_ERROR}" height="8" fill="${
										colors[lang]
									}" />`
							)
							.join("")}
          </svg>
					<div class="language-container">
						${Object.entries(sortedLanguages)
							.slice(0, 12)
							.map(
								([lang, width]) => `<p class="language">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12px" width="12px">
								<ellipse cx="6" cy="6" rx="6" ry="6" fill="${colors[lang]}" />
							</svg>
							<span><b>${(Math.round((width / BAR_WIDTH) * 1000) / 10).toLocaleString(
								"en"
							)}%</b></span>
							<span>${lang}</span>
						</p>`
							)
							.join("")}
					</div>
          <p class="label">
						${await Bun.file("./assets/images/repo.svg").text()}
						<span>Most used project main languages</span>
					</p>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BAR_WIDTH} 8" width="${BAR_WIDTH}" height="8px">
            ${Object.entries(sortedPrimaryLanguages)
							.map(
								([lang, width], index) =>
									`<rect x="${Math.max(
										0,
										Object.entries(sortedPrimaryLanguages)
											.slice(0, index)
											.reduce((acc, [_, value]) => acc + value, 0) - FLOAT_ERROR
									)}" y="0" width="${width + FLOAT_ERROR}" height="8" fill="${
										colors[lang]
									}" />`
							)
							.join("")}
          </svg>
					<div class="language-container">
						${Object.entries(sortedPrimaryLanguages)
							.slice(0, 12)
							.map(
								([lang, width]) => `<p class="language">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12px" width="12px">
								<ellipse cx="6" cy="6" rx="6" ry="6" fill="${colors[lang]}" />
							</svg>
							<span><b>${(Math.round((width / BAR_WIDTH) * 1000) / 10).toLocaleString(
								"en"
							)}%</b></span>
							<span>${lang}</span>
						</p>`
							)
							.join("")}
					</div>
        </div>
      </foreignObject>
    </svg>`;

		return new File([content], "global-info.svg", {
			type: "image/svg+xml",
		});
	},
	{
		params: t.Object({ username: t.String() }),
	}
);
