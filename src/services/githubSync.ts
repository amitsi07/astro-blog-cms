/**
 * GitHub & Cloudflare Direct Auto-Deploy Service
 * Pushes post markdown, categories, or triggers deploy hooks directly
 */

export interface GitHubSyncConfig {
  user: string;
  repo: string;
  branch: string;
  token: string;
}

export function getGitHubSyncConfig(): GitHubSyncConfig | null {
  const token = localStorage.getItem('astro_sveltia_gh_token') || '';
  const user = localStorage.getItem('astro_sveltia_gh_user') || '';
  const repo = localStorage.getItem('astro_sveltia_gh_repo') || '';
  const branch = localStorage.getItem('astro_sveltia_gh_branch') || 'main';

  if (!token || !user || !repo) return null;
  return { user, repo, branch, token };
}

export function getDeployHookUrl(): string | null {
  return localStorage.getItem('astro_cf_deploy_hook') || null;
}

/**
 * Commits a single post as Markdown directly to GitHub repo
 */
export async function pushSinglePostToGitHub(
  postMarkdown: string,
  slug: string,
  title: string
): Promise<{ success: boolean; message: string; commitUrl?: string }> {
  const config = getGitHubSyncConfig();
  if (!config) {
    return {
      success: false,
      message: 'GitHub credentials not configured in "Publish to GitHub & Cloudflare" modal.',
    };
  }

  const { user, repo, branch, token } = config;
  const filePath = `src/content/blog/${slug}.md`;

  try {
    // 1. Check existing SHA
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${user}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (getRes.ok) {
        const data = await getRes.json();
        existingSha = data.sha;
      }
    } catch {
      // file does not exist yet
    }

    // 2. Base64 encode
    const utf8Bytes = new TextEncoder().encode(postMarkdown);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64Content = btoa(binary);

    // 3. Commit file
    const putRes = await fetch(
      `https://api.github.com/repos/${user}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: existingSha
            ? `content: update blog post "${title}" [skip ci]`
            : `content: publish blog post "${title}"`,
          content: base64Content,
          branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      return { success: false, message: err.message || 'GitHub commit failed.' };
    }

    const data = await putRes.json();
    return {
      success: true,
      message: `Committed "${slug}.md" to GitHub @ ${branch}! Cloudflare auto-deploy triggered.`,
      commitUrl: data.commit?.html_url,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error communicating with GitHub.' };
  }
}

/**
 * Triggers Cloudflare Pages Deploy Hook if set
 */
export async function triggerCloudflareDeployHook(): Promise<boolean> {
  const hookUrl = getDeployHookUrl();
  if (!hookUrl) return false;

  try {
    await fetch(hookUrl, { method: 'POST', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
}
