import { writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';

const site = 'https://hkexl.com';
const pages = ['/', '/process', '/dorms', '/info', '/contact', '/worker', '/renewal'];
const config = loadEnv('', process.cwd(), 'VITE_');

/** Fetch every published WordPress post so article and dormitory URLs stay in the sitemap. */
async function publishedPosts() {
  if (config.VITE_WORDPRESS_VERSION !== 'true') return [];
  const api = config.VITE_WP_API_URL;
  if (!api) throw new Error('VITE_WP_API_URL is required to generate the sitemap.');

  const posts = [];
  let page = 1;
  while (true) {
    const url = new URL(`${api.replace(/\/$/, '')}/posts`);
    url.search = new URLSearchParams({
      status: 'publish', per_page: '100', page: String(page),
      _fields: 'slug,categories,hkexl_sitemap_index',
    });
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`WordPress sitemap request failed: ${response.status}`);
    posts.push(...await response.json());
    if (page >= Number(response.headers.get('X-WP-TotalPages') || 1)) break;
    page += 1;
  }
  return posts;
}

/** Write canonical site URLs only after every WordPress page has loaded successfully. */
async function generateSitemap() {
  const dormCategory = Number(config.VITE_WP_DORM_CATEGORY_ID);
  const posts = await publishedPosts();
  const paths = new Set(pages);
  for (const post of posts) {
    if (!post.slug) continue;
    const isDorm = post.categories?.includes(dormCategory);
    // The WordPress presentation site is globally noindex; only explicit per-post noindex applies here.
    if (!isDorm && post.hkexl_sitemap_index === 'noindex') continue;
    const section = isDorm ? 'living' : 'posts';
    // Match the canonical tag's encoding (uppercase %XX) so Google sees one URL per page.
    paths.add(`/${section}/${encodeURI(decodeURIComponent(post.slug))}`);
  }
  const entries = [...paths].map((path) => `  <url><loc>${site}${path}</loc></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
  await writeFile('public/sitemap.xml', xml);
  console.log(`Generated sitemap with ${entries.length} URLs.`);
}

await generateSitemap();
