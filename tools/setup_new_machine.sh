#!/usr/bin/env bash
# 新電腦設定：把「探索未來世界的能力」這個專案接上來。
#
#   bash tools/setup_new_machine.sh            # 實際執行（已設定過的部分會自動略過）
#   bash tools/setup_new_machine.sh --check    # 只檢查、不改任何東西
#   bash tools/setup_new_machine.sh --force    # 連既有的 memory 也用 claude-config 的版本覆蓋
#
# 不需要 sudo，也不會動到這個 repo 裡的檔案。
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_REPO="${CLAUDE_CONFIG_DIR:-$HOME/claude-config}"
CONFIG_URL="https://github.com/Victor0830/claude-config.git"
AIEDU_MEMORY="$HOME/.claude/projects/$(echo "$REPO" | sed 's|/|-|g')/memory"

MODE=run
case "${1:-}" in
  --check) MODE=check ;;
  --force) MODE=force ;;
  "") ;;
  *) echo "不認得的參數：$1（可用 --check 或 --force）"; exit 2 ;;
esac

ok()   { echo "  ✅ $*"; }
warn() { echo "  ⚠️  $*"; }
todo() { echo "  👉 $*"; }
problems=0
fail() { echo "  ❌ $*"; problems=$((problems + 1)); }

echo "=== 1/4 檢查工具 ==="
for cmd in git python3; do
  if command -v "$cmd" >/dev/null 2>&1; then ok "$cmd $("$cmd" --version 2>&1 | head -1)"; else fail "找不到 $cmd，請先安裝"; fi
done
GH=""
for c in "$HOME/.local/bin/gh" "$(command -v gh 2>/dev/null)"; do
  [ -n "$c" ] && [ -x "$c" ] && GH="$c" && break
done
if [ -n "$GH" ]; then
  if "$GH" auth status >/dev/null 2>&1; then ok "gh 已登入（$GH）"; else warn "gh 還沒登入：執行 $GH auth login，在瀏覽器完成授權"; fi
else
  warn "找不到 gh（非必要；clone 私有 repo 時改用 https 也可以）"
fi

echo
echo "=== 2/4 這個 repo ==="
[ -f "$REPO/CLAUDE.md" ] && ok "CLAUDE.md（工作規則，開工時自動讀取）" || fail "少了 CLAUDE.md"
[ -f "$REPO/.claude/settings.json" ] && ok ".claude/settings.json（唯讀指令允許清單）" || warn "少了 .claude/settings.json"
[ -d "$REPO/docs" ] && ok "docs/ 共 $(find "$REPO/docs" -name '*.html' | wc -l | tr -d ' ') 個頁面" || fail "少了 docs/"

echo
echo "=== 3/4 個人偏好與 memory（私有 repo claude-config）==="
if [ -d "$CONFIG_REPO/.git" ]; then
  ok "已經有 $CONFIG_REPO"
  if [ "$MODE" != check ]; then
    git -C "$CONFIG_REPO" pull --quiet --ff-only 2>/dev/null && ok "已更新到最新" || warn "pull 沒成功，請自己看一下 $CONFIG_REPO"
  fi
elif [ "$MODE" = check ]; then
  warn "還沒有 $CONFIG_REPO（不加 --check 執行就會 clone）"
else
  echo "  正在 clone claude-config…"
  if [ -n "$GH" ] && "$GH" auth status >/dev/null 2>&1; then
    "$GH" repo clone Victor0830/claude-config "$CONFIG_REPO" -- --quiet && ok "clone 完成" || fail "clone 失敗（私有 repo，需要先 gh auth login）"
  else
    git clone --quiet "$CONFIG_URL" "$CONFIG_REPO" && ok "clone 完成" || fail "clone 失敗（私有 repo，請先 $HOME/.local/bin/gh auth login）"
  fi
fi

if [ -f "$CONFIG_REPO/install.sh" ]; then
  existing=0
  [ -d "$AIEDU_MEMORY" ] && existing=$(find "$AIEDU_MEMORY" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
  if [ "$MODE" = check ]; then
    echo "  --check：只試跑，不會寫入"
    bash "$CONFIG_REPO/install.sh" --dry-run 2>&1 | sed 's/^/    /'
  elif [ "$existing" -gt 0 ] && [ "$MODE" != force ]; then
    warn "這台電腦已經有 $existing 個 AIeducation memory 檔，略過還原以免覆蓋新內容（要覆蓋請加 --force）"
  else
    bash "$CONFIG_REPO/install.sh" 2>&1 | sed 's/^/    /'
  fi
else
  [ -d "$CONFIG_REPO" ] && fail "$CONFIG_REPO 裡沒有 install.sh"
fi

[ -f "$HOME/.claude/CLAUDE.md" ] && ok "全域偏好 ~/.claude/CLAUDE.md" || warn "還沒有 ~/.claude/CLAUDE.md（跑完 install.sh 就會有）"
[ -f "$REPO/local-context.md" ] && ok "local-context.md（家庭狀況，不進版控）" || warn "還沒有 local-context.md：跑 install.sh，或從舊電腦複製過來"

echo
echo "=== 4/4 剩下這兩件事不能用指令做 ==="
todo "側邊欄群組：跟 Claude 說「建立群組『探索未來世界的能力』，把這個資料夾的工作階段歸進去」。"
echo "     七個階段的標題：① 國文閱讀 ② 英文聽說寫 ③ 數理邏輯推理 ④ 經濟與金錢 ⑤ 世界史與台灣史 ⑥ 體能訓練 ⑦ 升學規劃"
todo "孩子的作答與打卡紀錄存在舊電腦的瀏覽器裡：在舊電腦的體能訓練、每月測驗頁面按「下載備份」，"
echo "     到新電腦的同一頁按「還原」。英文的錄音在 IndexedDB，備份檔帶不走。"

echo
if [ "$problems" -gt 0 ]; then
  echo "=== 有 $problems 項需要處理，看上面的 ❌ ==="
  exit 1
fi
echo "=== 可以開始工作了 ==="
