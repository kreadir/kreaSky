/**
 * patronSinemacx - Built from src/patronSinemacx/
 * Generated: 2026-06-18T23:04:13.147Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/patronSinemacx/index.js
var patronSinemacx_exports = {};
__export(patronSinemacx_exports, {
  getStreams: () => getStreams
});
module.exports = __toCommonJS(patronSinemacx_exports);

// src/patronSinemacx/http.js
var PROVIDER_TAG = "[Sinemacx]";
var BASE_URL = "https://www.sinema.gg";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8"
};
function fixUrl(url, baseUrl = BASE_URL) {
  if (!url)
    return "";
  if (url.startsWith("http")) {
    return url;
  } else if (url.startsWith("//")) {
    return `https:${url}`;
  } else {
    const cleanBase = baseUrl.replace(/\/$/, "");
    const cleanUrl = url.replace(/^\//, "");
    return `${cleanBase}/${cleanUrl}`;
  }
}
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    try {
      const response = yield fetch(url, __spreadProps(__spreadValues({}, options), {
        headers: __spreadValues(__spreadValues({}, HEADERS), options.headers)
      }));
      if (!response.ok) {
        if (response.status === 404)
          return "";
        throw new Error(`HTTP ${response.status}`);
      }
      return yield response.text();
    } catch (e) {
      console.error(`${PROVIDER_TAG} fetchText hatas\u0131 (${url}): ${e.message}`);
      return "";
    }
  });
}

// src/patronSinemacx/extractor.js
function resolveSinemacx(movieUrl) {
  return __async(this, null, function* () {
    const streams = [];
    console.log(`${PROVIDER_TAG} Film sayfas\u0131 inceleniyor: ${movieUrl}`);
    let text = yield fetchText(movieUrl, { headers: { "Referer": BASE_URL } });
    if (!text)
      return streams;
    let iframeSrcs = [];
    let iframeRegex = /<iframe[^>]*data-vsrc=["']([^"']+)["'][^>]*>/ig;
    let match;
    while ((match = iframeRegex.exec(text)) !== null) {
      if (match[1].trim())
        iframeSrcs.push(match[1].trim());
    }
    const isOnlyTrailer = iframeSrcs.length === 0 || iframeSrcs.every((src) => {
      const s = src.toLowerCase();
      return s.includes("youtube") || s.includes("fragman") || s.includes("trailer");
    });
    if (isOnlyTrailer) {
      const altUrl = movieUrl.endsWith("/") ? `${movieUrl}2/` : `${movieUrl}/2/`;
      console.log(`${PROVIDER_TAG} Fragman \u015F\xFCphesi, alternatif sayfa deneniyor: ${altUrl}`);
      const altText = yield fetchText(altUrl, { headers: { "Referer": BASE_URL } });
      if (altText) {
        let altSrcs = [];
        let m;
        iframeRegex.lastIndex = 0;
        while ((m = iframeRegex.exec(altText)) !== null) {
          if (m[1].trim())
            altSrcs.push(m[1].trim());
        }
        if (altSrcs.length > 0) {
          iframeSrcs = altSrcs;
        }
      }
    }
    if (iframeSrcs.length === 0) {
      console.log(`${PROVIDER_TAG} Ge\xE7erli iframe bulunamad\u0131.`);
      return streams;
    }
    let rawIframe = iframeSrcs[0];
    const imgParamPos = rawIframe.indexOf("?img=");
    if (imgParamPos !== -1) {
      rawIframe = rawIframe.substring(0, imgParamPos);
    }
    let iframeUrl = fixUrl(rawIframe, BASE_URL);
    iframeUrl = iframeUrl.replace(/^https?:\/\/[^\/]+/i, (match2) => match2.toLowerCase());
    console.log(`${PROVIDER_TAG} \u0130frame bulundu: ${iframeUrl}`);
    const iframeRes = yield fetchText(iframeUrl, { headers: { "Referer": BASE_URL } });
    if (!iframeRes)
      return streams;
    let subtitles = [];
    const subMatch = iframeRes.match(/playerjsSubtitle\s*=\s*["']([^"']+)["']/);
    if (subMatch) {
      const subSection = subMatch[1].replace(/\\\//g, "/");
      const subLinkRegex = /\[(.*?)\](https?:\/\/[^\s"',]+)/g;
      let sMatch;
      while ((sMatch = subLinkRegex.exec(subSection)) !== null) {
        let lang = sMatch[1].toLowerCase() || "tr";
        let sUrl = sMatch[2];
        if (!sUrl.includes(".vtt")) {
          sUrl += "#sub.vtt";
        }
        subtitles.push({
          label: lang,
          file: sUrl
        });
        console.log(`${PROVIDER_TAG} Altyaz\u0131 bulundu: [${lang}] ${sUrl}`);
      }
    }
    let sourceName = "Sinemacx";
    if (iframeUrl.toLowerCase().includes("player.filmizle.in")) {
      const domainMatch = iframeUrl.match(/https?:\/\/([^\/]+)/);
      if (domainMatch) {
        const baseDomain = domainMatch[1].toLowerCase();
        const cleanPath = iframeUrl.replace(/\/$/, "");
        const parts = cleanPath.split("/");
        const videoId = parts[parts.length - 1];
        const apiUrl = `https://${baseDomain}/player/index.php?data=${videoId}&do=getVideo`;
        console.log(`${PROVIDER_TAG} Stream API iste\u011Fi at\u0131l\u0131yor: ${apiUrl}`);
        try {
          const apiResponse = yield fetch(apiUrl, {
            method: "POST",
            headers: __spreadProps(__spreadValues({}, HEADERS), {
              "Content-Type": "application/x-www-form-urlencoded",
              "X-Requested-With": "XMLHttpRequest",
              "Referer": iframeUrl
            })
          });
          if (apiResponse.ok) {
            const jsonRes = yield apiResponse.json();
            if (jsonRes && jsonRes.securedLink) {
              streams.push({
                url: jsonRes.securedLink,
                quality: "Auto",
                name: sourceName,
                headers: { "Referer": iframeUrl },
                subtitles: subtitles.length > 0 ? subtitles : void 0
              });
              console.log(`${PROVIDER_TAG} securedLink bulundu.`);
            } else {
              console.warn(`${PROVIDER_TAG} JSON cevab\u0131 ge\xE7erli de\u011Fil:`, jsonRes);
            }
          } else {
            console.warn(`${PROVIDER_TAG} API ba\u015Far\u0131s\u0131z: HTTP ${apiResponse.status} ${yield apiResponse.text()}`);
          }
        } catch (err) {
          console.error(`${PROVIDER_TAG} API bypass hatas\u0131: ${err.message}`);
        }
      }
    } else {
      if (iframeUrl.includes(".m3u8") || iframeUrl.includes(".mp4")) {
        streams.push({
          url: iframeUrl,
          quality: "Auto",
          name: sourceName,
          headers: { "Referer": movieUrl },
          subtitles: subtitles.length > 0 ? subtitles : void 0
        });
      }
    }
    return streams;
  });
}

// src/patronSinemacx/tmdb.js
var TMDB_API_KEY = "500330721680edb6d5f7f12ba7cd9023";
var PROVIDER_TAG2 = "[Sinemacx]";
function decodeHtml(text) {
  return (text || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#039;/g, "'");
}
function getTmdbTitleFromHtml(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" ? "movie" : "tv";
      const url = `https://www.themoviedb.org/${type}/${tmdbId}?language=tr-TR`;
      const response = yield fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const html = yield response.text();
      let trTitle = "";
      const ogMatch = html.match(/<meta property="og:title" content="([^"]+)">/i);
      if (ogMatch) {
        trTitle = decodeHtml(ogMatch[1]).split("(")[0].trim();
      } else {
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          trTitle = decodeHtml(titleMatch[1]).split("(")[0].split("\u2014")[0].trim();
        }
      }
      if (!trTitle)
        return null;
      let origTitle = trTitle;
      const origMatch = html.match(/<h3 class="caption" dir="auto">([^<]+)<\/h3>/i) || html.match(/<strong class="original_title">([^<]+)<\/strong>/i);
      if (origMatch) {
        const cleaned = decodeHtml(origMatch[1]).replace("Orijinal Ba\u015Fl\u0131k", "").replace("Original Title", "").replace("Orijinal Ad\u0131", "").replace("Orijinal Adi", "").trim();
        if (cleaned.length > 0)
          origTitle = cleaned;
      }
      const shortTitle = trTitle.split(" ").slice(0, 2).join(" ");
      const yearMatch = html.match(/\((\d{4})\)/);
      const year = yearMatch ? parseInt(yearMatch[1]) : null;
      console.log(`${PROVIDER_TAG2} [HTML] Ba\u015Fl\u0131k: ${trTitle} | Orijinal: ${origTitle} | Y\u0131l: ${year}`);
      return { trTitle, origTitle, shortTitle, year };
    } catch (e) {
      console.warn(`${PROVIDER_TAG2} [HTML] Scraping ba\u015Far\u0131s\u0131z: ${e.message}`);
      return null;
    }
  });
}
function getTmdbTitleFromApi(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" ? "movie" : "tv";
      const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=tr-TR`;
      const response = yield fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = yield response.json();
      const trTitle = data.title || data.name || "";
      const origTitle = data.original_title || data.original_name || trTitle;
      const shortTitle = trTitle.split(" ").slice(0, 2).join(" ");
      const dateStr = data.release_date || data.first_air_date || "";
      const year = dateStr ? parseInt(dateStr.substring(0, 4)) : null;
      if (!trTitle)
        return null;
      console.log(`${PROVIDER_TAG2} [API] Ba\u015Fl\u0131k: ${trTitle} | Orijinal: ${origTitle} | Y\u0131l: ${year}`);
      return { trTitle, origTitle, shortTitle, year };
    } catch (e) {
      console.warn(`${PROVIDER_TAG2} [API] REST API ba\u015Far\u0131s\u0131z: ${e.message}`);
      return null;
    }
  });
}
function getTmdbTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const htmlResult = yield getTmdbTitleFromHtml(tmdbId, mediaType);
    if (htmlResult)
      return htmlResult;
    console.log(`${PROVIDER_TAG2} HTML scraping ba\u015Far\u0131s\u0131z, TMDB REST API deneniyor...`);
    const apiResult = yield getTmdbTitleFromApi(tmdbId, mediaType);
    if (apiResult)
      return apiResult;
    console.error(`${PROVIDER_TAG2} Her iki y\xF6ntem de ba\u015Far\u0131s\u0131z: TMDB ID=${tmdbId}`);
    return { trTitle: "", origTitle: "", shortTitle: "", year: null };
  });
}

// src/patronSinemacx/index.js
function getStreams(tmdbId, type, season, episode) {
  return __async(this, null, function* () {
    console.log(`${PROVIDER_TAG} getStreams: ${type} | TMDB: ${tmdbId} | S${season}E${episode}`);
    if (type !== "movie" && type !== "tv") {
      console.log(`${PROVIDER_TAG} Sadece film ve dizi aramalar\u0131 desteklenmektedir.`);
      return [];
    }
    try {
      const { trTitle, origTitle, shortTitle, year } = yield getTmdbTitle(tmdbId, type);
      const queries = [];
      if (trTitle)
        queries.push(trTitle);
      if (origTitle && origTitle !== trTitle)
        queries.push(origTitle);
      if (shortTitle && shortTitle !== trTitle && shortTitle !== origTitle)
        queries.push(shortTitle);
      let matchUrl = null;
      for (const query of queries) {
        console.log(`${PROVIDER_TAG} Aran\u0131yor: "${query}"`);
        const searchUrl = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
        const html = yield fetchText(searchUrl);
        if (!html)
          continue;
        const itemRegex = /class=["']yanac["'][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/ig;
        let m;
        let matchCount = 0;
        while ((m = itemRegex.exec(html)) !== null) {
          matchCount++;
          const href = m[1];
          let titleStr = m[2];
          titleStr = titleStr.replace(/&#8217;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
          const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "");
          const rTitle = normalize(titleStr);
          const cleanTr = normalize(trTitle);
          const cleanOrig = normalize(origTitle);
          const cleanQ = normalize(query);
          const titleMatches = rTitle === cleanTr || rTitle === cleanOrig || rTitle === cleanQ || rTitle === cleanTr + "1" || rTitle === cleanOrig + "1" || rTitle === cleanQ + "1";
          const yearMatches = !year || href.includes(year) || titleStr.includes(year);
          const partialMatch = rTitle.includes(cleanQ) || cleanQ.includes(rTitle);
          if (titleMatches || partialMatch && yearMatches) {
            console.log(`${PROVIDER_TAG} E\u015Fle\u015Fme: "${titleStr}" -> ${href}`);
            matchUrl = fixUrl(href, BASE_URL);
            break;
          }
        }
        if (matchUrl)
          break;
      }
      if (!matchUrl) {
        console.log(`${PROVIDER_TAG} \u0130\xE7erik bulunamad\u0131.`);
        return [];
      }
      return yield resolveSinemacx(matchUrl);
    } catch (e) {
      console.error(`${PROVIDER_TAG} Hata: ${e.message}`);
      return [];
    }
  });
}
