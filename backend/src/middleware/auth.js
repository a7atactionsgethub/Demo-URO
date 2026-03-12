// Auth middleware — stubbed for now
// Later: validate JWT, check roles (doctor / patient / admin)

function auth(req, res, next) {
  // TODO: Add JWT verification here
  // const token = req.headers.authorization?.split(" ")[1];
  // if (!token) return res.status(401).json({ error: "Unauthorized" });
  // const user = verifyToken(token);
  // req.user = user;
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    // TODO: Check req.user.role === role
    next();
  };
}

module.exports = { auth, requireRole };
