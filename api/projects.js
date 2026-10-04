const { getSql } = require("./_lib/db");
const { route, body, str, url, id, HttpError } = require("./_lib/http");

const STATUSES = ["", "in-progress", "coming-soon"];

// Extra links beyond demo/GitHub, e.g. { label: "fynnchintan.in", url, tag: "Coming soon" }.
const cleanLinks = (links = []) => {
  if (!Array.isArray(links)) throw new HttpError(400, "links must be a list");
  if (links.length > 4) throw new HttpError(400, "A project can have at most 4 extra links");
  return links.map((l) => {
    const linkUrl = url(l?.url, { field: "Link URL" });
    if (!linkUrl) throw new HttpError(400, "Link URL is required");
    return {
      label: str(l?.label, { field: "Link label", required: true, max: 40 }),
      url: linkUrl,
      tag: str(l?.tag, { field: "Link tag", max: 24 }),
    };
  });
};

const clean = (b) => {
  if (b.icons !== undefined && !Array.isArray(b.icons)) throw new HttpError(400, "icons must be a list");
  if (!STATUSES.includes(b.status || "")) throw new HttpError(400, "Unknown status");
  return {
    name: str(b.name, { field: "Name", required: true, max: 120 }),
    description: str(b.description, { field: "Description", max: 1000 }),
    image: url(b.image, { field: "Image", allowRelative: true }),
    github: url(b.github, { field: "GitHub URL" }),
    demo: url(b.demo, { field: "Demo URL" }),
    icons: (b.icons || [])
      .slice(0, 12)
      .map((i) => str(i, { max: 40 }))
      .filter(Boolean),
    featured: Boolean(b.featured),
    status: b.status || "",
    links: cleanLinks(b.links),
  };
};

module.exports = route(
  {
    POST: async (req) => {
      const p = clean(body(req));
      const sql = getSql();
      // New projects go to the top of the list. Only one project can be featured at a time.
      const queries = [];
      if (p.featured) queries.push(sql`UPDATE projects SET featured = false WHERE featured`);
      queries.push(sql`
        INSERT INTO projects (name, description, image, github, demo, icons, featured, status, links, sort)
        VALUES (${p.name}, ${p.description}, ${p.image}, ${p.github}, ${p.demo}, ${p.icons}, ${p.featured},
                ${p.status}, ${JSON.stringify(p.links)}::jsonb,
                (SELECT COALESCE(MIN(sort), 1) - 1 FROM projects))
        RETURNING id, name, description, image, github, demo, icons, featured, status, links`);
      const results = await sql.transaction(queries);
      return results[results.length - 1][0];
    },

    PUT: async (req) => {
      const projectId = id(req.query.id);
      const p = clean(body(req));
      const sql = getSql();
      const queries = [];
      if (p.featured) queries.push(sql`UPDATE projects SET featured = false WHERE featured AND id <> ${projectId}`);
      queries.push(sql`
        UPDATE projects SET name = ${p.name}, description = ${p.description}, image = ${p.image},
          github = ${p.github}, demo = ${p.demo}, icons = ${p.icons}, featured = ${p.featured},
          status = ${p.status}, links = ${JSON.stringify(p.links)}::jsonb
        WHERE id = ${projectId}
        RETURNING id, name, description, image, github, demo, icons, featured, status, links`);
      const results = await sql.transaction(queries);
      const row = results[results.length - 1][0];
      if (!row) throw new HttpError(404, "Project not found");
      return row;
    },

    // Reorder: body { order: [id, id, ...] }
    PATCH: async (req) => {
      const { order } = body(req);
      if (!Array.isArray(order) || order.length > 500) throw new HttpError(400, "order must be a list of ids");
      const sql = getSql();
      await sql.transaction(order.map((pid, i) => sql`UPDATE projects SET sort = ${i} WHERE id = ${id(pid)}`));
      return { ok: true };
    },

    DELETE: async (req) => {
      const rows = await getSql()`DELETE FROM projects WHERE id = ${id(req.query.id)} RETURNING id`;
      if (!rows.length) throw new HttpError(404, "Project not found");
      return { ok: true };
    },
  },
  { adminOnly: ["POST", "PUT", "PATCH", "DELETE"] },
);
