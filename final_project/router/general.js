const express = require('express');
const axios = require('axios'); // ✅ for async/promise simulation
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ===============================
// 🟢 Register a new user
// ===============================
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });
});

// ===============================
// 🟩 Task 10: Get all books (Async/Await)
// ===============================
public_users.get('/', async (req, res) => {
  try {
    // Simulate async operation
    const response = await new Promise((resolve) => {
      setTimeout(() => resolve({ data: books }), 200);
    });
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// ===============================
// 🟦 Task 11: Get book details based on ISBN (Async/Await)
// ===============================
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve({ data: books[isbn] });
      } else {
        reject(new Error("Book not found"));
      }
    });
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ===============================
// 🟨 Task 12: Get book details based on Author (Promise then/catch)
// ===============================
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  new Promise((resolve, reject) => {
    const booksByAuthor = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author
    );
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject(new Error("No books found by this author"));
    }
  })
    .then((data) => res.status(200).json(data))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// ===============================
// 🟧 Task 13: Get book details based on Title (Async/Await)
// ===============================
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const response = await new Promise((resolve, reject) => {
      const booksByTitle = Object.values(books).filter(
        (book) => book.title.toLowerCase().includes(title)
      );
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error("No books found with this title"));
      }
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// ===============================
// 💬 Get book reviews
// ===============================
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        if (book.reviews && Object.keys(book.reviews).length > 0) {
          resolve(book.reviews);
        } else {
          resolve({ message: "No reviews found for this book." });
        }
      } else {
        reject(new Error("Book not found"));
      }
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports.general = public_users;
