import gql from "graphql-tag";

type GlobalInfo = {
  data: {
    user: {
      name: string;
      login: string;
      bio: string;
      avatarUrl: string;
      createdAt: string;
      updatedAt: string;
      location: string;
      company: string;
      pronouns: string;
      websiteUrl: string;
      repositories: { totalCount: number };
      pullRequests: { totalCount: number };
      issues: { totalCount: number };
      followers: { totalCount: number };
      following: { totalCount: number };
      contributionsCollection: {
        contributionCalendar: {
          colors: string[];
          totalContributions: number;
          weeks: {
            contributionDays: {
              color: string;
              contributionCount: number;
              date: string;
              weekday: number;
            }[];
            firstDay: string;
          }[];
        };
      };
    };
  };
};

export default class User {
  private static readonly Authorization = `bearer ${process.env.GITHUB_TOKEN}`;

  public static fromUsername(username: string) {
    return new User(username);
  }

  public readonly username: string;

  private constructor(username: string) {
    this.username = username;
  }

  public async getGlobalInfo() {
    const query = gql`
      query {
        user(login: "${this.username}") {
          name
          login
          bio
          avatarUrl
          createdAt
          updatedAt
          location
          company
          pronouns
          websiteUrl
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
          contributionsCollection {
            contributionCalendar {
              colors
              totalContributions
              weeks {
                contributionDays {
                  color
                  contributionCount
                  date
                  weekday
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
      headers: { Authorization: User.Authorization },
      body: JSON.stringify({ query: query.loc!.source.body }),
    });

    const json: GlobalInfo = await response.json();
    if (json.data.user === null) return null;
    return json.data.user;
  }
}
