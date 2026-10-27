# WordPress 網誌編輯指南

網站：https://hkexl-990b9.web.app/
文章列表：https://hkexl-990b9.web.app/info
WordPress 後台：https://palegoldenrod-finch-836401.hostingersite.com/wp-admin/

## 新增文章

1. 登入 WordPress 後台，選擇「文章」→「新增文章」。
2. 輸入標題，用 Gutenberg 區塊加入段落、標題、圖片、清單及連結。
3. 在文章設定中加入「特色圖片」及「摘要」，設定文章網址 slug。
4. 按「發佈」。網站會讀取已發佈文章，毋須重新部署 Firebase。
5. 開啟網站「外勞資訊」查看新文章。列表每分鐘及切回視窗時更新；重新整理亦會讀取最新資料。WordPress 本身的快取可能稍有延遲。

## 修改位置與網站影響

| WordPress 欄位 | 網站會改變的位置 |
| --- | --- |
| 文章標題 | 文章卡片、文章頁標題、瀏覽器標題 |
| 文章內容 | 文章頁正文，支援段落、標題、圖片、清單、表格及連結 |
| 摘要 | 文章卡片簡介及頁面描述；沒有摘要時從正文擷取 |
| 特色圖片 | 文章卡片及文章頁圖片；沒有圖片時使用公司預設圖 |
| 發佈日期 | 文章日期及排序，最新文章在最前 |
| 網址 slug | /posts/你的-slug；更改後舊網址不會自動轉址 |
| 草稿／私人／垃圾桶 | 不會出現在公開網站；已開啟的頁面請重新整理 |

每頁顯示 12 篇文章，超過時有上一頁／下一頁。只會公開「已發佈」文章。網站不需要、亦沒有儲存 WordPress 密碼。圖片應加入替代文字，建議特色圖片使用橫向構圖。

目前新 WordPress 只有預設的「Hello world!」網誌文章。可在後台編輯它，或新增正式文章後將它移至垃圾桶。

## 十八區宿舍

宿舍同樣由 WordPress「文章」管理，但必須選擇分類「十八區宿舍」。網站會按分類名稱辨認內容（亦兼容 slug `dormitories`），把相關文章放到 `/dorms`，並自動從「外勞資訊」網誌列表排除。

新增宿舍：

1. 選擇「文章」→「新增文章」。文章標題就是宿舍名稱，網址 slug 就是網站的 `/living/slug`。
2. 選擇分類「十八區宿舍」。
3. 加入「清單」或「段落」區塊，前三項按以下格式填寫，冒號前文字不要改：
   - `地區：新界`
   - `鐵路通勤：往返 10 分鐘`
   - `巴士接駁：往返 5 分鐘`
4. 在清單下面用任何 Gutenberg 區塊加入宿舍介紹、地址、價錢、設施、圖片、表格或連結。
5. 設定特色圖片後發佈。沒有特色圖片時，現有同名宿舍會使用網站內的原圖；新宿舍會使用預設圖。

**設定分區：**開啟對應宿舍文章，修改 `地區：` 後面的文字，例如 `香港島`、`九龍` 或 `新界`，再按「更新」。宿舍列表的「地區」選項會直接由已發佈宿舍的這個欄位產生；新增其他分區名稱，選項亦會自動加入。此欄位也會用於宿舍內頁描述。請確保每間宿舍只寫一個分區，名稱用字一致。

修改宿舍：直接改文章並按「更新」。刪除宿舍：把文章移至垃圾桶或改成草稿。網站只顯示已發佈而且已選「十八區宿舍」分類的文章，列表會讀取全部頁數，不限首 12 間或首 100 間。分類存在後，WordPress 若沒有任何已發佈宿舍，網站亦會顯示空列表，所以可以真正刪除全部宿舍。特色圖片會直接讀取 WordPress 媒體庫，改圖後網站亦會更新。

舊有匯入檔 `exports/hkexl-dormitories.wordpress.xml` 只含首 12 間宿舍；目前 WordPress 已有完整宿舍資料，毋須再匯入該檔，以免產生重複文章。

## SEO 與 WordPress 可見度

WordPress「設定」→「閱讀」內的「建議搜索引擎不索引本站點」必須保持勾選。文章及宿舍在 WordPress 後台仍需設為「已發佈」，Firebase 正式網站才可以透過 WordPress API 讀取；WordPress 文章頁會輸出 `noindex, nofollow`，避免同一篇內容在兩個網站造成重複 SEO。

網站已配合 **Yoast SEO、Site Kit by Google 及 GTM4WP**：

- Yoast 的文章 SEO 標題、描述、robots、Open Graph 圖片／類型及 Twitter Card 會同步到 Firebase 文章頁。
- Yoast 的網站名稱、首頁標題、首頁描述、預設社交圖片及 Twitter 帳號會同步到 Firebase 網站。
- GTM4WP 的 `GTM-...` 容器及 Site Kit 已啟用的 Tag Manager／Analytics 代碼會同步到 Firebase；相同 ID 只載入一次。
- WordPress 設定更新後，Firebase 網站會在一分鐘內或訪客重新整理／切回頁面時重新讀取，毋須重新部署。
- Firebase 每個網址會產生指向自身的 canonical；WordPress 副本由 HKEXL Bridge 同時加入 HTML robots 及 `X-Robots-Tag: noindex, nofollow`。

### 新文章發佈前檢查（避免 Google「未編入索引」）

1. **網址 slug 發佈前定好，之後不要改。** 改 slug 會令舊網址變 404；如必須更改，請在 Redirection 外掛加 301 轉址並重新部署。
2. **內容要獨特及足夠。** 文章建議 800 字以上，有清楚小標題（H2）及常見問題；宿舍頁不要只複製範本，每間宿舍最少寫 150 字獨有資料（附近工業區、街道、實際交通時間、房型、相片說明）。內容太短或與其他頁面幾乎相同，Google 會標示「已檢索 - 目前未編入索引」。
3. **填寫 Yoast 的 SEO 標題及描述**，每篇不同；不要在 Yoast「進階」把文章設為 noindex。
4. **加入內部連結。** 在相關舊文章或宿舍頁加一條連結指向新文章，Google 會較快發現。
5. **發佈後重新部署 Firebase。** sitemap 及給 Google 的靜態 HTML 只在 `npm run build` 時產生；未重新部署前，新文章不會出現在 `https://hkexl.com/sitemap.xml`。
6. **到 Google Search Console 提交。** 「網址審查」貼上 `https://hkexl.com/posts/<slug>` →「要求建立索引」。數天後再檢查「網頁」報告。

請保留「HKEXL Headless SEO & Tracking Bridge」外掛為啟用狀態。追蹤代碼只應在 Site Kit 或 GTM4WP 其中一處設定同一個服務；即使兩者出現相同 ID，橋接亦會自動去重。

## 首頁和表格

本次 WordPress 接駁範圍包括網誌及十八區宿舍。首頁其他內容及服務頁保留在 React 專案。聯絡表格會開啟 WhatsApp，讓訪客確認內容後自行發送；表格本身不儲存或寄出資料。

## 本地設定

.env 的 VITE_WORDPRESS_VERSION=true 會讀取 WordPress；false 則使用專案內的示範文章。VITE_WP_API_URL 指向 https://palegoldenrod-finch-836401.hostingersite.com/wp-json/wp/v2。修改 .env 後需要重新建置及部署，新增或修改文章不需要。
