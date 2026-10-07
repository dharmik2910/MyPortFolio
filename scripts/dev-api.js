// Local stand-in for the Vercel/Netlify /api runtime.
// `npm start` mounts it automatically via src/setupProxy.js, so no second terminal is needed.
// It can also run on its own: `npm run api` (port 8787).
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

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

// Handles one /api/<name> request with the matching file in /api, Vercel-style.
const handleApi = async (req, res) => {
  const url = new URL(req.originalUrl || req.url, "http://localhost");
  const name = url.pathname.replace(/^\/api\//, "").replace(/\/$/, "");
  const file = path.join(ROOT, "api", `${name}.js`);
  if (!/^[a-z-]+$/.test(name) || !fs.existsSync(file)) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not found" }));
  }

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

  try {
    delete require.cache[require.resolve(file)]; // pick up edits without restarting
    await require(file)(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  }
  console.log(`${req.method} ${url.pathname}${url.search} → ${res.statusCode}`);
};

module.exports = { handleApi };

if (require.main === module) {
  const PORT = process.env.API_PORT || 8787;
  http
    .createServer(handleApi)
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the other process or set API_PORT=<port>.`);
        process.exit(1);
      }
      throw err;
    })
    .listen(PORT, () => console.log(`API dev server on http://localhost:${PORT}`));
}
