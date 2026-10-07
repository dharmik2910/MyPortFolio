// Picked up automatically by `npm start` (Create React App). Serves /api/* from the
// local handlers in /api so the admin and live content work with a single command.
// Everything else (images, hot reload) stays with the dev server.
const { handleApi } = require("../scripts/dev-api");

module.exports = (app) => {
  app.use((req, res, next) => (req.url.startsWith("/api/") ? handleApi(req, res) : next()));
};
