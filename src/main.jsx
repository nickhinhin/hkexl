import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Bus,
  CalendarDays,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Globe2,
  Home,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Rocket,
  ShieldCheck,
  Banknote,
  ChevronDown,
  Handshake,
  HeartPulse,
  Users,
  X,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import localAssets from './local-assets.json';
import './styles.css';

// The WordPress theme build sets HKEXL_CONFIG; the Firebase build leaves it undefined.
const runtimeConfig = window.HKEXL_CONFIG || {};
const A = `${import.meta.env.BASE_URL}assets/webp/`;
const U = 'https://hkexl.com/wp-content/uploads/';
const wordpressEnabled = import.meta.env.VITE_WORDPRESS_VERSION === 'true';
const wordpressApiUrl = runtimeConfig.apiUrl || import.meta.env.VITE_WP_API_URL || 'https://palegoldenrod-finch-836401.hostingersite.com/wp-json/wp/v2';
const wordpressOrigin = new URL(wordpressApiUrl).origin;
const wordpressHost = new URL(wordpressOrigin).host;
const customCmsEnabled = wordpressEnabled && !wordpressApiUrl.includes('public-api.wordpress.com');
const dormCategorySlug = 'dormitories';
const wordpressDormCategoryId = runtimeConfig.apiUrl ? null : Number(import.meta.env.VITE_WP_DORM_CATEGORY_ID) || null;
const dormPostFields = 'id,slug,title,excerpt,content,featured_media';
const CmsSettingsContext = createContext(null);
const phoneHref = 'tel:+85261426141';
const whatsappHref =
  'https://wa.me/85255815518?text=%E6%88%91%E5%BE%9E%E7%B6%B2%E7%AB%99%E8%81%AF%E7%B5%A1%E4%BD%A0%E6%9F%A5%E8%A9%A2%E5%A4%96%E5%8B%9E%E8%BC%B8%E5%85%A5%E8%A9%B3%E6%83%85';

const navItems = [
  ['首頁', '/'],
  ['申請流程', '/process'],
  ['十八區宿舍', '/dorms'],
  ['外勞資訊', '/info'],
  ['聯絡我們', '/contact'],
  ['國內勞工專區', '/worker'],
  ['續約指南', '/renewal'],
];

const serviceCards = [
  ['協助申請外勞配額', '我們會了解公司業務和人手短缺情況，評估是否適合申請外勞配額並釐定合適方案，同時協助僱主整理申請外勞配額所需文件，提高批核成功率。', 'fa1c1fc7-2641-483f-a32b-b38edb4ea165.webp', BriefcaseBusiness],
  ['篩選合適勞工', '在等待配額批出期間，我們會與僱主了解具體招聘標準，包括年齡、工作經驗、語言及特定技能，從人才庫中挑選合適人選安排線上或線下面試。', 'fa9d9d5c-af36-4b2c-a1b3-2a89a6961cb1.webp', Users],
  ['實體招聘會即場面試', '除人才庫外，我們還會在內地安排實體招聘會，並提供免費交通接送，讓僱主可親臨現場與候選人即場面試，了解其工作經驗、語言能力及性格。', '47ab2aaa-48d7-4b49-8c9a-f9cbaccab013.webp', Building2],
  ['安排來港手續及簽證', '我們會協助勞資雙方簽訂僱傭合約，確保合約條款符合本地法例要求。我們還會協助外勞申請工作簽證，並提醒僱主及外勞準備到港前的安排。', 'f014669d-d468-40ef-b889-a5d78eee41f4.webp', FileText],
  ['安排入住 18 區宿舍', '我們的宿舍遍佈全港18區，環境舒適並齊備基本家電配置，可根據工作地點及預算建議合適的住宿地點，方便員工通勤及盡快適應在港生活。', '503b572c-db3e-418f-b5e0-35481876f1ae.webp', Home],
  ['大灣區人才學校支援', '我們與大灣區多間人才培訓機構及職業學校合作，可根據僱主要求，協調學校提供針對性的職前培訓，讓外勞來港前已掌握基本工作要求。', 'b52f9e7a-a466-4e7a-b20f-9cc620b2ad4f.webp', BadgeCheck],
];

const advantages = [
  [Globe2, '大灣區自設外勞人才庫', '憑藉龐大內地人才庫及培訓合作，我們能快速配對各業人選，提升招聘效率。'],
  [Bus, '專車接送往返中港面試', '我們安排跨境專車及專人陪同面試，讓僱主可更順暢地完成招聘及甄選。'],
  [ShieldCheck, '收費清晰透明 絕無中介費', '收費透明、無隱藏開支，且不向外勞收費，為您吸引更多優質人才。'],
];

const processSteps = [
  [MessageCircle, '初步諮詢與資格評估', '了解公司背景、行業、職位及人手需要，評估是否符合外勞申請條件'],
  [ClipboardList, '準備及提交配額申請', '整理公司資料、本地招聘證明及工作條件，代為向相關部門提交配額申請'],
  [Users, '配額批出及招聘安排', '配額獲批後，安排內地招聘會或面試，協助僱主揀選合適外勞'],
  [FileText, '簽訂合約及簽證申請', '協助簽訂僱傭合約，整合外勞個人資料並向入境處申請工作簽證'],
  [Home, '到港住宿及開工', '簽證批出後安排來港、住宿及入職報到，確保外勞盡快投入工作'],
];

const workers = [
  ['美容', '專業', '07fe40a5-4616-4c0a-9e8c-5b1102a8094d-e1773822444742-768x697.webp'],
  ['文職', '專業', '1d35196a-dfe0-478b-986b-ae5700e45c07.webp'],
  ['待應', '高級', '53581542-b812-4c8e-8061-7c2d530233ab-768x731.webp'],
  ['待應', '高級', '5839a1b2-8e5c-4c35-93ce-c08c34fbfd52-768x708.webp'],
  ['待應', '高級', '601d2662-11dc-4cdc-af78-a91eded60766-768x692.webp'],
  ['文員', '專業', 'IMG_9146-e1773820744194-768x687.webp'],
  ['文員', '專業', 'c02549bf-ba48-42a6-bae8-087d8abb3124-1-768x713.webp'],
  ['倉務', '高級', 'f1a00325-a127-4011-b053-e31aeb0facfe.webp'],
];

const partnerLogos = [
  '%E7%89%9B%E9%99%A3-1-1.webp',
  'Grill-Tajimaya.webp',
  '%E7%A6%AE_-logo-1.webp',
  '%E6%B0%B8%E5%AF%8C-1.webp',
  '%E8%B1%AA%E9%9A%8D-1.webp',
  '%E4%BD%86%E9%A6%AC%E5%B1%8B-1.webp',
  'Sukiyakiya-1.webp',
  '%E9%8C%A2%E5%A4%A7%E5%AA%BD-1.webp',
  '%E7%B6%A0%E5%9C%A8%E5%8D%80%E5%8D%80-1.webp',
  '%E5%8D%83%E6%AD%B2-1.webp',
  '%E9%A6%99%E6%B8%AF%E6%A9%9F%E5%A0%B4%E7%AE%A1%E7%90%86%E5%B1%80-1.webp',
  '%E6%AA%B8%E6%AA%B8%E5%86%B0%E5%AE%A4-1.webp',
  '%E6%9C%AC%E9%99%A3-1.webp',
  '%E7%89%9B%E9%99%A3-2.webp',
  'Tajimaya-1.webp',
];

const faqs = [
  ['哪些公司適合申請香港外勞？', '一般而言，如公司屬合法在香港註冊、長期面對前線人手短缺，且已嘗試本地招聘但仍難以填補空缺，便較適合考慮申請外勞。若你所聘用的職位屬人手緊絀工種，並願意提供符合市場水平或以上的薪酬及合理工作條件，獲批機會通常會較高。建議先與香港特快外勞聯絡，提供公司及職位基本資料，我們可為你作初步評估及建議。'],
  ['香港外勞適用行業與常見招聘職位', '較常聘用外勞的行業包括餐飲服務、酒店及旅遊、零售及物流、建造及裝修、倉務及貨運等。常見招聘職位包括侍應、廚務助理、清潔員、店務員、倉務員、送貨員、技工及一般勞工等前線崗位。如你的行業或職位不在以上例子內，亦可與我們查詢，我們會按最新政策及市場情況為你提供建議。'],
  ['申請香港外勞大約需要多久？', '申請時間視乎行業、申請批量及審批情況而定，一般包括本地招聘、配額審批及簽證處理幾個階段。由提交配額申請到獲批，一般需時數月，其後再安排招聘、簽證及到港。香港特快外勞會在合作初期為你預估時間表，並盡量透過預早準備文件及跟進審批進度，縮短整體流程。'],
  ['僱主需要負責外勞的住宿安排嗎？', '大多數情況下，僱主須為外勞提供合適及符合法例要求的住宿安排，或以津貼形式協助解決住屋問題。我們可協助僱主物色位於不同地區的合規宿舍或合適居所，配合工作地點及班次需要。若你不確定現有安排是否合規，歡迎與我們查詢，我們可提供建議。'],
  ['外勞的薪金和福利有什麼要求？', '外勞的薪金一般不得低於同類本地職位的中位數，並須符合相關勞工法例及計劃規定。除基本薪金外，亦須留意工時、休息日、假期安排及加班補水等條款是否合理。我們可協助僱主檢視工作條件，確保申請時不會因待遇問題影響審批。'],
  ['外勞合約期滿後可以續約嗎？', '合約期滿後，如僱主仍有實際人手需要，並符合相關政策及審批要求，一般可考慮續約或重新申請。是否可續約及續約年期，會因計劃及當時政策而異，需要個別評估。我們會在合約期將近時提醒僱主，並按實際情況建議下一步安排。'],
  ['如外勞中途離職，可以安排替補人選嗎？', '如外勞因個人原因或其他因素提早離職，我們可協助僱主評估能否在剩餘配額或計劃框架內安排替補人選。實際是否可替補，會視乎原有申請條件及當時政策而定，我們會盡力協助僱主減少人手流失對營運造成的影響。'],
  ['申請外勞前一定要進行本地招聘嗎？', '一般情況下，僱主需要先嘗試在本地招聘，並保留相關紀錄，以證明確有聘不到足夠本地員工。本地招聘的安排包括刊登招聘廣告、記錄應徵及面試情況等，這些都會成為配額申請的重要文件。'],
  ['外勞來港後的培訓及適應誰來負責？', '僱主通常需為外勞提供入職培訓，包括工作流程、安全守則及公司政策等。我們可協助安排到港簡介、基本生活資訊及工作前準備，部分工種亦可配合大灣區人才學校作職前培訓。良好的培訓及支援有助外勞更快融入團隊，減少流失率。'],
  ['如公司首次申請香港外勞，需要準備什麼資料？', '首次申請的公司一般需要準備商業登記、公司註冊資料、營運簡介及員工架構等文件，同時亦需提供本地招聘紀錄、職位描述、薪酬及工作條件說明等，以支持實際人手需求。你只需先把現有資料交給我們，我們會列出尚欠文件清單，協助一步步完成準備。'],
];

const dormCards = [
  ['kam-sheung-road', '錦上路', '新界', '往返 10 分鐘', '往返 5分鐘', `${U}2026/02/mg_7831_2_3_med_hr-300x200.jpg`],
  ['yuen-long', '元朗', '新界', '往返 5 分鐘', '往返 3 分鐘', `${U}2026/02/MTR_LeafletThumbnail_v3_TML_YUL_16800707LR02-300x188.png`],
  ['tuen-mun', '屯門', '新界', '往返 12分鐘', '往返 5 分鐘', `${U}2026/02/mg_8269_med_hr-300x200.jpg`],
  ['tin-shui-wai', '天水圍', '新界', '往返 11 分鐘', '往返 5 分鐘', `${U}2026/02/%E5%A4%A9%E6%B0%B4%E5%9C%8D%E7%AB%99-300x219.jpg`],
  ['to-kwa-wan', '土瓜灣', '九龍', '往返 10分鐘', '往返 5分鐘', `${U}2026/02/Platform_2_To_Kwa_Wan_Station_MTR_20210612-300x200.jpg`],
  ['shek-mun', '石門', '新界', '往返 10分鐘', '往返 3分鐘', `${U}2026/02/Shek_Mun_Station_01-300x237.jpg`],
  ['sheung-shui', '上水', '新界', '往返 13分鐘', '往返 6分鐘', `${U}2026/02/hq720-300x169.jpg`],
  ['fanling', '粉嶺', '新界', '往返 10分鐘', '往返 5分鐘', `${U}2026/02/651e4842e4b0bf23114a7cab-300x225.jpg`],
  ['tai-po-market', '大埔墟', '新界', '往返 14分鐘', '往返 7分鐘', `${U}2026/02/MTR_LeafletThumbnail_v3_EAL_TAP_168s00D70216-300x188.png`],
  ['sha-tin', '沙田', '新界', '往返 9分鐘', '往返 3分鐘', `${U}2026/02/P1210918-uai-2000x1500-1-300x225.jpg`],
  ['tai-wai', '大圍', '新界', '往返 13分鐘', '往返 5分鐘', `${U}2026/02/01068a-300x224.jpg`],
  ['sham-shui-po', '深水埗', '九龍', '往返 4分鐘', '往返 2分鐘', `${U}2026/02/5155305039_9505ffe715_b-300x225.jpg`],
];

const dormImageByName = Object.fromEntries(dormCards.map(([, name, , , , image]) => [name, image]));
const dormSeedImageByName = {
  '中環': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_Hong_Kong_station_Central.jpg',
  '堅尼地城': 'https://hkexl.com/wp-content/uploads/2026/02/kennedy-town-hong-kong-dec-260nw-2570789951.webp',
  '香港大學': 'https://hkexl.com/wp-content/uploads/2026/02/HKU_character.JPG-scaled.webp',
  '西營盤': 'https://hkexl.com/wp-content/uploads/2026/02/images.jpg',
  '上環': 'https://hkexl.com/wp-content/uploads/2026/02/istockphoto-615834050-170667a.jpg',
  '金鐘': 'https://hkexl.com/wp-content/uploads/2026/02/Admiralty-MTR-Livery-scaled.jpg',
  '灣仔': 'https://hkexl.com/wp-content/uploads/2026/02/9c13d5728ebae074e1f5e4e1bb60994d.jpg',
  '銅鑼灣': 'https://hkexl.com/wp-content/uploads/2026/02/hk_service_apartment_13811034141581082099-1.jpg',
  '天后': 'https://hkexl.com/wp-content/uploads/2026/02/tinhau_1.webp',
  '炮台山': 'https://hkexl.com/wp-content/uploads/2026/02/624be2924b5d3841e3ae3f75449abdca.jpg',
  '北角': 'https://hkexl.com/wp-content/uploads/2026/02/f865b0c13c5ad7b79906c8ffb75419a1.jpg',
  '鰂魚涌': 'https://hkexl.com/wp-content/uploads/2026/02/b53013c1d22b3ad275b896c82b5ffeb2.jpg',
  '太古': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_Tai_Koo_Station.jpg',
  '西灣河': 'https://hkexl.com/wp-content/uploads/2026/02/46e9225bd5ea8ed1caf50cf98b5ef12d.jpg',
  '筲箕灣': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_LeafletThumbnail_v3_ISL_SKW_1680069V9E28.png',
  '杏花邨': 'https://hkexl.com/wp-content/uploads/2026/02/13044d1a10fc67bcad9b936c66ad247f.jpg',
  '柴灣': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_LeafletThumbnail_v3_ISL_CHW_B16800l69975.png',
  '黃竹坑': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_LeafletThumbnail_v3_SIL_WCH_816h80062408.png',
  '旺角': 'https://hkexl.com/wp-content/uploads/2026/02/mong-kok-guide-how-to-get-there-900x643-1.jpg',
  '太子': 'https://hkexl.com/wp-content/uploads/2026/02/j3-private-tours-hong.jpg',
  '油麻地': 'https://hkexl.com/wp-content/uploads/2026/02/278-900x510-1.webp',
  '石硤尾': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_LeafletThumbnail_v3_KTL_SKM_1N6800692788.png',
  '樂富': 'https://hkexl.com/wp-content/uploads/2026/02/16700044253_4abe62f111_b.jpg',
  '九龍灣': 'https://hkexl.com/wp-content/uploads/2026/02/00956e.jpg',
  '牛頭角': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_LeafletThumbnail_v3_KTL_NTK_1V6800698V03.png',
  '觀塘': 'https://hkexl.com/wp-content/uploads/2026/02/mg_5316_med_hr.jpg',
  '油塘': 'https://hkexl.com/wp-content/uploads/2026/02/mg_5154_med_hr.jpg',
  '荃灣': 'https://hkexl.com/wp-content/uploads/2026/02/MTR-TsuenWan-scaled.jpg',
  '葵興': 'https://hkexl.com/wp-content/uploads/2026/02/mg_7119_med_hr.jpg',
  '葵芳': 'https://hkexl.com/wp-content/uploads/2026/02/mg_7057_med_hr.jpg',
  '荔枝角': 'https://hkexl.com/wp-content/uploads/2026/02/4095650876_8088ff7b25_z.jpg',
  '深水埗': 'https://hkexl.com/wp-content/uploads/2026/02/5155305039_9505ffe715_b.jpg',
  '大圍': 'https://hkexl.com/wp-content/uploads/2026/02/01068a.jpg',
  '沙田': 'https://hkexl.com/wp-content/uploads/2026/02/P1210918-uai-2000x1500-1.jpg',
  '大埔墟': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_LeafletThumbnail_v3_EAL_TAP_168s00D70216.png',
  '粉嶺': 'https://hkexl.com/wp-content/uploads/2026/02/651e4842e4b0bf23114a7cab-scaled.jpg',
  '上水': 'https://hkexl.com/wp-content/uploads/2026/02/hq720.jpg',
  '石門': 'https://hkexl.com/wp-content/uploads/2026/02/Shek_Mun_Station_01.jpg',
  '土瓜灣': 'https://hkexl.com/wp-content/uploads/2026/02/Platform_2_To_Kwa_Wan_Station_MTR_20210612-scaled.jpg',
  '天水圍': 'https://hkexl.com/wp-content/uploads/2026/02/天水圍站.jpg',
  '屯門': 'https://hkexl.com/wp-content/uploads/2026/02/mg_8269_med_hr.jpg',
  '元朗': 'https://hkexl.com/wp-content/uploads/2026/02/MTR_LeafletThumbnail_v3_TML_YUL_16800707LR02.png',
  '錦上路': 'https://hkexl.com/wp-content/uploads/2026/02/mg_7831_2_3_med_hr.jpg',
};

const infoPosts = [
  ['pregnancy', '【外勞懷孕2026】僱主需知的法律責任、產假安排與常見問題', '近年香港輸入勞工人數增加，外勞懷孕亦成為部份僱主關注的實際問題。就法例層面來說，輸入勞工享有香港勞工法例保障。', `${U}2026/06/%E5%A4%96%E5%8B%9E%E6%87%B7%E5%AD%95.png`],
  ['job-types', '【香港外勞工種2026】僱主申請指南與最新政策重點', '近年香港多個行業持續面對人手短缺問題，輸入外勞成為僱主關注的重點範疇之一。', `${U}2026/06/%E5%A4%96%E5%8B%9E%E5%B7%A5%E7%A8%AE.png`],
  ['mpf', '【香港外勞MPF】一文看清外勞強積金豁免、登記及供款安排', '隨著香港輸入勞工、外勞及海外僱員逐漸增加，強積金成為僱主與員工都高度關注的議題。', `${U}2026/06/%E5%A4%96%E5%8B%9E%E5%BC%B7%E7%A9%8D%E9%87%91.png`],
  ['tax', '【外勞交稅2026】香港外勞要交稅嗎？看清薪俸稅計算方式及60日豁免', '外勞在香港工作超過指定時間，便需就在香港賺取的收入繳交薪俸稅。', 'Hero-Section.webp'],
  ['salary', '【外勞薪金表2026】香港輸入外勞工資指南：飲食、護理業中位數一覽', '餐飲、零售、院舍及物流等行業面對招聘困難，薪金中位數是外勞申請的重要基礎。', 'Container.webp'],
  ['supplementary-labour', '補充勞工優化計劃是甚麼？', '香港政府於2023年9月正式推行的政策，在優先保障本地工人就業的前提下協助企業引入合資格外地勞工。', `${U}2026/02/Rectangle-221.png`],
];

const staticInfoPosts = infoPosts.map(([slug, title, body, image]) => ({
  slug,
  title,
  body,
  image,
  content: '',
}));
const infoImageByTitle = Object.fromEntries(infoPosts.map(([, title, , image]) => [title, image]));

const renewalFaqs = [
  ['續約申請流程大約需要多久？', '透過香港特快外勞辦理，我們擁有一套成熟的高效流程，平均只需 3 個月即可完成從遞交申請到獲批的所有步驟。'],
  ['宿舍優惠適用於哪些地區？', '宿舍優惠適用於我們在全港 18 區管理的所有外勞宿舍，續約後首月租金即時減半，減輕僱主負擔。'],
  ['續約期間外勞可以正常工作嗎？', '在遞交續約申請並獲得入境處簽發的臨時延期或新簽證期間，只要在獲准逗留期內，外勞可繼續為同一僱主工作。'],
];

/** Update browser history, scroll position, and the active React route. */
function routeTo(path, setPage) {
  window.history.pushState({}, '', path);
  window.scrollTo(0, 0);
  setPage(path);
}

/** Handle internal link clicks while preserving modified-click browser behavior. */
function navigate(event, path) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
  event.preventDefault();
  routeTo(path, window.__setPage);
}

/** Point WordPress upload paths at the CMS host that physically serves the files. */
function wordpressMediaSrc(src = '') {
  try {
    const url = new URL(src, window.location.origin);
    return url.pathname.startsWith('/wp-content/uploads/')
      && (url.origin === window.location.origin || url.host === wordpressHost)
      ? `${wordpressOrigin}${url.pathname}${url.search}${url.hash}`
      : src;
  } catch {
    return src;
  }
}

/** Restore CMS media URLs inside imported Gutenberg content. */
function wordpressContent(html = '') {
  return DOMPurify.sanitize(html)
    .replaceAll(`${window.location.origin}/wp-content/uploads/`, `${wordpressOrigin}/wp-content/uploads/`)
    .replaceAll(`http://${wordpressHost}/wp-content/uploads/`, `${wordpressOrigin}/wp-content/uploads/`);
}

/** Resolve original company media to compressed local assets; preserve WordPress uploads. */
function imageSrc(src = '') {
  src = wordpressMediaSrc(src);
  if (!src.startsWith('http')) return `${A}${encodeURIComponent(src)}`;
  if (src.startsWith(U)) {
    const filename = src.split('/').pop().replace(/\.[^.]+$/, '.webp');
    const candidates = [filename, decodeURIComponent(filename)];
    const local = candidates.find((name) => localAssets.includes(name));
    if (local) return `${A}${encodeURIComponent(local)}`;
  }
  return src;
}

/** Decode a percent-encoded path, leaving malformed input unchanged. */
function safeDecodeUri(path) {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/** Normalize a path to its pathname with no trailing slash. */
function normalizePath(path) {
  try {
    const url = new URL(path, window.location.origin);
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '/';
  }
}

/** Convert WordPress HTML to decoded plain text for summaries and metadata. */
function plainText(html = '') {
  const withoutTags = html.replace(/<[^>]*>/g, ' ');
  const textarea = document.createElement('textarea');
  textarea.innerHTML = withoutTags;
  return textarea.value.replace(/\s+/g, ' ').trim();
}

/** Resolve supported Yoast title placeholders into readable metadata. */
function cleanSeoTemplate(value = '', postTitle = '') {
  return plainText(value)
    .replaceAll('%%title%%', postTitle)
    .replaceAll('%%sitename%%', '香港特快外勞')
    .replaceAll('%%sitedesc%%', '外勞申請、招聘、簽證及宿舍安排')
    .replaceAll('%%page%%', '')
    .replaceAll('%%sep%%', '-')
    // Yoast fills the site name from WordPress, which is still the temporary hosting domain.
    .replace(/[a-z0-9-]+\.hostingersite\.com/gi, '香港特快外勞')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ignore temporary hosting domains when WordPress has not received the final brand name yet. */
function cmsSiteName(value = '') {
  const candidate = plainText(value);
  return !candidate || /(?:https?:\/\/|\.com|\.net|\.org|hostingersite)/i.test(candidate)
    ? '香港特快外勞'
    : candidate;
}

/** Normalize optional WordPress SEO metadata with article fallbacks. */
function normalizeSeo(post, title, body, image) {
  const yoast = post.yoast_head_json || {};
  const fallback = post.hkexl_seo || {};
  return {
    title: cleanSeoTemplate(yoast.title || fallback.title || title, title),
    description: cleanSeoTemplate(yoast.description || fallback.description || body, title),
    image: yoast.og_image?.[0]?.url || image,
    // WordPress itself is globally noindex; only an explicit article override applies to React.
    robots: {
      ...(yoast.robots || fallback.robots || {}),
      index: post.hkexl_sitemap_index === 'noindex' ? 'noindex' : 'index',
      follow: 'follow',
    },
    type: yoast.og_type || fallback.type || 'article',
    twitterCard: yoast.twitter_card || fallback.twitter_card || 'summary_large_image',
  };
}

/** Map a published WordPress post to sanitized article data. */
function normalizeWpPost(post) {
  const media = post.hkexl_featured_image || post.hkexl_legacy_featured_image || post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const summary = plainText(post.excerpt?.rendered || post.content?.rendered || '');
  const title = plainText(post.title?.rendered || '未命名文章');
  const isGenericImage = /HKEXL-Banner|Hero-Section|banner|background-photo/i.test(media || '');
  const image = !media || isGenericImage ? (infoImageByTitle[title] || 'Hero-Section.webp') : media;
  const body = summary || '這篇文章由 WordPress CMS 發佈，內容可在後台直接修改。';
  return {
    slug: post.slug,
    date: post.date,
    title,
    body,
    image,
    content: wordpressContent(post.content?.rendered || ''),
    seo: normalizeSeo(post, title, body, image),
    cms: true,
  };
}

/** Build a WordPress REST URL from the configured API base and query. */
function wpEndpoint(path, query) {
  const routePath = path.startsWith('/') ? path : `/${path}`;
  const base = wordpressApiUrl.replace(/\/$/, '');
  if (base.includes('rest_route=')) {
    return `${base}${routePath}${query ? `&${query}` : ''}`;
  }
  return `${base}${routePath}${query ? `?${query}` : ''}`;
}

/** Build the public endpoint exposed by the HKEXL WordPress bridge plugin. */
function cmsBridgeEndpoint() {
  return `${wordpressApiUrl.replace(/\/wp\/v2\/?$/, '')}/hkexl/v1/site-config`;
}

/** Read site-wide Yoast, Site Kit, and GTM4WP settings from WordPress. */
function useCmsSiteConfig() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    if (!wordpressEnabled || !customCmsEnabled) return;
    const controller = new AbortController();
    const refresh = () => fetch(`${cmsBridgeEndpoint()}?v=${Date.now()}`, { signal: controller.signal, cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((nextConfig) => { if (!controller.signal.aborted && nextConfig) setConfig(nextConfig); })
      .catch(() => {});
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return config;
}

/** Remove duplicate legacy CMS items by their title or name. */
function uniqueByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = (item.title || item.name || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Read optional self-hosted custom content types; disabled on WordPress.com. */
function useWordPressCollection(type, perPage = 100) {
  const [state, setState] = useState({ items: [], loading: customCmsEnabled, error: '' });

  useEffect(() => {
    if (!customCmsEnabled) return;
    const controller = new AbortController();
    fetch(wpEndpoint(`/${type}`, `_embed=1&per_page=${perPage}`), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`WordPress API ${response.status}`);
        return response.json();
      })
      .then((items) => setState({ items, loading: false, error: '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ items: [], loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [type, perPage]);

  return state;
}

/** Read taxonomy labels for the optional self-hosted dormitory collection. */
function useWordPressTerms(taxonomy) {
  const [state, setState] = useState({ terms: {}, loading: customCmsEnabled, error: '' });

  useEffect(() => {
    if (!customCmsEnabled) return;
    const controller = new AbortController();
    fetch(wpEndpoint(`/${taxonomy}`, 'per_page=100'), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`WordPress API ${response.status}`);
        return response.json();
      })
      .then((terms) => {
        const termMap = Object.fromEntries(terms.map((term) => [term.id, term.name]));
        setState({ terms: termMap, loading: false, error: '' });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ terms: {}, loading: false, error: error.message });
      });
    return () => controller.abort();
  }, [taxonomy]);

  return state;
}

/** Map optional dormitory CMS fields to the shared dormitory card format. */
function normalizeWpDorm(post, areaTerms = {}) {
  const name = plainText(post.title?.rendered || '');
  const cmsImage = post.hkexl_featured_image || post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
  const isGenericImage = /HKEXL-Banner|Hero-Section|banner|background-photo/i.test(cmsImage);
  return {
    slug: post.slug,
    name,
    district: areaTerms[post.area?.[0]] || '宿舍',
    train: post.hkexl_meta?.clock || '往返時間可查詢',
    bus: post.hkexl_meta?.bus || '交通資料可查詢',
    image: !cmsImage || isGenericImage ? (dormImageByName[name] || dormSeedImageByName[name] || 'Hero-Section.webp') : cmsImage,
    content: wordpressContent(post.content?.rendered || ''),
    cms: true,
  };
}

/** Read one labelled value from ordinary Gutenberg paragraph or list blocks. */
function dormField(html, labels, fallback) {
  const documentBody = new DOMParser().parseFromString(html || '', 'text/html');
  const rows = Array.from(documentBody.querySelectorAll('p, li'));
  const labelPattern = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const pattern = new RegExp(`^(?:${labelPattern})\\s*[：:]\\s*(.+)$`, 'i');
  const match = rows.map((row) => row.textContent.trim().match(pattern)).find(Boolean);
  return match?.[1]?.trim() || fallback;
}

/** Map a WordPress post in the dormitory category to one dormitory record. */
function normalizeWordPressDorm(post) {
  const name = plainText(post.title?.rendered || '未命名宿舍');
  const content = wordpressContent(post.content?.rendered || '');
  const media = post.hkexl_featured_image || new DOMParser().parseFromString(content, 'text/html').querySelector('img')?.src || '';
  return {
    id: post.id,
    slug: post.slug,
    name,
    district: dormField(content, ['地區', '區域'], '其他'),
    train: dormField(content, ['鐵路通勤', '港鐵通勤', '港鐵'], '往返時間可查詢'),
    bus: dormField(content, ['巴士接駁', '巴士'], '交通資料可查詢'),
    image: media,
    content,
    summary: plainText(post.excerpt?.rendered || post.content?.rendered || ''),
    cms: true,
  };
}

/** Resolve featured-image IDs in one compact WordPress media request per 100 images. */
async function withDormitoryMedia(posts, signal) {
  const ids = [...new Set(posts.map((post) => post.featured_media).filter(Boolean))];
  if (!ids.length) return posts;
  const chunks = Array.from({ length: Math.ceil(ids.length / 100) }, (_, index) => ids.slice(index * 100, (index + 1) * 100));
  const mediaPages = await Promise.all(chunks.map(async (chunk) => {
    const response = await fetch(wpEndpoint('/media', `include=${chunk.join(',')}&per_page=100&_fields=id,source_url,media_details`), { signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`WordPress media API ${response.status}`);
    return response.json();
  }));
  const mediaById = Object.fromEntries(mediaPages.flat().map((item) => [item.id, item.media_details?.sizes?.medium_large?.source_url || item.source_url]));
  return posts.map((post) => ({ ...post, hkexl_featured_image: mediaById[post.featured_media] || '' }));
}

/** Find the dormitory category even when WordPress.com rewrites its requested slug. */
async function fetchDormCategory(signal) {
  if (wordpressDormCategoryId) return { id: wordpressDormCategoryId, slug: dormCategorySlug };
  const slugResponse = await fetch(wpEndpoint('/categories', `slug=${encodeURIComponent(dormCategorySlug)}`), { signal, cache: 'no-store' });
  if (!slugResponse.ok) throw new Error(`WordPress category API ${slugResponse.status}`);
  const [slugMatch] = await slugResponse.json();
  if (slugMatch) return slugMatch;

  const nameResponse = await fetch(wpEndpoint('/categories', `search=${encodeURIComponent('十八區宿舍')}&per_page=100`), { signal, cache: 'no-store' });
  if (!nameResponse.ok) throw new Error(`WordPress category API ${nameResponse.status}`);
  const categories = await nameResponse.json();
  return categories.find((category) => plainText(category.name) === '十八區宿舍') || null;
}

/** Resolve the dormitory category and load every published page of its posts. */
/** Build-time copy of this route's WordPress record, embedded by generate-route-pages.mjs. */
const initialRecord = (() => {
  try {
    return JSON.parse(document.getElementById('hkexl-initial')?.textContent || 'null');
  } catch {
    return null;
  }
})();

/** Return the embedded record when it belongs to this route; Googlebot cannot reach the CMS API. */
function initialPost(kind, slug) {
  if (!initialRecord || initialRecord.kind !== kind) return null;
  const same = (value) => { try { return decodeURIComponent(value); } catch { return value; } };
  return same(initialRecord.post.slug) === same(slug) ? initialRecord.post : null;
}

/** Return the embedded list for /info or /dorms, if this page has one. */
function initialList(kind) {
  return initialRecord?.kind === kind ? initialRecord.posts : null;
}

function useWordPressCategoryPosts(categorySlug) {
  const initial = categorySlug === dormCategorySlug ? initialList('dorms') : null;
  const [state, setState] = useState({ posts: initial || [], categoryId: null, loading: wordpressEnabled && !initial, error: '' });

  useEffect(() => {
    if (!wordpressEnabled) return;
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const category = categorySlug === dormCategorySlug
          ? await fetchDormCategory(controller.signal)
          : null;
        if (!category) {
          setState({ posts: [], categoryId: null, loading: false, error: '找不到 WordPress「十八區宿舍」分類。' });
          return;
        }
        const query = `status=publish&_fields=${encodeURIComponent(dormPostFields)}&per_page=100&categories=${category.id}&orderby=date&order=asc`;
        const firstResponse = await fetch(wpEndpoint('/posts', `${query}&page=1`), { signal: controller.signal, cache: 'no-store' });
        if (!firstResponse.ok) throw new Error(`WordPress dormitory API ${firstResponse.status}`);
        const totalPages = Math.max(1, Number(firstResponse.headers.get('X-WP-TotalPages')) || 1);
        const remainingPages = await Promise.all(Array.from({ length: totalPages - 1 }, async (_, index) => {
          const response = await fetch(wpEndpoint('/posts', `${query}&page=${index + 2}`), { signal: controller.signal, cache: 'no-store' });
          if (!response.ok) throw new Error(`WordPress dormitory API ${response.status}`);
          return response.json();
        }));
        const posts = await withDormitoryMedia([...await firstResponse.json(), ...remainingPages.flat()], controller.signal);
        if (!controller.signal.aborted) setState({ posts, categoryId: category.id, loading: false, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setState((previous) => (previous.posts.length ? { ...previous, loading: false } : { posts: [], categoryId: null, loading: false, error: error.message }));
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [categorySlug]);

  return state;
}

/** Fetch only the requested WordPress dormitory instead of downloading the complete directory. */
function useWordPressDormPost(slug) {
  const initial = initialPost('dorm', slug);
  const [state, setState] = useState({ post: initial, loading: wordpressEnabled && !initial, error: '' });
  useEffect(() => {
    if (!wordpressEnabled) return;
    const controller = new AbortController();
    setState({ post: initial, loading: !initial, error: '' });
    const refresh = async () => {
      try {
        const category = await fetchDormCategory(controller.signal);
        if (!category) throw new Error('找不到 WordPress「十八區宿舍」分類。');
        let decodedSlug = slug;
        try { decodedSlug = decodeURIComponent(slug); } catch { /* Preserve malformed slugs for a normal not-found response. */ }
        const query = `status=publish&_fields=${encodeURIComponent(dormPostFields)}&categories=${category.id}&slug=${encodeURIComponent(decodedSlug)}`;
        const response = await fetch(wpEndpoint('/posts', query), { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error(`WordPress dormitory API ${response.status}`);
        const posts = await withDormitoryMedia(await response.json(), controller.signal);
        if (!controller.signal.aborted) setState({ post: posts[0] || null, loading: false, error: '' });
      } catch (error) {
        // Keep the build-time copy instead of replacing real content with an error.
        if (!controller.signal.aborted) setState({ post: initial, loading: false, error: initial ? '' : error.message });
      }
    };
    refresh();
    return () => controller.abort();
  }, [slug]);
  return state;
}

/** Map optional worker CMS fields to the shared worker card format. */
function normalizeWpWorker(post) {
  return {
    title: plainText(post.title?.rendered || ''),
    tag: post.hkexl_meta?.experience || '專業',
    image: post.hkexl_featured_image || post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
    cms: true,
  };
}

/** Deduplicate legacy worker records, preferring a record with a photograph. */
function uniqueWorkers(workersList) {
  const map = new Map();
  workersList.forEach((worker) => {
    const key = `${worker.title}|${worker.tag}`;
    const existing = map.get(key);
    if (!existing || (!existing.image && worker.image)) {
      map.set(key, worker);
    }
  });
  return Array.from(map.values());
}

/** Read a published article page; refresh on focus and once per minute. */
function useWordPressPosts(page = 1) {
  const raw = page === 1 ? initialList('posts') : null;
  const initial = raw ? raw.map(normalizeWpPost) : null;
  const [state, setState] = useState({ posts: initial || [], loading: wordpressEnabled && !initial, error: '', totalPages: 1 });
  useEffect(() => {
    if (!wordpressEnabled) return;
    const controller = new AbortController();
    setState({ posts: initial || [], loading: !initial, error: '', totalPages: 1 });
    const refresh = async () => {
      try {
        const dormCategory = await fetchDormCategory(controller.signal);
        const excludedCategory = dormCategory ? `&categories_exclude=${dormCategory.id}` : '';
        const response = await fetch(wpEndpoint('/posts', `status=publish&_embed=1&per_page=12&page=${page}&orderby=date&order=desc${excludedCategory}`), { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error(`WordPress API ${response.status}`);
        const posts = await response.json();
        if (!controller.signal.aborted) setState({ posts: posts.map(normalizeWpPost), loading: false, error: '', totalPages: Number(response.headers.get('X-WP-TotalPages')) || 1 });
      } catch (error) {
        if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false, error: previous.posts.length ? '' : error.message }));
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [page]);
  return state;
}

/** Fetch one published post by its decoded URL slug; never substitute another article. */
function useWordPressPost(slug) {
  const raw = initialPost('post', slug);
  const initial = raw ? normalizeWpPost(raw) : null;
  const [state, setState] = useState({ post: initial, loading: wordpressEnabled && !initial, error: '' });
  useEffect(() => {
    if (!wordpressEnabled) return;
    const controller = new AbortController();
    setState({ post: initial, loading: !initial, error: '' });
    let decodedSlug = slug;
    try { decodedSlug = decodeURIComponent(slug); } catch { /* Preserve malformed slugs for a normal not-found response. */ }
    fetch(wpEndpoint('/posts', `status=publish&_embed=1&slug=${encodeURIComponent(decodedSlug)}`), { signal: controller.signal, cache: 'no-store' })
      .then((response) => { if (!response.ok) throw new Error(`WordPress API ${response.status}`); return response.json(); })
      .then((posts) => { if (!controller.signal.aborted) setState({ post: posts[0] ? normalizeWpPost(posts[0]) : null, loading: false, error: '' }); })
      .catch((error) => { if (!controller.signal.aborted) setState({ post: initial, loading: false, error: initial ? '' : error.message }); });
    return () => controller.abort();
  }, [slug]);
  return state;
}

/** Create or update one metadata tag in the document head. */
function setMeta(selector, attr, key, value) {
  const tag = document.head.querySelector(selector) || document.createElement('meta');
  tag.setAttribute(attr, key);
  tag.setAttribute('content', value);
  if (!tag.parentElement) document.head.appendChild(tag);
}

/** Create or update the canonical link for the active Firebase route. */
function setCanonical(value) {
  const tag = document.head.querySelector('link[rel="canonical"]') || document.createElement('link');
  tag.setAttribute('rel', 'canonical');
  tag.setAttribute('href', value);
  if (!tag.parentElement) document.head.appendChild(tag);
}

/** Apply route-specific metadata plus the current site-wide Yoast settings. */
function Seo({ title, description, image, robots, type = 'website', twitterCard = 'summary_large_image' }) {
  const cmsConfig = useContext(CmsSettingsContext);
  useEffect(() => {
    const siteName = cmsSiteName(cmsConfig?.seoPluginActive ? cmsConfig?.seo?.siteName : '');
    const isHome = normalizePath(window.location.pathname) === '/';
    const localTitle = title || '香港特快外勞｜外勞申請、招聘、簽證及宿舍安排';
    const safeTitle = cleanSeoTemplate(
      isHome && cmsConfig?.seo?.homeTitle ? cmsConfig.seo.homeTitle : localTitle.replaceAll('香港特快外勞', siteName),
      localTitle,
    );
    const safeDescription = (isHome && cmsConfig?.seo?.homeDescription)
      || description
      || cmsConfig?.seo?.defaultDescription
      || '香港特快外勞提供香港外勞申請、招聘、簽證代辦、宿舍安排及續約支援。';
    // Same encoding as the sitemap and the static HTML, whichever form the visitor arrived with.
    const canonical = `${runtimeConfig.canonicalOrigin || window.location.origin}${encodeURI(safeDecodeUri(normalizePath(window.location.pathname)))}`;
    const robotsValue = runtimeConfig.noindex
      ? 'noindex, nofollow'
      : robots
        ? [robots.index, robots.follow, robots['max-snippet'], robots['max-image-preview'], robots['max-video-preview']].filter(Boolean).join(', ')
        : 'index, follow';
    document.title = safeTitle;
    setCanonical(canonical);
    setMeta('meta[name="description"]', 'name', 'description', safeDescription);
    setMeta('meta[name="robots"]', 'name', 'robots', robotsValue);
    setMeta('meta[property="og:title"]', 'property', 'og:title', safeTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', safeDescription);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    setMeta('meta[property="og:type"]', 'property', 'og:type', type);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', safeTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', safeDescription);
    if (cmsConfig?.seo?.twitterSite) setMeta('meta[name="twitter:site"]', 'name', 'twitter:site', cmsConfig.seo.twitterSite);
    const socialImage = image || cmsConfig?.seo?.defaultImage;
    if (socialImage) {
      const imageUrl = new URL(imageSrc(socialImage), window.location.origin).href;
      setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);
      setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    }
  }, [cmsConfig, description, image, robots, title, twitterCard, type]);
  return null;
}

/** Load tracking IDs configured in Site Kit or GTM4WP, without inserting duplicates. */
function CmsTracking({ config }) {
  useEffect(() => {
    document.querySelectorAll('[data-hkexl-tracking]').forEach((node) => node.remove());
    if (!config?.tracking) return;

    const gtmIds = [...new Set(config.tracking.gtmContainerIds || [])];
    gtmIds.forEach((id) => {
      const script = document.createElement('script');
      script.dataset.hkexlTracking = 'gtm';
      script.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
      document.head.appendChild(script);
      const frame = document.createElement('iframe');
      frame.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`;
      frame.height = '0'; frame.width = '0'; frame.style.display = 'none'; frame.style.visibility = 'hidden';
      const noscript = document.createElement('noscript');
      noscript.dataset.hkexlTracking = 'gtm';
      noscript.appendChild(frame);
      document.body.prepend(noscript);
    });

    [...new Set(config.tracking.gaMeasurementIds || [])].forEach((id) => {
      const loader = document.createElement('script');
      loader.async = true;
      loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
      loader.dataset.hkexlTracking = 'ga';
      document.head.appendChild(loader);
      const configScript = document.createElement('script');
      configScript.dataset.hkexlTracking = 'ga';
      configScript.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
      document.head.appendChild(configScript);
    });
    return () => document.querySelectorAll('[data-hkexl-tracking]').forEach((node) => node.remove());
  }, [config]);
  return null;
}

/** Apply optional legacy CMS redirect rules; disabled on WordPress.com. */
function useReactRedirects(page, setPage) {
  useEffect(() => {
    if (!customCmsEnabled) return;
    const controller = new AbortController();
    fetch(wpEndpoint('/redirects', 'per_page=100'), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((rules) => {
        const current = normalizePath(page);
        const match = rules
          .map((rule) => rule.hkexl_redirect)
          .find((rule) => rule?.from && normalizePath(rule.from) === current && normalizePath(rule.to || '/') !== current);
        if (!match?.to) return;
        const target = new URL(match.to, window.location.origin);
        if (target.origin === window.location.origin) {
          window.history.replaceState({}, '', `${target.pathname}${target.search}${target.hash}`);
          window.scrollTo(0, 0);
          setPage(target.pathname);
          return;
        }
        window.location.replace(target.href);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [page, setPage]);
}

/** Render desktop navigation or a collapsible mobile and tablet menu. */
function Header({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const go = (event, href) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
    event.preventDefault();
    setOpen(false);
    routeTo(href, setPage);
  };
  return (
    <header className="site-header">
      <a className="logo-link" href="/" aria-label="香港特快外勞首頁" onClick={(event) => go(event, '/')}>
        <img src={`${A}HKEXL-logo-768x215.webp`} width="200" height="56" alt="香港特快外勞" />
      </a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-label="開關選單" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      <nav className={open ? 'nav open' : 'nav'} aria-label="主要選單">
        {navItems.map(([label, href]) => (
          <a key={label} href={href} className={page === href ? 'active' : ''} onClick={(event) => go(event, href)}>
            {label}
          </a>
        ))}
        <a className="nav-cta" href={whatsappHref}>立即查詢</a>
      </nav>
    </header>
  );
}

/** Render the supplied desktop banner, responsive mobile content, and contact actions. */
function Hero() {
  return (
    <section id="top" className="hero-shell">
      <img className="hero-image" width="1280" height="600" fetchPriority="high" src={`${A}Hero-Section.webp`} alt="香港外勞申請 一站式外勞配額 招聘及簽證代辦" />
      <div className="mobile-hero" aria-label="香港外勞申請">
        <div className="mobile-hero-photo" />
        <div className="mobile-hero-copy"><h2>香港<span>外勞</span>申請</h2><p>一站式外勞配額、招聘及簽證代辦</p></div>
        <div className="mobile-hero-benefits">{[[Users, '專業團隊全程支援', '經驗豐富，貼心跟進'], [ShieldCheck, '一站式服務', '配額、招聘、簽證代辦全包辦'], [Phone, '高效快捷', '快速到位，助您發展']].map(([Icon, title, body]) => <div key={title}><Icon size={32} /><div><strong>{title}</strong><p>{body}</p></div></div>)}</div>
      </div>
      <div className="cta-row">
        <a className="btn pink" href={phoneHref}><Phone size={16} /> 免費電話查詢</a>
        <a className="btn green" href={whatsappHref}><MessageCircle size={16} /> 免費線上WhatsApp查詢</a>
      </div>
    </section>
  );
}

/** Render the introduction and six reusable service cards. */
function Services() {
  return (
    <section className="section services" aria-labelledby="services-heading">
      <div className="section-title">
        <h1 id="services-heading">香港外勞申請</h1>
        <h2>一站式外勞配額、招聘及簽證代辦 - 香港特快外勞</h2>
        <h3>服務範疇：香港外勞申請全程代辦</h3>
        <p>香港特快外勞專為香港僱主提供一站式外勞申請服務，涵蓋配額申請、人才招聘、簽證辦理及到港安排，全程專人跟進。</p>
      </div>
      <div className="card-grid">
        {serviceCards.map(([title, body, image, Icon]) => (
          <article className="service-card" key={title}>
            <div className="image-wrap">
              <img src={`${A}${image}`} alt="" loading="lazy" />
            </div>
            <div className="card-copy">
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Render the three company advantages on a blue background. */
function Advantages() {
  return (
    <section className="advantages" aria-labelledby="advantages-heading">
      <h2 id="advantages-heading">我們的優勢</h2>
      <div className="advantage-grid">
        {advantages.map(([Icon, title, body]) => (
          <article key={title}>
            <span><Icon size={28} /></span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Render the three application stages as selectable text and responsive cards. */
function Timeline() {
  const stages = [
    [FileText, '本地招聘及準備文件階段', '通常需時數星期，視乎僱主提供資料的速度'],
    [BadgeCheck, '配額審批時間', '由政府部門處理，需時數週至數月不等'],
    [Rocket, '配額獲批後的招聘及簽證', '完成招聘、簽訂合約及簽證申請後，外勞通常可於獲批後若干星期內來港開工'],
  ];
  return <section className="section timeline" aria-labelledby="time-heading">
    <svg className="timeline-waves" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-80 120 C170 -10 390 -10 660 115 S1120 260 1520 75" />
      <path d="M-80 220 C170 90 390 90 660 215 S1120 360 1520 175" />
      <path d="M-80 320 C170 190 390 190 660 315 S1120 460 1520 275" />
    </svg>
    <div className="section-title"><h2 id="time-heading">特快外勞申請時間</h2>
      <strong className="timeline-note">平均只需3個月</strong>
      <p>香港外勞申請所需時間視乎行業、職位及申請批量而有所不同，我們會在每個階段向僱主解釋預計時間表，並盡量提前準備文件及作好安排，減少不必要的延誤：</p>
    </div>
    <div className="timeline-grid">{stages.map(([Icon, title, body], index) => <article key={title}>
      <span className="timeline-number">0{index + 1}<span className="timeline-badge"><Icon size={16} strokeWidth={1.8} /></span></span><h3>{title}</h3><p>{body}</p>
    </article>)}</div>
  </section>;
}

/** Render the five numbered application steps from shared content data. */
function Process() {
  return (
    <section id="process" className="process-band" aria-labelledby="process-heading">
      <div className="section-title">
        <p className="eyebrow">申請順序</p><h2 id="process-heading"><span>香港特快外勞</span>申請流程</h2>
      </div>
      <div className="process-grid">
        {processSteps.map(([Icon, title, body], index) => (
          <article key={title}>
            <Icon className="step-icon" size={32} /><small>STEP</small>
            <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Render the existing worker photographs and descriptions in a responsive grid. */
function WorkerNetwork() {
  const { items } = useWordPressCollection('workers');
  const cmsWorkers = uniqueWorkers(items.map(normalizeWpWorker).filter((worker) => worker.title));
  const visibleWorkers = wordpressEnabled && cmsWorkers.length ? cmsWorkers : workers.map(([title, tag, image]) => ({ title, tag, image, cms: false }));
  return (
    <section id="network" className="section network" aria-labelledby="network-heading">
      <div className="section-title">
        <p className="eyebrow">優選人才庫</p><h2 id="network-heading">龐大外勞網絡</h2><p>香港特快外勞與多間大灣區及內地城市的招聘機構、<br />職業學校及培訓中心保持緊密合作。</p>
      </div>
      <div className="worker-grid">
        {visibleWorkers.map((worker, index) => (
          <article className="worker-card" key={`${worker.title}-${index}`}>
            <div className="worker-card-media">
              <img src={worker.image ? (worker.cms ? imageSrc(worker.image) : `${A}${worker.image}`) : `${A}${workers[index % workers.length][2]}`} alt={worker.title} loading="lazy" />
            </div>
            <div className="worker-card-copy">
              <h3>{worker.title}</h3>
              <span>{worker.tag}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Render the interview section with a recruitment photograph. */
function Housing() {
  return (
    <section id="housing" className="housing">
      <div>
        <p className="eyebrow">人才招募</p><h2>面試現場實錄</h2>
        <p>在每一場招聘會裡，我們協助僱主與求職者面對面交流，了解工作經驗與招聘要求，配對合適人才。</p>
      </div><img src={`${A}47ab2aaa-48d7-4b49-8c9a-f9cbaccab013.webp`} width="600" height="340" alt="招聘會面試現場" loading="lazy" />
    </section>
  );
}

/** Render compressed company partner logos with encoded asset paths. */
function Partners() {
  return (
    <section className="section partners" aria-labelledby="partners-heading">
      <div className="section-title">
        <h2 id="partners-heading">合作夥伴</h2>
        <p>多間香港企業及機構選用香港特快外勞服務</p>
      </div>
      <div className="logo-marquee" role="group" aria-label="合作夥伴標誌">
        {partnerLogos.map((logo, index) => (
          <img key={`${logo}-${index}`} src={imageSrc(logo)} alt="" loading="lazy" />
        ))}
      </div>
    </section>
  );
}

/** Render the employer or worker enquiry form and its WhatsApp handoff. */
function Contact({ workerMode = false }) {
  /** Prepare an enquiry; the visitor reviews and sends it in WhatsApp. */
  const submitEnquiry = (event) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const labels = { 'your-name': '姓名', 'your-contact': '聯絡電話', 'your-industry': '行業', 'number-of-employee': '所需人數', 'job-type': '工種', age: '年齡', 'cantonese-proficiency': '粵語能力' };
    const message = [workerMode ? '國內勞工應聘查詢' : '僱主外勞申請查詢', ...Array.from(values, ([key, value]) => `${labels[key] || key}：${value}`)].join('\n');
    window.location.assign(`https://wa.me/85255815518?text=${encodeURIComponent(message)}`);
  };
  return (
    <section id="contact" className="contact-band" aria-labelledby="contact-heading">
      <div className="contact-copy">
        <h2 id="contact-heading">聯絡我們</h2>
        <p>{workerMode ? '留下資料後，專人會按你的粵語能力、年齡及工種安排應聘跟進。' : '留下資料後，專人會按你的行業、工種及招聘要求提供初步外勞申請評估。'}</p>
        <ul>
          <li><Phone size={17} /> +852 6142 6141</li>
          <li><MessageCircle size={17} /> WhatsApp 即時查詢</li>
          <li><Mail size={17} /><a href="mailto:info@hkexl.com">info@hkexl.com</a></li>
          <li><MapPin size={17} /> 香港全區服務</li>
        </ul>
      </div>
      <form className="contact-form" onSubmit={submitEnquiry}>
        <h3>{workerMode ? '立即應聘！' : '僱主申請表'}</h3>
        <label>全名<input name="your-name" placeholder="*請填寫你的姓名" required /></label>
        <label>電話號碼<input name="your-contact" placeholder={workerMode ? '*必須填寫真實電話/WeChat號碼，否則不能聯繫閣下' : '*必須填寫真實電話/電郵地址，否則不能聯繫閣下'} required /></label>
        {workerMode ? (
          <>
            <label>粵語能力<select name="cantonese-proficiency" defaultValue="流利"><option>流利</option><option>一般</option><option>不會說</option></select></label>
            <label>年齡<input name="age" type="number" min="18" max="100" placeholder="*請填寫年齡" /></label>
          </>
        ) : (
          <>
            <label>行業<input name="your-industry" placeholder="*請填寫行業" /></label>
            <label>需要多少位勞工<input name="number-of-employee" type="number" min="1" placeholder="*請填寫需要多少位勞工" /></label>
          </>
        )}
        <label>工種<input name="job-type" placeholder={workerMode ? '*請填寫工種' : '餐飲類'} /></label>
        <button type="submit">透過 WhatsApp 查詢</button><p className="form-note">將開啟 WhatsApp，請確認內容後發送。</p>
      </form>
    </section>
  );
}

/** Render an accessible accordion with at most one expanded answer. */
function FAQ({ items = faqs, title = '常見問題' }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="faq" className="section faq" aria-labelledby="faq-heading">
      <div className="section-title">
        <h2 id="faq-heading">{title}</h2>
      </div>
      <div className="faq-list">
        {items.map(([question, answer], index) => (
          <article className={openIndex === index ? 'faq-item open' : 'faq-item'} key={question}>
            <button type="button" aria-expanded={openIndex === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              <span>{question}</span>
              <span className="faq-mark">{openIndex === index ? '−' : '+'}</span>
            </button>
            <p id={`faq-answer-${index}`}>{answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/** Compose the homepage sections in their design order. */
function HomePage() {
  return (
    <>
      <Seo
        title="香港特快外勞｜香港外勞申請、招聘、簽證及宿舍安排"
        description="香港特快外勞提供一站式外勞申請服務，涵蓋配額申請、人才招聘、簽證代辦、到港安排、18區宿舍及續約支援。"
      />
      <Hero />
      <Services />
      <Advantages />
      <Timeline />
      <Process />
      <WorkerNetwork />
      <Housing />
      <Partners />
      <Contact />
      <FAQ />
    </>
  );
}

/** Render a reusable internal-page introduction with image and contact actions. */
function PageHero({ title, body, image = 'Hero-Section.webp' }) {
  return (
    <section className="sub-hero">
      <div>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="sub-cta">
          <a className="btn pink" href={phoneHref}><Phone size={16} /> 免費電話查詢</a>
          <a className="btn green" href={whatsappHref}><MessageCircle size={16} /> WhatsApp查詢</a>
        </div>
      </div>
      <img src={imageSrc(image)} alt="" />
    </section>
  );
}

/** Render the shared Figma page banner with live contact links. */
function FeatureHero({ id, label, title, body, contact = false }) {
  return <>
    <section id={id} className="feature-hero">
      <div className="feature-hero-content">
        {label ? <span className="feature-pill">{label}</span> : null}
        <h1>{title}</h1>
        {body ? <p>{body}</p> : null}
      </div>
    </section>
    {contact ? <div className="feature-hero-actions"><ContactButtons /></div> : null}
  </>;
}

/** Keep the telephone and WhatsApp actions consistent across the two redesigned pages. */
function ContactButtons({ assessment = false }) {
  return <div className="feature-actions">
    <a className="feature-action call" href={phoneHref}><Phone size={16} /> {assessment ? '立即致電評估申請資格' : '免費電話查詢'}</a>
    <a className="feature-action chat" href={whatsappHref}><MessageCircle size={16} /> 免費線上WhatsApp查詢</a>
  </div>;
}

/** Render the Figma application process with selectable text and accessible cards. */
function ProcessArticlePage() {
  const requirements = [
    [ShieldCheck, '合法註冊', '持有有效商業登記證明及相關公司文件'],
    [Users, '本地招聘', '需完成四星期本地招聘及保留招聘紀錄'],
    [BadgeCheck, '無不良紀錄', '沒有違反任何勞工法例或相關法規紀錄'],
    [Banknote, '薪酬要求', '不低於本地同類職位中位工資'],
    [HeartPulse, '財政能力', '可負擔薪酬、住宿及返程安排'],
    [Handshake, '直接聘用', '由僱主直接聘用並履行相關責任'],
  ];
  const documents = [
    ['公司營業證明', '如商業登記證（BR）、公司註冊證（CI）及相關申請表格'],
    ['本地招聘紀錄', '提供本地招聘廣告和面試紀錄等資料，以證明有本地招聘困難'],
    ['職位薪酬資料', '擬聘職位、工作內容、薪酬、住宿安排及工作條件的詳細說明'],
  ];
  const qualifications = [
    ['年齡', '年滿18歲或以上'],
    ['工作經驗', '具相關工作經驗或技能證明'],
    ['證明文件', '身份、培訓及工作等證明'],
    ['健康狀況', '良好的健康狀況，沒有傳染性疾病'],
    ['批核後限制', '只可受聘於指定僱主及職位'],
  ];
  return <div className="feature-page process-page">
    <Seo title="香港外勞申請流程及資格｜香港特快外勞" description="了解香港外勞申請資格、僱主所需文件、外勞個人條件及五步申請流程。" />
    <FeatureHero id="process-hero" title={<>專業代辦香港外勞申請<br />平均只需 3 個月</>} contact />
    <section id="process-intro" className="feature-intro"><div className="feature-container"><h2>外勞申請資格｜香港公司申請外勞條件及流程</h2><p>香港特快外勞為僱主提供一站式外勞申請服務，協助香港僱主了解外勞申請資格及公司申請條件，讓企業更有系統地規劃招聘、配額、簽證及住宿安排。</p></div></section>
    <section id="process-requirements" className="feature-section feature-container"><h2>香港外勞申請資格</h2><p>香港公司申請外勞條件簡單，僱主須先證明本身在香港合法經營、有真實及持續的人手需求，而且並無不良紀錄，便可向政府提出外勞配額申請。</p><div className="requirements-grid">{requirements.map(([Icon, title, body]) => <article key={title}><span className="feature-icon"><Icon size={25} /></span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="process-documents" className="feature-section documents-section"><div className="feature-container"><h2>僱主申請外勞文件</h2><p>香港公司申請外勞條件簡單，僱主須先證明本身在香港合法經營、有真實及持續的人手需求，而且並無不良紀錄，便可向政府提出外勞配額申請。</p><div className="documents-grid">{documents.map(([title, body], index) => <article key={title}><strong>{index + 1}</strong><div><h3>{title}</h3><p>{body}</p></div></article>)}</div></div></section>
    <section id="process-worker-qualification" className="feature-section worker-qualification"><div className="feature-container"><h2>外勞個人申請資格</h2><p>申請來港工作的外地勞工，一般須由香港僱主代為辦理申請及簽證和其他手續。外勞申請人須具備與擬聘職位相符的工作能力、資歷及經驗，亦須符合基本健康及身份文件要求。</p><div className="qualification-photos"><figure><img src={imageSrc('fa9d9d5c-af36-4b2c-a1b3-2a89a6961cb1.webp')} alt="僱主面試外勞" loading="lazy" /><figcaption>面試</figcaption></figure><figure><img src={imageSrc('b52f9e7a-a466-4e7a-b20f-9cc620b2ad4f.webp')} alt="外勞培訓" loading="lazy" /><figcaption>培訓</figcaption></figure><figure><img src={imageSrc('503b572c-db3e-418f-b5e0-35481876f1ae.webp')} alt="外勞工作" loading="lazy" /><figcaption>工作</figcaption></figure></div></div></section>
    <section className="feature-section feature-container"><div className="qualification-table"><div><strong>項目</strong><strong>一般要求</strong></div>{qualifications.map(([name, value]) => <div key={name}><span>{name}</span><span>{value}</span></div>)}</div></section>
    <section id="process-timeline" className="feature-section process-timeline"><div className="feature-container"><h2>香港外勞申請流程圖</h2><div className="timeline-grid">{processSteps.map(([Icon, title, body], index) => <article key={title}><span className="timeline-icon"><Icon size={29} /><i>{index + 1}</i></span><h3>步驟{['一','二','三','四','五'][index]}：<br />{title}</h3><p>{body}</p></article>)}</div><p className="timeline-note">*香港特快外勞協助僱主完成主要申請及招聘流程，服務時間視乎行業、配額及政府審批進度而定。</p></div></section>
    <section id="process-cta" className="feature-cta"><div><h2>想了解公司<span>是否符合外勞申請資格？</span></h2><p>香港特快外勞提供一站式外勞申請支援，由資格評估、本地招聘、外地招聘、簽證辦理到來港住宿全程跟進，並可按不同行業提供申請方案建議。</p><ContactButtons assessment /></div></section>
    <FAQ title="外勞申請常見問題" items={faqs.filter((_, index) => [2, 7, 9].includes(index))} />
  </div>;
}

/** Render the Figma dormitory page with live WordPress cards and district filters. */
function DormsPage() {
  const [filter, setFilter] = useState('全部');
  const { posts, loading, error } = useWordPressCategoryPosts(dormCategorySlug);
  const source = wordpressEnabled
    ? posts.map(normalizeWordPressDorm)
    : dormCards.map(([slug, name, district, train, bus, image]) => ({ slug, name, district, train, bus, image, cms: false }));
  const visible = filter === '全部' ? source : source.filter((card) => card.district === filter);
  const filters = ['全部', ...Array.from(new Set(source.map((card) => card.district))).filter(Boolean)];
  useEffect(() => {
    if (!filters.includes(filter)) setFilter('全部');
  }, [filter, posts]);
  const housingBenefits = [
    [MapPin, '宿舍遍佈全港十八區', '覆蓋港島、九龍及新界主要工業及商業區，確保員工通勤便利。', 'map'],
    [Banknote, '每月費用低至HK$2500', '透明收費、無隱藏開支，助企業有效控制外勞引進成本。', 'price'],
    [ShieldCheck, '嚴格遵從政府標準', '我們嚴格遵從外勞宿舍標準，空間及設施均符合要求，全方位保障員工安全。', 'standards'],
  ];
  const housingRules = [
    ['空間與佈局', '每位輸入勞工最少佔有3.4平方米（約36平方呎）淨樓面實用面積', '宿舍必須為清潔及獨立單位', '睡房必須與休息室或客廳分隔'],
    ['設施與環境', '每個睡房設置床位不得超過6張', '宿舍需提供廁所、洗澡及煮食設備', '宿舍需有電力及食水供應'],
    ['生活配套', '宿舍須備有基本傢俱及日用品、毛毯、枕頭、電風扇及雪櫃等'],
  ];
  return (
    <div className="feature-page dorms-page">
      <Seo
        title="香港外勞宿舍及十八區住宿安排｜香港特快外勞"
        description="香港特快外勞提供全港18區外勞宿舍安排，配合僱主工作地點、班次及通勤需要。"
      />
      <FeatureHero id="dorm-hero" label="一站式服務" title={<>香港外勞宿舍<br />全港18區外勞住宿安排及一站式支援</>} body="香港特快外勞提供全港18區外勞住宿安排，協助僱主按工作地點、通勤需要及預算預訂，為外勞配對合適宿位。無論是短期過渡安排，還是長期住宿方案，我們都致力提供方便、實用且符合要求的住宿選擇，讓外勞及早安頓、僱主亦可更輕鬆處理後續人事安排。" />
      <section className="feature-section dorm-benefits"><div className="feature-container"><h2 className="feature-centered">香港特快外勞宿舍</h2><div className="benefits-grid">{housingBenefits.map(([Icon, title, body, kind]) => <article key={title}><div className={`benefit-picture ${kind}`}><img src={imageSrc(kind === 'map' ? 'hong-kong-map-illustration.webp' : kind === 'price' ? 'housing-savings.webp' : 'dormitory-room-figma-inspired.webp')} alt={kind === 'map' ? '香港地圖示意圖' : kind === 'price' ? '節省住宿費用示意圖' : '宿舍房間示意圖'} loading="lazy" /></div><span className="feature-icon"><Icon size={22} /></span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
      <section className="housing-compliance"><span className="feature-icon"><ShieldCheck size={25} /></span><h2>符合輸入外勞住宿規定</h2><p>香港特快外勞嚴格遵守勞工處對輸入勞工住宿的規定，確保僱主申請及續約時不會因住宿不合規而受阻。</p></section>
      <section className="feature-section housing-rules"><div className="feature-container"><h2 className="feature-centered">輸入外勞住宿法規要求</h2><div className="housing-rules-layout"><div>{housingRules.map(([group, ...items], groupIndex) => <div className="housing-rule-group" key={group}><h3>{group}</h3>{items.map((item, index) => <p key={item}><strong>{housingRules.slice(0, groupIndex).reduce((sum, row) => sum + row.length - 1, 0) + index + 1}</strong>{item}</p>)}</div>)}</div><img src={imageSrc('dormitory-room-figma-inspired.webp')} alt="外勞宿舍床位及設施" loading="lazy" /></div></div></section>
      <section className="feature-section housing-directory"><div className="feature-container"><h2 className="feature-centered">十八區宿舍</h2><label className="filter-row"><span className="sr-only">地區</span><select aria-label="地區篩選" value={filter} onChange={(event) => setFilter(event.target.value)} disabled={wordpressEnabled && (loading || Boolean(error))}>{filters.map((item) => <option key={item} value={item}>{item === '全部' ? '地區' : item}</option>)}</select><ChevronDown size={17} aria-hidden="true" /></label><div className="dorm-grid">
        {wordpressEnabled && loading ? <p className="cms-state" role="status">正在載入宿舍…</p> : null}
        {wordpressEnabled && error ? <p className="cms-state" role="alert">暫時未能載入宿舍，請稍後重新整理。</p> : null}
        {!loading && !error && !source.length ? <p className="cms-state">暫時未有已發佈宿舍。</p> : null}
        {!loading && !error && source.length > 0 && !visible.length ? <p className="cms-state">這個地區暫時未有宿舍。</p> : null}
        {visible.map((dorm) => (
          <article className="dorm-card" key={dorm.id || dorm.slug}>
            {dorm.image ? <img src={imageSrc(dorm.image)} alt={dorm.name} loading="lazy" /> : null}
            <div>
              <h2>{dorm.name}</h2>
              <p><Clock size={16} /> {dorm.train}</p><p><Bus size={16} /> {dorm.bus}</p>
              <a href={`/living/${dorm.slug}`} onClick={(event) => navigate(event, `/living/${dorm.slug}`)}>了解更多</a>
            </div>
          </article>
        ))}
      </div></div></section>
      <section className="feature-section housing-why"><div className="feature-container"><div><h2>選擇我們的理由</h2><p>香港特快外勞明白僱主在聘請外勞時，最重視的並非單是宿舍安排，更是整個招聘及配對過程是否順暢可靠。因此，我們不只提供宿舍配對服務，更致力協助僱主聘請合適外勞、從申請配額、招聘到入住安排，提供一站式支援。</p><p>我們同時提供全方位的住宿支援，按工作地點、預算及實際需要作出靈活配對，並嚴格遵從外勞住宿標準，確保安排合規、安全且實用。</p></div><div className="housing-photo-grid">{['dormitory-room-figma-inspired.webp','dormitory-room-figma-inspired.webp','dormitory-room-figma-inspired.webp','dormitory-room-figma-inspired.webp'].map((image, index) => <img key={index} src={imageSrc(image)} alt="外勞住宿設施" loading="lazy" />)}</div></div></section>
      <FAQ title="外勞宿舍常見問題" items={[
        ['外勞住宿費用可否由薪金扣除？', '住宿費及薪金安排須符合適用法例與僱傭合約規定。歡迎與我們聯絡，按實際計劃和合約條款核對。'],
        ['外勞宿舍的水電煤及日常開支由誰負責？', '相關費用應在僱傭合約及住宿安排中清楚列明，實際分擔方式視乎方案而定。'],
        ['外勞可以不入住僱主安排的宿舍嗎？', '住宿安排須符合適用計劃及簽證條件。如需變更，請先核對規定並通知相關部門。'],
      ]} />
    </div>
  );
}

/** Render published blog cards with loading, empty, error, and pagination states. */
function InfoPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { posts, loading, error, totalPages } = useWordPressPosts(currentPage);
  const visiblePosts = wordpressEnabled ? posts : staticInfoPosts;
  return (
    <>
      <Seo
        title="外勞資訊與相關文章｜香港特快外勞"
        description="閱讀香港外勞申請、外勞薪金、強積金、稅務、工種及僱主責任等最新資訊。"
      />
      <section className="section page-heading">
        <h1>外勞資訊與相關文章</h1>
        <p>補充勞工優化計劃的相關知識與申請指南</p>
      </section>
      <section className="section post-grid">
        {wordpressEnabled && loading ? <p className="cms-state" role="status">正在載入文章…</p> : null}
        {wordpressEnabled && error ? <p className="cms-state">暫時未能載入文章，請稍後重新整理。</p> : null}
        {visiblePosts.map((post, index) => (
          <article className={index === 0 ? 'post-card featured' : 'post-card'} key={post.slug}>
            <img src={imageSrc(post.image)} alt={post.title} loading="lazy" />
            <div>
              <span><CalendarDays size={15} /> {post.date ? new Date(post.date).toLocaleDateString('zh-HK') : '外勞資訊'}</span>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <a href={`/posts/${post.slug}`} onClick={(event) => navigate(event, `/posts/${post.slug}`)}>了解更多</a>
            </div>
          </article>
        ))}
      </section>
      {wordpressEnabled && !loading && !error && !posts.length ? <p className="section cms-state">暫時未有已發佈文章。</p> : null}
      {wordpressEnabled && totalPages > 1 ? <nav className="pagination section" aria-label="文章分頁">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>上一頁</button>
        <span>第 {currentPage} / {totalPages} 頁</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>下一頁</button>
      </nav> : null}
    </>
  );
}

/** Resolve a dormitory slug and render its details or a not-found state. */
function DormDetailPage({ slug }) {
  const { post, loading, error } = useWordPressDormPost(slug);
  const cmsDorm = post ? normalizeWordPressDorm(post) : null;
  const staticDorm = dormCards.find((item) => item[0] === slug);
  if (wordpressEnabled && loading) return <section className="section page-heading" role="status"><h1>正在載入宿舍…</h1></section>;
  if (wordpressEnabled && error) return <section className="section page-heading" role="alert"><h1>宿舍暫時未能載入</h1><p>請稍後再試。</p></section>;
  if (wordpressEnabled && !cmsDorm) return <NotFound />;
  if (!wordpressEnabled && !staticDorm) return <NotFound />;
  const dorm = wordpressEnabled ? cmsDorm : {
    slug: staticDorm[0],
    name: staticDorm[1],
    district: staticDorm[2],
    train: staticDorm[3],
    bus: staticDorm[4],
    image: staticDorm[5],
    content: '',
    cms: false,
  };
  return (
    <>
      <Seo
        title={`${dorm.name} - 香港特快外勞`}
        description={`香港特快外勞提供${dorm.district}${dorm.name}宿舍安排，配合外勞到港、住宿及通勤需要。`}
        image={dorm.image}
      />
      {!dorm.content ? <PageHero
        title={dorm.name}
        body={`香港特快外勞提供${dorm.district}${dorm.name}宿舍安排，配合外勞到港、住宿及通勤需要。`}
        image={dorm.image}
      /> : null}
      <section className={`section article-page detail-layout${dorm.content ? ' dorm-original-detail' : ''}`}>
        {dorm.content ? <div className="wp-content" dangerouslySetInnerHTML={{ __html: dorm.content }} /> : (
          <>
            <h2>{dorm.name}宿舍資料</h2>
            <p>宿舍位置鄰近主要交通配套，可按僱主工作地點、班次及預算，安排合適住宿方案，方便外勞通勤及適應在港生活。</p>
            <ul className="check-list">
              <li>地區：{dorm.district}</li>
              <li>鐵路通勤：{dorm.train}</li>
              <li>巴士或接駁：{dorm.bus}</li>
              <li>可按外勞人數、入職時間及預算作個別安排。</li>
            </ul>
          </>
        )}
        {!dorm.content ? <div className="cta-row inline">
          <a className="btn pink" href={phoneHref}><Phone size={16} /> 免費電話查詢</a>
          <a className="btn green" href={whatsappHref}><MessageCircle size={16} /> WhatsApp查詢</a>
        </div> : null}
      </section>
    </>
  );
}

/** Render sanitized published article blocks or a loading/error/not-found state. */
function PostDetailPage({ slug }) {
  const { post: cmsPost, loading, error } = useWordPressPost(slug);
  const post = wordpressEnabled ? cmsPost : staticInfoPosts.find((item) => item.slug === slug);
  if (!post || loading) return <section className="section page-heading" role="status">
    <Seo title={loading ? '載入文章中｜香港特快外勞' : '找不到文章｜香港特快外勞'} />
    <h1>{loading ? '正在載入文章…' : error ? '暫時未能載入文章' : '找不到這篇文章'}</h1>
    <p>{error ? '請稍後重新整理，或返回文章列表。' : '文章可能尚未發佈，或已經移除。'}</p>
    <a className="btn pink" href="/info" onClick={(event) => navigate(event, '/info')}>返回文章列表</a>
  </section>;
  return (
    <>
      <Seo
        title={post.seo?.title || `${post.title}｜香港特快外勞`}
        description={post.seo?.description || post.body}
        image={post.seo?.image || post.image}
        robots={post.seo?.robots}
        type={post.seo?.type || 'article'}
        twitterCard={post.seo?.twitterCard}
      />
      <PageHero title={post.title} body={post.body} image={post.image} />
      <section className="section article-page detail-layout">
        {wordpressEnabled && loading ? <p className="cms-state" role="status">正在載入文章…</p> : null}
        {wordpressEnabled && error ? <p className="cms-state">暫時未能載入文章，請稍後重新整理。</p> : null}
        {post.content ? (
          <div className="wp-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <>
            <p>{post.body}</p>
            <p>香港特快外勞會按最新政策及實際個案，協助僱主理解申請要求、薪酬及福利責任、文件準備、住宿安排及後續跟進。</p>
            <h2>僱主需要留意的重點</h2>
            <ul className="check-list">
              <li>確認職位是否符合相關外勞輸入計劃要求。</li>
              <li>保留本地招聘、薪酬條件及公司營運證明文件。</li>
              <li>安排合規住宿、到港支援及入職培訓。</li>
              <li>如政策或審批要求有更新，應盡早作重新評估。</li>
            </ul>
          </>
        )}
      </section>
    </>
  );
}

/** Compose a page introduction and the appropriate enquiry form. */
function ContactPage({ workerMode = false }) {
  return (
    <>
      <Seo
        title={workerMode ? '國內勞工專區｜香港特快外勞' : '聯絡我們｜香港特快外勞'}
        description={workerMode ? '國內求職者可留下資料，香港特快外勞會按粵語能力、年齡及工種安排應聘跟進。' : '聯絡香港特快外勞，查詢外勞申請、招聘、簽證、宿舍及續約服務。'}
      />
      <PageHero
        title={workerMode ? '國內勞工專區' : '聯絡我們'}
        body={workerMode ? '國內求職者可留下聯絡資料、粵語能力、年齡及工種，我們會安排專人跟進。' : '僱主如需要外勞申請、招聘、簽證或住宿安排，可留下資料作初步評估。'}
        image={`${U}2026/02/HKEXL-Banner-4-1024x416.png`}
      />
      <Contact workerMode={workerMode} />
    </>
  );
}

/** Render renewal information, promotional media, and related FAQs. */
function RenewalPage() {
  return (
    <>
      <Seo
        title="外勞續約指南｜香港特快外勞"
        description="了解香港外勞續約流程、續約申請資格、住宿優惠及僱主需要留意的續約安排。"
      />
      <PageHero
        title="外勞續約指南"
        body="僱主如欲與現有輸入勞工續約，須重新向相關決策局或部門遞交配額申請，並在限期內安排簽證或進入許可申請。"
        image={`${U}2026/02/background-photo-1-scaled.png`}
      />
      <section className="section article-page">
        <h2>與同一僱主續約詳情</h2>
        <p>僱主如欲與現有輸入勞工續約須重新向相關決策局／部門遞交配額申請。在取得配額後，僱主須在通知書所指明的限期內安排其擬續約的輸入勞工向入境處遞交簽證／進入許可申請。</p>
        <div className="promotion-panel">
          <img src={imageSrc(`${U}2026/02/Group-97.png`)} alt="" />
          <div>
            <h2>即刻轉台！馬上攞 iPhone / 優惠券 / 宿舍優惠</h2>
            <p>續約就搵香港特快外勞。</p>
          </div>
        </div>
        <h2>續約專業服務流程</h2>
        <img src={imageSrc(`${U}2026/02/Container.png`)} alt="續約服務流程" />
        <h2>延長逗留期限及申請資格</h2>
        <ul className="check-list">
          <li>輸入勞工的旅行證件有效期若較僱傭合約短，入境時將按旅行證件有效期獲准較短逗留期限。</li>
          <li>獲僱主確認繼續聘用後，須於獲准逗留期限內向入境處申請延長逗留期限。</li>
          <li>一般而言，輸入勞工在僱傭合約屆滿或終止後，將不會獲准延長逗留期限。</li>
          <li>每名輸入勞工須就每份標準僱傭合約出席一場僱傭權益簡介會。</li>
        </ul>
      </section>
      <FAQ title="續約專區常見問題" items={renewalFaqs} />
    </>
  );
}

/** Display site navigation and company branding at the bottom of every route. */
function Footer() {
  return <footer className="footer">
    <div className="footer-row"><a href="/" onClick={(event) => navigate(event, '/')} aria-label="香港特快外勞首頁"><img src={`${A}HKEXL-logo-768x215.webp`} width="200" height="56" alt="香港特快外勞" loading="lazy" /></a>
    <nav aria-label="頁尾選單">{navItems.map(([label, href]) => <a key={href} href={href} onClick={(event) => navigate(event, href)}>{label}</a>)}</nav></div>
    <p>copyright © {new Date().getFullYear()} 香港特快外勞</p>
  </footer>;
}

/** Provide persistent telephone and WhatsApp links on every route. */
function FloatingActions() {
  return (
    <div className="floating-actions" aria-label="快速聯絡">
      <a href={phoneHref} aria-label="電話查詢"><Phone size={20} /></a>
      <a href={whatsappHref} aria-label="WhatsApp 查詢"><MessageCircle size={20} /></a>
    </div>
  );
}

/** Render a clear recovery link when a route or dormitory does not exist. */
function NotFound() {
  return <section className="section page-heading"><Seo title="找不到頁面｜香港特快外勞" /><h1>找不到這個頁面</h1><p>請檢查網址，或返回首頁瀏覽。</p><a className="btn pink" href="/" onClick={(event) => navigate(event, '/')}>返回首頁</a></section>;
}

/** Coordinate route state, browser back navigation, shared header, content, and footer. */
function App() {
  const [page, setPage] = useState(normalizePath(window.location.pathname));
  const cmsConfig = useCmsSiteConfig();
  useReactRedirects(page, setPage);
  useEffect(() => {
    window.__setPage = setPage;
    const onPop = () => setPage(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      delete window.__setPage;
    };
  }, []);

  const staticPages = {
    '/': <HomePage />,
    '/process': <ProcessArticlePage />,
    '/dorms': <DormsPage />,
    '/info': <InfoPage />,
    '/contact': <ContactPage />,
    '/worker': <ContactPage workerMode />,
    '/renewal': <RenewalPage />,
  };
  const Page = staticPages[page]
    || (page.startsWith('/living/') ? <DormDetailPage slug={page.replace('/living/', '')} /> : null)
    || (page.startsWith('/posts/') ? <PostDetailPage slug={page.replace('/posts/', '')} /> : null)
    || <NotFound />;

  return (
    <CmsSettingsContext.Provider value={cmsConfig}>
      <CmsTracking config={cmsConfig} />
      <Header page={page} setPage={setPage} />
      <a className="skip-link" href="#main-content">跳至主要內容</a><main id="main-content">{Page}</main>
      <Footer />
      <FloatingActions />
    </CmsSettingsContext.Provider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
