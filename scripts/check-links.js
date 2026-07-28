/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 *
 * Checks every markdown link in README.md and reports broken ones.
 * Writes broken-links-report.json for CI to pick up; exits non-zero when
 * any broken links are found.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_PATH = path.join(__dirname, '../README.md');
const REPORT_PATH = path.join(__dirname, '../broken-links-report.json');

const CONCURRENCY = 10;
const TIMEOUT_MS = 10000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function extractLinks(readmeContent) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(readmeContent)) !== null) {
    links.push({ title: match[1], url: match[2] });
  }
  return links;
}

async function checkLink(link) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    let response;
    try {
      response = await fetch(link.url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': USER_AGENT },
      });
    } catch {
      // Some servers block HEAD or the initial attempt times out — retry with GET.
      const controllerGet = new AbortController();
      const timeoutIdGet = setTimeout(() => controllerGet.abort(), TIMEOUT_MS);
      response = await fetch(link.url, {
        method: 'GET',
        signal: controllerGet.signal,
        headers: { 'User-Agent': USER_AGENT },
      });
      clearTimeout(timeoutIdGet);
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        // Bot-protection false positives — surfaced separately, not treated as dead.
        return { link, warning: response.status };
      }
      return { link, broken: true, status: response.status };
    }
    return { link, ok: true };
  } catch (error) {
    clearTimeout(timeoutId);
    return { link, broken: true, error: error.message };
  }
}

async function main() {
  const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
  const links = extractLinks(readmeContent);
  console.log(`Found ${links.length} links to check.`);

  const broken = [];
  const warnings = [];

  for (let i = 0; i < links.length; i += CONCURRENCY) {
    const chunk = links.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(checkLink));
    for (const result of results) {
      if (result.broken) {
        broken.push({
          ...result.link,
          status: result.status,
          error: result.error,
        });
        console.error(
          `Broken: [${result.link.title}](${result.link.url}) - ${result.status ?? result.error}`
        );
      } else if (result.warning) {
        warnings.push({ ...result.link, status: result.warning });
      } else {
        process.stdout.write('.');
      }
    }
  }

  console.log(
    `\n\nChecked ${links.length} links: ${broken.length} broken, ${warnings.length} bot-blocked (not counted as dead).`
  );
  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      { checkedAt: new Date().toISOString(), broken, warnings },
      null,
      2
    )
  );

  if (broken.length > 0) process.exitCode = 1;
}

main();
