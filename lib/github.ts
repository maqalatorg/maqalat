/**
 * Minimal GitHub Contents API helpers for MDX edits.
 *
 * Env:
 *   GITHUB_TOKEN  — fine-grained PAT with `contents: read/write` on GITHUB_REPO
 *   GITHUB_REPO   — "owner/repo" (e.g. "maqalatorg/maqalat")
 *   GITHUB_BRANCH — target branch (default "main")
 *
 * All calls include an actor label so the commit history is readable.
 */

const API = "https://api.github.com";

function env() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) throw new Error("GITHUB_TOKEN and GITHUB_REPO must be set");
  return { token, repo, branch };
}

async function ghFetch(path: string, init: RequestInit = {}) {
  const { token } = env();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  return res;
}

export type FileInfo = { content: string; sha: string };

/** Get a file's raw content + sha (needed for updates). Returns null if 404. */
export async function getFile(path: string): Promise<FileInfo | null> {
  const { repo, branch } = env();
  const res = await ghFetch(`/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${branch}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFile failed: ${res.status}`);
  const data = (await res.json()) as { content: string; sha: string; encoding: string };
  const content = data.encoding === "base64" ? Buffer.from(data.content, "base64").toString("utf8") : data.content;
  return { content, sha: data.sha };
}

/** Create or update a file. If `sha` omitted → create; if provided → update. */
export async function putFile(params: {
  path: string;
  content: string;
  message: string;
  sha?: string;
}): Promise<{ commitSha: string; blobSha: string }> {
  const { repo, branch } = env();
  const body = {
    message: params.message,
    content: Buffer.from(params.content, "utf8").toString("base64"),
    branch,
    ...(params.sha ? { sha: params.sha } : {}),
    committer: { name: "Maqalat Admin", email: "admin@maqalat.org" },
  };
  const res = await ghFetch(`/repos/${repo}/contents/${encodeURIComponent(params.path)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub putFile failed: ${res.status} ${t}`);
  }
  const data = (await res.json()) as { commit: { sha: string }; content: { sha: string } };
  return { commitSha: data.commit.sha, blobSha: data.content.sha };
}

/** Delete a file. Requires `sha`. */
export async function deleteFile(params: { path: string; sha: string; message: string }): Promise<string> {
  const { repo, branch } = env();
  const body = {
    message: params.message,
    sha: params.sha,
    branch,
    committer: { name: "Maqalat Admin", email: "admin@maqalat.org" },
  };
  const res = await ghFetch(`/repos/${repo}/contents/${encodeURIComponent(params.path)}`, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub deleteFile failed: ${res.status} ${t}`);
  }
  const data = (await res.json()) as { commit: { sha: string } };
  return data.commit.sha;
}

/** True when GitHub env is configured. */
export function isGithubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}
