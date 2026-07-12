(() => {
  "use strict";

  const root = document.documentElement.dataset.root || ".";
  const locale = document.documentElement.lang === "ja" ? "ja" : "en";
  const mePattern = /(丹治\s*和史|丹治和史|Kazufumi Tanji|Tanji, Kazufumi)/g;

  const escapeHtml = (value = "") => value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const underlineMe = value => escapeHtml(value).replace(mePattern, '<span class="me">$1</span>');
  const cleanBib = value => value
    .replace(/\{\{([^{}]+)\}\}/g, "$1").replace(/\{([^{}]+)\}/g, "$1")
    .replace(/---/g, "—").replace(/--/g, "–").trim();
  const formatBibAuthors = value => value.split(/\s+and\s+/).map(name => {
    const parts = name.split(",").map(part => part.trim());
    return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name.trim();
  }).join(", ");

  const conferenceEnglish = {
    "離れたイオン-共振器系でのエンタングルメント生成における励起パルス波形の最適化": "Optimizing the driving pulse waveform for entanglement generation between distant ion-cavity systems",
    "量子誤り訂正された遠隔量子ゲートの現実的な量子ノイズを考慮した数値シミュレーション": "Numerical simulation of quantum error corrected remote quantum gate on realistic noise model",
    "光子数基底の重ね合わせを用いた高次元ベル測定とエンタングルメントスワッピング": "High-Dimensional Bell Measurement and Entanglement Swapping with Photon-Number Basis",
    "ガウス分解を用いた非ガウス操作の効率的シミュレーション": "Fast Simulation of Non-Gaussian Operation with Gaussian Decomposition",
    "開放量子系の二時刻相関関数に対するGRAPE型最適制御法": "Gradient Ascent Pulse Engineering for Two-Time Correlations in Open Quantum Systems",
    "遠隔イオントラップ間のGottesman -Kitaev -Preskillもつれ生成": "Remote Gottesman-Kitaev-Preskill Entanglement Generation between Trapped Ions",
    "量子エラー訂正のための量子プロセストモグラフィーを用いた，Mølmer-Sørensenゲートにおけるノイズの数値解析": "Numerical Analysis of Noise in Mølmer-Sørensen Gates via Quantum Process Tomography for Quantum Error Correction"
  };
  const authorEnglish = {
    "丹治 和史": "Kazufumi Tanji", "丹治和史": "Kazufumi Tanji", "清水 耀": "Hikaru Shimizu", "武岡 正裕": "Masahiro Takeoka", "武岡正裕": "Masahiro Takeoka",
    "高橋 優樹": "Hiroki Takahashi", "Wojciech Roga": "Wojciech Roga", "鈴木 一樹": "Kazuki Suzuki", "鈴木 泰成": "Yasunari Suzuki", "徳永 裕己": "Hiroki Tokunaga",
    "Dot B. Pio": "Dot B. Pio", "桐生 翔平": "Shohei Kiryu", "Ulrik L.  Andersen": "Ulrik L. Andersen", "松添壱成": "Issei Matsuzoe", "ロガ ヴォイチェフ": "Wojciech Roga",
    "青木陽": "Haruki Aoki", "早瀬 潤子": "Junko Ishi-Hayase", "平井希空": "Noah Hirai", "宮西孝一郎": "Koichiro Miyanishi", "工藤　勇": "Isamu Kudo", "西尾　真": "Shin Nishio", "佐藤貴彦": "Takahiko Satoh", "高橋優樹": "Hiroki Takahashi"
  };
  function translateAuthors(value) {
    return value.split(/[，,]/).map(name => authorEnglish[name.trim()] || name.trim()).join(", ");
  }
  function ordinal(value) {
    const number = Number(value), mod100 = number % 100;
    const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[number % 10] || "th");
    return `${number}${suffix}`;
  }
  function dateKey(value) {
    const year = Number((value.match(/(20\d{2})/) || [0, 0])[1]);
    const names = { January:1, February:2, March:3, April:4, May:5, June:6, July:7, August:8, September:9, October:10, November:11, December:12 };
    const monthName = Object.keys(names).find(name => value.includes(name));
    const month = monthName ? names[monthName] : Number((value.match(/年\s*(\d{1,2})月/) || [0, 0])[1]);
    const day = Number((value.match(monthName ? new RegExp(`${monthName}\\s+(\\d{1,2})`) : /月\s*(\d{1,2})日?/) || [0, 0])[1]);
    return year * 10000 + month * 100 + day;
  }
  function formatConferenceDate(value) {
    const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let year, month, startDay, endMonth, endDay;
    const japanese = value.match(/(20\d{2})年\s*(\d{1,2})月\s*(\d{1,2})(?:日)?(?:[-–](\d{1,2})日?)?/);
    const englishMonth = monthNames.findIndex(name => name && value.includes(name));
    const english = englishMonth > 0 ? value.match(/(20\d{2})\s*,?\s*([A-Za-z]+)\s+(\d{1,2})(?:[-–](?:([A-Za-z]+)\s+)?(\d{1,2}))?/) : null;
    if (japanese) {
      [, year, month, startDay, endDay] = japanese;
    } else if (english) {
      [, year, , startDay, endMonth, endDay] = english;
      month = String(englishMonth);
    } else {
      return value;
    }
    return `${monthNames[Number(month)]} ${startDay}${endDay ? `–${endMonth ? `${endMonth} ` : ""}${endDay}` : ""}, ${year}`;
  }

  function parseBib(text) {
    const entries = [];
    let start = 0;
    while ((start = text.indexOf("@", start)) !== -1) {
      const brace = text.indexOf("{", start);
      if (brace < 0) break;
      const entryType = text.slice(start + 1, brace).trim().toLowerCase();
      let depth = 1, end = brace + 1;
      for (; end < text.length && depth; end++) {
        if (text[end] === "{") depth++;
        else if (text[end] === "}") depth--;
      }
      const block = text.slice(brace + 1, end - 1);
      const comma = block.indexOf(",");
      const fieldsText = block.slice(comma + 1);
      const fields = { entryType };
      let i = 0;
      while (i < fieldsText.length) {
        while (/[\s,]/.test(fieldsText[i] || "")) i++;
        const keyMatch = fieldsText.slice(i).match(/^([A-Za-z]+)\s*=\s*/);
        if (!keyMatch) break;
        const key = keyMatch[1].toLowerCase(); i += keyMatch[0].length;
        let value = "";
        if (fieldsText[i] === "{") {
          let d = 1; i++;
          while (i < fieldsText.length && d) {
            if (fieldsText[i] === "{") d++;
            if (fieldsText[i] === "}") d--;
            if (d) value += fieldsText[i];
            i++;
          }
        } else if (fieldsText[i] === '"') {
          i++;
          while (i < fieldsText.length && fieldsText[i] !== '"') value += fieldsText[i++];
          i++;
        } else {
          while (i < fieldsText.length && fieldsText[i] !== ",") value += fieldsText[i++];
        }
        fields[key] = cleanBib(value);
      }
      entries.push(fields); start = end;
    }
    return entries.sort((a, b) => Number(b.year) - Number(a.year));
  }

  function publicationHtml(item) {
    const venue = item.journal || item.booktitle || item.publisher || "";
    let identifier = "";
    if (item.journal) {
      identifier = `${item.journal}${item.volume ? ` ${item.volume}` : ""}${item.pages ? `, ${item.pages}` : ""} (${item.year})`;
    } else if (item.booktitle) {
      const proceedings = item.booktitle.replace(/\s*\(20\d{2}\),?\s*Paper\s+\S+\s*$/, "");
      identifier = `${proceedings}${item.volume ? ` ${item.volume}` : ""}${item.pages ? `, ${item.pages}` : ""} (${item.year})`;
    } else if (item.eprint) {
      identifier = `arXiv:${item.eprint} (${item.year})`;
    } else if (venue) {
      identifier = `${venue} (${item.year})`;
    }
    const links = [];
    if (item.doi) links.push(`<a href="https://doi.org/${encodeURIComponent(item.doi)}">DOI</a>`);
    if (item.eprint) links.push(`<a href="https://arxiv.org/abs/${encodeURIComponent(item.eprint)}">arXiv:${escapeHtml(item.eprint)}</a>`);
    return `<article class="entry"><div class="entry-year">${escapeHtml(item.year)}</div><div><h3>${escapeHtml(item.title)}</h3><p class="authors">${underlineMe(formatBibAuthors(item.author))}</p>${identifier ? `<p class="meta">${escapeHtml(identifier)}${item.note ? ` <span class="publication-note">${escapeHtml(item.note)}</span>` : ""}</p>` : ""}${links.length ? `<p class="entry-links">${links.join("")}</p>` : ""}</div></article>`;
  }

  function publicationGroupsHtml(items) {
    const papers = items.filter(item => item.entryType !== "inproceedings");
    const proceedings = items.filter(item => item.entryType === "inproceedings");
    const papersLabel = locale === "ja" ? "学術論文" : "Papers";
    const proceedingsLabel = locale === "ja" ? "会議論文（Proceedings）" : "Proceedings";
    return `<section class="publication-group" aria-labelledby="papers-heading"><h3 id="papers-heading" class="subsection-title">${papersLabel}</h3><div class="entries">${papers.map(publicationHtml).join("")}</div></section><section class="publication-group" aria-labelledby="proceedings-heading"><h3 id="proceedings-heading" class="subsection-title">${proceedingsLabel}</h3><div class="entries">${proceedings.map(publicationHtml).join("")}</div></section>`;
  }

  function parseConferences(text) {
    let category = "";
    const rows = [];
    for (const line of text.split(/\r?\n/)) {
      if (line.startsWith("# ")) category = line.slice(2).trim();
      if (!line.startsWith("|") || line.includes("|---") || line.includes("| Author |")) continue;
      const cells = line.split("|").slice(1, -1).map(cell => cell.trim());
      if (cells.length !== 6) continue;
      const year = (cells[4].match(/\b(20\d{2})\b/) || ["", ""])[1];
      rows.push({ category, author: cells[0], title: cells[1], conference: cells[2], place: cells[3], date: cells[4], type: cells[5], year });
    }
    return rows.sort((a, b) => dateKey(b.date) - dateKey(a.date));
  }

  function conferenceHtml(item) {
    const domestic = item.category === "Japanese conference";
    const title = locale === "en" && domestic ? conferenceEnglish[item.title] || item.title : item.title;
    const authors = locale === "en" && domestic ? translateAuthors(item.author) : item.author.replace(/[，,]\s*/g, ", ").replace(/\s{2,}/g, " ");
    const normalizedConference = item.conference.replace(/第(\d+)回量子情報技術研究会\s*[（(]\s*(QIT\d+)\s*[）)]/g, "第$1回量子情報技術研究会（$2）");
    const conference = locale === "en" && domestic ? item.conference.replace(/第(\d+)回量子情報技術研究会\s*[（(]\s*(QIT\d+)\s*[）)]/g, (_, number, short) => `The ${ordinal(number)} Quantum Information Technology Symposium (${short})`) : normalizedConference;
    const placeTranslations = { "慶應義塾大学，神奈川": "Keio University, Kanagawa, Japan", "サンポートホール高松，香川": "Sunport Hall Takamatsu, Kagawa, Japan", "静岡大学浜松キャンパス，静岡": "Shizuoka University Hamamatsu Campus, Shizuoka, Japan", "シンフォニアテクノロジー響ホール伊勢，三重": "Sinfonia Technology Hibiki Hall Ise, Mie, Japan" };
    const place = locale === "en" && domestic ? placeTranslations[item.place] || item.place : item.place;
    const type = locale === "ja" ? ({ Talk: "口頭発表", Poster: "ポスター発表" }[item.type] || item.type) : item.type;
    return `<article class="entry"><div class="entry-year">${escapeHtml(formatConferenceDate(item.date))}</div><div><h3>${escapeHtml(title)}</h3><p class="authors">${underlineMe(authors)}</p><p class="meta">${escapeHtml(conference)} · ${escapeHtml(place)} · ${escapeHtml(type)}</p></div></article>`;
  }

  function conferenceGroupsHtml(items) {
    const nonPeerReviewed = items.filter(item => /\bQIT\d+\b/i.test(item.conference));
    const peerReviewed = items.filter(item => !/\bQIT\d+\b/i.test(item.conference));
    const peerReviewedLabel = locale === "ja" ? "査読あり" : "Peer-reviewed";
    const nonPeerReviewedLabel = locale === "ja" ? "査読なし" : "Non-peer-reviewed";
    return `<section class="conference-group" aria-labelledby="peer-reviewed-heading"><h3 id="peer-reviewed-heading" class="subsection-title">${peerReviewedLabel}</h3><div class="entries">${peerReviewed.map(conferenceHtml).join("")}</div></section><section class="conference-group" aria-labelledby="non-peer-reviewed-heading"><h3 id="non-peer-reviewed-heading" class="subsection-title">${nonPeerReviewedLabel}</h3><div class="entries">${nonPeerReviewed.map(conferenceHtml).join("")}</div></section>`;
  }

  async function loadData(path, targetId, parser, renderer, renderWholeList = false) {
    const target = document.getElementById(targetId);
    if (!target) return;
    try {
      const response = await fetch(`${root}/data/${path}`);
      if (!response.ok) throw new Error(`${response.status}`);
      const items = parser(await response.text());
      target.innerHTML = renderWholeList ? renderer(items) : items.map(renderer).join("");
    } catch (error) {
      target.innerHTML = `<p class="notice">${locale === "ja" ? "データを読み込めませんでした。Live Previewなどのローカルサーバーで開いてください。" : "The data could not be loaded. Open this site through a local server such as Live Preview."}</p>`;
      console.error(error);
    }
  }

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", event => {
      if (event.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }
  document.querySelectorAll("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });
  loadData("MyPapers.bib", "publications-list", parseBib, publicationGroupsHtml, true);
  loadData("Conference.md", "presentations-list", parseConferences, conferenceGroupsHtml, true);
})();
