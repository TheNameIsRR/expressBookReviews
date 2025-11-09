const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const usersFile = path.join(__dirname, 'users.json');

// Load users from file
let users = [];
if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile));
}

// Save users to file
const saveUsers = () => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const isValid = (username) => {
  return users.some(u => u.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// Register new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  if (isValid(username))
    return res.status(400).json({ message: "User already exists" });

  users.push({ username, password });
  saveUsers();
  res.status(200).json({ message: "User registered successfully" });
});

// Login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!authenticatedUser(username, password))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { token, username };
  res.status(200).json({ message: "Login successful", token });
});

// Delete a review by the logged-in user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user; // set by JWT middleware
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "No review found for this user" });
    }
  });
  
  

// ✅ Add or modify a review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(' ')[1];
  let username;

  try {
    const decoded = jwt.verify(token, "access");
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Ensure book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update user's review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = authenticatedUser;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.regd_users = regd_users;
