// Netlify adapter: runs the Vercel-style handlers in /api behind one Netlify Function.
// netlify.toml rewrites /api/* here, so the frontend calls the same URLs on both hosts.
const handlers = {
  content: require("../../api/content"),
  login: require("../../api/login"),
  settings: require("../../api/settings"),
  projects: require("../../api/projects"),
  skills: require("../../api/skills"),
  messages: require("../../api/messages"),
  upload: require("../../api/upload"),
  image: require("../../api/image"),
};

// Minimal Vercel/Express-style response object that collects a Lambda response.
const createRes = () => {
  const res = { statusCode: 200, headers: {}, body: "", isBase64Encoded: false, headersSent: false };
  res.setHeader = (key, value) => {
    res.headers[key] = value;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (obj) => {
    res.headers["Content-Type"] = "application/json";
    res.body = JSON.stringify(obj);
    res.headersSent = true;
  };
  res.send = (data) => {
    if (Buffer.isBuffer(data)) {
      res.body = data.toString("base64");
      res.isBase64Encoded = true;
    } else {
      res.body = String(data ?? "");
    }
    res.headersSent = true;
  };
  return res;
};

exports.handler = async (event) => {
  const name = event.path.replace(/^\/(\.netlify\/functions\/api|api)\/?/, "").replace(/\/$/, "");
  const handler = handlers[name];
  if (!handler) {
    return { statusCode: 404, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Not found" }) };
  }

  const raw = event.body && event.isBase64Encoded ? Buffer.from(event.body, "base64").toString() : event.body || "";
  let body = raw;
  if (raw && (event.headers["content-type"] || "").includes("json")) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = raw; // handlers reject invalid JSON themselves
    }
  }

  const req = { method: event.httpMethod, headers: event.headers || {}, query: event.queryStringParameters || {}, body };
  const res = createRes();
  await handler(req, res);
  const { statusCode, headers, body: out, isBase64Encoded } = res;
  return { statusCode, headers, body: out, isBase64Encoded };
};
