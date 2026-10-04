// Local stand-in for Vercel's /api runtime: `npm run api` (port 8787), then `npm start`.
// CRA proxies /api/* here via the "proxy" field in package.json.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = process.env.API_PORT || 8787;

// Minimal .env.local loader (KEY=value per line).
for (const file of [".env.local", ".env"]) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const name = url.pathname.replace(/^\/api\//, "").replace(/\/$/, "");
    const file = path.join(ROOT, "api", `${name}.js`);
    if (!/^[a-z-]+$/.test(name) || !fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not found" }));
    }

    // Vercel-style helpers
    req.query = Object.fromEntries(url.searchParams);
    const raw = await readBody(req);
    try {
      req.body = raw && (req.headers["content-type"] || "").includes("json") ? JSON.parse(raw) : raw;
    } catch {
      req.body = raw;
    }
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (obj) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(obj));
    };
    res.send = (data) => res.end(data);

    delete require.cache[require.resolve(file)]; // pick up edits without restarting
    await require(file)(req, res);
    console.log(`${req.method} ${url.pathname}${url.search} → ${res.statusCode}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or run with API_PORT=<port> (and update "proxy" in package.json).`);
      process.exit(1);
    }
    throw err;
  })
  .listen(PORT, () => console.log(`API dev server on http://localhost:${PORT}`));
