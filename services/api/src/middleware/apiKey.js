import crypto from "crypto";

// No fallback key: an unset key means the endpoint is switched off (503),
// never that some default from the repo is accepted.
export const requireApiKey = (envVarName) => (req, res, next) => {
  const expected = process.env[envVarName];
  if (!expected) {
    return res.status(503).json({ error: "Not configured" });
  }
  const given = Buffer.from(String(req.headers["x-api-key"] ?? ""));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
};
