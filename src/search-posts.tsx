import { Action, ActionPanel, Color, Icon, List, getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";

type Preferences = {
  accessToken: string;
  teams: string;
};

type EsaPost = {
  number: number;
  name: string;
  full_name: string;
  wip: boolean;
  category: string | null;
  tags: string[];
  updated_at: string;
  url: string;
  updated_by?: { screen_name: string } | null;
};

type TeamResult = {
  team: string;
  posts: EsaPost[];
  error?: string;
};

const PER_PAGE = 20;

async function searchTeam(team: string, query: string, token: string): Promise<TeamResult> {
  const url = new URL(`https://api.esa.io/v1/teams/${encodeURIComponent(team)}/posts`);
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const hint = res.status === 401 ? "トークンが無効" : res.status === 404 ? "チームが見つからない" : `HTTP ${res.status}`;
      return { team, posts: [], error: hint };
    }
    const json = (await res.json()) as { posts: EsaPost[] };
    return { team, posts: json.posts };
  } catch (e) {
    return { team, posts: [], error: e instanceof Error ? e.message : "通信エラー" };
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Command() {
  const { accessToken, teams } = getPreferenceValues<Preferences>();
  const teamList = teams
    .split(/[,\s、]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const [query, setQuery] = useState("");

  const { data, isLoading } = useCachedPromise(
    async (q: string) => Promise.all(teamList.map((team) => searchTeam(team, q, accessToken))),
    [query],
    { keepPreviousData: true },
  );

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setQuery}
      searchBarPlaceholder="esaを全チーム横断で検索（esaの検索構文が使えます）"
      throttle
    >
      {data?.map((result) => (
        <List.Section
          key={result.team}
          title={result.team}
          subtitle={result.error ? `⚠ ${result.error}` : `${result.posts.length}件`}
        >
          {result.posts.map((post) => (
            <List.Item
              key={`${result.team}-${post.number}`}
              icon={post.wip ? { source: Icon.Pencil, tintColor: Color.Orange } : Icon.Document}
              title={post.name}
              subtitle={post.category ?? ""}
              keywords={[post.full_name, ...post.tags]}
              accessories={[
                ...(post.wip ? [{ tag: { value: "WIP", color: Color.Orange } }] : []),
                ...post.tags.slice(0, 2).map((t) => ({ tag: t })),
                { text: formatDate(post.updated_at) },
              ]}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser url={post.url} />
                  <Action.CopyToClipboard title="URLをコピー" content={post.url} shortcut={{ modifiers: ["cmd"], key: "c" }} />
                  <Action.CopyToClipboard
                    title="Markdownリンクをコピー"
                    content={`[${post.name}](${post.url})`}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
