import { BaseScraper, type ScrapedItem } from "./base.scraper";

interface GitHubRepo {
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  owner: { avatar_url: string };
}

interface GitHubSearchResponse {
  items: GitHubRepo[];
}

export class GitHubTrendingScraper extends BaseScraper {
  readonly sourceName = "GitHub Trending";
  readonly sourceUrl = "https://github.com/trending";

  async fetch(): Promise<ScrapedItem[]> {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const query = `created:>${since} stars:>10`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=20`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "AITechPulse/1.0",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`);

    const data = (await res.json()) as GitHubSearchResponse;

    return data.items.map((repo) => ({
      title: repo.full_name,
      url: repo.html_url,
      content: repo.description ?? undefined,
      publishedAt: new Date(repo.created_at),
      metadata: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        ownerAvatar: repo.owner.avatar_url,
      },
    }));
  }
}
