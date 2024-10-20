import Elysia, { NotFoundError, t } from "elysia";
import User from "../classes/User";
import secureHTML from "../utils/secureHTML";

export default new Elysia({ prefix: "/api/:username" }).get(
  "/",
  async ({ set, params }) => {
    const user = await User.fromUsername(params.username).getGlobalInfo();

    if (!user) {
      set.status = "Not Found";
      throw new NotFoundError("User not found");
    }

    console.log(user);

    const content = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="225">
      <style>${await Bun.file("./svg/style/main.css").text()}</style>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <div>
            <h2>
              <img src="${user.avatarUrl}" width="20" height="20"></img>
              <span>${secureHTML(user.name)}</span>
            </h2>
          </div>
        </div>
      </foreignObject>
    </svg>`;

    console.log(content);

    return new File([content], "global-info.svg", {
      type: "image/svg+xml",
    });
  },
  {
    params: t.Object({ username: t.String() }),
  }
);
