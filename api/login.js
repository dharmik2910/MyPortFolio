const { checkPassword, createToken, isAdmin } = require("./_lib/auth");
const { route, body } = require("./_lib/http");

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = route({
  // Exchange the admin password for a signed session token.
  POST: async (req, res) => {
    const { password } = body(req);
    if (!checkPassword(password)) {
      await wait(800); // slow down guessing
      res.status(401).json({ error: "Wrong password" });
      return;
    }
    return { token: createToken() };
  },
  // Lets the admin UI check whether a stored token is still valid.
  GET: async (req) => ({ ok: isAdmin(req) }),
});
