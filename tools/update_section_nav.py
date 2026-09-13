"""把所有頁面上方的主題導覽（section-nav）更新成同一份清單。
新增主題時：在 SECTIONS 加一行，執行 python3 tools/update_section_nav.py，
再執行 python3 tools/planning_pages.py（升學規劃頁面由產生器輸出）。"""
import pathlib, re

DOCS = pathlib.Path(__file__).resolve().parent.parent / "docs"
# 第三欄 True＝已上線；主題還在建置時設成 False，導覽列就先不放它
SECTIONS = [
    ("chinese", "國文閱讀", True),
    ("english", "英文聽說寫", True),
    ("planning", "升學規劃", True),
    ("economics", "經濟與金錢", True),
    ("history", "世界史與台灣史", False),
]
NAV_RE = re.compile(r'<nav class="section-nav" aria-label="主題">.*?</nav>', re.S)


def live_sections():
    """只列出已上線、而且有 index.html 的主題，避免導覽列出現打不開的連結。"""
    return [(f, l) for f, l, ready in SECTIONS if ready and (DOCS / f / "index.html").exists()]


def nav_html(current, prefix, indent):
    items = []
    for folder, label in live_sections():
        cur = ' aria-current="true"' if folder == current else ""
        items.append(f'{indent}  <a href="{prefix}{folder}/index.html"{cur}>{label}</a>')
    return '<nav class="section-nav" aria-label="主題">\n' + "\n".join(items) + f"\n{indent}</nav>"


def main():
    changed = 0
    for page in sorted(DOCS.rglob("*.html")):
        rel = page.relative_to(DOCS)
        current = rel.parts[0] if len(rel.parts) > 1 else None
        if current in {f for f, _, ready in SECTIONS if not ready}:
            continue  # 建置中的主題由它自己的工作階段管理，不動
        prefix = "../" * (len(rel.parts) - 1)
        text = page.read_text(encoding="utf-8")
        m = NAV_RE.search(text)
        if not m:
            continue
        line_start = text.rfind("\n", 0, m.start()) + 1
        indent = re.match(r"[ \t]*", text[line_start:m.start()]).group(0)
        new = NAV_RE.sub(lambda _: nav_html(current, prefix, indent), text, count=1)
        if new != text:
            page.write_text(new, encoding="utf-8")
            changed += 1
    print(f"section-nav updated in {changed} pages")


if __name__ == "__main__":
    main()
