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
		viewer: {
			name: string;
			avatarUrl: string;
			createdAt: string;
			location: string;
			repositories: {
				totalCount: number;
				nodes: { stargazerCount: number; forkCount: number }[];
			};
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
		viewer: {
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

export type Licenses = {
	error?: { message: string };
	data: {
		viewer: {
			repositories: {
				nodes: {
					licenseInfo: {
						name: string;
						permissions: { label: string }[];
					};
				}[];
			};
		};
	};
};

export default class User {
	public static async getGlobalInfo() {
		const query = gql`
			query {
				viewer {
					name
					avatarUrl
					createdAt
					location
					repositories(
						first: 100
						ownerAffiliations: OWNER
						visibility: PUBLIC
						orderBy: { field: STARGAZERS, direction: DESC }
					) {
						totalCount
						nodes {
							stargazerCount
							forkCount
						}
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

		return json?.data?.viewer ?? null;
	}

	public static async getSkills() {
		const query = gql`
			query {
				viewer {
					name
					repositories(
						first: 100
						ownerAffiliations: OWNER
						visibility: PUBLIC
					) {
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

		return json?.data?.viewer ?? null;
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

	public static async getTopics() {}

	public static async getLicenses() {
		const query = gql`
			query {
				viewer {
					repositories(
						first: 100
						visibility: PUBLIC
						ownerAffiliations: OWNER
					) {
						nodes {
							licenseInfo {
								name
								permissions {
									label
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

		const json: Licenses = await response.json();

		if (json.error) {
			console.error(json.error.message);
			return null;
		}

		return json?.data?.viewer ?? null;
	}

	public static async getRepository(repoName: string) {
		const query = gql`
			query {
				viewer {
					repository(name: "${repoName}") {
						name
						description
					}
				}
			}
		`;

		const response = await fetch("https://api.github.com/graphql", {
			method: "POST",
			headers: { Authorization: `bearer ${Config.GITHUB_TOKEN}` },
			body: JSON.stringify({ query: query.loc!.source.body }),
		});

		const json = await response.json();

		if (json.error) {
			console.error(json.error.message);
			return null;
		}

		return json?.data?.viewer ?? null;
	}
}
