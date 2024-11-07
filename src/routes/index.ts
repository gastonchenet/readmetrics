import Elysia, { NotFoundError, t } from "elysia";
import path from "node:path";
import User from "../classes/User";
import Svg from "../classes/Svg";
import secureHTML from "../utils/secureHTML";
import moment from "moment";
import weekColor from "../utils/weekColor";
import urlToBase64 from "../utils/urlToBase64";
import skills from "./skills";
import viewProfile from "../utils/viewProfile";
import Config from "../classes/Config";
import loadIcon from "../utils/loadIcon";
import spotify from "./spotify";
import licenses from "./licenses";
import followers from "./followers";
import repository from "./repository";

export default new Elysia()
	.use(skills)
	.use(spotify)
	.use(licenses)
	.use(followers)
	.use(repository)
	.get(
		"/",
		async ({ set }) => {
			const user = await User.getGlobalInfo();

			if (!user) {
				set.status = "Not Found";
				throw new NotFoundError("User not found");
			}

			const views = viewProfile(Config.GITHUB_USERNAME);

			const content = `<h2 class="header">
      <img class="avatar" src="${await urlToBase64(
				user.avatarUrl
			)}" alt="Avatar" />
      <span class="text">${secureHTML(user.name)}</span>
    </h2>
    <div class="sections">
      <section>
        <p class="line">
          ${await loadIcon("login")}
          <span>Joined Github on <b>${moment(user.createdAt).format(
						"MMM Do, YYYY"
					)}</b></span>
        </p>
        <p class="line">
          ${await loadIcon("following")}
          <span><b>${user.followers.totalCount.toLocaleString()}</b> followers · <b>${user.following.totalCount.toLocaleString()}</b> following</span>
        </p>
        <p class="line">
          ${await loadIcon("repo")}
          <span><b>${user.repositories.totalCount.toLocaleString()}</b> repositories</span>
        </p>
        <p class="line">
          ${await loadIcon("starred")}
          <span><b>${user.starredRepositories.totalCount.toLocaleString()}</b> starred repositories</span>
        </p>
        <p class="line">
          ${await loadIcon("starred")}
          <span><b>${user.repositories.nodes
						.reduce((acc, repo) => acc + repo.stargazerCount, 0)
						.toLocaleString()}</b> stargazers</span>
        </p>
      </section>
      <section>
        <p class="line">
          ${await loadIcon("view")}
          <span>Profile seen <b>${views}</b> time${views > 1 ? "s" : ""}</span>
        </p>
        <p class="line">
          ${await loadIcon("location")}
          <span><b>${user.location}</b></span>
        </p>
        <p class="line">
          ${await loadIcon("pull")}
          <span><b>${user.pullRequests.totalCount.toLocaleString()}</b> pull requests</span>
        </p>
        <p class="line">
          ${await loadIcon("fork")}
          <span><b>${user.repositories.nodes
						.reduce((acc, repo) => acc + repo.forkCount, 0)
						.toLocaleString()}</b> forks</span>
        </p>
        <p class="line">
          ${await loadIcon("issues")}
          <span><b>${user.issues.totalCount.toLocaleString()}</b> issues</span>
        </p>
      </section>
    </div>
    <p class="line label">
      ${await loadIcon("week")}
      <span>Weekly contributions</span>
    </p>
    <svg class="commits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 236 11" width="240" height="11">
      ${user.contributionsCollection.contributionCalendar.weeks
				.map(
					(week, index) =>
						`<rect class="day" x="${
							index * 15
						}" y="0" width="11" height="11" fill="${weekColor(week)}" />`
				)
				.join("")}
    </svg>`;

			return new Svg({
				HTMLContent: content,
				filename: "global.svg",
				stylesheet: path.join(process.cwd(), "public/styles/main.scss"),
				width: 480,
				height: 220,
			});
		},
		{
			response: t.File({
				type: "image/svg",
			}),
		}
	);
