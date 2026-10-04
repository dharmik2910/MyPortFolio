const { isAdmin } = require("./auth");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Wraps a handler map like { GET: fn, POST: fn }.
 * `adminOnly` lists methods that require a valid admin session.
 */
const route = (handlers, { adminOnly = [] } = {}) => async (req, res) => {
  const fn = handlers[req.method];
  if (!fn) {
    res.setHeader("Allow", Object.keys(handlers).join(", "));
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (adminOnly.includes(req.method) && !isAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const result = await fn(req, res);
    if (!res.headersSent) res.status(200).json(result ?? { ok: true });
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? "Server error" : err.message });
  }
};

const body = (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body || "{}");
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
};

const str = (value, { max = 500, required = false, field = "value" } = {}) => {
  const s = typeof value === "string" ? value.trim() : "";
  if (required && !s) throw new HttpError(400, `${field} is required`);
  if (s.length > max) throw new HttpError(400, `${field} is too long (max ${max})`);
  return s;
};

// Accepts http(s) URLs, site-relative paths ("/zelbi.png") or empty.
const url = (value, { field = "url", allowRelative = false } = {}) => {
  const s = str(value, { max: 2000, field });
  if (!s) return "";
  if (allowRelative && s.startsWith("/") && !s.startsWith("//")) return s;
  if (!/^https?:\/\//i.test(s)) throw new HttpError(400, `${field} must start with http:// or https://`);
  return s;
};

const id = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, "Invalid id");
  return n;
};

module.exports = { route, body, str, url, id, HttpError };
