# Project commands

## `[wpweb] <figma-link>`

When the user writes `[wpweb]` followed by a Figma URL, build and deliver the complete website without stopping after a plan. Treat the Figma URL as the visual source of truth and use the current workspace's WordPress, Firebase, domain, and environment configuration when they already exist.

### Design and implementation

- Inspect the supplied Figma file and implement every relevant page in React with pixel-accurate layout, typography, colours, spacing, images, alignment, scale, and component states.
- Use `figmaflow` from `https://github.com/NelsonChen1982/figmaflow` when it can reduce Figma API usage without reducing accuracy.
- Reuse clean components and keep the code simple, readable, and maintainable.
- Use the company logo as the favicon.
- Implement desktop, tablet, and mobile layouts. On tablet and mobile, replace the desktop navigation with a menu button in the top-right corner.
- Keep the result as a real accessible website with selectable text, working buttons, links, forms, images, and video. Do not flatten the design into screenshots.

### WordPress content

- When `VITE_WORDPRESS_VERSION=true`, WordPress is the only source for editable page, article, dormitory, image, video, button-link, menu, and ordering data.
- Never display bundled or locally stored fallback content while WordPress is loading or when it fails.
- Display `正在載入文章…` while articles load and `正在載入宿舍…` while dormitories load. On failure, show a short retry message instead of local content.
- Make content directly editable with ordinary Gutenberg blocks. Avoid requiring the client to edit JSON.
- Give editable sections stable identifiers and document in Chinese which WordPress field or block controls each part of the live website.
- Preserve client edits. Before updating WordPress, read the current record and change only the fields required by the request.
- Avoid duplicate posts and pages. Update matching records in place so their IDs, slugs, publication status, and SEO metadata remain stable.
- Ensure media uses working WordPress or deployed production URLs. Verify every visible image and video after migration.
- A single detail page must request only its own WordPress record. Directory pages may request the collection, but must use compact REST fields and avoid unnecessary category or embed requests.
- Refresh WordPress data on navigation or focus as appropriate so published edits reach the live site without showing local substitutes.

### SEO and analytics

- Make the deployed React site the indexable canonical website.
- Keep the WordPress presentation site `noindex, nofollow` when it duplicates the React site.
- Apply relevant Yoast SEO settings to the React site's title, description, robots, canonical, Open Graph, and Twitter metadata.
- Apply Site Kit by Google and GTM4WP settings without loading GA or GTM containers more than once.
- Use the WordPress Redirection plugin as the editable source for redirect rules. Synchronize its enabled URL, match, target, HTTP status, and ordering rules into the production host so redirects happen before the React application loads.
- On Firebase Hosting, translate supported Redirection rules into `firebase.json` redirects and deploy them. Do not represent client-side React navigation as an SEO-equivalent HTTP redirect. Explain when a Redirection rule needs a new deployment before it reaches Firebase.
- Preserve query strings when the WordPress rule requires them. Reject or flag regex, conditional, login-state, header, cookie, server-variable, or plugin-only rules that Firebase cannot reproduce exactly instead of silently changing their meaning.
- Before deployment, detect redirect loops, chains, duplicate sources, conflicting destinations, redirects to WordPress preview URLs, and rules that intercept WordPress REST or admin paths. Verify the public response status and `Location` header after deployment.
- Never use a temporary hosting domain as the public brand name. Fall back to the configured company name until WordPress has a proper site name.
- Preserve readable, stable routes and ensure articles and CMS collections do not compete with one another in search results.

### Performance and assets

- Convert suitable images to WebP, size them for their rendered dimensions, and retain enough quality that the visual difference is not noticeable.
- Preconnect to required CMS and media origins.
- Lazy-load below-the-fold media and avoid downloading collection data on individual detail pages.
- Run a production build and Lighthouse. Aim for 95 or higher in every category and fix material performance, accessibility, SEO, and best-practice issues.

### Verification and delivery

- Compare the implementation with Figma at desktop, tablet, and mobile sizes and correct visible differences.
- Test every page, navigation item, button, filter, form, article, CMS detail page, image, and video.
- Confirm there is no horizontal overflow, broken media, duplicate tracking, duplicate content, stale local fallback, or unusual spacing.
- When content is migrated, compare the source and destination records for visible text, media count, media order, slugs, and publication status.
- Deploy using the workspace's configured hosting target, then repeat the main checks against the public URL.
- Continue until the requested website is complete. Ask the user only when required credentials, login, a destination, or an irreversible decision is genuinely missing.
- Report completion in Chinese, including the public URLs, validation results, WordPress editing map, and any remaining limitation.

### Expected invocation

`[wpweb] https://www.figma.com/design/...`

The user may add optional details after the URL, such as a WordPress admin URL, old content source, Firebase project ID, or production domain. Explicit details supplied with the command override existing workspace defaults.
