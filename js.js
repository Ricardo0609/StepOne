/**
 * StepOne — js.js
 * Gestión de metas y logros con persistencia en localStorage
 */

// =============================================
// CONSTANTES & ESTADO
// =============================================
const KEY_METAS  = 'stepone_metas';
const KEY_LOGROS = 'stepone_logros';

let metas  = JSON.parse(localStorage.getItem(KEY_METAS)  || '[]');
let logros = JSON.parse(localStorage.getItem(KEY_LOGROS) || '[]');

let pasosTemp    = [];   // Pasos del formulario de nueva meta
let metaActivaId = null; // ID de la meta abierta en detalle
let logroActivoId = null;

// =============================================
// UTILS
// =============================================
function guardarMetas()  { localStorage.setItem(KEY_METAS,  JSON.stringify(metas));  }
function guardarLogros() { localStorage.setItem(KEY_LOGROS, JSON.stringify(logros)); }

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatFechaCorta(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]} ${y}`;
}

function formatFechaISO(isoString) {
  if (!isoString) return '';
  const dt = new Date(isoString);
  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${dt.getDate()} ${MESES[dt.getMonth()]} ${dt.getFullYear()}`;
}

function estaVencida(fechaStr) {
  if (!fechaStr) return false;
  return new Date(fechaStr + 'T23:59:59') < new Date();
}

function calcProgreso(pasos) {
  if (!pasos || pasos.length === 0) return { completados: 0, total: 0, pct: 0 };
  const completados = pasos.filter(p => p.completado).length;
  return { completados, total: pasos.length, pct: Math.round((completados / pasos.length) * 100) };
}

// =============================================
// TOAST
// =============================================
let toastTimer = null;

function mostrarToast(msg, tipo = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.className = `toast toast-${tipo}`;
  toastTimer = setTimeout(() => { el.classList.add('oculto'); }, 2800);
}

// =============================================
// RENDER — METAS (index.html)
// =============================================
function renderMetas() {
  const contenedor  = document.getElementById('contenedor-metas');
  const emptyState  = document.getElementById('empty-state');
  const resumenEl   = document.getElementById('resumen');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  if (metas.length === 0) {
    emptyState?.classList.remove('oculto');
    if (resumenEl) resumenEl.textContent = '';
    return;
  }

  emptyState?.classList.add('oculto');

  if (resumenEl) {
    const total = metas.length;
    const conPasos = metas.filter(m => m.pasos?.length > 0).length;
    resumenEl.textContent = `${total} meta${total !== 1 ? 's' : ''} activa${total !== 1 ? 's' : ''}${conPasos > 0 ? ` · ${conPasos} con pasos` : ''}`;
  }

  metas.forEach(meta => {
    const prog = calcProgreso(meta.pasos);
    const vencida = estaVencida(meta.fecha);

    const card = document.createElement('article');
    card.className = 'meta-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Meta: ${meta.titulo}`);
    card.dataset.id = meta.id;

    let chipsHTML = '';
    if (meta.fecha) chipsHTML += `<span class="card-chip">📅 ${formatFechaCorta(meta.fecha)}</span>`;
    if (meta.pasos?.length > 0) chipsHTML += `<span class="card-chip">📋 ${meta.pasos.length} paso${meta.pasos.length !== 1 ? 's' : ''}</span>`;

    card.innerHTML = `
      <div class="card-top">
        <h3 class="card-titulo">${escapeHtml(meta.titulo)}</h3>
        ${vencida ? '<span class="badge-vencida">Vencida</span>' : ''}
      </div>
      ${meta.descripcion ? `<p class="card-desc">${escapeHtml(meta.descripcion)}</p>` : ''}
      ${chipsHTML ? `<div class="card-chips">${chipsHTML}</div>` : ''}
      ${meta.pasos?.length > 0 ? `
        <div class="card-progress">
          <div class="progress-label">
            <span>${prog.completados} de ${prog.total} pasos</span>
            <span class="progress-pct">${prog.pct}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill ${prog.pct === 100 ? 'completo' : ''}" style="width:${prog.pct}%"></div>
          </div>
        </div>
      ` : '<p class="card-no-pasos">Toca para añadir pasos</p>'}
    `;

    const abrir = () => abrirDetalleMeta(meta.id);
    card.addEventListener('click', abrir);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') abrir(); });

    contenedor.appendChild(card);
  });
}

// =============================================
// RENDER — LOGROS (logros.html)
// =============================================
function renderLogros() {
  const contenedor = document.getElementById('contenedor-logros');
  const emptyState = document.getElementById('empty-state-logros');
  const resumenEl  = document.getElementById('resumen-logros');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  if (logros.length === 0) {
    emptyState?.classList.remove('oculto');
    if (resumenEl) resumenEl.textContent = '';
    return;
  }

  emptyState?.classList.add('oculto');

  if (resumenEl) {
    resumenEl.textContent = `${logros.length} logro${logros.length !== 1 ? 's' : ''} conseguido${logros.length !== 1 ? 's' : ''}`;
  }

  logros.forEach(logro => {
    const card = document.createElement('article');
    card.className = 'meta-card logro-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Logro: ${logro.titulo}`);
    card.dataset.id = logro.id;

    card.innerHTML = `
      <span class="logro-trophy-small" aria-hidden="true">🏆</span>
      <div class="card-top">
        <h3 class="card-titulo">${escapeHtml(logro.titulo)}</h3>
      </div>
      ${logro.descripcion ? `<p class="card-desc">${escapeHtml(logro.descripcion)}</p>` : ''}
      <div class="card-chips">
        <span class="card-chip chip-completado">✅ Completado el ${formatFechaISO(logro.fechaCompletado)}</span>
        ${logro.pasos?.length > 0 ? `<span class="card-chip">📋 ${logro.pasos.length} pasos</span>` : ''}
      </div>
    `;

    const abrir = () => abrirDetalleLogro(logro.id);
    card.addEventListener('click', abrir);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') abrir(); });

    contenedor.appendChild(card);
  });
}

// =============================================
// MODAL — AGREGAR META
// =============================================
function abrirModalAgregar() {
  pasosTemp = [];
  const overlay = document.getElementById('overlay');
  const fields = ['inp-titulo', 'inp-descripcion', 'inp-fecha'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  renderPasosTemp();
  overlay?.classList.remove('oculto');
  setTimeout(() => document.getElementById('inp-titulo')?.focus(), 80);
}

function cerrarModalAgregar() {
  document.getElementById('overlay')?.classList.add('oculto');
}

function renderPasosTemp() {
  const lista = document.getElementById('lista-pasos-temp');
  if (!lista) return;
  lista.innerHTML = '';

  pasosTemp.forEach((texto, idx) => {
    const li = document.createElement('li');
    li.className = 'paso-temp-item';
    li.innerHTML = `
      <span>${escapeHtml(texto)}</span>
      <button class="btn-del-paso-temp" aria-label="Eliminar paso">×</button>
    `;
    li.querySelector('.btn-del-paso-temp').addEventListener('click', () => {
      pasosTemp.splice(idx, 1);
      renderPasosTemp();
    });
    lista.appendChild(li);
  });
}

function intentarAgregarPasoTemp() {
  const inp = document.getElementById('inp-paso');
  const texto = inp?.value.trim();
  if (!texto) return;
  pasosTemp.push(texto);
  inp.value = '';
  renderPasosTemp();
  inp.focus();
}

function guardarMeta() {
  const titulo      = document.getElementById('inp-titulo')?.value.trim();
  const descripcion = document.getElementById('inp-descripcion')?.value.trim();
  const fecha       = document.getElementById('inp-fecha')?.value || null;

  if (!titulo) {
    mostrarToast('Escribe un nombre para la meta', 'error');
    document.getElementById('inp-titulo')?.focus();
    return;
  }

  const meta = {
    id:          uid(),
    titulo,
    descripcion: descripcion || '',
    fecha,
    pasos:       pasosTemp.map(texto => ({ id: uid(), texto, completado: false })),
    fechaCreado: new Date().toISOString(),
  };

  metas.push(meta);
  guardarMetas();
  cerrarModalAgregar();
  renderMetas();
  mostrarToast('Meta añadida 🎯', 'success');
}

// =============================================
// MODAL — DETALLE META
// =============================================
function abrirDetalleMeta(id) {
  const meta = metas.find(m => m.id === id);
  if (!meta) return;
  metaActivaId = id;

  const overlay = document.getElementById('overlay-meta');

  // Título
  const tituloEl = document.getElementById('detalle-titulo');
  if (tituloEl) tituloEl.textContent = meta.titulo;

  // Descripción
  const descEl = document.getElementById('detalle-desc');
  if (descEl) {
    descEl.textContent = meta.descripcion || '';
    descEl.style.display = meta.descripcion ? 'block' : 'none';
  }

  // Fecha
  const fechaEl = document.getElementById('detalle-fecha');
  if (fechaEl) {
    if (meta.fecha) {
      fechaEl.textContent = `📅 Fecha límite: ${formatFechaCorta(meta.fecha)}`;
      fechaEl.style.display = 'inline-flex';
    } else {
      fechaEl.style.display = 'none';
    }
  }

  // Progress block
  const progBlock = document.getElementById('progress-block');
  if (progBlock) {
    progBlock.style.display = (meta.pasos?.length > 0) ? 'block' : 'none';
  }

  renderDetallePasos(meta);

  // Limpiar input inline
  const inpInline = document.getElementById('inp-paso-inline');
  if (inpInline) inpInline.value = '';

  overlay?.classList.remove('oculto');
}

function cerrarDetalleMeta() {
  document.getElementById('overlay-meta')?.classList.add('oculto');
  metaActivaId = null;
}

function renderDetallePasos(meta) {
  const lista     = document.getElementById('detalle-pasos');
  const progText  = document.getElementById('detalle-progreso-text');
  const progFill  = document.getElementById('detalle-progress-fill');
  if (!lista) return;

  const prog = calcProgreso(meta.pasos);

  if (progText) progText.textContent = `${prog.completados}/${prog.total}`;
  if (progFill) {
    progFill.style.width = `${prog.pct}%`;
    progFill.className = `progress-bar-fill${prog.pct === 100 ? ' completo' : ''}`;
  }

  lista.innerHTML = '';

  if (!meta.pasos || meta.pasos.length === 0) {
    const li = document.createElement('li');
    li.className = 'no-pasos-msg';
    li.textContent = 'Sin pasos. Añade uno debajo.';
    lista.appendChild(li);
    return;
  }

  meta.pasos.forEach(paso => {
    const li = document.createElement('li');
    li.className = `paso-item${paso.completado ? ' completado' : ''}`;

    li.innerHTML = `
      <label class="paso-label" aria-label="${escapeHtml(paso.texto)}">
        <input type="checkbox" ${paso.completado ? 'checked' : ''} data-paso-id="${paso.id}">
        <span class="paso-check" aria-hidden="true"></span>
        <span class="paso-texto">${escapeHtml(paso.texto)}</span>
      </label>
      <button class="btn-del-paso-item" data-paso-id="${paso.id}" aria-label="Eliminar paso">×</button>
    `;

    li.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
      togglePaso(paso.id, e.target.checked);
    });

    li.querySelector('.btn-del-paso-item').addEventListener('click', () => {
      eliminarPaso(paso.id);
    });

    lista.appendChild(li);
  });
}

function togglePaso(pasoId, completado) {
  const meta = metas.find(m => m.id === metaActivaId);
  if (!meta) return;
  const paso = meta.pasos.find(p => p.id === pasoId);
  if (paso) {
    paso.completado = completado;
    guardarMetas();
    renderDetallePasos(meta);
    renderMetas();
  }
}

function eliminarPaso(pasoId) {
  const meta = metas.find(m => m.id === metaActivaId);
  if (!meta) return;
  meta.pasos = meta.pasos.filter(p => p.id !== pasoId);
  guardarMetas();

  const progBlock = document.getElementById('progress-block');
  if (progBlock) progBlock.style.display = (meta.pasos.length > 0) ? 'block' : 'none';

  renderDetallePasos(meta);
  renderMetas();
}

function agregarPasoInline() {
  const inp = document.getElementById('inp-paso-inline');
  const texto = inp?.value.trim();
  if (!texto) return;

  const meta = metas.find(m => m.id === metaActivaId);
  if (!meta) return;

  if (!meta.pasos) meta.pasos = [];
  meta.pasos.push({ id: uid(), texto, completado: false });
  guardarMetas();
  inp.value = '';

  const progBlock = document.getElementById('progress-block');
  if (progBlock) progBlock.style.display = 'block';

  renderDetallePasos(meta);
  renderMetas();
  inp.focus();
}

function completarMeta() {
  const meta = metas.find(m => m.id === metaActivaId);
  if (!meta) return;

  const logro = { ...meta, fechaCompletado: new Date().toISOString() };

  logros.unshift(logro);
  metas = metas.filter(m => m.id !== metaActivaId);

  guardarMetas();
  guardarLogros();
  cerrarDetalleMeta();
  renderMetas();
  mostrarToast('¡Meta completada! Nuevo logro desbloqueado 🏆', 'success');
}

function eliminarMeta() {
  if (!confirm('¿Eliminar esta meta? Esta acción no se puede deshacer.')) return;
  metas = metas.filter(m => m.id !== metaActivaId);
  guardarMetas();
  cerrarDetalleMeta();
  renderMetas();
  mostrarToast('Meta eliminada', 'info');
}

// =============================================
// MODAL — DETALLE LOGRO
// =============================================
function abrirDetalleLogro(id) {
  const logro = logros.find(l => l.id === id);
  if (!logro) return;
  logroActivoId = id;

  const overlay = document.getElementById('overlay-logro');

  const tituloEl = document.getElementById('logro-titulo');
  if (tituloEl) tituloEl.textContent = logro.titulo;

  const descEl = document.getElementById('logro-desc');
  if (descEl) {
    descEl.textContent = logro.descripcion || '';
    descEl.style.display = logro.descripcion ? 'block' : 'none';
  }

  const fechaEl = document.getElementById('logro-fecha-completado');
  if (fechaEl) fechaEl.textContent = `🏆 Completado el ${formatFechaISO(logro.fechaCompletado)}`;

  const lista = document.getElementById('logro-pasos');
  if (lista) {
    lista.innerHTML = '';
    if (logro.pasos && logro.pasos.length > 0) {
      logro.pasos.forEach(paso => {
        const li = document.createElement('li');
        li.className = 'paso-item completado';
        li.innerHTML = `
          <span class="paso-check" aria-hidden="true"></span>
          <span class="paso-texto">${escapeHtml(paso.texto)}</span>
        `;
        lista.appendChild(li);
      });
    }
  }

  overlay?.classList.remove('oculto');
}

function cerrarDetalleLogro() {
  document.getElementById('overlay-logro')?.classList.add('oculto');
  logroActivoId = null;
}

function eliminarLogro() {
  if (!confirm('¿Eliminar este logro? Esta acción no se puede deshacer.')) return;
  logros = logros.filter(l => l.id !== logroActivoId);
  guardarLogros();
  cerrarDetalleLogro();
  renderLogros();
  mostrarToast('Logro eliminado', 'info');
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {

  // Detectar página actual
  const enMetas  = !!document.getElementById('contenedor-metas');
  const enLogros = !!document.getElementById('contenedor-logros');

  if (enMetas)  renderMetas();
  if (enLogros) renderLogros();

  // --- BOTÓN FAB ---
  document.getElementById('btn-agregar')?.addEventListener('click', abrirModalAgregar);

  // --- MODAL AGREGAR: cerrar ---
  document.getElementById('btn-cancelar')?.addEventListener('click', cerrarModalAgregar);
  document.getElementById('modal-backdrop')?.addEventListener('click', cerrarModalAgregar);

  // --- MODAL AGREGAR: guardar ---
  document.getElementById('btn-guardar')?.addEventListener('click', guardarMeta);
  document.getElementById('inp-titulo')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') guardarMeta();
  });

  // --- MODAL AGREGAR: añadir paso temp ---
  document.getElementById('btn-add-paso')?.addEventListener('click', intentarAgregarPasoTemp);
  document.getElementById('inp-paso')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      intentarAgregarPasoTemp();
    }
  });

  // --- DETALLE META: cerrar ---
  document.getElementById('btn-cerrar-detalle')?.addEventListener('click', cerrarDetalleMeta);
  document.getElementById('meta-backdrop')?.addEventListener('click', cerrarDetalleMeta);

  // --- DETALLE META: acciones ---
  document.getElementById('btn-completar-meta')?.addEventListener('click', completarMeta);
  document.getElementById('btn-eliminar-meta')?.addEventListener('click', eliminarMeta);

  // --- DETALLE META: añadir paso inline ---
  document.getElementById('btn-add-paso-inline')?.addEventListener('click', agregarPasoInline);
  document.getElementById('inp-paso-inline')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') agregarPasoInline();
  });

  // --- DETALLE LOGRO: cerrar ---
  document.getElementById('btn-cerrar-logro')?.addEventListener('click', cerrarDetalleLogro);
  document.getElementById('logro-backdrop')?.addEventListener('click', cerrarDetalleLogro);

  // --- DETALLE LOGRO: eliminar ---
  document.getElementById('btn-eliminar-logro')?.addEventListener('click', eliminarLogro);

  // --- ESC global ---
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    cerrarModalAgregar();
    cerrarDetalleMeta();
    cerrarDetalleLogro();
  });

});