"use client";

import { FormEvent, useMemo, useState } from "react";

type GithubAsset = {
  id: number;
  name: string;
  browser_download_url: string;
  size: number;
  updated_at: string;
  download_count: number;
};

type GithubRelease = {
  id: number;
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  assets: GithubAsset[];
};

function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const value = input.trim().replace(/\.git$/i, "");
  if (!value) return null;

  const urlMatch = value.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/.*)?$/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  const pathMatch = value.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (pathMatch) {
    return { owner: pathMatch[1], repo: pathMatch[2] };
  }

  return null;
}

function formatSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

export default function ApkDownloadPage() {
  const [repoInput, setRepoInput] = useState("");
  const [currentRepo, setCurrentRepo] = useState<{ owner: string; repo: string } | null>(null);
  const [releases, setReleases] = useState<GithubRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repoLabel = useMemo(() => {
    if (!currentRepo) return "";
    return `${currentRepo.owner}/${currentRepo.repo}`;
  }, [currentRepo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = parseRepoInput(repoInput);
    if (!parsed) {
      setError("请输入有效的 GitHub 仓库地址或 owner/repo 格式，例如 https://github.com/vercel/next.js");
      setReleases([]);
      setCurrentRepo(null);
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentRepo(parsed);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases?per_page=100`,
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("仓库不存在，或该仓库没有公开 release。");
        }
        if (response.status === 403) {
          throw new Error("GitHub API 访问频率受限，请稍后重试。");
        }
        throw new Error(`GitHub API 请求失败（${response.status}）。`);
      }

      const data = (await response.json()) as GithubRelease[];
      const validReleases = data.filter((release) => !release.draft);
      setReleases(validReleases);
    } catch (fetchError) {
      setReleases([]);
      setCurrentRepo(null);
      setError(fetchError instanceof Error ? fetchError.message : "获取 release 失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">GitHub 安装包下载中心</h1>
        <p className="mt-2 text-gray-600">
          输入 GitHub 仓库地址后，自动读取该仓库每次打包发布到 Release 的资产（Assets）。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <label htmlFor="repo-input" className="mb-2 block text-sm font-medium text-gray-700">
            GitHub 仓库地址 / owner/repo
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="repo-input"
              type="text"
              value={repoInput}
              onChange={(event) => setRepoInput(event.target.value)}
              placeholder="例如：https://github.com/owner/repo 或 owner/repo"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "加载中..." : "获取 Assets"}
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {repoLabel ? (
          <div className="mt-4 text-sm text-gray-600">
            当前仓库：<code>{repoLabel}</code>
          </div>
        ) : null}

        {!loading && currentRepo && releases.length === 0 && !error ? (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-gray-700">
            该仓库暂时没有可展示的 release 资产。
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          {releases.map((release) => (
            <section key={release.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="text-base font-semibold text-gray-900">
                  {release.name || release.tag_name}
                  {release.prerelease ? (
                    <span className="ml-2 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                      Pre-release
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  Tag: {release.tag_name}
                  {release.published_at
                    ? ` · 发布时间：${new Date(release.published_at).toLocaleString("zh-CN", { hour12: false })}`
                    : ""}
                  {" · "}
                  <a
                    href={release.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    查看 Release 页面
                  </a>
                </div>
              </div>

              {release.assets.length === 0 ? (
                <div className="px-4 py-4 text-sm text-gray-500">该 release 没有 assets。</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-left">
                    <thead className="text-sm text-gray-700">
                      <tr>
                        <th className="px-4 py-3">文件名</th>
                        <th className="px-4 py-3">大小</th>
                        <th className="px-4 py-3">更新时间</th>
                        <th className="px-4 py-3">下载次数</th>
                        <th className="px-4 py-3">下载</th>
                      </tr>
                    </thead>
                    <tbody>
                      {release.assets.map((asset) => (
                        <tr key={asset.id} className="border-t border-gray-200 text-sm text-gray-800">
                          <td className="px-4 py-3">{asset.name}</td>
                          <td className="px-4 py-3">{formatSize(asset.size)} MB</td>
                          <td className="px-4 py-3">
                            {new Date(asset.updated_at).toLocaleString("zh-CN", { hour12: false })}
                          </td>
                          <td className="px-4 py-3">{asset.download_count}</td>
                          <td className="px-4 py-3">
                            <a
                              href={asset.browser_download_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                            >
                              下载
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
