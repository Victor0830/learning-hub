# 國文閱讀力練習室

給國一學生的國文閱讀理解練習網站，附互動練習題與家長陪練指南。

| 單元 | 內容 |
|---|---|
| ① 詞性 | 形容詞與副詞、三步驟判斷法、副詞六大類、語氣副詞 |
| ② 抓重點 | 縮句、段落刪去法、主旨句位置、一段一句與全文一句、看懂題目 |
| ③ 譬喻與言外之意 | 明喻／隱喻／略喻／借喻、讀懂譬喻三問、推論線索 |
| ④ 成語古文與轉品 | 「一樹火紅」拆解、翻白話／看位置／找對稱、四種轉品、判斷卡、文言虛字 |
| 給家長 | 找出卡在哪一層、練習順序與安排、陪練技巧、需要多留意的情況 |

純靜態網站（HTML／CSS／JS，無需建置），內容在 `docs/`。作答紀錄只存在瀏覽器的 localStorage。

## 本機預覽

```bash
python3 -m http.server 8765 --directory docs
```

## 部署

- **GitHub Pages**：從 `main` 分支的 `/docs` 資料夾發布，push 後自動更新。
- **Cloudflare Pages**：`.github/workflows/cloudflare-pages.yml` 在每次 push 到 `main` 時，用 Wrangler 部署 `docs/` 到 Pages 專案 `guowen-reading`。需要在 GitHub repo 設定兩個 Secrets：
  - `CLOUDFLARE_API_TOKEN`：Cloudflare API Token，權限需包含 **Account → Cloudflare Pages → Edit**
  - `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 帳號 ID（Dashboard 右側可找到）

  未設定 Secrets 時，workflow 會略過部署，不會失敗。
