// Copy WordPress images (as WebP) and videos used by articles and dormitories to Firebase, so the public site
// (and Googlebot, which the Hostinger host blocks) never loads media from the WordPress server.
import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const cacheDir = '.media-cache';
const maxWidth = 1200; // Widest rendered size (article column at 2x is narrower).
const quality = 80;
const uploadUrl = /https?:\/\/[^"'\s<>()\\]+?\/wp-content\/uploads\/[^"'\s<>()\\]+?\.(?:jpe?g|png|gif|webp|mp4|webm)(?=["'\s<>()\\?#]|$)/gi;
const results = new Map(); // WordPress URL -> Promise<public path | null>
const targets = new Map(); // public path -> WordPress URL, to avoid name collisions
let active = 0;
const waiting = [];

/** Run at most six downloads/conversions at once. */
async function limited(task) {
  if (active >= 6) await new Promise((resolve) => waiting.push(resolve));
  active += 1;
  try { return await task(); } finally { active -= 1; waiting.shift()?.(); }
}

/** GET with three attempts; the Hostinger host sometimes drops connections. 404s fail at once. */
async function download(source, headers) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(source, { headers, signal: AbortSignal.timeout(30000) });
      if (response.ok || response.status === 404 || attempt === 3) {
        if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), { final: true });
        return response;
      }
    } catch (error) {
      if (error.final || attempt === 3) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
  }
}

/** Public /media path for an upload; keeps the WordPress folder and file name. */
function targetFor(url, uploadsPath, video) {
  let target = video ? `/media/${uploadsPath}` : `/media/${uploadsPath.replace(/\.[^./]+$/, '')}.webp`;
  if (targets.has(target) && targets.get(target) !== url) target = `/media/${uploadsPath}.webp`;
  targets.set(target, url);
  return target;
}

/** Resize to the widest rendered size and encode as WebP, keeping GIF animation. */
function toWebp(input, uploadsPath) {
  const image = /\.gif$/i.test(uploadsPath) ? sharp(input, { animated: true }) : sharp(input).rotate();
  return image.resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality }).toBuffer();
}

/** Download, resize and convert one upload (cached between builds); returns its public path. */
function mirror(url, wordpressOrigin, managedHosts) {
  if (!results.has(url)) {
    results.set(url, limited(async () => {
      try {
        const parsed = new URL(url);
        if (!managedHosts.has(parsed.host)) return null;
        const uploadsPath = decodeURIComponent(parsed.pathname).replace(/^\/wp-content\/uploads\//, '');
        const source = `${wordpressOrigin}${parsed.pathname}`;
        const headers = { 'User-Agent': 'HKEXL-Deploy' };
        const head = await fetch(source, { method: 'HEAD', headers, signal: AbortSignal.timeout(15000) }).catch(() => null);
        const version = head?.headers.get('last-modified') || head?.headers.get('etag') || '';
        // Videos are copied unchanged; images are resized and converted to WebP.
        const video = /\.(?:mp4|webm)$/i.test(uploadsPath);
        const key = createHash('sha1').update(`${source}|${version}|${maxWidth}|${quality}`).digest('hex');
        const cached = join(cacheDir, `${key}${video ? uploadsPath.slice(uploadsPath.lastIndexOf('.')) : '.webp'}`);
        try {
          await access(cached);
        } catch {
          const response = await download(source, headers);
          const input = Buffer.from(await response.arrayBuffer());
          await mkdir(cacheDir, { recursive: true });
          await writeFile(cached, video ? input : await toWebp(input, uploadsPath));
        }
        const target = targetFor(url, uploadsPath, video);
        const file = join('dist', target);
        await mkdir(dirname(file), { recursive: true });
        await copyFile(cached, file);
        return encodeURI(target);
      } catch (error) {
        console.warn(`Kept WordPress URL for ${url}: ${error.message}`);
        return null;
      }
    }));
  }
  return results.get(url);
}

/**
 * Return a copy of a WordPress record with every upload URL replaced by its /media WebP copy.
 * Social-sharing fields under yoast_head_json get absolute URLs on the public origin.
 */
export async function localizeMedia(record, { wordpressOrigin, publicOrigin }) {
  const managedHosts = new Set([new URL(wordpressOrigin).host, new URL(publicOrigin).host, `www.${new URL(publicOrigin).host}`]);
  const { yoast_head_json: yoast, ...rest } = record;
  const replaceIn = async (value, prefix) => {
    let json = JSON.stringify(value);
    if (json === undefined) return value;
    const urls = [...new Set(json.match(uploadUrl) || [])];
    const paths = await Promise.all(urls.map((url) => mirror(url, wordpressOrigin, managedHosts)));
    urls.forEach((url, index) => { if (paths[index]) json = json.replaceAll(url, `${prefix}${paths[index]}`); });
    return JSON.parse(json);
  };
  return { ...(await replaceIn(rest, '')), yoast_head_json: await replaceIn(yoast, publicOrigin) };
}

/** Number of distinct uploads copied so far. */
export const mirroredCount = () => targets.size;
