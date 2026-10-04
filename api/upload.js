const { getSql } = require("./_lib/db");
const { route, body, HttpError } = require("./_lib/http");

const MAX_BYTES = 3 * 1024 * 1024;

// Admin: stores an image (sent as a data URL) in Postgres and returns its public URL.
// The admin UI resizes/compresses to WebP before uploading, so files stay small.
module.exports = route(
  {
    POST: async (req) => {
      const { data } = body(req);
      const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(data || "");
      if (!match) throw new HttpError(400, "Expected a PNG, JPEG, WebP or GIF data URL");
      const [, mime, b64] = match;
      if (Buffer.byteLength(b64, "base64") > MAX_BYTES) throw new HttpError(413, "Image is larger than 3 MB");
      const [row] = await getSql()`
        INSERT INTO images (mime, data) VALUES (${mime}, decode(${b64}, 'base64')) RETURNING id`;
      return { url: `/api/image?id=${row.id}` };
    },
  },
  { adminOnly: ["POST"] }
);
