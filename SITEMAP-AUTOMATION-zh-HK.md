# HKEXL Sitemap 自動更新

## 流程

1. WordPress 發佈、修改、下架或永久刪除文章／宿舍文章時，`HKEXL Sitemap Webhook` 外掛通知 GitHub。
2. `.github/workflows/refresh-sitemap.yml` 執行 `npm ci`、`npm run build`，由 `scripts/generate-sitemap.mjs` 讀取已發佈的 WordPress 文章並產生正式網域網址。
3. GitHub Actions 將整個現有網站建置結果部署到 Firebase Hosting，`https://hkexl.com/sitemap.xml` 及預先產生嘅文章／宿舍頁面因而更新。
4. 後備檢查：工作流程每 3 小時（第 17 分鐘）比較 WordPress 已發佈文章數量及最新修改時間，同 `https://hkexl.com/wp-sync.json` 記錄嘅上次部署版本。有分別先會重新部署，冇分別就跳過。即使 webhook 失敗，最遲約 3 小時內都會自動補回。

文章同宿舍：部署時會由 WordPress 生成 `dist/data/` 入面嘅 JSON 檔案（`posts/page-N.json`、`posts/<slug>.json`、`dorms.json`、`dorms/<slug>.json`），訪客瀏覽器只會讀取 hkexl.com 上面嘅呢啲檔案，唔會直接連去 WordPress。同一次瀏覽入面，已經睇過嘅文章會記住，唔會再次載入。所以喺 WordPress 修改文章或宿舍之後，要等自動部署完成（通常 2–3 分鐘）先會喺網站出現。

頁面文字、選單及網站設定仍然會即時向 WordPress 讀取，唔使部署。WordPress 主題版本（`wordpress/hkexl-theme`）亦繼續即時讀取 WordPress。Google Search Console 成功提交 sitemap 一次後會定期重讀。

## 一次性設定

- GitHub 倉庫：`nickhinhin/hkexl`，工作流程必須位於預設分支。
- GitHub Actions secret：`FIREBASE_SERVICE_ACCOUNT_HKEXL_990B9`，內容為專用、最少權限的 Firebase 部署服務帳戶 JSON 金鑰。切勿提交金鑰到 Git。
- GitHub fine-grained personal access token：只授權 `nickhinhin/hkexl`，Repository permissions → Contents → Read and write。WordPress「設定 → HKEXL Sitemap Webhook」儲存此 token；外掛不會在頁面重新顯示它。
- WordPress 外掛檔案：`wordpress/wp-content/plugins/hkexl-sitemap-webhook/hkexl-sitemap-webhook.php`。安裝並啟用後，可在其設定頁按「Save and send test event」。

## 檢查

- WordPress 設定頁的 `Last dispatch` 應顯示 `204`。
- GitHub Actions 的「Deploy HKEXL from WordPress」工作應成功。
- `https://hkexl.com/wp-sync.json` 的 `version`（格式：文章數量:文章ID@修改時間）應等於 WordPress 最新狀態。
- `https://hkexl.com/sitemap.xml` 應列出新的／更新後的文章網址；下架文章應消失。

WordPress 前台被全站設為 `noindex`，但正式 React 網站使用本身的索引設定。外掛公開 `hkexl_sitemap_index` 欄位，讓文章在 Yoast 明確設為 `noindex` 時仍不加入 sitemap。
