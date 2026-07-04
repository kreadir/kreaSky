/**
 * patronSinewix - Built from src/patronSinewix/
 * Updated with Live Authorization Headers & Token
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: true, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => { try { step(generator.next(value)); } catch (e) { reject(e); } };
    var rejected = (value) => { try { step(generator.throw(value)); } catch (e) { reject(e); } };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/patronSinewix/index.js
var patronSinewix_exports = {};
__export(patronSinewix_exports, {
  getMainPage: () => getMainPage,
  getStreams: () => getStreams,
  search: () => search
});
module.exports = __toCommonJS(patronSinewix_exports);

// src/patronSinewix/http.js - YAKALANAN CANLI VERİLERLE GÜNCELLENDİ
var BASE_URL = "https://ydfvfdizipanel.ru";
var API_TOKEN = "EuXs1Y5oXTrDpGte3E2dNDIu82LLjaoCd6om"; // Yeni Canlı Sabit Token
var HEADERS = {
  "User-Agent": "EasyPlex (Android 9; SM-S9160; samsung star2qltechn; en)",
  "Accept": "application/json",
  "token": "EuXs1Y5oXTrDpGte3E2dNDIu82LLjaoCd6om",
  "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiMjdhNjgzNjA2MTJhOGE5MjgzZWQ2NWQwYzBjZTJhNzUyMzQyZmVmZmMwODM5M2RjY2FlNmIxYmZlYzk0ZDMzY2FlNzhlNDg4NjJkZTIxNWYiLCJpYXQiOjE3ODIzMDA2NjYuNDQ1NTYyLCJuYmYiOjE3ODIzMDA2NjYuNDQ1NTY4LCJleHAiOjE4MTM4MzY2NjYuNDQxNTE3LCJzdWIiOiIyNDgxMjE0Iiwic2NvcGVzIjpbXX0.MS5aUmHffv_cp9Dkue-1otieRwUWVakl0jAmJeK7AvzClHM8LqpYYxGsiPfgALTdIgxId0HNrDgUTLHV_F3IpTiPJvICoVGe6sxiLOdIkqLMcylIEVZyAD8B2fZSEM8jWUEfzp4TFiOCrSORL19_e2ta9re16hu7Z-xJ8PpkKHRUVZvZXn"
};

function fetchJSON(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const response = yield fetch(url, __spreadProps(__spreadValues({}, options), {
      headers: __spreadValues(__spreadValues({}, HEADERS), options.headers || {})
    }));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} -> ${url}`);
    }
    return yield response.json();
  });
}

// src/patronSinewix/tmdb.js
var import_cheerio_without_node_native = __toESM(require("cheerio-without-node-native"));
var TMDB_SCRAPE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
};
function decodeHtml(text) {
  return (text || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#039;/g, "'");
}
function getTmdbTitle(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" ? "movie" : "tv";
      const scrapeUrl = `https://www.themoviedb.org/${type}/${tmdbId}?language=tr-TR`;
      console.log(`[SineWix] Scraping TMDB: ${scrapeUrl}`);
      const response = yield fetch(scrapeUrl, { headers: TMDB_SCRAPE_HEADERS });
      let trTitle = "";
      let origTitle = "";
      let year = "";
      if (response.ok) {
        const html = yield response.text();
        const ogMatch = html.match(/<meta property="og:title" content="([^"]+)">/i);
        if (ogMatch) {
          trTitle = decodeHtml(ogMatch[1]).split("(")[0].trim();
        }
        const origMatch = html.match(/<h3 class="caption" dir="auto">([^<]+)<\/h3>/i) || html.match(/<strong class="original_title">([^<]+)<\/strong>/i);
        if (origMatch) {
          origTitle = decodeHtml(origMatch[1]).trim();
        }
        const yearMatch = html.match(/\((\d{4})\)/);
        if (yearMatch) {
          year = yearMatch[1];
        }
        if (!origTitle) {
          const $ = import_cheerio_without_node_native.default.load(html);
          $("section.facts p").each((_, el) => {
            const text = $(el).text();
            if (text.includes("Orijinal Başlık") || text.includes("Original Title")) {
              origTitle = text.replace("Orijinal Başlık", "").replace("Original Title", "").trim();
            }
          });
        }
      }
      if (!trTitle || !origTitle) {
        console.log(`[SineWix] TMDB Scrape failed or partial, using API fallback...`);
        const apiKey = "500330721680edb6d5f7f12ba7cd9023";
        const apiUrl = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}&language=tr-TR`;
        const apiRes = yield fetch(apiUrl);
        if (apiRes.ok) {
          const data = yield apiRes.json();
          trTitle = data.title || data.name || trTitle;
          origTitle = data.original_title || data.original_name || origTitle;
          year = (data.release_date || data.first_air_date || year).substring(0, 4);
        }
      }
      let shortTitle = "";
      if (origTitle && (origTitle.includes(":") || origTitle.toLowerCase().includes(" and "))) {
        shortTitle = origTitle.split(":")[0].split(/ and /i)[0].trim();
      }
      return {
        trTitle: trTitle || origTitle,
        origTitle: origTitle || trTitle,
        shortTitle,
        year
      };
    } catch (error) {
      console.error(`[SineWix] TMDB title fetch error: ${error.message}`);
      return { trTitle: "", origTitle: "", shortTitle: "", year: "" };
    }
  });
}

// src/patronSinewix/extractor.js
var PROVIDER_NAME = "SineWix";
function normalizeTitle(value) {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function searchContent(query) {
  return __async(this, null, function* () {
    const url = `${BASE_URL}/public/api/search/${encodeURIComponent(query)}/${API_TOKEN}`;
    const data = yield fetchJSON(url);
    return data.search || [];
  });
}
var MediafireExtractor = class {
  static canHandleUrl(url) {
    return url.includes("mediafire.com");
  }
  static extract(url, referer = null) {
    return __async(this, null, function* () {
      try {
        console.log(`[Mediafire] Extracting: ${url}`);
        const headers = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        };
        if (referer)
          headers.Referer = referer;
        const response = yield fetch(url, { headers });
        const html = yield response.text();
        const downloadMatch = html.match(/id="downloadButton"\s+href="([^"]+)"/i) || html.match(/href="([^"]+)"\s+id="downloadButton"/i);
        if (downloadMatch) {
          const videoUrl = downloadMatch[1];
          console.log(`[Mediafire] Extracted direct link: ${videoUrl}`);
          const labelMatch = html.match(/class="dl-btn-label"[^>]*>([^<]+)</i);
          let quality = "Auto";
          if (labelMatch) {
            const label = labelMatch[1].trim();
            const qMatch = label.match(/(\d{3,4})p/i);
            if (qMatch)
              quality = qMatch[1] + "p";
          }
          return {
            url: videoUrl,
            quality,
            headers: {
              "Referer": url,
              "User-Agent": headers["User-Agent"]
            }
          };
        }
        return null;
      } catch (e) {
        console.error(`[Mediafire] Extract error: ${e.message}`);
        return null;
      }
    });
  }
};
__publicField(MediafireExtractor, "name", "Mediafire");

function buildStream(video, sourceName) {
  return __async(this, null, function* () {
    let url = video.link || video.youtubelink || video.embed;
    if (!url)
      return null;
    if (MediafireExtractor.canHandleUrl(url)) {
      const extracted = yield MediafireExtractor.extract(url);
      if (extracted) {
        return {
          name: PROVIDER_NAME,
          title: `${video.server || "Mediafire"} - ${video.lang || "TR"}`,
          url: extracted.url,
          quality: extracted.quality || "Auto",
          headers: extracted.headers || HEADERS
        };
      }
    }
    let finalUrl = url;
    if (!/\.(m3u8|mp4|mkv)/i.test(finalUrl)) {
      finalUrl += finalUrl.includes("#") ? "" : "#.mkv";
    }
    return {
      name: PROVIDER_NAME,
      title: `${video.server || "Server"} - ${video.lang || "TR"}`,
      url: finalUrl,
      quality: "Auto",
      headers: HEADERS
    };
  });
}

function extractStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const { trTitle, origTitle, shortTitle } = yield getTmdbTitle(tmdbId, mediaType);
      console.log(`[${PROVIDER_NAME}] TMDB: ${tmdbId} | TR: ${trTitle} | ORIG: ${origTitle}`);
      if (!trTitle && !origTitle)
        return [];
      let results = yield searchContent(trTitle);
      console.log(`[${PROVIDER_NAME}] Search "${trTitle}" found ${results.length} results`);
      if (!results.length && origTitle && origTitle !== trTitle) {
        results = yield searchContent(origTitle);
        console.log(`[${PROVIDER_NAME}] Search "${origTitle}" found ${results.length} results`);
      }
      if (!results.length && shortTitle) {
        results = yield searchContent(shortTitle);
        console.log(`[${PROVIDER_NAME}] Search "${shortTitle}" found ${results.length} results`);
      }
      const q = normalizeTitle(trTitle || origTitle);
      const qOrig = normalizeTitle(origTitle);
      const qShort = normalizeTitle(shortTitle);
      let match = results.find((item) => {
        const itemTitle = normalizeTitle(item.name || item.title);
        const itemOrig = normalizeTitle(item.original_name);
        const typeMatch = mediaType === "movie" ? item.type === "movie" : item.type === "serie";
        return typeMatch && (itemTitle === q || itemTitle === qOrig || itemTitle === qShort || itemOrig === q || itemOrig === qOrig);
      });
      if (!match) {
        console.warn(`[${PROVIDER_NAME}] Icerik eslesmedi: ${trTitle} / ${origTitle}`);
        return [];
      }
      console.log(`[${PROVIDER_NAME}] Matched: ${match.name || match.title} (ID: ${match.id})`);
      const id = match.id;
      const isMovie = mediaType === "movie";
      const typePath = isMovie ? "media" : "series";
      const method = isMovie ? "detail" : "show";
      const detailUrl = `${BASE_URL}/public/api/${typePath}/${method}/${id}/${API_TOKEN}`;
      const detailData = yield fetchJSON(detailUrl);
      const streams = [];
      if (isMovie) {
        const videos = detailData.videos || [];
        for (const v of videos) {
          const s = yield buildStream(v, PROVIDER_NAME);
          if (s)
            streams.push(s);
        }
      } else {
        const seasons = detailData.seasons || [];
        const targetSeason = seasons.find((s) => s.season_number == season);
        if (targetSeason) {
          const episodes = targetSeason.episodes || [];
          const targetEpisode = episodes.find((e) => e.episode_number == episode);
          if (targetEpisode) {
            const videos = targetEpisode.videos || [];
            for (const v of videos) {
              const s = yield buildStream(v, PROVIDER_NAME);
              if (s)
                streams.push(s);
            }
          }
        }
      }
      return streams;
    } catch (error) {
      console.error(`[${PROVIDER_NAME}] Extractor error: ${error.message}`);
      return [];
    }
  });
}

// src/patronSinewix/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[SineWix] Request: ${mediaType} ${tmdbId} S${season}E${episode}`);
      return yield extractStreams(tmdbId, mediaType, season, episode);
    } catch (error) {
      console.error(`[SineWix] Error: ${error.message}`);
      return [];
    }
  });
}
function search(query) {
  return __async(this, null, function* () {
    try {
      const results = yield searchContent(query);
      return results.map((item) => ({
        id: item.id.toString(),
        title: item.name || item.title,
        type: item.type === "serie" ? "tv" : "movie",
        poster: item.poster_path,
        year: item.release_date ? item.release_date.split("-")[0] : ""
      }));
    } catch (error) {
      console.error(`[SineWix] Search Error: ${error.message}`);
      return [];
    }
  });
}
function getMainPage() {
  return __async(this, null, function* () {
    try {
      const categories = [
        { name: "Popüler Filmler", url: `${BASE_URL}/public/api/movies/popular/${API_TOKEN}` },
        { name: "Yeni Filmler", url: `${BASE_URL}/public/api/movies/latest/${API_TOKEN}` },
        { name: "Popüler Diziler", url: `${BASE_URL}/public/api/series/popular/${API_TOKEN}` },
        { name: "Yeni Diziler", url: `${BASE_URL}/public/api/series/latest/${API_TOKEN}` }
      ];
      const pages = yield Promise.all(categories.map((cat) => __async(this, null, function* () {
        try {
          const data = yield fetchJSON(cat.url);
          const items = (data.movies || data.series || []).map((item) => ({
            id: item.id.toString(),
            title: item.name || item.title,
            type: item.type === "serie" ? "tv" : "movie",
            poster: item.poster_path,
            year: item.release_date ? item.release_date.split("-")[0] : ""
          }));
          return { name: cat.name, items };
        } catch (e) {
          return { name: cat.name, items: [] };
        }
      })));
      return pages;
    } catch (error) {
      console.error(`[SineWix] Main Page Error: ${error.message}`);
      return [];
    }
  });
}
