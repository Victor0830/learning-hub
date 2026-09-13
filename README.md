# 學習導航站

陪國一孩子一起成長的學習網站。純靜態網站（HTML／CSS／JS，無需建置），內容在 `docs/`。

| 子目錄 | 主題 | 內容 |
|---|---|---|
| `docs/chinese/` | 國文閱讀力練習室 | 詞性、抓重點、譬喻與言外之意、成語古文轉品、給家長的陪練指南，附互動練習 |
| `docs/english/` | 英文聽說寫 | 口說、聽力、寫作沒跟上閱讀的原因、發音優先順序、診斷錄音、跟讀／重述／聽寫／仿寫、每週安排 |
| `docs/planning/` | 升學規劃 | 雙胞胎（偏理科／平均型）的特質判斷、台灣與美國制度、A/B 路線比較、高中選擇、時間軸 |

共用資源在 `docs/assets/`（`style.css`、`quiz.js`）。作答紀錄只存在瀏覽器的 localStorage。
`docs/planning/` 的五個主要頁面由 `tools/planning_pages.py` 產生，修改內容請改該檔後執行 `python3 tools/planning_pages.py`。

## 新增子目錄

1. 建立 `docs/<新主題>/index.html`，引用 `../assets/style.css`（需要練習題時再引用 `../assets/quiz.js`，並在 `<body>` 設定唯一的 `data-page`）。
2. 複製現有頁面的 `<header class="site-header">`，把新主題加進 `section-nav`。
3. 在 `docs/index.html` 的 `.section-grid` 加一張卡片，並把新主題加進其他頁面的 `section-nav`。

## 本機預覽

```bash
python3 -m http.server 8765 --directory docs
```

## 部署

- **GitHub Pages**：從 `main` 分支的 `/docs` 資料夾發布，push 後自動更新。
- **Cloudflare Pages**：`.github/workflows/cloudflare-pages.yml` 在每次 push 到 `main` 時，用 Wrangler 部署 `docs/` 到 Pages 專案 `learning-hub`。需要在 GitHub repo 設定兩個 Secrets：
  - `CLOUDFLARE_API_TOKEN`：Cloudflare API Token，權限需包含 **Account → Cloudflare Pages → Edit**
  - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 帳號 ID

  未設定 Secrets 時，workflow 會略過部署，不會失敗。
