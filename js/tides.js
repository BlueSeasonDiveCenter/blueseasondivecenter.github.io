/* ============================================
   Blue Season Camiguin — Tide widget
   Data: Open-Meteo Marine API (no key required)
   Fixed to Camiguin / Mambajao, Asia/Manila time.
   Fails closed: if no data is available, the
   card/page widgets stay hidden — never shows
   a guessed value.
   ============================================ */

(function () {
  'use strict';

  var LAT = 9.2517, LON = 124.7283;       // Mambajao, Camiguin
  var TZ_OFFSET = '+08:00';               // Philippines, no DST
  var CACHE_KEY = 'bs_tide_v1';
  var API = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + LAT +
    '&longitude=' + LON +
    '&hourly=sea_level_height_msl&timezone=Asia%2FManila&forecast_days=7';

  /* ---------- Helpers ---------- */

  function manilaToday() {
    // en-CA gives YYYY-MM-DD
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  }

  function parseLocal(iso) {
    // "2026-06-30T14:00" (Manila local) -> absolute Date, correct for any viewer
    return new Date(iso + ':00' + TZ_OFFSET);
  }

  function fmtTime(d) {
    return d.toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit'
    });
  }

  function fmtDay(d) {
    return d.toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila', weekday: 'short', month: 'short', day: 'numeric'
    });
  }

  function dayKey(d) {
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  }

  function fmtH(h) { return h.toFixed(1) + ' m'; }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function loadCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); }
    catch (e) { return null; }
  }

  function saveCache(obj) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); }
    catch (e) { /* private mode etc. — ignore */ }
  }

  /* ---------- Data ---------- */

  function getData() {
    var cached = loadCache();
    var today = manilaToday();

    // Fetched today already? Use cache, no network.
    if (cached && cached.day === today && cached.time && cached.time.length) {
      return Promise.resolve(cached);
    }

    return fetch(API)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (j) {
        if (!j.hourly || !j.hourly.time || !j.hourly.sea_level_height_msl) {
          throw new Error('Malformed response');
        }
        var obj = {
          day: today,
          time: j.hourly.time,
          height: j.hourly.sea_level_height_msl
        };
        saveCache(obj);
        return obj;
      })
      .catch(function (err) {
        // Network/API failed — fall back to a still-valid stale cache.
        // Tide predictions are deterministic, so older data is still correct.
        if (cached && cached.time && cached.time.length) {
          var last = parseLocal(cached.time[cached.time.length - 1]);
          if (last.getTime() > Date.now()) return cached;
        }
        throw err;
      });
  }

  function buildPoints(data) {
    var pts = [];
    for (var i = 0; i < data.time.length; i++) {
      var h = data.height[i];
      if (h === null || h === undefined) continue;
      pts.push({ t: parseLocal(data.time[i]), h: h });
    }
    return pts;
  }

  // Local maxima/minima with parabolic refinement for sub-hour precision.
  // Tides strictly alternate high/low, so consecutive same-type detections
  // (from flat hourly plateaus) are merged, keeping the more extreme one.
  function findExtremes(pts) {
    var raw = [];
    for (var i = 1; i < pts.length - 1; i++) {
      var y0 = pts[i - 1].h, y1 = pts[i].h, y2 = pts[i + 1].h;
      var isHigh = y1 >= y0 && y1 >= y2 && (y1 > y0 || y1 > y2);
      var isLow = y1 <= y0 && y1 <= y2 && (y1 < y0 || y1 < y2);
      if (!isHigh && !isLow) continue;
      var denom = y0 - 2 * y1 + y2;
      var off = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
      if (off > 0.5) off = 0.5;
      if (off < -0.5) off = -0.5;
      raw.push({
        t: new Date(pts[i].t.getTime() + off * 3600 * 1000),
        h: y1 - 0.25 * (y0 - y2) * off,
        type: isHigh ? 'high' : 'low'
      });
    }

    var ex = [];
    for (var k = 0; k < raw.length; k++) {
      var e = raw[k], prev = ex[ex.length - 1];
      if (prev && prev.type === e.type) {
        if ((e.type === 'high' && e.h > prev.h) || (e.type === 'low' && e.h < prev.h)) {
          ex[ex.length - 1] = e;
        }
      } else {
        ex.push(e);
      }
    }
    return ex;
  }

  function currentState(pts) {
    var now = Date.now();
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i].t.getTime(), b = pts[i + 1].t.getTime();
      if (now >= a && now <= b) {
        var frac = (now - a) / (b - a);
        return {
          h: pts[i].h + (pts[i + 1].h - pts[i].h) * frac,
          rising: pts[i + 1].h >= pts[i].h
        };
      }
    }
    return null;
  }

  function nextOf(ex, type) {
    var now = Date.now();
    for (var i = 0; i < ex.length; i++) {
      if (ex[i].type === type && ex[i].t.getTime() > now) return ex[i];
    }
    return null;
  }

  /* ---------- SVG curve ---------- */

  function curveSVG(pts, exts, showNow) {
    var W = 600, H = 180, padL = 36, padR = 12, padT = 18, padB = 24;
    var ix0 = padL, ix1 = W - padR, iy0 = padT, iy1 = H - padB;
    var tMin = pts[0].t.getTime(), tMax = pts[pts.length - 1].t.getTime();
    var hMin = Infinity, hMax = -Infinity, i;
    for (i = 0; i < pts.length; i++) {
      if (pts[i].h < hMin) hMin = pts[i].h;
      if (pts[i].h > hMax) hMax = pts[i].h;
    }
    var pad = (hMax - hMin) * 0.18 || 0.2;
    hMin -= pad; hMax += pad;

    function X(t) { return ix0 + (t - tMin) / (tMax - tMin) * (ix1 - ix0); }
    function Y(h) { return iy1 - (h - hMin) / (hMax - hMin) * (iy1 - iy0); }

    var d = '';
    for (i = 0; i < pts.length; i++) {
      d += (i === 0 ? 'M' : 'L') + X(pts[i].t.getTime()).toFixed(1) + ',' + Y(pts[i].h).toFixed(1);
    }
    var area = d + 'L' + ix1.toFixed(1) + ',' + iy1 + 'L' + ix0.toFixed(1) + ',' + iy1 + 'Z';

    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" ' +
      'aria-label="Tide height curve">';
    // axis labels (top/bottom of plotted range)
    s += '<line x1="' + ix0 + '" y1="' + iy0 + '" x2="' + ix1 + '" y2="' + iy0 + '" class="tide-grid"/>';
    s += '<line x1="' + ix0 + '" y1="' + iy1 + '" x2="' + ix1 + '" y2="' + iy1 + '" class="tide-grid"/>';
    s += '<text x="' + (ix0 - 6) + '" y="' + (iy0 + 4) + '" class="tide-axis" text-anchor="end">' +
      hMax.toFixed(1) + 'm</text>';
    s += '<text x="' + (ix0 - 6) + '" y="' + (iy1) + '" class="tide-axis" text-anchor="end">' +
      hMin.toFixed(1) + 'm</text>';
    s += '<path d="' + area + '" class="tide-area"/>';
    s += '<path d="' + d + '" class="tide-line"/>';

    // extreme markers
    if (exts) {
      for (i = 0; i < exts.length; i++) {
        var e = exts[i];
        var ex = X(e.t.getTime()), ey = Y(e.h);
        if (ex < ix0 - 1 || ex > ix1 + 1) continue;
        s += '<circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="3.5" class="tide-dot-' + e.type + '"/>';
        var ly = e.type === 'high' ? ey - 8 : ey + 14;
        s += '<text x="' + ex.toFixed(1) + '" y="' + ly.toFixed(1) + '" class="tide-mark tide-mark-' + e.type +
          '" text-anchor="middle">' + (e.type === 'high' ? 'H ' : 'L ') + fmtTime(e.t) + '</text>';
      }
    }

    // now indicator
    if (showNow) {
      var now = Date.now();
      if (now >= tMin && now <= tMax) {
        var nx = X(now);
        s += '<line x1="' + nx.toFixed(1) + '" y1="' + (iy0 - 6) + '" x2="' + nx.toFixed(1) + '" y2="' + iy1 +
          '" class="tide-now-line"/>';
        s += '<text x="' + nx.toFixed(1) + '" y="' + (iy0 - 9) + '" class="tide-axis" text-anchor="middle">Now</text>';
      }
    }

    s += '</svg>';
    return s;
  }

  /* ---------- Render ---------- */

  function arrow(up) {
    return '<span class="tide-arrow ' + (up ? 'up' : 'down') + '" aria-hidden="true">' +
      (up ? '↑' : '↓') + '</span>';
  }

  function renderCard(pts, ex) {
    var card = document.getElementById('tideCard');
    if (!card) return;

    var cur = currentState(pts);
    var nh = nextOf(ex, 'high'), nl = nextOf(ex, 'low');

    var stateEl = document.getElementById('tideState');
    if (stateEl) {
      stateEl.innerHTML = cur
        ? (cur.rising ? 'Rising ' + arrow(true) : 'Falling ' + arrow(false))
        : 'Tide';
    }
    setText('tideNow', cur ? 'now ' + fmtH(cur.h) : '');

    var nhEl = document.getElementById('tideNextHigh');
    if (nhEl) nhEl.innerHTML = nh ? arrow(true) + ' Next high <b>' + fmtTime(nh.t) + '</b>' : '';
    var nlEl = document.getElementById('tideNextLow');
    if (nlEl) nlEl.innerHTML = nl ? arrow(false) + ' Next low <b>' + fmtTime(nl.t) + '</b>' : '';

    // Today's curve
    var today = manilaToday();
    var todayPts = pts.filter(function (p) { return dayKey(p.t) === today; });
    var todayEx = ex.filter(function (e) { return dayKey(e.t) === today; });
    var curveEl = document.getElementById('tideCurve');
    if (curveEl && todayPts.length > 2) {
      curveEl.innerHTML = curveSVG(todayPts, todayEx, true);
    }

    card.hidden = false;
  }

  function renderPage(pts, ex) {
    var weekEl = document.getElementById('tideWeekCurve');
    if (!weekEl) return;

    var cur = currentState(pts);
    var nh = nextOf(ex, 'high'), nl = nextOf(ex, 'low');

    var nowStateEl = document.getElementById('tideNowState');
    if (nowStateEl) {
      nowStateEl.innerHTML = cur
        ? (cur.rising ? 'Rising ' + arrow(true) : 'Falling ' + arrow(false))
        : '—';
    }
    setText('tideNowHeight', cur ? fmtH(cur.h) : '');
    setText('tideHighTime', nh ? fmtTime(nh.t) : '—');
    setText('tideHighH', nh ? fmtH(nh.h) : '');
    setText('tideLowTime', nl ? fmtTime(nl.t) : '—');
    setText('tideLowH', nl ? fmtH(nl.h) : '');

    weekEl.innerHTML = curveSVG(pts, null, true);

    // 7-day table grouped by Manila day
    var tbody = document.getElementById('tideTableBody');
    if (tbody) {
      var groups = {}, order = [];
      for (var i = 0; i < ex.length; i++) {
        var k = dayKey(ex[i].t);
        if (!groups[k]) { groups[k] = { date: ex[i].t, highs: [], lows: [] }; order.push(k); }
        (ex[i].type === 'high' ? groups[k].highs : groups[k].lows).push(fmtTime(ex[i].t));
      }
      var today = manilaToday();
      var html = '';
      for (var j = 0; j < order.length; j++) {
        var g = groups[order[j]];
        var label = order[j] === today ? fmtDay(g.date) + ' · Today' : fmtDay(g.date);
        html += '<tr' + (order[j] === today ? ' class="tide-row-today"' : '') + '>' +
          '<td>' + label + '</td>' +
          '<td>' + (g.highs.join(' · ') || '—') + '</td>' +
          '<td>' + (g.lows.join(' · ') || '—') + '</td></tr>';
      }
      tbody.innerHTML = html;
    }
  }

  /* ---------- Conditions (water temp, waves, wind, sun, moon) ---------- */

  var COND_MARINE = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + LAT +
    '&longitude=' + LON + '&current=sea_surface_temperature,wave_height,wave_period&timezone=Asia%2FManila';
  var COND_FORE = 'https://api.open-meteo.com/v1/forecast?latitude=' + LAT +
    '&longitude=' + LON + '&current=wind_speed_10m,wind_direction_10m&daily=sunrise,sunset' +
    '&timezone=Asia%2FManila&forecast_days=1';

  var MOON_EMOJI = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  var MOON_NAME = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous',
    'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];

  function moonInfo(date) {
    var syn = 29.53058867;
    var ref = Date.UTC(2000, 0, 6, 18, 14, 0);    // a known new moon
    var age = ((date.getTime() - ref) / 86400000) % syn;
    if (age < 0) age += syn;
    var idx = Math.floor((age / syn) * 8 + 0.5) % 8;
    // Spring tides near new/full moon; neap near the quarters.
    var toSyzygy = Math.min(age, Math.abs(age - syn / 2), syn - age);
    return { emoji: MOON_EMOJI[idx], name: MOON_NAME[idx], spring: toSyzygy <= 1.8 };
  }

  function compass(deg) {
    return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
  }

  function chip(ico, label, value, sub) {
    return '<span class="cond-chip"><span class="cond-ico" aria-hidden="true">' + ico + '</span>' +
      '<span class="cond-txt">' + (label ? '<span class="cond-label">' + label + '</span> ' : '') +
      value + (sub ? ' <span class="cond-sub">' + sub + '</span>' : '') + '</span></span>';
  }

  function buildConditions(marine, fc) {
    var chips = [];
    if (marine && marine.current) {
      var c = marine.current;
      if (typeof c.sea_surface_temperature === 'number') {
        chips.push(chip('🌡️', 'Water', '<b>' + c.sea_surface_temperature.toFixed(1) + '°C</b>'));
      }
      if (typeof c.wave_height === 'number') {
        chips.push(chip('🌊', 'Waves', '<b>' + c.wave_height.toFixed(1) + ' m</b>'));
      }
    }
    if (fc && fc.current && typeof fc.current.wind_speed_10m === 'number') {
      var dir = typeof fc.current.wind_direction_10m === 'number' ? ' ' + compass(fc.current.wind_direction_10m) : '';
      chips.push(chip('💨', 'Wind', '<b>' + Math.round(fc.current.wind_speed_10m) + ' km/h</b>' + dir));
    }
    if (fc && fc.daily && fc.daily.sunrise && fc.daily.sunrise[0]) {
      chips.push(chip('🌅', 'Sun',
        '<b>' + fc.daily.sunrise[0].split('T')[1] + '</b> – <b>' + fc.daily.sunset[0].split('T')[1] + '</b>'));
    }
    var m = moonInfo(new Date());
    chips.push(chip(m.emoji, m.name, '<span class="cond-sub">' + (m.spring ? 'Spring tides' : 'Neap tides') + '</span>'));
    return chips.join('');
  }

  function initConditions() {
    var strips = document.querySelectorAll('.cond-strip');
    if (!strips.length || !('fetch' in window) || !('Promise' in window)) return;

    function safe(u) { return fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return null; }); }

    Promise.all([safe(COND_MARINE), safe(COND_FORE)]).then(function (res) {
      var html = buildConditions(res[0], res[1]);
      if (!html) return;                               // fails closed
      for (var i = 0; i < strips.length; i++) {
        strips[i].innerHTML = html;
        strips[i].hidden = false;
        var block = strips[i].closest ? strips[i].closest('.cond-block') : null;
        if (block) {
          block.hidden = false;
          // The block starts hidden, so main.js's scroll-reveal animation never
          // fired for it — clear the leftover opacity:0 so it shows.
          block.classList.add('revealed');
          block.style.opacity = '1';
          block.style.transform = 'none';
        }
      }
    });
  }

  /* ---------- Init ---------- */

  function init() {
    initConditions();
    if (!document.getElementById('tideCard') && !document.getElementById('tideWeekCurve')) return;
    if (!('fetch' in window) || !('Promise' in window)) return;

    getData().then(function (data) {
      var pts = buildPoints(data);
      if (pts.length < 3) return;
      var ex = findExtremes(pts);
      renderCard(pts, ex);
      renderPage(pts, ex);
    }).catch(function () {
      // Fails closed. The dive-sites card stays hidden; on the standalone page,
      // swap the "Loading…" placeholders for a clear unavailable message.
      var wc = document.getElementById('tideWeekCurve');
      if (wc) wc.innerHTML = '<p class="tide-note" style="margin:0;">Tide forecast is temporarily unavailable. Please try again later.</p>';
      var tb = document.getElementById('tideTableBody');
      if (tb) tb.innerHTML = '<tr><td colspan="3" class="tide-note" style="border:0;">Temporarily unavailable.</td></tr>';
    });

    // Card expand/collapse
    var toggle = document.getElementById('tideToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var panel = document.getElementById('tidePanel');
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        if (panel) panel.hidden = open;
        var card = document.getElementById('tideCard');
        if (card) card.classList.toggle('open', !open);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
