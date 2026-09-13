/* 世界史與台灣史：互動元件
 * - #timeline：依 ERAS 資料畫出台灣 × 世界雙軌年表（含比例時間帶、只看大事、遮住骨架卡答案）
 * - .order[data-order]：因果排序練習（點卡片依序排列）
 * - #note-app：看影片／上課筆記卡，存在這台裝置的瀏覽器，並自動依時代、年份排好
 * 紀錄只存在 localStorage，不會上傳。
 */
(function () {
  var KEY = 'history-hub:v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var state = load();

  /* ================= 年表資料 =================
   * tw / world：[年份, 內容, 標記]；標記 b = 大事（★），l = 和另一邊有牽動關係
   */
  var ERAS = [
    {
      id: 'prehistory', name: '史前時代與原住民族', short: '史前', years: '數萬年前 — 1600 年代',
      span: '沒有文字紀錄，靠考古發掘認識',
      oneline: '文字紀錄出現以前，台灣就已經有人住了好幾萬年。',
      wave: '冰河時期海水比現在低，台灣海峽有時會露出陸地，人和動物可能因此來到台灣。後來海水上升，台灣才又變成島。',
      tw: [
        ['數萬年前', '長濱文化（舊石器時代）：住在台東海邊的洞穴，用敲打出來的石器，靠採集、打獵、捕魚生活。', 'b'],
        ['約 6000 年前', '大坌坑文化（新石器時代）：開始出現陶器，也有早期的農業。'],
        ['約 3000 多年前', '卑南文化：留下大量石板棺和精美的玉器。'],
        ['約 1800–500 年前', '十三行文化（金屬器時代）：會煉鐵，遺址中有外地傳來的錢幣和器物，表示已經和外地往來。'],
        ['很早以前', '台灣原住民族屬於「南島語族」，台灣是南島語族分布的最北端。有學者認為台灣可能是南島語族的原鄉之一，但學界還在討論。', 'b']
      ],
      world: [
        ['約 1 萬年前', '西亞開始出現農業和畜牧（農業革命），人類慢慢定居下來。'],
        ['約 5000 年前', '兩河流域、埃及出現文字和城市。', 'b'],
        ['前 221 年', '秦統一中國。'],
        ['476 年', '西羅馬帝國滅亡，歐洲進入中古時期。']
      ],
      skeleton: [
        ['誰住在這裡？', '史前人類，以及後來的原住民族祖先。'],
        ['怎麼生活？', '從打獵採集，到種田、做陶器，再到會煉鐵、和外地交換物品。'],
        ['我們怎麼知道？', '沒有文字，靠考古：挖出來的石器、陶器、玉器、墓葬。'],
        ['留下什麼？', '原住民族的語言和文化，一直延續到今天。']
      ]
    },
    {
      id: 'dutch', name: '大航海時代：荷蘭與西班牙', short: '荷西', years: '1624 — 1662', from: 1624, to: 1662,
      span: '荷蘭約 38 年；西班牙在北部約 16 年',
      oneline: '歐洲人為了做亞洲的生意來到東亞，台灣第一次被捲進世界貿易。',
      wave: '歐洲進入大航海時代，荷蘭想和中國、日本做生意，但明朝不讓外國人隨便靠岸貿易。荷蘭需要一個靠近中國的據點。',
      tw: [
        ['1622', '荷蘭先佔領澎湖，要求和明朝通商。', 'l'],
        ['1624', '明朝軍隊把荷蘭人逼離澎湖，荷蘭轉到大員（今台南安平）建立據點，興建熱蘭遮城。', 'b l'],
        ['1626', '西班牙佔領北部的雞籠（今基隆），後來又到淡水。'],
        ['1642', '荷蘭把西班牙趕出北台灣。'],
        ['這段時期', '荷蘭招募漢人來台開墾，種甘蔗和稻米；台灣的鹿皮賣到日本，蔗糖也大量出口。', 'b'],
        ['這段時期', '傳教士用羅馬字母拼寫原住民的西拉雅語，後來留下「新港文書」。'],
        ['1652', '郭懷一事件：漢人不滿重稅起來反抗，被荷蘭鎮壓。']
      ],
      world: [
        ['1492', '哥倫布抵達美洲。', 'b'],
        ['1498', '達伽馬繞過非洲，抵達印度。'],
        ['1517', '馬丁路德發起宗教改革。'],
        ['1602', '荷蘭東印度公司成立，專做亞洲貿易。', 'l'],
        ['明朝', '明朝實施海禁，限制人民出海和外國人來貿易。', 'l']
      ],
      skeleton: [
        ['誰來了？', '荷蘭東印度公司（在南部）、西班牙（在北部）。'],
        ['為什麼來？', '把台灣當作貿易轉運站，連接中國、日本和東南亞。'],
        ['怎麼管理？', '像公司一樣經營：收稅、控制貿易、傳教。'],
        ['人民怎麼回應？', '原住民有合作也有反抗；漢人不滿重稅，發生郭懷一事件。'],
        ['留下什麼？', '大量漢人移民開始來台、蔗糖產業、新港文書。']
      ]
    },
    {
      id: 'zheng', name: '鄭氏時期', short: '鄭氏', years: '1662 — 1683', from: 1662, to: 1683,
      span: '約 21 年',
      oneline: '明朝滅亡後，鄭成功把台灣當成反清的根據地。',
      wave: '中國改朝換代：1644 年明朝滅亡，清朝統治中國。鄭成功在東南沿海抗清，打輸以後需要一個新的根據地。',
      tw: [
        ['1661', '鄭成功率軍攻打台灣。', 'l'],
        ['1662', '荷蘭投降，離開台灣；同年鄭成功過世，由兒子鄭經繼承。', 'b'],
        ['這段時期', '實施屯田：軍隊一邊駐守一邊開墾。今天的左營、新營、林鳳營等地名，就和軍隊駐紮有關。'],
        ['1666', '陳永華主持興建孔廟（今台南孔廟），推行儒學教育。'],
        ['1683', '清朝派施琅攻下澎湖，鄭克塽投降。', 'b l']
      ],
      world: [
        ['1644', '明朝滅亡，清軍入關，開始統治中國。', 'b l'],
        ['1659', '鄭成功北伐攻打南京，失敗。', 'l'],
        ['1661', '清朝下「遷界令」，讓沿海居民往內陸遷，切斷對鄭氏的支援。'],
        ['1673–1681', '中國發生三藩之亂，鄭經曾趁機出兵福建。'],
        ['1688', '英國光榮革命，國會權力提高。']
      ],
      skeleton: [
        ['誰來了？', '鄭成功和他的軍隊、官員。'],
        ['為什麼來？', '抗清需要基地；台灣有土地可以養軍隊，又隔著海峽，比較好防守。'],
        ['怎麼管理？', '仿照明朝設官、屯田開墾、辦儒學教育。'],
        ['人民怎麼回應？', '更多漢人移入，開墾範圍擴大，也和原住民發生衝突。'],
        ['留下什麼？', '漢人文化和儒學教育在台灣扎根，還有許多「營」字地名。']
      ],
      views: '鄭成功在不同立場的人眼中形象不同：有人稱他民族英雄，有人強調他對荷蘭人和原住民來說是外來的武力。'
    },
    {
      id: 'qing', name: '清帝國統治', short: '清', years: '1683 — 1895', from: 1683, to: 1895,
      span: '約 212 年，是台灣近四百年歷史中最長的一段',
      oneline: '清朝前期「為了防台灣而管台灣」，直到外國勢力來敲門，才開始積極建設。',
      wave: '前期：清朝擔心台灣再變成反抗基地。後期：工業革命後，歐美列強和日本到東亞搶市場和土地，台灣的位置變得重要。',
      tw: [
        ['1684', '清朝把台灣納入版圖，設台灣府，隸屬福建省。', 'b'],
        ['1684 起', '限制人民渡海來台（例如要申請許可，也曾不准攜帶家眷），後人常稱「渡台禁令」。'],
        ['1700 年代', '劃界封山：用土牛溝等界線，限制漢人進入原住民生活的區域。'],
        ['1786', '林爽文事件。移民社會常有民變和械鬥，俗話說「三年一小反，五年一大亂」。'],
        ['1700–1800 年代', '「一府二鹿三艋舺」：台南、鹿港、艋舺（今台北萬華）成為熱鬧的港口城市。'],
        ['1860 年代', '開港通商：淡水、雞籠、安平、打狗陸續開放，茶、糖、樟腦大量出口。', 'b l'],
        ['1872', '加拿大籍的馬偕來到淡水，傳教、行醫、辦學。'],
        ['1874', '牡丹社事件：日本以琉球人在台灣被殺為理由出兵恆春半島。清朝派沈葆楨來台加強防務。', 'l'],
        ['1875', '沈葆楨推動「開山撫番」，並廢除渡台的限制。'],
        ['1884–1885', '清法戰爭，法軍攻打基隆、淡水。', 'l'],
        ['1885', '台灣建省，劉銘傳擔任首任巡撫，修鐵路、架電報、辦新式學堂。', 'b'],
        ['1895', '清朝在甲午戰爭中戰敗，簽訂《馬關條約》，把台灣和澎湖割讓給日本。', 'b l']
      ],
      world: [
        ['1700 年代後期', '英國開始工業革命，需要原料和市場。', 'b l'],
        ['1776', '美國發表獨立宣言。'],
        ['1789', '法國大革命。'],
        ['1840–1842', '鴉片戰爭，清朝戰敗，簽《南京條約》。', 'l'],
        ['1856–1860', '英法聯軍，清朝簽《天津條約》《北京條約》，台灣因此開港。', 'l'],
        ['1868', '日本明治維新，快速學習西方變強。', 'b l'],
        ['1894', '甲午戰爭（清朝對日本）。', 'l']
      ],
      skeleton: [
        ['誰來了？', '清朝官員，以及大量閩南、客家移民。'],
        ['為什麼來？', '清朝原本有人主張放棄台灣，施琅認為台灣位置重要才留下；主要目的是防止台灣再成為反抗基地。'],
        ['怎麼管理？', '前期消極：限制移民、劃界封山。後期積極：開山撫番、建省、現代化建設。'],
        ['人民怎麼回應？', '民變和械鬥頻繁；開港後北部靠茶和樟腦興起。'],
        ['留下什麼？', '漢人社會成形、廟宇和宗族、經濟重心由南往北移、台灣第一條鐵路。']
      ],
      views: '清朝前期到底算不算「消極」，歷史學者看法不完全一樣：也有人認為清朝只是用當時的方式，務實地管理一個邊疆島嶼。'
    },
    {
      id: 'japan', name: '日本統治', short: '日本', years: '1895 — 1945', from: 1895, to: 1945,
      span: '約 50 年',
      oneline: '台灣成為日本的第一個殖民地，快速現代化，也受到差別對待。',
      wave: '日本明治維新後變強，想像歐美列強一樣擁有殖民地；甲午戰爭打敗清朝，拿到台灣。',
      tw: [
        ['1895', '台灣民主國成立抗日；日軍登陸後，各地發生武裝抗日（乙未戰爭）。', 'b'],
        ['1898 起', '總督兒玉源太郎、民政長官後藤新平：調查戶口和土地、實施保甲制度、改善衛生和交通。'],
        ['1908', '西部縱貫鐵路全線通車。'],
        ['1915', '西來庵事件，是日治時期規模最大的漢人武裝抗日之一，之後大規模武裝抗日漸漸結束。'],
        ['1919 起', '改派文官擔任總督，推動「同化政策」。'],
        ['1921', '台灣文化協會成立（蔣渭水、林獻堂等人）；同年開始「台灣議會設置請願運動」。', 'b l'],
        ['1930', '嘉南大圳完工（八田與一主持設計），嘉南平原的稻米和甘蔗大增產。'],
        ['1930', '霧社事件：賽德克族人起身反抗日本統治。'],
        ['1937 起', '皇民化運動：推行說日語、改日本姓名、參拜神社，後來徵召台灣人當兵。', 'b l'],
        ['1945', '日本戰敗投降，結束在台灣的統治。', 'b l']
      ],
      world: [
        ['1914–1918', '第一次世界大戰。', 'b'],
        ['1918', '美國總統威爾遜提出的主張中強調「民族自決」，影響許多殖民地。', 'l'],
        ['1919', '朝鮮發生三一運動，中國發生五四運動。'],
        ['1929', '全球經濟大恐慌。'],
        ['1937', '中日戰爭爆發。', 'l'],
        ['1939–1945', '第二次世界大戰；1941 年日本偷襲珍珠港，美國參戰。', 'b l']
      ],
      skeleton: [
        ['誰來了？', '日本在台灣設立的台灣總督府。'],
        ['為什麼來？', '依《馬關條約》取得台灣；台灣可以提供米、糖等資源，後來也被當成日本向南擴張的基地。'],
        ['怎麼管理？', '前期武力鎮壓＋調查建設；中期同化政策；後期皇民化。總督的權力很大。'],
        ['人民怎麼回應？', '前期武裝抗日 → 中期改用文化啟蒙、議會請願等非武力方式爭取權利 → 後期被動員參與戰爭。'],
        ['留下什麼？', '鐵路、水利、衛生、普及的基礎教育；也留下差別待遇和戰爭的傷痛。']
      ],
      views: '日治時期的建設該怎麼評價，常常有爭論：有人強調現代化的成果，有人強調這些建設主要是為了日本的利益，台灣人也受到不平等對待。兩種角度可以一起看。'
    },
    {
      id: 'martial', name: '戰後：戒嚴時期', short: '戒嚴', years: '1945 — 1987', from: 1945, to: 1987,
      span: '戒嚴從 1949 到 1987 年，長達 38 年',
      oneline: '二戰結束後政府換人；冷戰讓台灣長期戒嚴，也在美國支持下發展經濟。',
      wave: '二戰結束 → 國共內戰 → 冷戰（美國和蘇聯兩大陣營對立）。韓戰爆發後，美國把台灣視為圍堵共產勢力的一環。',
      tw: [
        ['1945', '中華民國政府接收台灣，設立台灣省行政長官公署（陳儀）。', 'b l'],
        ['1947', '二二八事件：查緝私菸的衝突，引爆當時累積的不滿；政府派軍隊鎮壓，許多人傷亡。', 'b'],
        ['1949', '台灣實施戒嚴；中華民國政府在國共內戰失利後遷到台灣。', 'b l'],
        ['1949–1953', '土地改革：三七五減租、公地放領、耕者有其田。'],
        ['1950–1951', '韓戰爆發後，美國派第七艦隊巡防台灣海峽，1951 年起提供美援。', 'l'],
        ['戒嚴時期', '白色恐怖：許多人因為政治理由被逮捕、判刑。'],
        ['1966', '高雄設立加工出口區，發展出口工業。'],
        ['1971', '中華民國退出聯合國。', 'l'],
        ['1970 年代', '十大建設：高速公路、鐵路電氣化、港口、煉鋼廠等。'],
        ['1979', '美國與中華民國斷交，美國國會通過《台灣關係法》；同年發生美麗島事件。', 'b l'],
        ['1980', '新竹科學園區成立。']
      ],
      world: [
        ['1945', '第二次世界大戰結束，聯合國成立。', 'b l'],
        ['1946–1949', '國共內戰；1949 年中華人民共和國成立。', 'l'],
        ['1947 起', '美國和蘇聯進入冷戰。', 'b'],
        ['1950–1953', '韓戰。', 'l'],
        ['1955–1975', '越戰。'],
        ['1973', '石油危機。'],
        ['1978–1979', '中國開始改革開放；美國和中華人民共和國建交。', 'l']
      ],
      skeleton: [
        ['誰來了？', '中華民國政府，以及 1949 年前後跟著政府來台的大批軍民。'],
        ['為什麼來？', '二戰後接收台灣；國共內戰失利後，以台灣為根據地。'],
        ['怎麼管理？', '戒嚴，限制言論、集會和組黨；同時推動土地改革和經濟建設。'],
        ['人民怎麼回應？', '二二八和白色恐怖留下傷痛；有人持續爭取民主（黨外運動）；多數人投入工作，創造「經濟奇蹟」。'],
        ['留下什麼？', '中小企業和出口經濟、科技產業的基礎；也留下轉型正義的課題。']
      ],
      views: '這段歷史離現在很近，很多家庭都有親身經驗，不同家庭的記憶和感受可能很不一樣。可以問問家裡的長輩。'
    },
    {
      id: 'democracy', name: '解嚴後：民主化', short: '民主', years: '1987 — 今', from: 1987, to: 2026,
      span: '解嚴至今',
      oneline: '解除戒嚴後，台灣一步步走向由人民選出領導人的民主社會。',
      wave: '1980 年代末全球民主化浪潮：南韓民主化、東歐共產政權瓦解、柏林圍牆倒塌，冷戰結束。',
      tw: [
        ['1986', '民主進步黨成立。'],
        ['1987', '解除戒嚴；同年開放民眾到中國大陸探親。', 'b l'],
        ['1988', '解除報禁，可以自由辦報紙。'],
        ['1991', '廢止《動員戡亂時期臨時條款》；1991–1992 年國會全面改選。'],
        ['1996', '第一次總統直選。', 'b'],
        ['2000', '第一次政黨輪替。', 'b'],
        ['2002', '以「台灣、澎湖、金門、馬祖個別關稅領域」名義加入世界貿易組織（WTO）。']
      ],
      world: [
        ['1987', '南韓民主化。', 'l'],
        ['1989', '柏林圍牆倒塌。', 'b l'],
        ['1991', '蘇聯解體，冷戰結束。', 'b'],
        ['2001', '美國發生九一一恐怖攻擊。'],
        ['2008', '全球金融海嘯。']
      ],
      skeleton: [
        ['誰來做決定？', '越來越多事情由人民投票決定。'],
        ['為什麼改變？', '經濟發展後人民想參與政治，加上黨外運動長期爭取，以及國際的民主浪潮。'],
        ['怎麼運作？', '解嚴、開放組黨和辦報、國會全面改選、總統直選。'],
        ['人民怎麼參與？', '選舉、社會運動、公民團體。'],
        ['留下什麼？', '民主制度、言論自由，以及重視原住民族、客家、新住民的多元文化。']
      ]
    }
  ];
  window.HISTORY_ERAS = ERAS;

  /* ================= 年表 ================= */
  var tl = document.getElementById('timeline');
  if (tl) {
    var ribbon = document.getElementById('ribbon');
    if (ribbon) {
      var START = 1624, END = 2026;
      var bar = el('div', 'ribbon');
      var years = el('div', 'ribbon-years');
      ERAS.forEach(function (e, i) {
        var a = el('a', 'era-' + i);
        a.href = '#' + e.id;
        a.title = e.name + '（' + e.years + '）';
        a.appendChild(el('span', null, e.short));
        if (i === 0) { a.classList.add('pre'); }
        else {
          a.style.flex = (e.to - e.from) + ' 1 0';
          if (e.to - e.from < 30) a.classList.add('short');
        }
        bar.appendChild(a);
      });
      [1624, 1683, 1895, 1945, 1987].forEach(function (y) {
        var s = el('span', null, y);
        s.style.left = ((y - START) / (END - START) * 100) + '%';
        years.appendChild(s);
      });
      ribbon.appendChild(bar);
      ribbon.appendChild(years);
    }

    ERAS.forEach(function (e, i) {
      var sec = el('section', 'era era-' + i);
      sec.id = e.id;
      var head = el('div', 'era-head');
      head.appendChild(el('span', 'years', e.years));
      var h = el('h2', null, e.name);
      head.appendChild(h);
      head.appendChild(el('p', 'span-note', e.span));
      sec.appendChild(head);
      sec.appendChild(el('p', 'oneline', e.oneline));

      var wave = el('p', 'wave');
      wave.appendChild(el('b', 'label', '🌊 世界的浪：'));
      wave.appendChild(document.createTextNode(e.wave));
      sec.appendChild(wave);

      var lanes = el('div', 'lanes');
      [['tw', '🏝️ 台灣發生什麼'], ['world', '🌏 同時的世界（含中國、東亞）']].forEach(function (pair) {
        var lane = el('div', 'lane ' + pair[0]);
        lane.appendChild(el('h3', null, pair[1]));
        var ol = el('ol');
        e[pair[0]].forEach(function (ev) {
          var li = el('li');
          var flags = ev[2] || '';
          if (flags.indexOf('b') > -1) li.classList.add('big');
          if (flags.indexOf('l') > -1) li.classList.add('link');
          li.appendChild(el('span', 'yr', ev[0]));
          li.appendChild(el('span', 'txt', ev[1]));
          ol.appendChild(li);
        });
        lane.appendChild(ol);
        lanes.appendChild(lane);
      });
      sec.appendChild(lanes);

      var det = el('details', 'skeleton');
      det.open = true;
      det.appendChild(el('summary', null, '🦴 這個時代的骨架卡'));
      var grid = el('div', 'skel-grid');
      e.skeleton.forEach(function (s) {
        var d = el('div');
        d.appendChild(el('b', null, s[0]));
        var ans = el('span', 'ans', s[1]);
        ans.addEventListener('click', function () { ans.classList.toggle('peek'); });
        d.appendChild(ans);
        grid.appendChild(d);
      });
      det.appendChild(grid);
      if (e.views) {
        var v = el('p', 'small muted');
        v.style.margin = '.7rem 0 0';
        v.appendChild(el('b', null, '👀 不同的看法：'));
        v.appendChild(document.createTextNode(e.views));
        det.appendChild(v);
      }
      sec.appendChild(det);
      tl.appendChild(sec);
    });

    var prefs = state.timeline || (state.timeline = {});
    function applyPref(btn) {
      var key = btn.dataset.toggle;
      var on = !!prefs[key];
      document.body.classList.toggle(key, on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    document.querySelectorAll('[data-toggle]').forEach(function (btn) {
      applyPref(btn);
      btn.addEventListener('click', function () {
        prefs[btn.dataset.toggle] = !prefs[btn.dataset.toggle];
        save(state);
        applyPref(btn);
      });
    });
  }

  /* ================= 因果排序 ================= */
  var orderState = state.order || (state.order = {});
  document.querySelectorAll('.order[data-order]').forEach(function (box) {
    var id = box.dataset.order;
    var items = Array.prototype.map.call(box.querySelectorAll('li'), function (li) { return li.textContent.trim(); });
    var list = box.querySelector('ol');
    list.remove();

    var picked = el('div', 'picked');
    var pool = el('div', 'pool');
    var row = el('div', 'row');
    var check = el('button', 'btn-primary', '✅ 檢查順序');
    var undo = el('button', null, '↺ 重新排');
    var result = el('p', 'result');
    result.setAttribute('aria-live', 'polite');
    check.type = undo.type = 'button';
    row.appendChild(check); row.appendChild(undo); row.appendChild(result);
    box.appendChild(picked); box.appendChild(pool); box.appendChild(row);

    var order = [];   // 目前排進去的 index
    var deck;

    function cardBtn(idx, n) {
      var b = el('button', 'card-btn');
      b.type = 'button';
      b.appendChild(el('span', 'n', n ? n + '.' : '•'));
      b.appendChild(el('span', null, items[idx]));
      b.dataset.idx = idx;
      return b;
    }
    function render(checked) {
      picked.innerHTML = ''; pool.innerHTML = '';
      order.forEach(function (idx, pos) {
        var b = cardBtn(idx, pos + 1);
        if (checked) b.classList.add(idx === pos ? 'right' : 'wrong');
        b.setAttribute('aria-label', '第 ' + (pos + 1) + ' 張：' + items[idx] + '（點一下拿回去）');
        b.addEventListener('click', function () {
          order.splice(pos, 1);
          result.textContent = '';
          render(false);
        });
        picked.appendChild(b);
      });
      deck.forEach(function (idx) {
        if (order.indexOf(idx) > -1) return;
        var b = cardBtn(idx, 0);
        b.addEventListener('click', function () {
          order.push(idx);
          result.textContent = '';
          render(false);
        });
        pool.appendChild(b);
      });
      check.disabled = order.length !== items.length;
    }
    function reset() {
      order = [];
      deck = shuffle(items.map(function (_, i) { return i; }));
      result.textContent = ''; result.className = 'result';
      render(false);
    }
    check.addEventListener('click', function () {
      var right = order.filter(function (idx, pos) { return idx === pos; }).length;
      render(true);
      if (right === items.length) {
        result.textContent = '🎉 全對！試著用「因為……所以……」把它說一遍。';
        result.className = 'result ok';
        orderState[id] = true;
      } else {
        result.textContent = '對了 ' + right + ' / ' + items.length + ' 張。紅色的卡片點一下可以拿回去重排。';
        result.className = 'result no';
      }
      save(state);
    });
    undo.addEventListener('click', reset);
    reset();
    if (orderState[id]) {
      result.textContent = '（之前已經排對過，可以再挑戰一次）';
    }
  });

  /* ================= 筆記卡 ================= */
  var app = document.getElementById('note-app');
  if (app) {
    var form = document.getElementById('note-form');
    var listBox = document.getElementById('note-list');
    var filterBox = document.getElementById('note-filters');
    var savedMsg = document.getElementById('saved-msg');
    var eraSel = form.elements.era;
    ERAS.forEach(function (e, i) {
      var o = el('option', null, e.name + '（' + e.years + '）');
      o.value = String(i);
      eraSel.appendChild(o);
    });
    var notes = state.notes || (state.notes = []);
    var who = '';
    var editing = null;
    var FIELDS = [
      ['background', '背景'], ['fuse', '導火線'], ['process', '經過'], ['effect', '影響'],
      ['world', '同時的世界'], ['views', '不同角度'], ['wonder', '我還想知道']
    ];

    function yearNum(s) {
      var m = String(s || '').match(/-?\d{1,4}/);
      return m ? parseInt(m[0], 10) : 99999;
    }
    function renderFilters() {
      filterBox.innerHTML = '';
      var names = [];
      notes.forEach(function (n) { if (n.who && names.indexOf(n.who) < 0) names.push(n.who); });
      if (names.length < 2) { who = ''; return; }
      [''].concat(names).forEach(function (name) {
        var b = el('button', null, name || '全部');
        b.type = 'button';
        b.setAttribute('aria-pressed', who === name ? 'true' : 'false');
        b.addEventListener('click', function () { who = name; renderFilters(); renderList(); });
        filterBox.appendChild(b);
      });
    }
    function renderList() {
      listBox.innerHTML = '';
      var count = document.getElementById('note-count');
      if (count) count.textContent = notes.length ? '共 ' + notes.length + ' 張卡片' : '還沒有卡片';
      ERAS.forEach(function (e, i) {
        var mine = notes.filter(function (n) { return String(n.era) === String(i) && (!who || n.who === who); })
          .sort(function (a, b) { return yearNum(a.year) - yearNum(b.year); });
        var wrap = el('section', 'my-era era-' + i);
        var h = el('h3');
        h.appendChild(el('span', 'dot'));
        h.appendChild(document.createTextNode(e.name));
        wrap.appendChild(h);
        if (!mine.length) {
          wrap.appendChild(el('p', 'empty', '還沒有這個時代的卡片'));
        }
        mine.forEach(function (n) {
          var c = el('article', 'ncard');
          c.appendChild(el('h4', null, n.title || '（沒有標題）'));
          var meta = [n.year, n.source, n.who && ('✏️ ' + n.who)].filter(Boolean).join('　·　');
          if (meta) c.appendChild(el('p', 'meta', meta));
          var dl = el('dl');
          FIELDS.forEach(function (f) {
            if (!n[f[0]]) return;
            dl.appendChild(el('dt', null, f[1]));
            dl.appendChild(el('dd', null, n[f[0]]));
          });
          c.appendChild(dl);
          var row = el('div', 'row');
          var ed = el('button', null, '✏️ 修改');
          var del = el('button', null, '🗑️ 刪除');
          ed.type = del.type = 'button';
          ed.addEventListener('click', function () { fill(n); form.scrollIntoView({ behavior: 'smooth' }); });
          del.addEventListener('click', function () {
            if (!confirm('要刪除「' + (n.title || '這張卡片') + '」嗎？')) return;
            notes.splice(notes.indexOf(n), 1);
            save(state); renderFilters(); renderList();
          });
          row.appendChild(ed); row.appendChild(del);
          c.appendChild(row);
          wrap.appendChild(c);
        });
        listBox.appendChild(wrap);
      });
    }
    function fill(n) {
      editing = n;
      Array.prototype.forEach.call(form.elements, function (f) {
        if (f.name) f.value = n[f.name] != null ? n[f.name] : '';
      });
      document.getElementById('note-submit').textContent = '💾 儲存修改';
    }
    function clearForm() {
      var keepWho = form.elements.who.value;
      form.reset();
      form.elements.who.value = keepWho;
      editing = null;
      document.getElementById('note-submit').textContent = '💾 存成卡片';
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.elements.title.value.trim()) { form.elements.title.focus(); return; }
      var data = editing || { id: Date.now().toString(36) };
      Array.prototype.forEach.call(form.elements, function (f) {
        if (f.name) data[f.name] = f.value.trim();
      });
      if (!editing) notes.push(data);
      save(state);
      clearForm();
      renderFilters(); renderList();
      savedMsg.textContent = '已存好，卡片排進「' + ERAS[data.era].name + '」了 ↓';
      setTimeout(function () { savedMsg.textContent = ''; }, 4000);
    });
    document.getElementById('note-clear').addEventListener('click', clearForm);
    renderFilters(); renderList();
  }
})();
