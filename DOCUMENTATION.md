# HKEXL implementation documentation

Deployment target: `hkexl-990b9`. React + Vite, Firebase Hosting, published WordPress.com REST API.

## Function map

| Function | Input | Output / purpose | Calls |
| --- | --- | --- | --- |
| `routeTo` | `path, setPage` | Update browser history, scroll position, and the active React route. | Browser/React APIs or content data |
| `navigate` | `event, path` | Handle internal link clicks while preserving modified-click browser behavior. | routeTo |
| `imageSrc` | `src = ''` | Return a local compressed URL or preserve external CMS media. | Browser/React APIs or content data |
| `normalizePath` | `path` | Normalize a path to its pathname with no trailing slash. | Browser/React APIs or content data |
| `plainText` | `html = ''` | Convert WordPress HTML to decoded plain text for summaries and metadata. | Browser/React APIs or content data |
| `cleanSeoTemplate` | `value = '', postTitle = ''` | Resolve supported Yoast title placeholders into readable metadata. | plainText |
| `normalizeSeo` | `post, title, body, image` | Normalize optional WordPress SEO metadata with article fallbacks. | cleanSeoTemplate |
| `normalizeWpPost` | `post` | Map a published WordPress post to sanitized article data. | plainText, normalizeSeo |
| `wpEndpoint` | `path, query` | Build a WordPress REST URL from the configured API base and query. | Browser/React APIs or content data |
| `uniqueByTitle` | `items` | Remove duplicate legacy CMS items by their title or name. | Browser/React APIs or content data |
| `useWordPressCollection` | `type, perPage = 100` | Read optional self-hosted custom content types; disabled on WordPress.com. | wpEndpoint |
| `useWordPressTerms` | `taxonomy` | Read taxonomy labels for the optional self-hosted dormitory collection. | wpEndpoint |
| `normalizeWpDorm` | `post, areaTerms = {}` | Map optional dormitory CMS fields to the shared dormitory card format. | plainText |
| `normalizeWpWorker` | `post` | Map optional worker CMS fields to the shared worker card format. | plainText |
| `uniqueWorkers` | `workersList` | Deduplicate legacy worker records, preferring a record with a photograph. | Browser/React APIs or content data |
| `useWordPressPosts` | `page = 1` | Return posts, loading, error, and page count; refresh on focus and every minute. | wpEndpoint |
| `useWordPressPost` | `slug` | Return one published post, loading and error state. | normalizeWpPost, wpEndpoint |
| `useCmsSiteConfig` | none | Refresh public Yoast, Site Kit, and GTM4WP bridge settings on load, focus, and every minute. | cmsBridgeEndpoint, browser fetch |
| `CmsTracking` | bridge config | Deduplicate and load configured GTM and GA tags into the Firebase document. | DOM APIs |
| `setMeta` | `selector, attr, key, value` | Create or update one metadata tag in the document head. | Browser/React APIs or content data |
| `Seo` | `{ title, description, image }` | Apply route-specific page titles, descriptions, and social image metadata. | imageSrc, setMeta |
| `useReactRedirects` | `page, setPage` | Apply optional legacy CMS redirect rules; disabled on WordPress.com. | normalizePath, wpEndpoint |
| `Header` | `{ page, setPage }` | Render desktop navigation or a collapsible mobile and tablet menu. | routeTo |
| `Hero` | `none` | Render the supplied desktop banner, responsive mobile content, and contact actions. | Browser/React APIs or content data |
| `Services` | `none` | Render the introduction and six reusable service cards. | Browser/React APIs or content data |
| `Advantages` | `none` | Render the three company advantages on a blue background. | Browser/React APIs or content data |
| `Timeline` | `none` | Render the three application timeline stages. | Browser/React APIs or content data |
| `Process` | `none` | Render the five numbered application steps from shared content data. | Browser/React APIs or content data |
| `WorkerNetwork` | `none` | Render the existing worker photographs and descriptions in a responsive grid. | imageSrc, useWordPressCollection, uniqueWorkers |
| `Housing` | `none` | Render the interview section with a recruitment photograph. | Browser/React APIs or content data |
| `Partners` | `none` | Render compressed company partner logos with encoded asset paths. | imageSrc |
| `Contact` | `{ workerMode = false }` | Render the employer or worker enquiry form and its WhatsApp handoff. | Browser/React APIs or content data |
| `FAQ` | `{ items = faqs, title = '常見問題' }` | Render an accessible accordion with at most one expanded answer. | Browser/React APIs or content data |
| `HomePage` | `none` | Compose the homepage sections in their design order. | Seo, Hero, Services, Advantages, Timeline, Process, WorkerNetwork, Housing, Partners, Contact, FAQ |
| `PageHero` | `{ title, body, image = 'Hero-Section.webp' }` | Render a reusable internal-page introduction with image and contact actions. | imageSrc |
| `ProcessArticlePage` | `none` | Render the application information page and its related FAQs. | imageSrc, Seo, FAQ, PageHero |
| `dormField` | `html, labels, fallback` | Read a labelled value from Gutenberg paragraph or list blocks. | Browser DOM APIs |
| `normalizeWordPressDorm` | `post` | Convert a WordPress dormitory post into the shared card/detail record. | plainText, dormField |
| `withDormitoryMedia` | `posts, signal` | Resolve WordPress featured images in batches of 100 and return the posts with image URLs. | wpEndpoint, fetch |
| `useWordPressCategoryPosts` | `categorySlug` | Resolve a WordPress category, load every published page, and refresh its posts. | wpEndpoint, withDormitoryMedia, React APIs |
| `DormsPage` | `none` | Render all published WordPress dormitory cards and filter them by editable district. | navigate, imageSrc, useWordPressCategoryPosts, normalizeWordPressDorm, Seo |
| `InfoPage` | `none` | Render published blog cards with loading, empty, error, and pagination states. | navigate, imageSrc, useWordPressPosts, Seo |
| `DormDetailPage` | `{ slug }` | Resolve a WordPress-managed dormitory slug and render its Gutenberg blocks or a not-found state. | useWordPressDormPost, normalizeWordPressDorm, Seo, PageHero, NotFound |
| `PostDetailPage` | `{ slug }` | Render sanitized published article blocks or a loading/error/not-found state. | navigate, useWordPressPost, Seo, PageHero |
| `ContactPage` | `{ workerMode = false }` | Compose a page introduction and the appropriate enquiry form. | Seo, Contact, PageHero |
| `RenewalPage` | `none` | Render renewal information, promotional media, and related FAQs. | imageSrc, Seo, FAQ, PageHero |
| `Footer` | `none` | Render footer navigation and copyright. | navigate |
| `FloatingActions` | `none` | Provide persistent telephone and WhatsApp links on every route. | Browser/React APIs or content data |
| `NotFound` | `none` | Render a not-found message and homepage link. | navigate, Seo |
| `App` | `none` | Coordinate route state, browser back navigation, shared header, content, and footer. | normalizePath, useReactRedirects, Header, HomePage, ProcessArticlePage, DormsPage, InfoPage, DormDetailPage, PostDetailPage, ContactPage, RenewalPage, Footer, FloatingActions, NotFound |

## CMS contract

Blog list: `/posts?status=publish&_embed=1&per_page=12&page=N&orderby=date&order=desc`. Detail: `/posts?status=publish&_embed=1&slug=...`. Base: `https://palegoldenrod-finch-836401.hostingersite.com/wp-json/wp/v2`. Only published posts are fetched; drafts are never used as public content. DOMPurify sanitizes article HTML. API errors and missing slugs have explicit states.

`wordpress/hkexl-headless-bridge/` exposes only non-sensitive SEO and tracking identifiers through `/wp-json/hkexl/v1/site-config`. It reads active Yoast SEO, Site Kit, and GTM4WP settings. The React `Seo` component combines those settings with route-specific metadata, always keeps the canonical URL on the Firebase origin, and respects per-post Yoast robots values. The bridge forces the WordPress-rendered frontend to `noindex, nofollow` in both markup and the HTTP response while leaving REST content readable.

Dormitory content uses normal WordPress posts in the `十八區宿舍` category. `fetchDormCategory` resolves its ID; `useWordPressCategoryPosts` reads every published API page and `withDormitoryMedia` resolves featured images from the WordPress media library in batches. The blog query excludes the dormitory category. `normalizeWordPressDorm` reads `地區：`, `鐵路通勤：`, and `巴士接駁：` values from ordinary Gutenberg paragraph or list blocks; the district filter options come directly from these values. The remaining sanitized blocks render on the detail page. Once the category exists, deleting or drafting a post removes it from the site, including the last remaining entry. The listing shows a loading or retry state and never displays bundled dormitories when WordPress is enabled.

Old Docker and custom CMS plugin files remain in `wordpress/` for reference. They are not deployed or used by the current Hostinger WordPress integration. In particular, the old plugin exposed drafts; it must not be used for this deployment.

## Responsive and assets

Desktop navigation changes to a top-right menu at 1100px. Layouts adapt further at 600px. Original assets are retained locally, but Firebase excludes `assets/original/**`. Compressed WebP assets total approximately 2.2 MB for the entire site. Original company URLs map to local assets when available.

## Verification

Seven routes checked at 390px, 820px and 1280px with no horizontal overflow. WordPress list and detail verified against the existing Hello World post. District filtering and missing-post recovery verified. Lighthouse production preview: performance 98, accessibility 100, best practices 100, SEO 100. These are local lab scores, not a guarantee for every network or device.

## Design reference and limits

Figma file: `0YEpewIZLQOplQaX3yN0NP`; desktop homepage `0:3`, hero `114:1029`, service cards `0:13`, timeline `0:126`, application steps `0:183`, worker section `0:274`, contact section `0:486`, footer `111:981`, mobile hero `45:511`. Inspected through Figma canvas and Properties because no Figma MCP tool was available. Figmaflow documentation was checked; it configures MCP connections and does not itself export designs.

The original desktop banner is a supplied raster asset; other sections are semantic React markup. Mobile hero uses a photograph crop and real text. Existing worker photographs and secondary-page content were retained. Exact 99% pixel similarity has not been established; mobile crop, worker cards, typography and secondary pages still differ from the Figma file.

See `BLOG-GUIDE-zh-HK.md` for client editing instructions.
