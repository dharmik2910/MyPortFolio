const crypto = require("crypto");
const { getSql } = require("./_lib/db");
const { route, body, str } = require("./_lib/http");

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|lighthouse|headless|curl|wget|python|axios|node-fetch/i;

const header = (req, name) => {
  const v = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v || "";
};

const decode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

// Location from the host's edge headers (Vercel, Netlify or Cloudflare). Empty in local dev.
const geo = (req) => {
  const nf = header(req, "x-nf-geo");
  if (nf) {
    try {
      const g = JSON.parse(Buffer.from(nf, "base64").toString());
      return { country: g.country?.code || "", region: g.subdivision?.name || "", city: g.city || "" };
    } catch {
      /* fall through */
    }
  }
  return {
    country: header(req, "x-vercel-ip-country") || header(req, "cf-ipcountry") || header(req, "x-country"),
    region: decode(header(req, "x-vercel-ip-country-region")),
    city: decode(header(req, "x-vercel-ip-city")),
  };
};

const device = (ua) => {
  const browser = /edg\//i.test(ua) ? "Edge"
    : /opr\/|opera/i.test(ua) ? "Opera"
    : /samsungbrowser/i.test(ua) ? "Samsung Internet"
    : /firefox|fxios/i.test(ua) ? "Firefox"
    : /chrome|crios/i.test(ua) ? "Chrome"
    : /safari/i.test(ua) ? "Safari"
    : "Other";
  const os = /windows/i.test(ua) ? "Windows"
    : /iphone|ipad|ipod/i.test(ua) ? "iOS"
    : /android/i.test(ua) ? "Android"
    : /mac os/i.test(ua) ? "macOS"
    : /linux/i.test(ua) ? "Linux"
    : "Other";
  const type = /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|iphone|android/i.test(ua) ? "Mobile" : "Desktop";
  return { browser, os, type };
};

// Prefer the browser's random id; otherwise a salted hash so raw IPs are never stored.
const visitorId = (req, given) => {
  if (/^[a-z0-9-]{8,64}$/i.test(given || "")) return given;
  const ip = (header(req, "x-forwarded-for").split(",")[0] || header(req, "x-real-ip") || "").trim();
  const salt = process.env.SESSION_SECRET || "";
  return "h-" + crypto.createHash("sha256").update(`${ip}|${header(req, "user-agent")}|${salt}`).digest("hex").slice(0, 24);
};

const RANGES = { 7: 7, 30: 30, 90: 90 };

module.exports = route(
  {
    // Public: one call per browser session from the site (see src/lib/track.js).
    POST: async (req) => {
      const ua = header(req, "user-agent");
      if (!ua || BOT_UA.test(ua)) return { ok: true };
      const b = body(req);
      const { browser, os, type } = device(ua);
      const { country, region, city } = geo(req);
      const path = str(b.path, { max: 200 }) || "/";
      const referrer = str(b.referrer, { max: 200 }).toLowerCase();
      await getSql()`
        INSERT INTO visits (visitor_id, path, referrer, country, region, city, device, browser, os)
        VALUES (${visitorId(req, b.vid)}, ${path}, ${referrer}, ${country.slice(0, 8)}, ${region.slice(0, 80)},
                ${city.slice(0, 80)}, ${type}, ${browser}, ${os})`;
      return { ok: true };
    },

    // Admin: totals, a daily series for the chosen range, breakdowns and recent visits.
    GET: async (req) => {
      const days = RANGES[req.query.days] || 30;
      const sql = getSql();
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const [[totals], daily, countries, referrers, devices, browsers, recent] = await Promise.all([
        sql`
          SELECT count(*)::int AS views,
                 count(DISTINCT visitor_id)::int AS visitors,
                 count(*) FILTER (WHERE created_at >= ${since}::timestamptz)::int AS range_views,
                 count(DISTINCT visitor_id) FILTER (WHERE created_at >= ${since}::timestamptz)::int AS range_visitors,
                 count(*) FILTER (WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::date = (now() AT TIME ZONE 'Asia/Kolkata')::date)::int AS today
          FROM visits`,
        sql`
          SELECT to_char(d, 'YYYY-MM-DD') AS day,
                 count(v.id)::int AS views,
                 count(DISTINCT v.visitor_id)::int AS visitors
          FROM generate_series((now() AT TIME ZONE 'Asia/Kolkata')::date - (${days}::int - 1),
                               (now() AT TIME ZONE 'Asia/Kolkata')::date, interval '1 day') AS d
          LEFT JOIN visits v ON (v.created_at AT TIME ZONE 'Asia/Kolkata')::date = d::date
          GROUP BY d ORDER BY d`,
        sql`SELECT COALESCE(NULLIF(country, ''), '??') AS label, count(*)::int AS n FROM visits
            WHERE created_at >= ${since}::timestamptz GROUP BY 1 ORDER BY n DESC LIMIT 8`,
        sql`SELECT COALESCE(NULLIF(referrer, ''), 'Direct') AS label, count(*)::int AS n FROM visits
            WHERE created_at >= ${since}::timestamptz GROUP BY 1 ORDER BY n DESC LIMIT 8`,
        sql`SELECT device AS label, count(*)::int AS n FROM visits
            WHERE created_at >= ${since}::timestamptz GROUP BY 1 ORDER BY n DESC`,
        sql`SELECT browser AS label, count(*)::int AS n FROM visits
            WHERE created_at >= ${since}::timestamptz GROUP BY 1 ORDER BY n DESC LIMIT 6`,
        sql`
          SELECT v.id, v.visitor_id, v.path, v.referrer, v.country, v.region, v.city, v.device, v.browser, v.os,
                 v.created_at, c.visits, c.first_seen
          FROM visits v
          JOIN (SELECT visitor_id, count(*)::int AS visits, min(created_at) AS first_seen FROM visits GROUP BY visitor_id) c
            USING (visitor_id)
          ORDER BY v.created_at DESC LIMIT 100`,
      ]);
      return { days, totals, daily, countries, referrers, devices, browsers, recent };
    },
  },
  { adminOnly: ["GET"] }
);
