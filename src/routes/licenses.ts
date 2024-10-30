import Elysia, { NotFoundError, t } from "elysia";
import Svg from "../classes/Svg";
import path from "node:path";
import User from "../classes/User";
import hslToHex from "../utils/hslToHex";
import makeProgressBar from "../utils/makeProgressBar";
import loadIcon from "../utils/loadIcon";

export default new Elysia({ prefix: "/licenses" }).get(
	"/",
	async ({ set }) => {
		const rawLicenses = await User.getLicenses();

		if (!rawLicenses) {
			set.status = "Not Found";
			throw new NotFoundError("Licenses not found");
		}

		const curHSL = { h: 120, s: 50, l: 30 };
		const licenses: Record<string, number> = {};
		const permissions: Record<string, number> = {};
		let totalCount = 0;
		let totalPermissionCount = 0;

		for (const repo of rawLicenses.repositories.nodes) {
			if (repo.licenseInfo) {
				const license = repo.licenseInfo.spdxId;
				if (!licenses[license]) licenses[license] = 0;
				licenses[license]++;

				for (const permission of repo.licenseInfo.permissions) {
					if (!permissions[permission.label]) permissions[permission.label] = 0;
					permissions[permission.label]++;
					totalPermissionCount++;
				}
			}

			totalCount++;
		}

		const cleanLicenses = Object.entries(licenses).map(([license, count]) => ({
			license,
			count,
			prop: count / totalCount,
			color:
				license === "NOASSERTION"
					? "#a3a3a3"
					: hslToHex(curHSL.h, curHSL.s, (curHSL.l += 7)),
		}));

		curHSL.l = 30;

		const cleanPermissions = Object.entries(permissions).map(
			([permission, count]) => ({
				permission,
				count,
				prop: count / totalPermissionCount,
				color: hslToHex(curHSL.h, curHSL.s, (curHSL.l += 7)),
			})
		);

		const content = `<h2 class="header">Licenses</h2>
		<p class="label">
			${await loadIcon("license")}
			<span>Most used licenses</span>
		</p>
    ${makeProgressBar(cleanLicenses)}
		<div class="language-container grid">
			${cleanLicenses
				.slice(
					0,
					cleanLicenses.length <
						Object.values(licenses).reduce((acc, cur) => acc + cur, 0)
						? 5
						: 6
				)
				.map(
					({ license, color, prop, count }) => `<p class="language">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12px" width="12px">
							<ellipse cx="6" cy="6" rx="6" ry="6" fill="${color}" />
						</svg>
						<span><b>${(Math.round(prop * 1000) / 10).toLocaleString("en")}%</b></span>
						<span>${license === "NOASSERTION" ? "Other" : license}</span>
						<span class="size"><b>${count}</b></span>
					</p>`
				)
				.join("")}
				${
					cleanLicenses.length <
					Object.values(licenses).reduce((acc, cur) => acc + cur, 0)
						? `<p class="language">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12px" width="12px">
						<ellipse cx="6" cy="6" rx="6" ry="6" fill="#c4c4c4" />
					</svg>
					<span><b>${(
						Math.round(
							(1 - cleanLicenses.reduce((acc, { prop }) => acc + prop, 0)) *
								1000
						) / 10
					).toLocaleString("en")}%</b></span>
					<span>No License</span>
					<span class="size"><b>${
						totalCount -
						cleanLicenses.reduce((acc, { count }) => acc + count, 0)
					}</b></span>
				</p>`
						: ""
				}
		</div>
		<p class="label">
			${await loadIcon("security")}
			<span>Most used license permissions</span>
		</p>
		${makeProgressBar(cleanPermissions)}
				<div class="language-container grid">
			${cleanPermissions
				.slice(0, 6)
				.map(
					({ permission, color, prop, count }) => `<p class="language">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12px" width="12px">
							<ellipse cx="6" cy="6" rx="6" ry="6" fill="${color}" />
						</svg>
						<span><b>${(Math.round(prop * 1000) / 10).toLocaleString("en")}%</b></span>
						<span>${permission}</span>
						<span class="size"><b>${count}</b></span>
					</p>`
				)
				.join("")}
		</div>
		`;

		return new Svg({
			HTMLContent: content,
			stylesheet: path.join(process.cwd(), "public/styles/licenses.css"),
			filename: "licenses.svg",
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
