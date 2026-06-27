import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { list, set, deleteNote } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the project root
app.use(express.static(__dirname));

// API: Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await list();
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// API: Create a note
app.post('/api/notes', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid note text' });
    }

    const createdAt = Date.now();
    const id = crypto.randomUUID();

    await set(id, { text, createdAt });

    res.json({ id, text, createdAt });
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// API: Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete request for id:', id);
    await deleteNote(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    port: process.env.PORT || 3000,
    replit: !!process.env.REPLIT_DB_URL,
    status: 'OK'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Public (on Replit): https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});
