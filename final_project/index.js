const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').regd_users;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// ✅ Session setup
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// ✅ Middleware for verifying JWT
app.use("/customer/auth/*", function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, "access");
    req.user = decoded.username; // store username in request
    next(); // 🔹 important: allow route to proceed
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});

const PORT = 5000;

// ✅ Attach routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));
