const { getSql } = require("./_lib/db");
const { route, body, str, id, HttpError } = require("./_lib/http");

const clean = (b) => {
  const color = str(b.color, { field: "Color", max: 7 }) || "#f3ece0";
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new HttpError(400, "Color must be a hex value like #ff5823");
  return {
    name: str(b.name, { field: "Name", required: true, max: 60 }),
    icon: str(b.icon, { field: "Icon", max: 40 }),
    color,
    category: str(b.category, { field: "Category", max: 40 }) || "Other",
  };
};

module.exports = route(
  {
    POST: async (req) => {
      const s = clean(body(req));
      const [row] = await getSql()`
        INSERT INTO skills (name, icon, color, category, sort)
        VALUES (${s.name}, ${s.icon}, ${s.color}, ${s.category}, (SELECT COALESCE(MAX(sort), -1) + 1 FROM skills))
        RETURNING id, name, icon, color, category`;
      return row;
    },

    PUT: async (req) => {
      const s = clean(body(req));
      const [row] = await getSql()`
        UPDATE skills SET name = ${s.name}, icon = ${s.icon}, color = ${s.color}, category = ${s.category}
        WHERE id = ${id(req.query.id)}
        RETURNING id, name, icon, color, category`;
      if (!row) throw new HttpError(404, "Skill not found");
      return row;
    },

    // Reorder: body { order: [id, id, ...] }
    PATCH: async (req) => {
      const { order } = body(req);
      if (!Array.isArray(order) || order.length > 500) throw new HttpError(400, "order must be a list of ids");
      const sql = getSql();
      await sql.transaction(order.map((sid, i) => sql`UPDATE skills SET sort = ${i} WHERE id = ${id(sid)}`));
      return { ok: true };
    },

    DELETE: async (req) => {
      const rows = await getSql()`DELETE FROM skills WHERE id = ${id(req.query.id)} RETURNING id`;
      if (!rows.length) throw new HttpError(404, "Skill not found");
      return { ok: true };
    },
  },
  { adminOnly: ["POST", "PUT", "PATCH", "DELETE"] }
);
