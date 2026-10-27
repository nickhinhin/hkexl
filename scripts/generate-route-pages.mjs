import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { loadEnv } from 'vite';

const config = loadEnv('', process.cwd(), 'VITE_');
const origin = 'https://hkexl.com';
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const plain = (text = '') => text.replace(/<[^>]*>/g, ' ').replace(/&hellip;|\[&amp;hellip;\]|\[…\]/g, '…').replace(/\s+/g, ' ').trim();
// Static HTML for crawlers: keep text, headings, lists, links and images; drop scripts, styles and inline handlers.
const staticContent = (html = '') => html.replace(/<(script|style|iframe|noscript)[\s\S]*?<\/\1>/gi, '').replace(/\s(on\w+|style)="[^"]*"/gi, '');
const titles = {'/':'香港外勞申請一站式代辦','/process':'香港外勞申請流程','/dorms':'十八區宿舍','/info':'外勞資訊','/contact':'聯絡我們','/worker':'國內勞工專區','/renewal':'外勞續約指南'};
const oldPages = {'博客':'/info','外勞資訊':'/info','十八區宿舍':'/dorms','聯絡我們':'/contact','國內勞工專區':'/worker','申請流程':'/process','續約專區':'/renewal','續約指南':'/renewal','關於我們':'/','補充勞工優化計劃':encodeURI('/posts/補充勞工優化計劃是甚麼？')};
// Old WordPress collection URLs that Google still crawls.
const oldCollections = [
  {source:'/宿舍/:slug',destination:'/living/:slug',type:301}, {source:'/宿舍/:slug/',destination:'/living/:slug',type:301},
  {source:'/workers/**',destination:'/worker',type:301},
];
const navLinks = Object.entries(titles).map(([path, title]) => `<a href="${path}">${escape(title)}</a>`).join(' ');
const metadata = new Map();
const redirects = [];

/** Build initial HTML metadata and permanent redirects for the published routes. */
async function generateRoutes() {
  const sitemap = await readFile('public/sitemap.xml', 'utf8');
  const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeURIComponent(new URL(match[1]).pathname));
  if (config.VITE_WORDPRESS_VERSION === 'true') {
    let page = 1;
    while (true) {
      const url = `${config.VITE_WP_API_URL}/posts?status=publish&per_page=100&page=${page}&_fields=slug,title,excerpt,content,categories`;
      const response = await fetch(url, {signal: AbortSignal.timeout(15000)});
      if (!response.ok) throw new Error(`Route metadata request failed: ${response.status}`);
      for (const post of await response.json()) {
        const slug = decodeURIComponent(post.slug);
        const dorm = post.categories.includes(Number(config.VITE_WP_DORM_CATEGORY_ID));
        const path = `/${dorm ? 'living' : 'posts'}/${slug}`;
        metadata.set(path, {title: plain(post.title.rendered), description: plain(post.excerpt.rendered).slice(0, 180), content: staticContent(post.content.rendered)});
        if (!dorm) {
          redirects.push({source:`/${slug}`,destination:encodeURI(path),type:301});
          redirects.push({source:`/${slug}/`,destination:encodeURI(path),type:301});
        }
      }
      if (page >= Number(response.headers.get('X-WP-TotalPages') || 1)) break;
      page += 1;
    }
  }
  for (const [slug, destination] of Object.entries(oldPages)) {
    redirects.push({source:`/${slug}`,destination,type:301}, {source:`/${slug}/`,destination,type:301});
  }
  redirects.push(...oldCollections);
  const template = await readFile('dist/index.html', 'utf8');
  for (const path of paths) {
    const data = metadata.get(path) || {title:titles[path],description:'香港特快外勞提供香港外勞申請、招聘、簽證及住宿安排服務。'};
    const title = `${data.title}｜香港特快外勞`;
    const canonical = origin + encodeURI(path);
    const html = template.replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(data.description)}">`)
      .replace('</head>', `<link rel="canonical" href="${escape(canonical)}"><meta name="robots" content="index, follow"></head>`)
      // React replaces this on load; crawlers get the page text without running JavaScript.
      .replace('<div id="root"></div>', `<div id="root"><nav>${navLinks}</nav><main><h1>${escape(data.title)}</h1>${data.content || `<p>${escape(data.description)}</p>`}</main></div>`);
    const file = path === '/' ? 'dist/index.html' : join('dist', `${path.slice(1)}.html`);
    await mkdir(dirname(file), {recursive:true});
    await writeFile(file, html);
    if (path !== '/') redirects.push({source:`${path}/`,destination:encodeURI(path),type:301});
  }
  const firebase = JSON.parse(await readFile('firebase.json', 'utf8'));
  firebase.hosting.cleanUrls = true;
  firebase.hosting.rewrites = [];
  firebase.hosting.redirects = [...new Map([...(firebase.hosting.redirects || []), ...redirects].map((rule) => [rule.source, rule])).values()];
  await writeFile('firebase.json', JSON.stringify(firebase, null, 2) + '\n');
  await writeFile('dist/404.html', '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="robots" content="noindex"><title>找不到網頁｜香港特快外勞</title><h1>找不到網頁</h1><p>網址可能已更改或頁面已移除。</p><a href="/">返回首頁</a></html>');
  console.log(`Generated initial canonical metadata for ${paths.length} routes and ${redirects.length} redirect rules.`);
}

await generateRoutes();
