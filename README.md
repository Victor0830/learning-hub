# 探索未來世界的能力

陪國一孩子一起成長的學習網站。純靜態網站（HTML／CSS／JS，無需建置），內容在 `docs/`。

| 子目錄 | 主題 | 內容 |
|---|---|---|
| `docs/chinese/` | 國文閱讀力練習室 | 詞性、抓重點、譬喻與言外之意、成語古文轉品、給家長的陪練指南，附互動練習 |
| `docs/english/` | 英文聽說寫 | 口說、聽力、寫作沒跟上閱讀的原因、發音優先順序、診斷錄音、跟讀／重述／聽寫／仿寫、每週安排 |
| `docs/math/` | 數理邏輯推理 | 數理精英社團測驗三題：真假話推理（假設法／矛盾對）、四邊形對角線性質與牌卡對話、額頭上的數字，附互動工具與練習 |
| `docs/economics/` | 經濟與金錢 | 工作與錢、價格與市場、銀行利息通膨、公司與股票、世界經濟、讀書疑問、模擬投資、給家長 |
| `docs/history/` | 世界史與台灣史 | 歷史骨架、台灣 × 世界年表、因果鏈練習、看影片筆記卡 |
| `docs/fitness/` | 體能訓練 | 短跑型籃球員的體能菜單與打卡、籃球技巧、影片數據計數與動作檢查、每月測驗與進步曲線 |
| `docs/planning/` | 升學規劃 | 雙胞胎（偏理科／平均型）的特質判斷、台灣與美國制度、A/B 路線比較、高中選擇、時間軸 |

共用資源在 `docs/assets/`（`style.css`、`quiz.js`）。作答紀錄只存在瀏覽器的 localStorage。
`docs/planning/` 的五個主要頁面由 `tools/planning_pages.py` 產生，修改內容請改該檔後執行 `python3 tools/planning_pages.py`。

## 新增子目錄

1. 建立 `docs/<新主題>/index.html`，引用 `../assets/style.css`（需要練習題時再引用 `../assets/quiz.js`，並在 `<body>` 設定唯一的 `data-page`）。
2. 在 `tools/update_section_nav.py` 的 `SECTIONS` 加一行（建置中先設 `False`），完成後改成 `True`，執行 `python3 tools/update_section_nav.py` 更新所有頁面的主題導覽。
3. 在 `docs/index.html` 的 `.section-grid` 加一張卡片。

## 本機預覽

```bash
python3 -m http.server 8765 --directory docs
```

## 部署

- **GitHub Pages**：從 `main` 分支的 `/docs` 資料夾發布，push 後自動更新。
- **Cloudflare Pages**：在 Cloudflare 後台以 Git 整合連接本 repo（專案 `learning-hub`，production branch `main`，無建置指令，輸出目錄 `docs`），push 到 `main` 後自動部署到 https://learning-hub-85l.pages.dev/
