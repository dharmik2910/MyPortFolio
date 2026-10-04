const TOKEN_KEY = "portfolio-admin-token";
let memoryToken = null;

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || memoryToken;
  } catch {
    return memoryToken;
  }
};

export const setToken = (token) => {
  memoryToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — keep the in-memory copy */
  }
};

// Fired when the server rejects the session so the shell can show the login screen.
export const UNAUTHORIZED_EVENT = "admin:unauthorized";

export const api = async (path, { method = "GET", body, query } = {}) => {
  const qs = query ? `?${new URLSearchParams(query)}` : "";
  const res = await fetch(`/api/${path}${qs}`, {
    method,
    headers: {
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (res.status === 401 && path !== "login") {
    setToken(null);
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
};

// Downscale to max 1600px wide and re-encode as WebP before upload to keep rows small.
export const compressImage = (file, maxWidth = 1600, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/webp", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image"));
    };
    img.src = objectUrl;
  });

export const uploadImage = async (file) => {
  const data = await compressImage(file);
  const { url } = await api("upload", { method: "POST", body: { data } });
  return url;
};
