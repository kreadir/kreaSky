/**
 * patronDiziyou - Direct URL Access (No Search Needed)
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

var patronDiziyou_exports = {};
__export(patronDiziyou_exports, { getStreams: () => getStreams });
module.exports = __toCommonJS(patronDiziyou_exports);

var PROVIDER_TAG = "[Diziyou]";
var FALLBACK_URL = "https://www.diziyou.one";
var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8"
};

function getDiziyouBaseUrl() {
  return __async(this, null, function* () {
    return FALLBACK_URL; // Hızlı test için direkt fallback kullanıyoruz
  });
}

function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    try {
      const response = yield fetch(url, __spreadProps(__spreadValues({}, options), {
        headers: __spreadValues(__spreadValues({}, HEADERS), options.headers)
      }));
      if (!response.ok) return "";
      return yield response.text();
    } catch (e) {
      return "";
    }
  });
}

var TMDB_API_KEY = "500330721680edb6d5f7f12ba7cd9023";
function getTmdbTitleFromApi(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const type = mediaType === "movie" ? "movie" : "tv";
      const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=tr-TR`;
      const response = yield fetch(url);
      if (!response.ok) return null;
      const data = yield response.json();
      return {
        trTitle: data.title || data.name || "",
        origTitle: data.original_title || data.original_name || ""
      };
    } catch (e) {
      return null;
    }
  });
}

// Yeni Eklenti: TMDB ismini Diziyou URL formatına çevirme
function createSlug(title) {
  return (title || "").toLowerCase()
    .replace(/[^a-z0-9ğüşıöç\s-]/g, "") // özel karakterleri sil
    .trim()
    .replace(/\s+/g, "-"); // boşlukları tireye çevir
}

function resolveDiziyou(epUrl, baseUrl) {
  return __async(this, null, function* () {
    try {
      console.log(`${PROVIDER_TAG} Kaynak aranıyor: ${epUrl}`);
      const html = yield fetchText(epUrl, { headers: { "Referer": baseUrl } });
      if (!html) return [];
      
      const idMatch = html.match(/player\/(\d{4,8})\.html/i);
      if (!idMatch) return [];
      
      const v_id = idMatch[1];
      let hasDub = html.match(/id=["']turkceDublaj["']/i) ? true : false;
      let hasSub = html.match(/id=["']turkceAltyazili["']/i) ? true : false;
      if (!hasDub && !hasSub) hasSub = true;

      const sources = [];
      const domains = ["storage.diziyou.one", "cast3.dystream.com", "cdn.diziyou.one"];
      const filenames = ["play.m3u8", "720p.m3u8", "1080p.m3u8"];

      for (const d of domains) {
        for (const f of filenames) {
          let qualityLabel = f === "play.m3u8" ? "Auto" : f.replace(".m3u8", "");
          if (hasSub) {
            sources.push({
              url: `https://${d}/episodes/${v_id}/${f}`,
              quality: qualityLabel,
              language: "tr",
              name: `Diziyou Altyazılı (${d})`,
              headers: { "Referer": `${baseUrl}/` }
            });
          }
          if (hasDub) {
            sources.push({
              url: `https://${d}/episodes/${v_id}_tr/${f}`,
              quality: qualityLabel,
              language: "tr",
              name: `Diziyou Dublaj (${d})`,
              headers: { "Referer": `${baseUrl}/` }
            });
          }
        }
      }
      return sources;
    } catch (e) {
      return [];
    }
  });
}

function getStreams(tmdbId, type, season, episode) {
  return __async(this, null, function* () {
    try {
      const tmdbData = yield getTmdbTitleFromApi(tmdbId, type);
      if (!tmdbData) return [];
      
      const baseUrl = yield getDiziyouBaseUrl();
      
      // Arama motorunu atlayıp direkt link üretiyoruz!
      // İngilizce isme öncelik veriyoruz (Diziyou genelde orijinal ad kullanır)
      const titleToUse = tmdbData.origTitle || tmdbData.trTitle;
      const slug = createSlug(titleToUse);
      
      let targetUrl;
      if (type === "tv") {
        targetUrl = `${baseUrl}/${slug}-${season}-sezon-${episode}-bolum/`;
      } else {
        targetUrl = `${baseUrl}/${slug}-izle/`; 
      }
      
      console.log(`${PROVIDER_TAG} Doğrudan URL Deneniyor: ${targetUrl}`);
      const sources = yield resolveDiziyou(targetUrl, baseUrl);
      return sources;

    } catch (err) {
      return [];
    }
  });
}
