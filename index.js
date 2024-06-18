const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Create a sample table
db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )`);
});

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the SQLite API Service');
});

// Create a new user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Get all users
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

// Get a user by ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ user: row });
  });
});

// Update a user
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ updated: this.changes });
  });
});

// Delete a user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
