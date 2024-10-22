import Elysia, { NotFoundError, t } from "elysia";
import User from "../classes/User";

export default new Elysia({ prefix: "/skills" }).get(
  "/",
  async ({ set, params }) => {
    const user = await User.fromUsername(params.username).getSkills();

    if (!user) {
      set.status = "Not Found";
      throw new NotFoundError("User not found");
    }

    const primaryLanguages: Record<string, number> = {};
    const languages: Record<string, number> = {};
    let totalSize = 0;

    for (const repo of user.repositories.nodes) {
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

        if (languages[lang.node.name]) {
          languages[lang.node.name] += lang.size;
        } else {
          languages[lang.node.name] = lang.size;
        }
      }
    }

    const primaryLanguagesPercentages: Record<string, number> = {};
    const languagesPercentages: Record<string, number> = {};

    for (const lang in primaryLanguages) {
      primaryLanguagesPercentages[lang] =
        (primaryLanguages[lang] / user.repositories.nodes.length) * 100;
    }

    for (const lang in languages) {
      languagesPercentages[lang] = (languages[lang] / totalSize) * 100;
    }

    const sortedPrimaryLanguages = Object.fromEntries(
      Object.entries(primaryLanguagesPercentages).sort((a, b) => b[1] - a[1])
    );

    const sortedLanguages = Object.fromEntries(
      Object.entries(languagesPercentages).sort((a, b) => b[1] - a[1])
    );

    const content = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="225">
      <style>${await Bun.file("./svg/style/main.css").text()}</style>
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" class="container">
          
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
