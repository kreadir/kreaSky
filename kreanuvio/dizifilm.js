var TMDB_API_KEY = "4ef0d7355d9ffb5151e987764708ce96";
var API_BASE_URL = "https://kekikstream.onrcvndev.com.tr/api/v1";
var UPSTREAM_PLUGIN = "DiziFilm";
var PROVIDER_ID = "dizifilm";
var PROVIDER_NAME = "CVN-DiziFilm";
var SUPPORTED_TYPES = ["movie","tv"];

function supportsType(mediaType) {
  return SUPPORTED_TYPES.indexOf(mediaType === "movie" ? "movie" : "tv") >= 0;
}

function apiUrl(path, params) {
  var query = [];
  Object.keys(params || {}).forEach(function(key) {
    query.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(params[key])));
  });
  return API_BASE_URL + path + (query.length ? "?" + query.join("&") : "");
}

function encodedUrl(value) {
  var text = String(value || "");
  return /^https?%3a/i.test(text) ? text : encodeURIComponent(text);
}

function fetchJson(url) {
  return fetch(url, { method: "GET", headers: { Accept: "application/json" } }).then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.text();
  }).then(function(text) {
    return text ? JSON.parse(text) : {};
  });
}

function getResult(payload) {
  if (!payload) return null;
  if (typeof payload.result !== "undefined") return payload.result;
  if (typeof payload.results !== "undefined") return payload.results;
  return payload;
}

function unique(values) {
  var seen = {};
  var result = [];
  (values || []).forEach(function(value) {
    var text = String(value || "").trim();
    if (text && !seen[text]) {
      seen[text] = true;
      result.push(text);
    }
  });
  return result;
}

function normalize(value) {
  return String(value || "").replace(/\u0130/g, "I").replace(/\u0131/g, "i").replace(/\u015e/g, "S").replace(/\u015f/g, "s").replace(/\u011e/g, "G").replace(/\u011f/g, "g").replace(/\u00dc/g, "U").replace(/\u00fc/g, "u").replace(/\u00d6/g, "O").replace(/\u00f6/g, "o").replace(/\u00c7/g, "C").replace(/\u00e7/g, "c").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function getMetadata(tmdbId, mediaType) {
  var type = mediaType === "movie" ? "movie" : "tv";
  var languages = ["tr-TR", "en-US", "ja-JP", "ko-KR", "zh-CN"];
  var titles = [];
  var year = null;
  var chain = Promise.resolve();
  languages.forEach(function(language) {
    chain = chain.then(function() {
      var url = "https://api.themoviedb.org/3/" + type + "/" + encodeURIComponent(String(tmdbId)) + "?language=" + language + "&api_key=" + TMDB_API_KEY;
      return fetchJson(url).then(function(data) {
        if (data.title || data.name) titles.push(data.title || data.name);
        if (data.original_title || data.original_name) titles.push(data.original_title || data.original_name);
        if (!year) year = Number(String(data.release_date || data.first_air_date || "").slice(0, 4)) || null;
      }).catch(function() {});
    });
  });
  return chain.then(function() {
    titles = unique(titles);
    if (!titles.length) throw new Error("TMDB metadata not found");
    return { tmdbId: String(tmdbId), titles: titles, displayTitle: titles[0], year: year };
  });
}

function scoreResult(resultTitle, metadata) {
  var text = normalize(resultTitle);
  var best = 0;
  (metadata.titles || []).forEach(function(title) {
    var wanted = normalize(title);
    if (!wanted || !text) return;
    if (text === wanted) best = Math.max(best, 100);
    else if (text.indexOf(wanted) >= 0 || wanted.indexOf(text) >= 0) best = Math.max(best, 85);
    else if (text.split(" ")[0] === wanted.split(" ")[0]) best = Math.max(best, 55);
  });
  if (metadata.year && String(resultTitle || "").indexOf(String(metadata.year)) >= 0) best += 10;
  return best;
}

function searchTitle(title) {
  return fetchJson(apiUrl("/search", { plugin: UPSTREAM_PLUGIN, query: title })).then(function(payload) {
    var result = getResult(payload);
    return Array.isArray(result) ? result : [];
  });
}

function collectCandidates(metadata) {
  var all = [];
  var chain = Promise.resolve();
  metadata.titles.forEach(function(title) {
    chain = chain.then(function() {
      return searchTitle(title).then(function(results) {
        results.forEach(function(item) {
          if (item && item.url) all.push({ title: item.title || title, url: item.url, score: scoreResult(item.title || title, metadata) });
        });
      }).catch(function() {});
    });
  });
  return chain.then(function() {
    var seen = {};
    var candidates = [];
    all.sort(function(a, b) { return b.score - a.score; }).forEach(function(item) {
      if (!seen[item.url]) {
        seen[item.url] = true;
        candidates.push(item);
      }
    });
    return candidates;
  });
}

function loadItem(url) {
  return fetchJson(apiUrl("/load_item", { plugin: UPSTREAM_PLUGIN }) + "&encoded_url=" + encodedUrl(url)).then(getResult);
}

function loadLinks(url) {
  return fetchJson(apiUrl("/load_links", { plugin: UPSTREAM_PLUGIN }) + "&encoded_url=" + encodedUrl(url)).then(function(payload) {
    var result = getResult(payload);
    return Array.isArray(result) ? result : [];
  });
}

function pickEpisode(item, season, episode) {
  var episodes = item && Array.isArray(item.episodes) ? item.episodes : [];
  var wantedSeason = Number(season || 1);
  var wantedEpisode = Number(episode || 1);
  var found = null;
  episodes.forEach(function(entry) {
    var entrySeason = Number(entry.season || 1);
    var entryEpisode = Number(entry.episode || 0);
    if (!found && entrySeason === wantedSeason && entryEpisode === wantedEpisode) found = entry;
  });
  return found;
}

function qualityOf(link) {
  var text = String((link && link.name) || "") + " " + String((link && link.url) || "");
  var match = text.match(/(2160|1080|720|480|360)p?/i);
  return match ? match[1] + "P" : "Auto";
}

function mapSubtitles(subtitles) {
  var result = [];
  (subtitles || []).forEach(function(item) {
    if (item && item.url) result.push({ url: item.url, lang: item.lang || item.language || item.name || "Subtitle" });
  });
  return result;
}

function mapLinks(links, metadata, season, episode) {
  var streams = [];
  var seen = {};
  var epTag = season ? " - S" + season + "E" + episode : "";
  (links || []).forEach(function(link) {
    if (!link || !link.url || seen[link.url]) return;
    seen[link.url] = true;
    var headers = {};
    var hasHeaders = false;
    if (link.referer) { headers.Referer = link.referer; hasHeaders = true; }
    if (link.user_agent) { headers["User-Agent"] = link.user_agent; hasHeaders = true; }
    var stream = { name: PROVIDER_NAME + " - " + (link.name || "Stream"), title: metadata.displayTitle + epTag + " - " + (link.name || "Stream"), url: link.url, quality: qualityOf(link), provider: PROVIDER_ID };
    if (hasHeaders) stream.headers = headers;
    var subtitles = mapSubtitles(link.subtitles || []);
    if (subtitles.length) stream.subtitles = subtitles;
    streams.push(stream);
  });
  return streams;
}

function extractLink(link) {
  var url = link.url;
  var referer = link.referer || "";
  var extractApiUrl = API_BASE_URL + "/extract?_encoded_url=" + encodedUrl(url) + "&_encoded_referer=" + encodedUrl(referer);
  return fetchJson(extractApiUrl).then(function(payload) {
    var extracted = getResult(payload);
    if (!extracted) return [link];
    if (Array.isArray(extracted)) {
      return extracted.map(function(item) {
        return {
          name: link.name + " - " + (item.name || "Extracted"),
          url: item.url,
          referer: item.referer || link.referer,
          user_agent: item.user_agent || link.user_agent,
          subtitles: item.subtitles || link.subtitles
        };
      });
    }
    var extractedUrl = extracted.url || extracted.stream_url;
    if (extractedUrl) {
      return [{
        name: link.name + " - Extracted",
          url: extractedUrl,
          referer: extracted.referer || link.referer,
          user_agent: extracted.user_agent || link.user_agent,
          subtitles: extracted.subtitles || link.subtitles
      }];
    }
    return [link];
  }).catch(function() {
    var ytdlpApiUrl = API_BASE_URL + "/ytdlp-extract?url=" + encodedUrl(url);
    return fetchJson(ytdlpApiUrl).then(function(payload) {
      var extracted = getResult(payload);
      var extractedUrl = extracted && (extracted.url || extracted.stream_url);
      if (extractedUrl) {
        return [{
          name: link.name + " - Extracted (YT-DLP)",
          url: extractedUrl,
          referer: extracted.referer || link.referer,
          user_agent: extracted.user_agent || link.user_agent,
          subtitles: extracted.subtitles || link.subtitles
        }];
      }
      return [link];
    }).catch(function() {
      return [link];
    });
  });
}

function resolveCandidate(candidate, metadata, mediaType, season, episode) {
  return loadItem(candidate.url).catch(function() { return null; }).then(function(item) {
    var targetUrl = candidate.url;
    if (mediaType === "tv") {
      var selectedEpisode = pickEpisode(item, season, episode);
      if (selectedEpisode && selectedEpisode.url) targetUrl = selectedEpisode.url;
      else if (item && Array.isArray(item.episodes) && item.episodes.length) return [];
    } else if (item && item.url) {
      targetUrl = item.url;
    }
    return loadLinks(targetUrl).then(function(links) {
      var promises = (links || []).map(function(link) {
        return extractLink(link);
      });
      return Promise.all(promises).then(function(results) {
        var flattened = [];
        results.forEach(function(arr) {
          flattened = flattened.concat(arr);
        });
        return mapLinks(flattened, metadata, mediaType === "tv" ? season : null, mediaType === "tv" ? episode : null);
      });
    });
  });
}

function tryCandidates(candidates, metadata, mediaType, season, episode) {
  var index = 0;
  function next() {
    if (index >= candidates.length || index >= 5) return Promise.resolve([]);
    var candidate = candidates[index];
    index += 1;
    return resolveCandidate(candidate, metadata, mediaType, season, episode).then(function(streams) {
      return streams.length ? streams : next();
    }).catch(function() { return next(); });
  }
  return next();
}

function getStreams(tmdbId, mediaType, season, episode) {
  if (!supportsType(mediaType)) return Promise.resolve([]);
  return getMetadata(tmdbId, mediaType).then(function(metadata) {
    return collectCandidates(metadata).then(function(candidates) {
      return candidates.length ? tryCandidates(candidates, metadata, mediaType, season, episode) : [];
    });
  }).catch(function(error) {
    console.error("[" + PROVIDER_NAME + "] " + error.message);
    return [];
  });
}

if (typeof globalThis !== "undefined") globalThis.getStreams = getStreams;
if (typeof module !== "undefined") module.exports = { getStreams: getStreams };
