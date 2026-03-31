// server.js
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const pool    = require('./db');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

// ── ESTANTES ──────────────────────────────────────────
app.post('/api/ubicacion', async (req, res) => {
  const { num_pasillo, num_estante } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO ubicacion (num_pasillo, num_estante)
       VALUES ($1, $2) RETURNING *`,
      [num_pasillo, num_estante]
    );
    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ── EDITORIALES ───────────────────────────────────────
app.post('/api/editorial', async (req, res) => {
  const { nombre_editorial, direccion_editorial } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO editorial (nombre_editorial, direccion_editorial)
       VALUES ($1, $2) RETURNING *`,
      [nombre_editorial, direccion_editorial]
    );
    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ── AUTORES ───────────────────────────────────────────
app.post('/api/autor', async (req, res) => {
  const { rfc_autor, nombre_autor, nacionalidad } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO autor (rfc_autor, nombre_autor, nacionalidad)
       VALUES ($1, $2, $3) RETURNING *`,
      [rfc_autor, nombre_autor, nacionalidad]
    );
    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ── LIBROS ────────────────────────────────────────────
app.post('/api/libro', async (req, res) => {
  const { nombre_libro, rfc_autor, id_editorial, id_ubicacion, cantidad } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO libros (nombre_libro, rfc_autor, id_editorial, id_ubicacion, cantidad)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre_libro, rfc_autor, id_editorial, id_ubicacion, cantidad]
    );
    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ── GETs para poblar los <select> ─────────────────────
app.get('/api/autores',     async (req, res) => {
  const r = await pool.query('SELECT rfc_autor, nombre_autor FROM autor ORDER BY nombre_autor');
  res.json(r.rows);
});

app.get('/api/editoriales', async (req, res) => {
  const r = await pool.query('SELECT id_editorial, nombre_editorial FROM editorial ORDER BY nombre_editorial');
  res.json(r.rows);
});

app.get('/api/ubicaciones', async (req, res) => {
  const r = await pool.query('SELECT id_ubicacion, num_pasillo, num_estante FROM ubicacion ORDER BY num_pasillo, num_estante');
  res.json(r.rows);
});


// ── GET libros (con joins) ────────────────────────────
app.get('/api/libros', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT 
        l.id_libro,
        l.nombre_libro,
        a.nombre_autor,
        e.nombre_editorial,
        u.num_pasillo,
        u.num_estante,
        l.cantidad
      FROM libros l
      JOIN autor     a ON l.rfc_autor    = a.rfc_autor
      JOIN editorial e ON l.id_editorial = e.id_editorial
      JOIN ubicacion u ON l.id_ubicacion = u.id_ubicacion
      ORDER BY l.id_libro
    `);
    res.json(r.rows);
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// ── Iniciar servidor ──────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
