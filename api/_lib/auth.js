const crypto = require("crypto");

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return s;
};

const hmac = (data) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");
const sha256 = (s) => crypto.createHash("sha256").update(String(s)).digest();

// Token = base64url(JSON payload) + "." + HMAC signature. Stateless; expires after a week.
const createToken = () => {
  const body = Buffer.from(JSON.stringify({ sub: "admin", exp: Date.now() + SESSION_TTL_MS })).toString("base64url");
  return `${body}.${hmac(body)}`;
};

const verifyToken = (token) => {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const [body, sig] = token.split(".");
  const expected = Buffer.from(hmac(body));
  const given = Buffer.from(sig || "");
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    return payload.sub === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
};

const checkPassword = (password) => {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) throw new Error("ADMIN_PASSWORD is not set");
  return crypto.timingSafeEqual(sha256(password || ""), sha256(real));
};

const isAdmin = (req) => {
  const header = req.headers.authorization || "";
  return verifyToken(header.startsWith("Bearer ") ? header.slice(7) : "");
};

module.exports = { createToken, verifyToken, checkPassword, isAdmin };
