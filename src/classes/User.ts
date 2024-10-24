import gql from "graphql-tag";
import Config from "./Config";
import moment from "moment";

export type GlobalInfoWeek = {
	contributionDays: { contributionCount: number }[];
	firstDay: string;
};

export type GlobalInfo = {
	error?: { message: string };
	data: {
		user: {
			name: string;
			avatarUrl: string;
			createdAt: string;
			location: string;
			repositories: { totalCount: number };
			pullRequests: { totalCount: number };
			issues: { totalCount: number };
			followers: { totalCount: number };
			following: { totalCount: number };
			starredRepositories: { totalCount: number };
			contributionsCollection: {
				contributionCalendar: {
					weeks: GlobalInfoWeek[];
				};
			};
		};
	};
};

export type Skills = {
	error?: { message: string };
	data: {
		user: {
			name: string;
			repositories: {
				nodes: {
					primaryLanguage: {
						name: string;
						color: string;
					};
					languages: {
						totalSize: number;
						edges: {
							size: number;
							node: {
								name: string;
								color: string;
							};
						}[];
					};
				}[];
			};
		};
	};
};

export type SpotifyInfo = {
	status?: number;
	path?: string;
	message?: string;
	items: {
		position: number;
		streams: number;
		playedMs: number;
		track: {
			albums: {
				id: number;
				name: string;
				image: string;
			}[];
			artists: {
				id: number;
				name: string;
				image: string;
			}[];
			durationMs: number;
			explicit: boolean;
			externalIds: {
				spotify: string[];
				appleMusic: string[];
			};
			id: number;
			name: string;
			spotifyPopularity: number;
			spotifyPreview: string | null;
			appleMusicPreview: string | null;
		};
	}[];
};

export default class User {
	public static async getGlobalInfo() {
		const query = gql`
      query {
        user(login: "${Config.GITHUB_USERNAME}") {
          name
          avatarUrl
          createdAt
          location
          repositories {
            totalCount
          }
          pullRequests {
            totalCount
          }
          issues {
            totalCount
          }
          followers {
            totalCount
          }
          following {
            totalCount
          }
          starredRepositories {
            totalCount
          }
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                }
                firstDay
              }
            }
          }
        }
      }
    `;

		const response = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers: { Authorization: `bearer ${Config.GITHUB_TOKEN}` },
			body: JSON.stringify({ query: query.loc!.source.body }),
		});

		const json: GlobalInfo = await response.json();

		if (json.error) {
			console.error(json.error.message);
			return null;
		}

		return json?.data?.user ?? null;
	}

	public static async getSkills() {
		const query = gql`
      query {
        user(login: "${Config.GITHUB_USERNAME}") {
          name
          repositories(first: 100, ownerAffiliations: OWNER) {
            nodes {
              primaryLanguage {
                name
                color
              }
              languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
                totalSize
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
            }
          }
        }
      }
    `;

		const response = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers: { Authorization: `bearer ${Config.GITHUB_TOKEN}` },
			body: JSON.stringify({ query: query.loc!.source.body }),
		});

		const json: Skills = await response.json();

		if (json.error) {
			console.error(json.error.message);
			return null;
		}

		return json?.data?.user ?? null;
	}

	public static async getSpotifyInfo() {
		const url = new URL(
			`https://api.stats.fm/api/v1/users/${Config.SPOTIFY_USERNAME}/top/tracks`
		);

		url.searchParams.set("after", moment().subtract(6, "months").format("x"));
		url.searchParams.set("before", moment().format("x"));
		url.searchParams.set("limit", "5");

		const response = await fetch(url.toString());

		const json: SpotifyInfo = await response.json();

		if (!response.ok) {
			console.error(json.message);
			return null;
		}

		return json;
	}
}
