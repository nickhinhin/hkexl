# HKEXL Sitemap 自動更新

## 流程

1. WordPress 發佈、修改、下架或永久刪除文章／宿舍文章時，`HKEXL Sitemap Webhook` 外掛通知 GitHub。
2. `.github/workflows/refresh-sitemap.yml` 執行 `npm ci`、`npm run build`，由 `scripts/generate-sitemap.mjs` 讀取已發佈的 WordPress 文章並產生正式網域網址。
3. GitHub Actions 將整個現有網站建置結果部署到 Firebase Hosting，`https://hkexl.com/sitemap.xml` 因而更新。

只在 WordPress 後台改字或圖片，網站本身會直接讀取最新內容；上述部署只係為咗更新 sitemap。Google Search Console 成功提交 sitemap 一次後會定期重讀。

## 一次性設定

- GitHub 倉庫：`nickhinhin/hkexl`，工作流程必須位於預設分支。
- GitHub Actions secret：`FIREBASE_SERVICE_ACCOUNT_HKEXL_990B9`，內容為專用、最少權限的 Firebase 部署服務帳戶 JSON 金鑰。切勿提交金鑰到 Git。
- GitHub fine-grained personal access token：只授權 `nickhinhin/hkexl`，Repository permissions → Contents → Read and write。WordPress「設定 → HKEXL Sitemap Webhook」儲存此 token；外掛不會在頁面重新顯示它。
- WordPress 外掛檔案：`wordpress/wp-content/plugins/hkexl-sitemap-webhook/hkexl-sitemap-webhook.php`。安裝並啟用後，可在其設定頁按「Save and send test event」。

## 檢查

- WordPress 設定頁的 `Last dispatch` 應顯示 `204`。
- GitHub Actions 的「Refresh HKEXL sitemap」工作應成功。
- `https://hkexl.com/sitemap.xml` 應列出新的／更新後的文章網址；下架文章應消失。

WordPress 前台被全站設為 `noindex`，但正式 React 網站使用本身的索引設定。外掛公開 `hkexl_sitemap_index` 欄位，讓文章在 Yoast 明確設為 `noindex` 時仍不加入 sitemap。
