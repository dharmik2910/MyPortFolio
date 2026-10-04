const { getSql } = require("./_lib/db");
const { route, body, str, url, HttpError } = require("./_lib/http");

const list = (value, field, max = 20) => {
  if (!Array.isArray(value)) throw new HttpError(400, `${field} must be a list`);
  if (value.length > max) throw new HttpError(400, `${field} can have at most ${max} items`);
  return value;
};

const strings = (value, field, opts) =>
  list(value, field).map((s) => str(s, { field, ...opts })).filter(Boolean);

// Each settings key has its own shape; anything not listed here is dropped.
const validators = {
  profile: (v) => ({
    name: str(v.name, { field: "Name", required: true, max: 80 }),
    img: url(v.img, { field: "Photo", allowRelative: true }),
    professions: strings(v.professions, "Professions", { max: 60 }),
    info: strings(v.info, "Intro lines", { max: 300 }),
    resume: url(v.resume, { field: "Resume link" }),
    available: Boolean(v.available),
  }),
  about: (v) => ({
    statement: str(v.statement, { field: "Statement", max: 400 }),
    description: strings(v.description, "Paragraphs", { max: 1500 }),
    services: list(v.services, "Services", 8).map((s) => ({
      title: str(s?.title, { field: "Service title", required: true, max: 80 }),
      text: str(s?.text, { field: "Service text", max: 300 }),
    })),
  }),
  contact: (v) => ({
    email: str(v.email, { field: "Email", required: true, max: 200 }),
    phone: str(v.phone, { field: "Phone", max: 40 }),
    address: str(v.address, { field: "Address", max: 120 }),
    links: list(v.links, "Social links", 12).map((l) => ({
      url: url(l?.url, { field: "Social link URL" }),
      icon: str(l?.icon, { field: "Social icon", required: true, max: 40 }),
    })),
  }),
};

module.exports = route(
  {
    PUT: async (req) => {
      const { key, value } = body(req);
      const validate = validators[key];
      if (!validate) throw new HttpError(400, "Unknown settings key");
      if (!value || typeof value !== "object") throw new HttpError(400, "value must be an object");
      const clean = validate(value);
      await getSql()`
        INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(clean)}::jsonb, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
      return { key, value: clean };
    },
  },
  { adminOnly: ["PUT"] }
);
