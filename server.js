require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

async function getDbConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'littlelink'
  });
  return connection;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

app.get('/api/links', async (req, res) => {
  try {
    const connection = await getDbConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM links ORDER BY sort_order ASC, created_at DESC'
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/links', authMiddleware, async (req, res) => {
  try {
    const { name, url, category, icon_class, sort_order } = req.body;
    const connection = await getDbConnection();
    const [result] = await connection.execute(
      'INSERT INTO links (name, url, category, icon_class, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, url, category || null, icon_class || null, sort_order || 0]
    );
    const [newRow] = await connection.execute(
      'SELECT * FROM links WHERE id = ?',
      [result.insertId]
    );
    await connection.end();
    res.status(201).json(newRow[0]);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/links/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, category, icon_class, sort_order } = req.body;
    const connection = await getDbConnection();
    
    await connection.execute(
      'UPDATE links SET name = ?, url = ?, category = ?, icon_class = ?, sort_order = ? WHERE id = ?',
      [name, url, category || null, icon_class || null, sort_order || 0, id]
    );
    
    const [updatedRow] = await connection.execute(
      'SELECT * FROM links WHERE id = ?',
      [id]
    );
    await connection.end();
    
    if (updatedRow.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json(updatedRow[0]);
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/links/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await getDbConnection();
    const [result] = await connection.execute(
      'DELETE FROM links WHERE id = ?',
      [id]
    );
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
