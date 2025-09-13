const express = require('express');   // Import Express
const mongoose = require('mongoose'); // Import Mongoose

const app = express();                // Define app FIRST

// Middleware
app.use(express.json());

// Routes
app.get('/api/schemes', (req, res) => {
  res.json([]);
});

app.get('/api/members', (req, res) => {
  res.json([]);
});

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/jewelrydb', { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
