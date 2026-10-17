# 探索未來世界的能力

陪國一孩子一起成長的學習網站。純靜態網站（HTML／CSS／JS，無需建置），內容在 `docs/`。

| 子目錄 | 主題 | 內容 |
|---|---|---|
| `docs/chinese/` | 國文閱讀力練習室 | 詞性、抓重點、譬喻與言外之意、成語古文轉品、給家長的陪練指南，附互動練習 |
| `docs/english/` | 英文聽說寫 | 口說、聽力、寫作沒跟上閱讀的原因、發音優先順序、診斷錄音、跟讀／重述／聽寫／仿寫、每週安排 |
| `docs/math/` | 數理邏輯推理 | 數理精英社團每週測驗題：真假話推理、四邊形對角線與牌卡對話、額頭上的數字、表格推理法、對一半／只有一人猜對／標籤全錯，附互動工具與練習 |
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

## 換新電腦（四步）

```bash
bash tools/setup_new_machine.sh          # 先 --check 只檢查不改東西
```

| 步驟 | 做法 | 誰做 |
|---|---|---|
| ① 取得專案 | `git clone https://github.com/Victor0830/learning-hub.git`，在資料夾裡開 Claude Code，`CLAUDE.md` 自動生效 | 你 |
| ② 還原偏好與記憶 | 上面那支腳本會 clone 私有 repo `claude-config` 並執行它的 `install.sh`，還原 `~/.claude/` 的全域偏好、各專案 memory 和 `local-context.md` | 腳本（需要先 `gh auth login`） |
| ③ 側邊欄分組 | 跟 Claude 說「建立群組『探索未來世界的能力』，把這個資料夾的工作階段歸進去」。七個單元：① 國文閱讀 ② 英文聽說寫 ③ 數理邏輯推理 ④ 經濟與金錢 ⑤ 世界史與台灣史 ⑥ 體能訓練 ⑦ 升學規劃 | Claude |
| ④ 搬孩子的紀錄 | **換電腦前**在舊電腦的體能訓練、每月測驗頁面按「下載備份」，新電腦同一頁按「還原」 | 你 |

腳本可以重複執行：已經設定好的部分會自動略過，偵測到既有的 memory 也不會覆蓋（真的要覆蓋才加 `--force`）。
③ 只能由 Claude 做，因為側邊欄分組存在 Claude 桌面 App 的本機設定裡，對應的是這台電腦的 session id，複製過去沒有用。
④ 的紀錄存在瀏覽器的 localStorage，不會跟著 repo 走；英文的錄音在 IndexedDB，備份檔帶不走。
