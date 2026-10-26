// Records one visit per browser session for the admin "Visitors" page (api/visits.js).
// Skips local dev and the owner's own browser (anyone signed in to /admin).
const VISITOR_KEY = "pf-visitor";
const SESSION_KEY = "pf-visit-sent";
const ADMIN_TOKEN_KEY = "portfolio-admin-token";

const storage = (kind) => {
  try {
    return window[kind];
  } catch {
    return null;
  }
};

const visitorId = (local) => {
  let id = local?.getItem(VISITOR_KEY);
  if (!id) {
    id = window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    local?.setItem(VISITOR_KEY, id);
  }
  return id;
};

// Where the visitor came from: ?utm_source / ?ref, else the referring site's host.
const source = () => {
  const params = new URLSearchParams(window.location.search);
  const tagged = params.get("utm_source") || params.get("ref");
  if (tagged) return tagged.slice(0, 100);
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === window.location.hostname ? "" : host;
  } catch {
    return "";
  }
};

export const trackVisit = () => {
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) return;
  const local = storage("localStorage");
  const session = storage("sessionStorage");
  try {
    if (local?.getItem(ADMIN_TOKEN_KEY) || session?.getItem(SESSION_KEY)) return;
    session?.setItem(SESSION_KEY, "1");
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vid: visitorId(local), path: window.location.pathname, referrer: source() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking must never break the page */
  }
};
