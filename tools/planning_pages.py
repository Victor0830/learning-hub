"""產生 docs/planning/ 的頁面。修改內容後執行：python3 tools/planning_pages.py"""
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "docs" / "planning"
PAGES = [
    ("index.html", "總覽與時間軸"),
    ("assess.html", "判斷孩子特質"),
    ("routes.html", "台灣與美國制度"),
    ("stem.html", "偏理科的孩子"),
    ("balanced.html", "平均型的孩子"),
    ("timeline.html", "兩個孩子的升學時間表"),  # 由升學規劃工作階段手寫維護，不由本檔產生
]


def page(fname, title, desc, body, data_page=None):
    cur = ' aria-current="page"'
    links = "\n".join(
        f'      <a href="{f}"{cur if f == fname else ""}>{t}</a>' for f, t in PAGES
    )
    dp = f' data-page="{data_page}"' if data_page else ""
    script = '\n<script src="../assets/quiz.js"></script>' if data_page else ""
    full_title = "升學規劃｜學習導航站" if fname == "index.html" else f"{title}｜升學規劃｜學習導航站"
    html = f"""<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧭</text></svg>">
<link rel="stylesheet" href="../assets/style.css">
</head>
<body data-unit="plan"{dp}>
<header class="site-header">
  <div class="inner">
    <a class="brand" href="../index.html"><span class="seal">學</span>學習導航站</a>
    <nav class="section-nav" aria-label="主題">
      <a href="../chinese/index.html">國文閱讀</a>
      <a href="../english/index.html">英文聽說寫</a>
      <a href="../planning/index.html" aria-current="true">升學規劃</a>
    </nav>
  </div>
  <div class="subnav"><div class="inner">
    <a class="sub-home" href="index.html">🧭 升學規劃</a>
    <nav class="site-nav" aria-label="升學規劃頁面">
{links}
    </nav>
  </div></div>
</header>

<main>
{body}
</main>
<footer class="site-footer"><a href="../index.html">學習導航站</a>．升學規劃．制度與政策會變動，實際以各校簡章與官方公告為準</footer>{script}
</body>
</html>
"""
    (OUT / fname).write_text(html, encoding="utf-8")


def pager(prev=None, nxt=None):
    a = f'<a href="{prev[0]}"><small>← 上一頁</small>{prev[1]}</a>' if prev else '<span></span>'
    b = f'<a class="next" href="{nxt[0]}"><small>下一頁 →</small>{nxt[1]}</a>' if nxt else '<span></span>'
    return f'  <nav class="pager">\n    {a}\n    {b}\n  </nav>'


# ------------------------------------------------------------------ index
page("index.html", "總覽與時間軸",
     "雙胞胎國一，一個偏理科、一個各科平均：台灣與美國升學路線的判斷方法、時間軸與決策點。",
     f"""  <section class="hero">
    <span class="eyebrow">升學規劃</span>
    <h1>雙胞胎的升學規劃</h1>
    <p class="lead">兩個孩子目前國一、念公立國中。一個明顯偏好數學和理科，另一個各科平均、沒有明顯偏科。台灣和美國的大學該怎麼選、怎麼判斷？</p>
  </section>

  <div class="callout key">
    <span class="title">📌 國一還早，現在不用選定路線</span>
    <p>現階段比較重要的是兩件事：</p>
    <ol>
      <li><b>弄清楚孩子的特質</b>是真實的，還是暫時的。</li>
      <li><b>了解台灣和美國的升學制度</b>各自偏好哪一種孩子。</li>
    </ol>
  </div>

  <div class="page-links">
    <a href="assess.html"><b>① 判斷孩子特質</b><span>偏理科是真天分嗎？平均型的孩子方向在哪？</span></a>
    <a href="routes.html"><b>② 台灣與美國制度</b><span>各升學管道看什麼、適合誰；費用、簽證與折衷路線</span></a>
    <a href="stem.html"><b>③ 偏理科的孩子</b><span>國文怎麼補、台灣念大學還是直接出國、高中怎麼選</span></a>
    <a href="balanced.html"><b>④ 平均型的孩子</b><span>繁星優勢、找到主軸、文理學院的彈性</span></a>
    <a href="timeline.html"><b>📅 兩個孩子的升學時間表</b><span>國一到高三每個學期要做什麼、五個決策點在什麼時候，可勾選追蹤進度。</span></a>
  </div>

  <h2><span class="num">一</span>目前的狀況與結論</h2>
  <div class="two-col">
    <div class="example">
      <h3 style="margin-top:0">🔬 偏理科的孩子</h3>
      <ul>
        <li>數學、理科興趣明顯</li>
        <li>英文可以，<b>英文和科普文章閱讀都沒問題</b></li>
        <li>國文弱在<b>文學作品、文言文、寫作</b>，不是閱讀理解本身</li>
        <li>美國路線條件很好，A／B 還在考慮</li>
      </ul>
      <p><a href="stem.html">看完整規劃 →</a></p>
    </div>
    <div class="example">
      <h3 style="margin-top:0">⚖️ 平均型的孩子</h3>
      <ul>
        <li>各科平均，沒有明顯偏科</li>
        <li><b>台灣路線很有利</b>，尤其是繁星推薦</li>
        <li>美國路線要看能不能找到一兩個真正投入的領域</li>
      </ul>
      <p><a href="balanced.html">看完整規劃 →</a></p>
    </div>
  </div>
  <div class="table-wrap">
    <table>
      <thead><tr><th>家庭條件</th><th>狀態</th></tr></thead>
      <tbody>
        <tr><td>美國路線預算</td><td>✅ 沒問題</td></tr>
        <tr><td>意願</td><td>還沒決定：<b>A</b> 台灣念完大學再出國，或 <b>B</b> 大學就出國念書</td></tr>
        <tr><td>目前學校</td><td>公立國中，國一</td></tr>
      </tbody>
    </table>
  </div>

  <h2><span class="num">二</span>時間軸與決策點</h2>
  <p>下面是整體架構；每個學期的詳細待辦清單，請看 <a href="timeline.html">兩個孩子的升學時間表</a>。</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>階段</th><th>重點</th><th>要做的判斷</th></tr></thead>
      <tbody>
        <tr><td>國一～國二（現在）</td><td>廣泛探索。偏理科的孩子試試競賽，同時<b>顧好國文和英文</b>；平均型的孩子多嘗試課外領域</td><td>偏科是真天分嗎？平均型的孩子對什麼有熱情？</td></tr>
        <tr><td>國二暑假</td><td>偏理科的孩子參加<b>美國或海外的數理營隊 2～4 週</b></td><td>實際觀察獨立生活能力和適應狀況，這是判斷 A 或 B 最有用的方法</td></tr>
        <tr><td>國三</td><td>準備會考；科學班甄選（多在會考前）；<b>選高中類型</b>（普通高中、科學班、雙語部或國際部）</td><td><b>台灣為主，還是保留美國選項？</b></td></tr>
        <tr><td>高一</td><td>選組，開始累積學習歷程。走美國路線的話，也開始累積美國申請需要的活動和成績</td><td><b>高一下做最後決定</b>。美國申請會看高中三年的成績和活動</td></tr>
        <tr><td>高二</td><td>深化專長，準備考試（學測、托福、SAT）</td><td>選定目標校系</td></tr>
        <tr><td>高三</td><td>1 月考學測；美國申請截止多在 11 月到 1 月</td><td>兩邊同時申請工作量很大，但學習歷程和美國活動的內容可以共用</td></tr>
      </tbody>
    </table>
  </div>

  <h2><span class="num">三</span>現在就可以做的事</h2>
  <ol class="steps-list">
    <li><b>偏理科的孩子：</b>先做一份<b>會考國文歷屆試題</b>，分析錯在哪些題型（<a href="stem.html#analyze">做法</a>）；報名 <b>AMC 8</b> 和 <b>AoPS</b> 課程，看孩子在更高難度下的反應；開始規劃<b>國二暑假的海外營隊</b>。</li>
    <li><b>平均型的孩子：</b>這學期選一兩個<b>全新的課外活動</b>，注意孩子會主動多花時間在哪一個。</li>
    <li><b>兩個孩子：</b>每天固定閱讀，英文往學術程度提升；國文閱讀可以搭配 <a href="../chinese/index.html">國文閱讀力練習室</a>。</li>
    <li><b>和孩子分別聊：</b>不要一起比較，問他們各自「<b>做什麼事的時候會忘記時間</b>」。</li>
  </ol>

  <div class="callout warn">
    <span class="title">⚠️ 雙胞胎要特別注意</span>
    <p>不要讓「一個是理科的、一個是平均的」這種說法固定下來。孩子很容易照著標籤長大：平均型的孩子可能因此不敢碰數理，偏科的孩子也可能覺得自己「本來就不擅長語文」。<b>兩個人走不同路線、甚至念不同高中，都完全正常</b>，但要注意別讓孩子覺得「出國的比較厲害」。</p>
  </div>

{pager(None, ("assess.html", "① 判斷孩子特質"))}""")

# ------------------------------------------------------------------ assess
page("assess.html", "判斷孩子特質",
     "偏理科是真興趣、只是學得快，還是在逃避其他科目？平均型的孩子如何找方向？雙胞胎避免標籤。",
     f"""  <section class="hero">
    <span class="eyebrow">升學規劃 ①</span>
    <h1>先判斷孩子的狀況</h1>
    <p class="lead">分數只是其中一個線索。更重要的是觀察孩子遇到難題、遇到新領域時的反應。</p>
  </section>

  <h2><span class="num">一</span>偏理科的孩子：先分清楚是哪一種</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>類型</th><th>表現</th><th>意義</th></tr></thead>
      <tbody>
        <tr><td>真的有興趣和天分</td><td>會主動找難題，卡住了還想繼續想，喜歡問「為什麼」</td><td>可以往深處發展</td></tr>
        <tr><td>只是學得快</td><td>課內成績好，但遇到超出課本的題目就沒興趣</td><td>算是優勢，還不算天分</td></tr>
        <tr><td>在逃避其他科目</td><td>數理有成就感，所以國文、英文越來越不想碰</td><td>要注意，這個弱點以後兩邊升學都會吃虧</td></tr>
      </tbody>
    </table>
  </div>
  <h3>怎麼測試</h3>
  <p>讓孩子接觸比課本難的東西，觀察反應，不要只看分數。例如：</p>
  <ul>
    <li><b>AMC 8</b> 美國數學競賽（限 8 年級以下，國一、國二都能考）、學校的數學能力競賽、科展</li>
    <li>國中資優數學或營隊類課程</li>
    <li>程式設計入門，看孩子對邏輯類的東西會不會一樣投入</li>
  </ul>
  <div class="callout tip">
    <p>💡 如果孩子遇到難題會<b>越做越興奮</b>，就是真興趣。如果只喜歡「會做」的感覺，就先別太早貼上「理科天才」的標籤。</p>
  </div>

  <h2><span class="num">二</span>各科平均的孩子：平均不代表沒有方向</h2>
  <p>這種孩子通常有兩種情況：</p>
  <div class="two-col">
    <div class="example"><b>還沒找到喜歡的領域</b><p>國中課程範圍窄，很多領域根本還沒接觸過，例如設計、商業、心理、傳播、生物醫學。</p></div>
    <div class="example"><b>學習能力強、很自律</b><p>什麼科目都能做好，這本身就是很大的優勢。</p></div>
  </div>
  <p><b>建議做法：</b>國一到國二讓孩子廣泛嘗試課外活動、營隊、社團和閱讀，觀察孩子會主動花時間在哪裡。平均型孩子最常見的問題是「什麼都不錯，但沒有一樣特別突出」，這在美國申請時比較吃虧。</p>

  <h2><span class="num">三</span>雙胞胎要特別注意一點</h2>
  <div class="callout warn">
    <p>不要讓「哥哥（姊姊）是理科的，你是平均的」這種說法固定下來。孩子很容易照著標籤長大：平均型的孩子可能因此不敢碰數理，偏科的孩子也可能覺得自己「本來就不擅長語文」。兩個人走不同路線、甚至念不同高中，都完全正常。</p>
  </div>

{pager(("index.html", "總覽與時間軸"), ("routes.html", "② 台灣與美國制度"))}""")

# ------------------------------------------------------------------ routes
page("routes.html", "台灣與美國制度",
     "台灣繁星、個人申請、特殊選才等管道適合哪種孩子；美國綜合審查怎麼看；費用、簽證與台灣大學再出國的折衷路線。",
     f"""  <section class="hero">
    <span class="eyebrow">升學規劃 ②</span>
    <h1>台灣與美國的升學制度</h1>
    <p class="lead">兩邊的制度邏輯不同：台灣看考試和在校成績，各管道偏好不同的孩子；美國採綜合審查，更看重個人特色和深度。</p>
  </section>

  <h2><span class="num">一</span>台灣升學：不同管道適合不同的孩子</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>管道</th><th>看什麼</th><th>比較適合</th></tr></thead>
      <tbody>
        <tr><td>繁星推薦</td><td>高中在校成績排名（<b>全科</b>平均）</td><td>✅ <b>平均型</b>，這是很大的優勢</td></tr>
        <tr><td>個人申請</td><td>學測成績，加上學習歷程和面試；各校系對各科的採計和加權不同</td><td>兩個都適合；偏科的孩子可以挑重數學、自然的科系</td></tr>
        <tr><td>特殊選才</td><td>特定領域的表現，例如競賽、研究、作品，學測成績的比重較低</td><td>✅ <b>偏理科型</b>，真有實力的話很適合</td></tr>
        <tr><td>分科測驗分發</td><td>考試成績</td><td>兩個都可以</td></tr>
        <tr><td>奧林匹亞保送</td><td>國際科學奧林匹亞選訓的成績</td><td>只適合頂尖的偏科孩子</td></tr>
      </tbody>
    </table>
  </div>
  <div class="two-col">
    <div class="example">
      <b>偏理科的孩子要注意</b>
      <ul>
        <li>繁星看全科成績，偏科的孩子較吃虧</li>
        <li>學測國文、英文太弱的話，第一階段篩選就可能被刷掉，連頂尖電資科系也一樣</li>
        <li>國三可以考慮<b>科學班</b>或<b>數理資優班</b>的甄選（時間多半在會考前後，要提早注意各校簡章）</li>
      </ul>
    </div>
    <div class="example">
      <b>平均型孩子的優勢</b>
      <ul>
        <li>繁星最有利</li>
        <li>高一下或高二才選組，還有時間探索</li>
        <li>可以考慮跨領域學程，例如雙主修、學士班、不分系</li>
      </ul>
    </div>
  </div>

  <h2><span class="num">二</span>美國升學：制度邏輯和台灣不一樣</h2>
  <p>美國採<b>綜合審查</b>，看 GPA、課程難度、課外活動、文書、推薦信和標準化考試（SAT、托福）。</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th></th><th>偏理科型</th><th>平均型</th></tr></thead>
      <tbody>
        <tr><td>美國的看法</td><td>很喜歡「專精型」申請者，一個領域的深度比全面發展更有說服力</td><td>必須在高中找到一兩個主軸，不能只是「什麼都好」</td></tr>
        <tr><td>可以累積的經歷</td><td>AMC 10/12 → AIME、USACO 程式競賽、科研、國際科展、數學營（如 Ross、PROMYS）</td><td>找到真正投入的領域之後，做出持續性的成果，例如創立社團、做專題、服務計畫</td></tr>
        <tr><td>學校類型</td><td>理工強校、研究型大學</td><td><b>文理學院</b>非常適合；美國大學通常到大二才要宣告主修，時間夠慢慢探索</td></tr>
        <tr><td>要注意</td><td>文書要用英文寫出個人特色，語文弱點在這裡一樣會被放大</td><td>不能只靠成績，要有可以說的故事</td></tr>
      </tbody>
    </table>
  </div>

  <h3>美國路線要先想清楚的現實問題</h3>
  <ol class="steps-list">
    <li><b>費用：</b>私立大學一年的總花費大約 <b>8～9.5 萬美元</b>。兩個孩子同時念，四年是一大筆錢，國際生能拿到補助的學校很少。<span class="tag">家長已確認預算沒問題</span></li>
    <li><b>簽證政策：</b>2025 年以來，美國的學生簽證和畢業後工作簽證（例如 H-1B）變動很大。孩子大約 2031 年才申請，到時候的狀況很難預測，要持續關注。</li>
    <li><b>越早決定越好：</b>走美國路線的話，高一就要開始準備英文能力、課外活動和成績。國三時最好有初步方向，因為這會影響高中要選普通高中、雙語學校還是國際學校。</li>
  </ol>

  <h2><span class="num">三</span>很值得考慮的折衷路線</h2>
  <div class="two-col">
    <div class="example">
      <b>偏理科的孩子：台灣念大學，再到美國念研究所或博士</b>
      <ul>
        <li>台大、清大、交大、成大等校的電資和理工科系，國際認可度高</li>
        <li>美國理工科<b>博士班通常有獎學金並提供生活費</b>，幾乎不用自己出錢</li>
        <li>總花費遠低於直接去美國念大學，而且大學四年更成熟，出國適應力也比較好</li>
      </ul>
    </div>
    <div class="example">
      <b>平均型的孩子</b>
      <ul>
        <li>如果到高中還在探索，美國文理學院的彈性很有價值</li>
        <li>如果已經找到方向，台灣大學加上交換學生或出國念碩士也很好</li>
      </ul>
    </div>
  </div>
  <p>偏理科孩子的 A（台灣大學 → 美國研究所）與 B（直接念美國大學）詳細比較，請看 <a href="stem.html#ab">偏理科的孩子</a>。</p>

{pager(("assess.html", "① 判斷孩子特質"), ("stem.html", "③ 偏理科的孩子"))}""")

# ------------------------------------------------------------------ stem
page("stem.html", "偏理科的孩子",
     "英文和科普閱讀沒問題、國文弱在文學與文言文的偏理科孩子：國文補強方法、台灣念大學或直接出國、高中選擇與國一到國三清單。",
     f"""  <section class="hero">
    <span class="eyebrow">升學規劃 ③</span>
    <h1>偏理科的孩子</h1>
    <p class="lead">英文可以、預算沒問題、念公立國中，國文比較弱。進一步確認後發現：問題範圍比想像中小很多。</p>
  </section>

  <nav class="toc" aria-label="本頁目錄">
    <a href="#now">更新後的重點</a><a href="#impact">國文弱的影響</a><a href="#scope">問題範圍</a><a href="#analyze">找出失分題型</a>
    <a href="#method">用理科思維學國文</a><a href="#load">份量</a><a href="#ab">A 還是 B</a><a href="#when">決定時間點</a><a href="#hs">高中怎麼選</a><a href="#list">國一到國三清單</a>
  </nav>

  <h2 id="now"><span class="num">〇</span>更新後的重點</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>項目</th><th>狀態</th></tr></thead>
      <tbody>
        <tr><td>英文</td><td>✅ 沒問題，繼續往學術程度（托福 100 分以上）提升</td></tr>
        <tr><td>閱讀理解</td><td>✅ 沒問題（英文和科普文章都讀得懂）</td></tr>
        <tr><td>國文</td><td>⚠️ 問題限定在<b>文學、文言文、寫作</b>，會考前有兩年多可以處理</td></tr>
        <tr><td>美國大學路線（B）</td><td>✅ 條件很好，剩下看孩子的<b>獨立性</b>和<b>家庭意願</b></td></tr>
        <tr><td>下一步</td><td>① 做一份會考國文歷屆試題，分析錯在哪些題型　② 報名 AMC 8 和 AoPS 課程　③ 規劃國二暑假的海外營隊</td></tr>
      </tbody>
    </table>
  </div>

  <h2 id="impact"><span class="num">一</span>國文弱會造成什麼影響</h2>
  <p><b>國文弱在台灣路線上會一直卡著，在美國路線上影響小很多。</b></p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>關卡</th><th>國文的影響</th></tr></thead>
      <tbody>
        <tr><td>會考（國三）</td><td>國文和寫作測驗拉低成績，最高可能<b>掉一個志願等級</b>，影響能上哪所高中</td></tr>
        <tr><td>繁星推薦</td><td>看全科成績，吃虧</td></tr>
        <tr><td>學測個人申請</td><td>很多頂尖理工科系第一階段會採計國文，可能被篩掉</td></tr>
        <tr><td>美國申請</td><td>幾乎不受影響，只有<b>英文</b>閱讀和寫作能力重要</td></tr>
      </tbody>
    </table>
  </div>
  <p>所以就結構來說，這個孩子<b>很適合直接去美國念大學</b>。不過不管以後走哪條路，<b>國三會考前國文都要顧住</b>，因為這決定高中的選擇權。目標是「<b>不拖後腿</b>」，不是變強。</p>

  <h2 id="scope"><span class="num">二</span>已確認：問題範圍比想像中小</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>觀察</th><th>結果</th><th>判斷</th></tr></thead>
      <tbody>
        <tr><td>英文長篇文章看得懂嗎？能抓到重點嗎？</td><td>✅ 沒問題</td><td rowspan="2">閱讀理解能力沒有問題，弱的只是「<b>國文課特有的文本</b>」。美國 SAT 閱讀和申請文書的風險排除了</td></tr>
        <tr><td>中文科普文章（例如《科學少年》）理解有沒有問題？</td><td>✅ 沒問題</td></tr>
      </tbody>
    </table>
  </div>
  <div class="two-col">
    <div class="example">
      <b>擅長的</b>
      <ul>
        <li>說明文、科普文、資訊型文章，因為<b>邏輯清楚、答案明確</b></li>
        <li>英文，因為語法有規則</li>
      </ul>
    </div>
    <div class="example">
      <b>卡住的（很可能）</b>
      <ul>
        <li><b>文學作品</b>（詩、散文、小說），因為答案感覺很主觀</li>
        <li><b>文言文</b>，因為用字和句型跟現代中文差很多</li>
        <li><b>寫作</b>，因為要抒情、要鋪陳</li>
      </ul>
    </div>
  </div>
  <p>很多偏理科的孩子都這樣。他們不是讀不懂，而是<b>不習慣「沒有標準答案」的題目</b>，心裡會排斥。</p>
  <h3>對升學規劃的影響</h3>
  <ol class="steps-list">
    <li><b>美國路線最大的風險排除了。</b>直接念美國大學（B 路線）的條件更充分。</li>
    <li><b>國文問題範圍很小，會考前處理得完。</b>只要拉到「不拖後腿」的程度，高中選擇就不會受限，兩條路也都能保留。</li>
    <li><b>A 或 B 的決定，剩下兩個關鍵：</b>孩子<b>夠不夠獨立</b>（國二暑假的海外營隊是最好的觀察機會），以及家裡對孩子<b>以後在哪裡生活、工作</b>的想法。</li>
  </ol>

  <section class="practice" id="analyze">
    <h2>📋 先找出到底是哪一類題目在失分</h2>
    <p>找一份<b>會考國文歷屆試題</b>（國中教育會考網站可以下載），讓孩子<b>限時</b>寫完，再把錯的題目分類。國一還沒學完全部範圍，分數本身不重要，<b>重點是看錯題集中在哪一類</b>。</p>
    <div class="toolbar">
      <div class="score" hidden><span class="label"></span><span class="bar"><i></i></span></div>
      <button data-action="print">列印</button>
      <button data-action="reset">清除紀錄</button>
    </div>
    <div class="write">
      <h3>錯題分類表</h3>
      <label class="field-label">試題年度與作答日期：</label><textarea data-note="exam-info" rows="1" aria-label="試題年度與日期"></textarea>
      <label class="field-label">文言文　錯幾題、錯在哪：</label><textarea data-note="exam-classical" rows="1" aria-label="文言文錯題"></textarea>
      <label class="field-label">現代詩、散文、小說　錯幾題、錯在哪：</label><textarea data-note="exam-literary" rows="1" aria-label="文學類錯題"></textarea>
      <label class="field-label">說明文、圖表、資訊整合　錯幾題、錯在哪：</label><textarea data-note="exam-info-text" rows="1" aria-label="說明文圖表錯題"></textarea>
      <label class="field-label">字詞、成語、語文常識　錯幾題、錯在哪：</label><textarea data-note="exam-words" rows="1" aria-label="字詞常識錯題"></textarea>
      <label class="field-label">觀察與下一步：</label><textarea data-note="exam-next" rows="2" aria-label="觀察與下一步"></textarea>
      <p class="small muted">預期：說明文和圖表題大多答對，錯題集中在文言文和文學類。紀錄只存在這台裝置的瀏覽器裡。</p>
    </div>
  </section>

  <h2 id="method"><span class="num">三</span>用孩子習慣的「理科思維」來學國文</h2>

  <h3>1. 文學閱讀題：當成邏輯題來做</h3>
  <div class="callout key"><p>關鍵觀念：<b>會考國文沒有真正主觀的題目，每個正確答案都能在文章裡找到證據。</b></p></div>
  <ol class="steps-list">
    <li>圈出題目的<b>關鍵詞</b>。</li>
    <li>回到文章找<b>對應的句子</b>，也就是證據。</li>
    <li>分析錯誤選項<b>錯在哪裡</b>。</li>
  </ol>
  <div class="chips">
    <div class="chip-card"><b>偷換概念</b>把文章的意思換成另一件事</div>
    <div class="chip-card"><b>過度推論</b>文章沒說那麼多</div>
    <div class="chip-card"><b>無中生有</b>文章根本沒提到</div>
    <div class="chip-card"><b>因果顛倒</b>把原因和結果弄反</div>
  </div>
  <p>這種學法很像解數學題，偏理科的孩子通常很快就能上手。搭配練習：<a href="../chinese/main-idea.html">抓重點</a>、<a href="../chinese/metaphor.html">譬喻與言外之意</a>。</p>

  <h3>2. 文言文：當成「解碼」或學另一種程式語言</h3>
  <ul>
    <li>先把<b>常見虛詞</b>（之、而、以、於、其、者、也……）當成「語法關鍵字」，一個一個整理用法。</li>
    <li>常見<b>句型</b>（倒裝、省略、判斷句）當成語法規則來記。</li>
    <li><b>課內必讀的文言篇章</b>一定要讀熟，會考常考延伸。</li>
  </ul>
  <p>英文好，代表學語法規則的能力沒問題，只是還沒用這種方式看文言文。搭配練習：<a href="../chinese/zhuanpin.html">成語、古文的詞性與轉品</a>。</p>

  <h3>3. 寫作測驗：用結構來寫，不要只靠感覺</h3>
  <ul>
    <li>會考寫作測驗分成 <b>0～6 級分</b>，目標是 <b>4～5 級分</b>，不需要追求文采。</li>
    <li>固定一套結構：<b>開頭破題 → 2～3 個具體例子 → 反思 → 收尾呼應題目</b>。</li>
    <li>例子可以用孩子熟悉的<b>科學、數學、解決問題的經驗</b>，寫起來自然，也比較有特色。</li>
    <li>每個月練寫 1～2 篇，請老師針對結構批改。</li>
  </ul>
  <p>其他補強方式：用孩子有興趣的<b>中文科普、科學類文章</b>練習讀懂和摘要，比硬讀文學作品有效。</p>

  <h2 id="load"><span class="num">四</span>建議的份量（國一階段）</h2>
  <p>不要讓國文變成負擔，否則孩子會更排斥。</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>項目</th><th>頻率</th></tr></thead>
      <tbody>
        <tr><td>會考題型練習＋錯題分析</td><td>每週 1 次，30～40 分鐘</td></tr>
        <tr><td>文言文虛詞、句型整理</td><td>每週 1 次，20～30 分鐘</td></tr>
        <tr><td>作文</td><td>每月 1～2 篇</td></tr>
      </tbody>
    </table>
  </div>
  <div class="callout tip"><p>💡 如果要找補習或家教，<b>要找會教「閱讀策略」和「解題方法」的老師</b>，不要找只帶學生背課文注釋的。</p></div>

  <h2 id="ab"><span class="num">五</span>核心問題：台灣念大學再出國，還是大學直接出國？</h2>
  <p>預算不是限制之後，比較的重點變成下面這些：</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>面向</th><th>A：台灣大學 → 美國研究所</th><th>B：直接念美國大學</th></tr></thead>
      <tbody>
        <tr><td>國文的影響</td><td>要撐過會考和學測，壓力較大</td><td>幾乎沒影響 ✅</td></tr>
        <tr><td>適合什麼個性</td><td>比較晚熟、需要家人在身邊</td><td>獨立、適應力強</td></tr>
        <tr><td>學術資源</td><td>台大、清交電資的水準很好，但大學部接觸研究的機會比較有限</td><td>大一大二就能進實驗室做研究，選課彈性大 ✅</td></tr>
        <tr><td>轉換主修</td><td>轉系比較難</td><td>很容易 ✅</td></tr>
        <tr><td>以後在哪工作</td><td>適合<b>回台灣發展</b>（例如半導體產業），台灣人脈比較深</td><td>適合<b>留在美國發展</b>，實習和就業的連結比較直接</td></tr>
        <tr><td>風險</td><td>風險低，可以晚點再決定要不要出國</td><td>18 歲就要獨自面對美國的簽證政策變動</td></tr>
        <tr><td>研究所出路</td><td>頂尖理工科系申請美國博士班一向很強</td><td>美國大學部的研究經驗對申請博士很有利</td></tr>
      </tbody>
    </table>
  </div>
  <div class="two-col">
    <div class="callout unit"><b>什麼時候 B 比較好</b><p>孩子獨立、自律，對探索和研究有熱情，而且家裡不排斥孩子以後可能留在美國。</p></div>
    <div class="callout"><b>什麼時候 A 比較好</b><p>孩子還需要時間成熟，或家裡希望孩子以後回台灣發展。</p></div>
  </div>
  <div class="callout warn"><p><b>美國政策提醒：</b>2025 年以來，美國的學生簽證和畢業後工作簽證（例如 H-1B）變動很大。孩子要到大約 2031 年才申請，到時候的狀況很難預測。這是 B 路線最大的不確定因素，要持續關注。</p></div>

  <h2 id="when"><span class="num">六</span>建議：兩條路都保留到高一，同時偏向美國路線準備</h2>
  <p>現在不需要決定。但要注意：<b>B 路線需要較早開始準備，A 路線隨時都可以轉回來。</b>所以比較好的做法是<b>先按美國路線準備，同時顧好台灣的升學基本盤</b>。</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>時間</th><th>要決定什麼</th></tr></thead>
      <tbody>
        <tr><td>國二暑假</td><td>送孩子去<b>美國或海外的數理營隊 2～4 週</b>，實際看看獨立生活的能力和適應狀況。這是判斷 A 或 B 最有用的方法</td></tr>
        <tr><td>國三上</td><td><b>選高中類型</b>（見下一節）</td></tr>
        <tr><td>高一下</td><td><b>最後決定</b>。美國申請會看高中三年的成績和活動，高一結束前一定要確定</td></tr>
      </tbody>
    </table>
  </div>

  <h2 id="hs"><span class="num">七</span>高中怎麼選（最關鍵的一步）</h2>
  <p>從公立國中出發，主要有三個選項：</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th>選項</th><th>優點</th><th>缺點</th><th>適合</th></tr></thead>
      <tbody>
        <tr><td>① 頂尖公立高中（普通班或數理資優班）＋ 自己在校外準備美國申請</td><td>兩條路都保留，每年都有不少畢業生直接申請美國</td><td>升學輔導主要針對學測，美國申請要自己規劃或找顧問；國文課還是要照上</td><td>✅ <b>還沒決定時的首選</b></td></tr>
        <tr><td>② 科學班（國三另外甄選，時間多在會考前）</td><td>很早就接觸大學實驗室和研究，對特殊選才和美國申請都很有幫助</td><td>甄選競爭激烈</td><td>數理實力真的很強的話</td></tr>
        <tr><td>③ 私立高中的國際部或雙語部</td><td>有 AP、IB 等國際課程，有美國升學顧問，國文比重低</td><td>台灣升學管道幾乎放棄；費用高</td><td>高度確定走 B 的時候</td></tr>
      </tbody>
    </table>
  </div>
  <p><b>如果國文拉低會考成績、上不了理想的公立高中，</b>選項 ③ 或科學班甄選就更值得考慮，因為這兩條路不看會考國文成績。</p>

  <h2 id="list"><span class="num">八</span>國一到國三的具體清單</h2>
  <div class="chips">
    <div class="chip-card">
      <b>🔢 數理</b>
      <ul>
        <li><b>AMC 8</b>（每年 1 月考，國一、國二都能報）→ 升高中後考 AMC 10 和 AIME</li>
        <li><b>AoPS（Art of Problem Solving）線上課程</b>：美國最主流的競賽數學課程，全英文授課，數學和英文能一起練</li>
        <li><b>程式</b>：學 Python，挑戰 USACO 美國程式競賽（從 Bronze 級開始）</li>
        <li>問學校輔導室：國中有沒有<b>數理資優鑑定</b>或<b>區域資優方案</b></li>
        <li>國三準備<b>科學班甄選</b></li>
      </ul>
    </div>
    <div class="chip-card">
      <b>🔤 英文</b>
      <ul>
        <li>從「可以」提升到「學術程度」：多讀英文科普文章和非小說類書籍，<b>開始練習英文寫作</b></li>
        <li>高一時目標<b>托福 100 分以上</b>，保留申請美國頂尖學校的選項</li>
        <li>口說、聽力、寫作練習：<a href="../english/index.html">英文聽說寫</a></li>
      </ul>
    </div>
    <div class="chip-card">
      <b>📖 國文</b>
      <ul>
        <li>目標是會考國文成績不要拖垮整體</li>
        <li>歷屆試題錯題分析 → 針對失分題型補強（方法見上方）</li>
        <li>搭配 <a href="../chinese/index.html">國文閱讀力練習室</a></li>
      </ul>
    </div>
  </div>

{pager(("routes.html", "② 台灣與美國制度"), ("balanced.html", "④ 平均型的孩子"))}""", data_page="planning-stem")

# ------------------------------------------------------------------ balanced
page("balanced.html", "平均型的孩子",
     "各科平均的孩子：台灣繁星推薦的優勢、如何廣泛探索找到主軸、美國文理學院的彈性。",
     f"""  <section class="hero">
    <span class="eyebrow">升學規劃 ④</span>
    <h1>平均型的孩子</h1>
    <p class="lead">各科平均、沒有明顯偏科。國文應該沒問題，台灣路線對孩子很有利；美國路線則要看國中到高一之間，能不能找到一兩個真正投入的領域。</p>
  </section>

  <h2><span class="num">一</span>平均不代表沒有方向</h2>
  <div class="two-col">
    <div class="example"><b>還沒找到喜歡的領域</b><p>國中課程範圍窄，很多領域根本還沒接觸過，例如設計、商業、心理、傳播、生物醫學。</p></div>
    <div class="example"><b>學習能力強、很自律</b><p>什麼科目都能做好，這本身就是很大的優勢。</p></div>
  </div>
  <p><b>建議做法：</b>國一到國二讓孩子廣泛嘗試課外活動、營隊、社團和閱讀，觀察孩子會主動花時間在哪裡。</p>
  <div class="callout tip"><p>💡 <b>現在就可以做：</b>這學期選一兩個<b>全新的課外活動</b>，注意孩子會主動多花時間在哪一個。也可以問孩子「做什麼事的時候會忘記時間」。</p></div>

  <h2><span class="num">二</span>台灣路線：優勢很明顯</h2>
  <ul>
    <li><b>繁星推薦</b>看高中在校全科成績排名，平均型最有利。</li>
    <li>高一下或高二才選組，還有時間探索。</li>
    <li>可以考慮跨領域學程，例如雙主修、學士班、不分系。</li>
  </ul>

  <h2><span class="num">三</span>美國路線：必須找到主軸</h2>
  <ul>
    <li>美國綜合審查時，「什麼都不錯，但沒有一樣特別突出」比較吃虧。必須在高中找到一兩個主軸，<b>不能只是「什麼都好」</b>。</li>
    <li>找到真正投入的領域之後，做出<b>持續性的成果</b>，例如創立社團、做專題、服務計畫。不能只靠成績，要有可以說的故事。</li>
    <li><b>文理學院</b>非常適合。美國大學通常到大二才要宣告主修，時間夠慢慢探索。</li>
  </ul>

  <h2><span class="num">四</span>折衷選擇</h2>
  <div class="two-col">
    <div class="example"><b>到高中還在探索</b><p>美國文理學院的彈性很有價值。</p></div>
    <div class="example"><b>已經找到方向</b><p>台灣大學加上交換學生或出國念碩士也很好。</p></div>
  </div>

  <h2><span class="num">五</span>兩個孩子不需要走同一條路</h2>
  <div class="callout warn">
    <p>一個出國、一個留在台灣很常見，只是要注意<b>別讓孩子覺得「出國的比較厲害」</b>。也不要讓「一個是理科的、一個是平均的」這種標籤固定下來，平均型的孩子可能因此不敢碰數理。</p>
  </div>
  <p>英文練習可以參考 <a href="../english/index.html">英文聽說寫</a>；如果國文閱讀也想加強，可以使用 <a href="../chinese/index.html">國文閱讀力練習室</a>。</p>

{pager(("stem.html", "③ 偏理科的孩子"), ("timeline.html", "📅 兩個孩子的升學時間表"))}""")

print("planning pages written to", OUT)
