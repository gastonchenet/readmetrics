import path from "node:path";
import YAML from "yaml";

const CONFIG_PATH = path.resolve(process.cwd(), "config.yml");

export default class Config {
	public static GITHUB_USERNAME: string;
	public static GITHUB_TOKEN: string;
	public static PORT: number;
	public static SPOTIFY_USERNAME: string;

	public static async load() {
		const file = Bun.file(CONFIG_PATH);

		if (!(await file.exists())) {
			throw new Error("Config file not found");
		}

		const config = YAML.parse(await file.text());

		Config.GITHUB_USERNAME = config.github.username;
		Config.GITHUB_TOKEN = config.github.token;
		Config.PORT = config.port;
		Config.SPOTIFY_USERNAME = config.spotify_username;

		console.log("Config loaded");
	}
}
