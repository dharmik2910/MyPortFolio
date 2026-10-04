const { getSql } = require("./_lib/db");
const { route, HttpError } = require("./_lib/http");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Public: serves an uploaded image. Images are immutable (new upload = new id), so cache forever.
module.exports = route({
  GET: async (req, res) => {
    const imageId = String(req.query.id || "");
    if (!UUID.test(imageId)) throw new HttpError(400, "Invalid image id");
    const [row] = await getSql()`SELECT mime, encode(data, 'base64') AS b64 FROM images WHERE id = ${imageId}`;
    if (!row) throw new HttpError(404, "Image not found");
    res.setHeader("Content-Type", row.mime);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.status(200).send(Buffer.from(row.b64, "base64"));
  },
});
