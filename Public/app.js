// public/app.js
const API = 'http://localhost:3000/api';

// ── Helpers ──────────────────────────────────────────
async function post(endpoint, data) {
  const res = await fetch(`${API}/${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  return res.json();
}

function alerta(ok, mensaje) {
  alert(ok ? `✓ ${mensaje}` : `✗ Error: ${mensaje}`);
}

// ── Poblar selects al cargar la página ───────────────
async function cargarSelects() {
  const [autores, editoriales, ubicaciones] = await Promise.all([
    fetch(`${API}/autores`).then(r => r.json()),
    fetch(`${API}/editoriales`).then(r => r.json()),
    fetch(`${API}/ubicaciones`).then(r => r.json()),
  ]);

  const selAutor = document.getElementById('autor-libro');
  autores.forEach(a => {
    selAutor.innerHTML += `<option value="${a.rfc_autor}">${a.nombre_autor}</option>`;
  });

  const selEdit = document.getElementById('editorial-libro');
  editoriales.forEach(e => {
    selEdit.innerHTML += `<option value="${e.id_editorial}">${e.nombre_editorial}</option>`;
  });

  const selUbic = document.getElementById('ubicacion-libro');
  ubicaciones.forEach(u => {
    selUbic.innerHTML += `<option value="${u.id_ubicacion}">Pasillo ${u.num_pasillo} — Estante ${u.num_estante}</option>`;
  });
}

// ── Guardar estante ───────────────────────────────────
document.getElementById('btn-guardar-estante').addEventListener('click', async () => {
  const num_pasillo = parseInt(document.getElementById('pasillo').value);
  const num_estante = parseInt(document.getElementById('estante').value);

  if (!num_pasillo || !num_estante) return alerta(false, 'Completa todos los campos.');

  const res = await post('ubicacion', { num_pasillo, num_estante });
  alerta(res.ok, res.ok ? 'Ubicación guardada correctamente.' : res.error);
  if (res.ok) limpiar('page-estantes');
});

// ── Guardar editorial ─────────────────────────────────
document.getElementById('btn-guardar-editorial').addEventListener('click', async () => {
  const nombre_editorial    = document.getElementById('nombre-editorial').value.trim();
  const direccion_editorial = document.getElementById('direccion-editorial').value.trim();

  if (!nombre_editorial || !direccion_editorial) return alerta(false, 'Completa todos los campos.');

  const res = await post('editorial', { nombre_editorial, direccion_editorial });
  alerta(res.ok, res.ok ? 'Editorial guardada correctamente.' : res.error);
  if (res.ok) limpiar('page-editoriales');
});

// ── Guardar autor ─────────────────────────────────────
document.getElementById('btn-guardar-autor').addEventListener('click', async () => {
  const rfc_autor    = document.getElementById('rfc-autor').value.trim().toUpperCase();
  const nombre_autor = document.getElementById('nombre-autor').value.trim();
  const nacionalidad = document.getElementById('nacionalidad').value.trim();

  if (!rfc_autor || !nombre_autor || !nacionalidad) return alerta(false, 'Completa todos los campos.');

  const rfcRegex = /^[A-ZÁÉÍÓÚÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
  if (!rfcRegex.test(rfc_autor)) return alerta(false, 'El RFC no tiene un formato válido.');

  const res = await post('autor', { rfc_autor, nombre_autor, nacionalidad });
  alerta(res.ok, res.ok ? 'Autor guardado correctamente.' : res.error);
  if (res.ok) limpiar('page-autores');
});

// ── Guardar libro ─────────────────────────────────────
document.getElementById('btn-guardar-libro').addEventListener('click', async () => {
  const nombre_libro  = document.getElementById('nombre-libro').value.trim();
  const rfc_autor     = document.getElementById('autor-libro').value;
  const id_editorial  = document.getElementById('editorial-libro').value;
  const id_ubicacion  = document.getElementById('ubicacion-libro').value;
  const cantidad      = parseInt(document.getElementById('cantidad-libro').value);

  if (!nombre_libro || !rfc_autor || !id_editorial || !id_ubicacion || isNaN(cantidad)) {
    return alerta(false, 'Completa todos los campos.');
  }

  const res = await post('libro', { nombre_libro, rfc_autor, id_editorial, id_ubicacion, cantidad });
  alerta(res.ok, res.ok ? 'Libro guardado correctamente.' : res.error);
  if (res.ok) limpiar('page-libros');
});

// ── Cargar inventario ─────────────────────────────────
async function cargarInventario() {
  const tbody = document.getElementById('body-inventario');
  try {
    const libros = await fetch(`${API}/libros`).then(r => r.json());

    if (libros.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:32px; text-align:center; color:var(--text-muted);">No hay libros registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = libros.map((l, i) => `
      <tr style="border-bottom: 1px solid var(--border); ${i % 2 === 0 ? '' : 'background: var(--bg);'}">
        <td style="padding: 12px 16px; color:var(--text-muted);">${l.id_libro}</td>
        <td style="padding: 12px 16px; font-weight:500;">${l.nombre_libro}</td>
        <td style="padding: 12px 16px;">${l.nombre_autor}</td>
        <td style="padding: 12px 16px;">${l.nombre_editorial}</td>
        <td style="padding: 12px 16px;">Pasillo ${l.num_pasillo} — Estante ${l.num_estante}</td>
        <td style="padding: 12px 16px; text-align:center;">${l.cantidad}</td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:32px; text-align:center; color:red;">Error al cargar los datos.</td></tr>`;
  }
}

// ── Inicializar ───────────────────────────────────────
cargarSelects();