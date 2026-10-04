const { getSql } = require("./_lib/db");
const { route, body, str, id, HttpError } = require("./_lib/http");

module.exports = route(
  {
    // Public: contact form submissions.
    POST: async (req) => {
      const b = body(req);
      if (b.company) return { ok: true }; // honeypot filled → bot; pretend success
      const name = str(b.name, { field: "Name", required: true, max: 100 });
      const email = str(b.email, { field: "Email", required: true, max: 200 });
      const message = str(b.message, { field: "Message", required: true, max: 5000 });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Invalid email");
      await getSql()`INSERT INTO messages (name, email, message) VALUES (${name}, ${email}, ${message})`;
      return { ok: true };
    },

    GET: async () => {
      const rows = await getSql()`
        SELECT id, name, email, message, is_read, created_at FROM messages ORDER BY created_at DESC LIMIT 500`;
      return { messages: rows };
    },

    // body { is_read: boolean }
    PATCH: async (req) => {
      const isRead = Boolean(body(req).is_read);
      const rows = await getSql()`UPDATE messages SET is_read = ${isRead} WHERE id = ${id(req.query.id)} RETURNING id`;
      if (!rows.length) throw new HttpError(404, "Message not found");
      return { ok: true };
    },

    DELETE: async (req) => {
      const rows = await getSql()`DELETE FROM messages WHERE id = ${id(req.query.id)} RETURNING id`;
      if (!rows.length) throw new HttpError(404, "Message not found");
      return { ok: true };
    },
  },
  { adminOnly: ["GET", "PATCH", "DELETE"] }
);
