import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Ingen token tillhandahölls" });

  // JWT_SECRET is guaranteed by assertRequiredEnv() at startup.
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Ogiltig token" });
    req.user = user; // innehåller userId & email
    next();
  });
};
