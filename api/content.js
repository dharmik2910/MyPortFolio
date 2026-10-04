const { getSql } = require("./_lib/db");
const { route } = require("./_lib/http");

// Public: everything the portfolio renders, in one round trip.
module.exports = route({
  GET: async (req, res) => {
    const sql = getSql();
    const [settings, projects, skills] = await Promise.all([
      sql`SELECT key, value FROM settings`,
      sql`SELECT id, name, description, image, github, demo, icons, featured, status, links FROM projects ORDER BY sort, id`,
      sql`SELECT id, name, icon, color, category FROM skills ORDER BY sort, id`,
    ]);
    const byKey = Object.fromEntries(settings.map((r) => [r.key, r.value]));

    res.setHeader(
      "Cache-Control",
      req.query.fresh ? "no-store" : "public, s-maxage=15, stale-while-revalidate=300"
    );
    return {
      profile: byKey.profile || {},
      about: byKey.about || {},
      contact: byKey.contact || {},
      projects,
      skills,
    };
  },
});
