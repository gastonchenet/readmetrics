import Elysia, { NotFoundError, t } from "elysia";
import User from "../classes/User";
import secureHTML from "../utils/secureHTML";
import moment from "moment";
import weekColor from "../utils/weekColor";

export default new Elysia({ prefix: "/api/:username" }).get(
  "/",
  async ({ set, params }) => {
    const user = await User.fromUsername(params.username).getGlobalInfo();

    if (!user) {
      set.status = "Not Found";
      throw new NotFoundError("User not found");
    }

    const content = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="225">
      <style>${await Bun.file("./svg/style/main.css").text()}</style>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" class="container">
          <h2 class="header">
            <img class="avatar" src="${secureHTML(
              user.avatarUrl
            )}" alt="Avatar" />
            <span class="text">${secureHTML(user.name)}</span>
          </h2>
          <div class="sections">
            <section>
              <p class="line">
                ${await Bun.file("./assets/images/login.svg").text()}
                <span>Joined Github on <b>${moment(user.createdAt).format(
                  "MMM Do, YYYY"
                )}</b></span>
              </p>
              <p class="line">
                ${await Bun.file("./assets/images/following.svg").text()}
                <span><b>${user.followers.totalCount.toLocaleString()}</b> followers · <b>${user.following.totalCount.toLocaleString()}</b> following</span>
              </p>
              <p class="line">
                ${await Bun.file("./assets/images/repo.svg").text()}
                <span><b>${user.repositories.totalCount.toLocaleString()}</b> repositories</span>
              </p>
              <p class="line">
                ${await Bun.file("./assets/images/starred.svg").text()}
                <span><b>${user.starredRepositories.totalCount.toLocaleString()}</b> starred</span>
              </p>
            </section>
            <section>
              <p class="line">
                ${await Bun.file("./assets/images/location.svg").text()}
                <span><b>${user.location}</b></span>
              </p>
              <p class="line">
                ${await Bun.file("./assets/images/pull.svg").text()}
                <span><b>${user.pullRequests.totalCount.toLocaleString()}</b> pull requests</span>
              </p>
              <p class="line">
                ${await Bun.file("./assets/images/issues.svg").text()}
                <span><b>${user.issues.totalCount.toLocaleString()}</b> issues</span>
              </p>
            </section>
          </div>
          <p class="line label">
            ${await Bun.file("./assets/images/week.svg").text()}
            <span>Weekly contributions</span>
          </p>
          <svg class="commits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 236 11" width="240" height="11">
            <g>
              ${user.contributionsCollection.contributionCalendar.weeks
                .map(
                  (week, index) =>
                    `<rect class="day" x="${
                      index * 15
                    }" y="0" width="11" height="11" fill="${weekColor(
                      week
                    )}" />`
                )
                .join("")}
            </g>
          </svg>
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
