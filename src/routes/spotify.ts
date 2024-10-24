import Elysia, { NotFoundError, t } from "elysia";
import path from "node:path";
import Svg from "../classes/Svg";
import User from "../classes/User";
import urlToBase64 from "../utils/urlToBase64";
import secureHTML from "../utils/secureHTML";
import moment from "moment";
import loadIcon from "../utils/loadIcon";

export default new Elysia({ prefix: "/spotify" }).get(
	"/",
	async ({ set }) => {
		const spotify = await User.getSpotifyInfo();

		if (!spotify) {
			set.status = "Not Found";
			throw new NotFoundError("User not found");
		}

		const content = `<h2 class="header">
      ${await loadIcon("spotify")}
      <span>Spotify Statistics</span>
    </h2>
    <p class="line">
      Most listened tracks in the last 6 months
    </p>
    <section class="track-container">
      ${(
				await Promise.all(
					spotify.items.map(
						async (item) =>
							`<div class="track">
                <img src="${await urlToBase64(
									item.track.albums[0].image
								)}" alt="${secureHTML(item.track.name)} Cover" class="cover" />
                <div class="track-info">
                  <p class="track-name"><b>${item.position}. ${secureHTML(
								item.track.name
							)}, ${item.track.artists[0].name}</b></p>
              <p class="track-streams">Played ${Math.floor(
								item.playedMs / 60_000
							).toLocaleString("en")} minutes</p>
                </div>
              </div>`
					)
				)
			).join("")}
    </section>`;

		return new Svg({
			HTMLContent: content,
			stylesheet: path.join(process.cwd(), "public/styles/spotify.css"),
			filename: "spotify.svg",
			width: 480,
			height: 270,
		});
	},
	{
		response: t.File({
			type: "image/svg+xml",
		}),
	}
);
