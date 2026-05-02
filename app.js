'use strict';

const KEY = 'ambar_v1';
const DAY = 86400000;
const NOW = new Date();

const COLORES_HEX = {
  'Rojo':'#D94040','Negro':'#1C1C1E','Blanco':'#E8E8E8','Azul':'#2563EB',
  'Verde':'#16A34A','Amarillo':'#D97706','Naranja':'#EA580C','Gris':'#6B7280',
  'Violeta':'#7C3AED','Rosa':'#DB2777','Bordo':'#9F1239','Celeste':'#0284C7',
  'Grafito':'#374151','Plata':'#9CA3AF','Marron':'#92400E'
};

const AVATAR_BG = ['#4C3FD4','#0E7A5F','#C47B0A','#1A6BB5','#9B2B2B','#5B21B6','#065F46'];

function todayStr() { return NOW.toISOString().split('T')[0]; }
function ago(s) { return Math.round((NOW - new Date(s)) / DAY); }
function addDays(s, n) { const d = new Date(s); d.setDate(d.getDate() + n); return d.toISOString().split('T')[0]; }
function fmtDate(s) { return new Date(s).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }); }
function initials(n) { return n.trim().split(/\s+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase() || '?'; }
function avatarBg(n) { return AVATAR_BG[(n.charCodeAt(0) + (n.charCodeAt(1)||0)) % AVATAR_BG.length]; }
function pesos(n) { return '$' + Math.round(n).toLocaleString('es-AR'); }
function getMoto(id) { return S.motos.find(m => m.id == id) || { marca:'', modelo:'Moto', precio:0, cuota:0 }; }
function getMotoNombre(id) { const m = getMoto(id); return (m.marca + ' ' + m.modelo).trim(); }
function qs(sel) { return document.querySelector(sel); }
function el(id) { return document.getElementById(id); }

/* ── DEFAULT DATA ─────────────────────────────────── */
const DEFAULT = {
  nextId: 300,
  motos: [
    { id:1, marca:'Honda', modelo:'CB 190R', precio:480000, cuota:52000, cc:'190cc', consumo:'38', colores:['Rojo','Negro','Blanco'], stock:3, perfil:'Uso diario ciudad' },
    { id:2, marca:'Yamaha', modelo:'FZ25', precio:620000, cuota:68000, cc:'250cc', consumo:'32', colores:['Azul','Negro'], stock:2, perfil:'Deportivo' },
    { id:3, marca:'Bajaj', modelo:'Pulsar NS200', precio:550000, cuota:60000, cc:'200cc', consumo:'30', colores:['Negro','Rojo'], stock:5, perfil:'Deportivo' },
    { id:4, marca:'Honda', modelo:'Wave 110', precio:285000, cuota:31000, cc:'110cc', consumo:'55', colores:['Rojo','Azul','Blanco'], stock:1, perfil:'Economico' },
    { id:5, marca:'Motomel', modelo:'Skua 150', precio:320000, cuota:35000, cc:'150cc', consumo:'45', colores:['Negro','Verde'], stock:4, perfil:'Primerizo/a' },
  ],
  clientes: [
    { id:1, nombre:'Sofia Benitez', tel:'1155443322', tipo:'Mujer compradora', motoInt:1, prioridad:'alta', notas:'Le gusto la CB 190R roja, vuelve con el sueldo del 15', fecha: addDays(todayStr(),-1) },
    { id:2, nombre:'Lucas Fernandez', tel:'1162233445', tipo:'Comparador', motoInt:2, prioridad:'alta', notas:'Fue a 3 locales, quiere el mejor precio', fecha: addDays(todayStr(),-4) },
    { id:3, nombre:'Marta y Rodrigo', tel:'1177889900', tipo:'Pareja/familia', motoInt:5, prioridad:'media', notas:'El quiere comprar, ella tiene dudas del mantenimiento', fecha: addDays(todayStr(),-5) },
    { id:4, nombre:'Diego Rios', tel:'1144556677', tipo:'Curioso', motoInt:1, prioridad:'baja', notas:'Solo miraba, le deje mi contacto', fecha: addDays(todayStr(),-8) },
  ],
  ventas: [
    { id:1, clienteNombre:'Carla Mendez', motoId:1, motoNombre:'Honda CB 190R', color:'Roja', precio:490000, pago:'Cuotas x12', fecha: addDays(todayStr(),-15), notas:'Incluyo casco', postventa:'pendiente' },
    { id:2, clienteNombre:'Tomas Gimenez', motoId:3, motoNombre:'Bajaj Pulsar NS200', color:'Negro', precio:560000, pago:'Contado', fecha: addDays(todayStr(),-3), notas:'', postventa:'pendiente' },
    { id:3, clienteNombre:'Ana Morales', motoId:5, motoNombre:'Motomel Skua 150', color:'Verde', precio:325000, pago:'Cuotas x18', fecha: addDays(todayStr(),-22), notas:'Primera moto', postventa:'completado' },
  ]
};

/* ── STATE ───────────────────────────────────────── */
let S;
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT));
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {}
}

/* ── SEMAFORO ─────────────────────────────────────── */
function semCliente(c) {
  const d = ago(c.fecha);
  if (c.prioridad === 'alta' && d >= 1) return { cls:'b-red', stripe:'#D94040', dot:true, label:'Urgente', key:'rojo' };
  if (c.prioridad === 'media' && d >= 4) return { cls:'b-amber', stripe:'#F0A830', dot:true, label:'Esta semana', key:'naranja' };
  if (d >= 10) return { cls:'b-amber', stripe:'#F0A830', dot:true, label:'Demorado', key:'naranja' };
  return { cls:'b-green', stripe:'#4DBFA0', dot:false, label:'Al dia', key:'verde' };
}
function semVenta(v) {
  if (v.postventa === 'completado') return null;
  const d = ago(v.fecha);
  if (d >= 15) return { cls:'b-red', stripe:'#D94040', dot:true, label:'Post-venta HOY', key:'azul' };
  if (d >= 12) return { cls:'b-amber', stripe:'#F0A830', dot:true, label:'Post-venta pronto', key:'azul' };
  return { cls:'b-blue', stripe:'#6FAEE8', dot:false, label:'Post-venta OK', key:'azul' };
}

/* ── MENSAJES ─────────────────────────────────────── */
function msgCliente(c) {
  const m = getMotoNombre(c.motoInt);
  const fn = c.nombre.split(' ')[0];
  if (c.prioridad === 'alta')
    return `Hola ${fn}! Te escribo de la concesionaria, soy Ambar.\n\nEstuve pensando en vos — estuviste viendo la ${m} y queria saber si pudiste pensar en la propuesta.\n\nEsta semana tenemos disponibilidad y te puedo reservar una. Cualquier duda me avisas!`;
  if (c.prioridad === 'media')
    return `Hola ${fn}! Soy Ambar de la concesionaria.\n\nComo estas? Queria ver si seguia en tus planes lo de la ${m}.\n\nSi queres que te pase el detalle de financiacion o colores disponibles, avisame. Sin compromiso!`;
  return `Hola ${fn}! Soy Ambar de la concesionaria, te habia atendido cuando viniste a ver motos.\n\nTe escribo para ver si todavia tenes en mente comprarte una. Si queres info actualizada, con gusto te ayudo.`;
}
function msgPostventa(v) {
  return `Hola ${v.clienteNombre.split(' ')[0]}! Soy Ambar, te ayude con la ${v.motoNombre} ${v.color}.\n\nYa pasaron 15 dias — como la estas disfrutando? Se adapto bien a tu rutina?\n\nSi tenes alguna pregunta del service o del manejo, me escribis cuando quieras. Y si conoces a alguien que este buscando moto, ya sabes donde estoy!`;
}

/* ── NAVIGATION ─────────────────────────────────── */
function goScreen(name, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(b => b.classList.remove('active'));
  el('sc-' + name).classList.add('active');
  btn.classList.add('active');
  const renders = { inicio: renderInicio, seguimiento: () => renderSeg('todos'), prospectos: renderProspectos, stock: renderStock, comisiones: renderComisiones, ia: renderIA, tips: renderTips };
  renders[name] && renders[name]();
}

/* ── SHEETS ──────────────────────────────────────── */
function openSheet(id) {
  populateSelects();
  el(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSheet(id) {
  el(id).classList.remove('open');
  document.body.style.overflow = '';
}

/* ── TOAST ───────────────────────────────────────── */
let _toastTimer;
function toast(msg) {
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── POPULATORS ──────────────────────────────────── */
function populateSelects() {
  const mOpts = S.motos.map(m => `<option value="${m.id}">${m.marca} ${m.modelo}</option>`).join('');
  ['cmi','vm'].forEach(id => { const e = el(id); if(e) e.innerHTML = mOpts; });
  const vcEl = el('vc');
  if (vcEl) vcEl.innerHTML = '<option value="">Sin prospecto (nuevo cliente)</option>' +
    S.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
}

/* ── HTML BUILDERS ───────────────────────────────── */
function badgeHTML(sem) {
  return `<span class="badge ${sem.cls}">${sem.dot ? '<span class="dot"></span>' : ''}${sem.label}</span>`;
}

function contactCard({ nombre, subtipo, meta, nota, sem, btns }) {
  const av = initials(nombre), ac = avatarBg(nombre);
  return `
  <div class="ccard">
    <div class="ccard-stripe" style="background:${sem.stripe}"></div>
    <div class="ccard-body">
      <div class="ccard-top">
        <div class="ccard-left">
          <div class="avatar" style="background:${ac}22;color:${ac}">${av}</div>
          <div class="ccard-info">
            <div class="ccard-name">${nombre}</div>
            <div class="ccard-meta">${subtipo} · ${meta}</div>
          </div>
        </div>
        ${badgeHTML(sem)}
      </div>
      ${nota ? `<div class="ccard-note">${nota}</div>` : ''}
      <div class="ccard-actions">${btns}</div>
    </div>
  </div>`;
}

/* ── RENDER STATS ────────────────────────────────── */
function renderStats() {
  const urgentes = S.clientes.filter(c => semCliente(c).dot).length +
    S.ventas.filter(v => { const s=semVenta(v); return s && s.dot; }).length;
  const comision = totalComisionVentas(S.ventas);
  el('stats-row').innerHTML = `
    <div class="stat-item"><div class="stat-num alert">${urgentes}</div><div class="stat-lbl">Alertas</div></div>
    <div class="stat-item"><div class="stat-num">${S.clientes.length}</div><div class="stat-lbl">Prospectos</div></div>
    <div class="stat-item"><div class="stat-num ok">${S.ventas.length}</div><div class="stat-lbl">Ventas</div></div>
    <div class="stat-item"><div class="stat-num">${pesos(comision)}</div><div class="stat-lbl">Comision</div></div>
  `;
  el('bdot-inicio').classList.toggle('show', urgentes > 0);
  el('bdot-seguimiento').classList.toggle('show', urgentes > 0);
}

/* ── RENDER INICIO ───────────────────────────────── */
function renderInicio() {
  renderStats();
  let alertas = '';
  S.ventas.forEach(v => {
    const s = semVenta(v); if (!s || s.key !== 'azul' || !s.dot) return;
    const msg = msgPostventa(v);
    alertas += contactCard({
      nombre: v.clienteNombre, subtipo: 'Post-venta', meta: v.motoNombre + ' ' + v.color,
      nota: '', sem: s,
      btns: `<button class="btn btn-primary btn-sm" onclick="verMsg('${encodeURI(JSON.stringify({t:'Post-venta · '+v.clienteNombre,m:msg}))}')">Ver mensaje</button>
             <button class="btn btn-sm" onclick="marcarVenta(${v.id})">Marcar listo</button>`
    });
  });
  S.clientes.forEach(c => {
    const s = semCliente(c); if (!s.dot) return;
    const msg = msgCliente(c);
    alertas += contactCard({
      nombre: c.nombre, subtipo: c.tipo, meta: getMotoNombre(c.motoInt) + ' · hace ' + ago(c.fecha) + 'd',
      nota: c.notas, sem: s,
      btns: `<button class="btn btn-primary btn-sm" onclick="verMsg('${encodeURI(JSON.stringify({t:'Seguimiento · '+c.nombre,m:msg}))}')">Ver mensaje</button>
             <button class="btn btn-sm" onclick="quitarCliente(${c.id})">Quitar</button>`
    });
  });
  el('alertas-list').innerHTML = alertas ||
    `<div class="empty"><div class="empty-icon">✓</div><div class="empty-text">Sin alertas urgentes hoy. Buen trabajo!</div></div>`;

  let ventas = '';
  S.ventas.slice(0, 5).forEach(v => {
    const pv = v.postventa === 'completado'
      ? '<span class="badge b-gray">Post-venta OK</span>'
      : `<span class="badge b-blue"><span class="dot"></span>Post-venta</span>`;
    ventas += `<div class="venta-card">
      <div class="venta-card-left">
        <div class="venta-name">${v.clienteNombre}</div>
        <div class="venta-detail">${v.motoNombre} ${v.color} · ${pesos(v.precio)} · hace ${ago(v.fecha)}d</div>
      </div>
      ${pv}
    </div>`;
  });
  el('ventas-list').innerHTML = ventas || `<div class="empty"><div class="empty-text">Sin ventas todavia. La primera llega!</div></div>`;
}

/* ── RENDER SEGUIMIENTO ──────────────────────────── */
function renderSeg(filtro) {
  let html = '';
  S.ventas.forEach(v => {
    const s = semVenta(v); if (!s) return;
    if (filtro === 'rojo' && s.cls !== 'b-red') return;
    if (filtro === 'naranja' && s.cls !== 'b-amber') return;
    if (filtro === 'verde') return;
    if (filtro === 'azul' && s.key !== 'azul') return;
    const msg = msgPostventa(v);
    html += contactCard({
      nombre: v.clienteNombre, subtipo: 'Post-venta',
      meta: v.motoNombre + ' · ' + fmtDate(v.fecha),
      nota: v.notas, sem: s,
      btns: `<button class="btn btn-primary btn-sm" onclick="verMsg('${encodeURI(JSON.stringify({t:'Post-venta · '+v.clienteNombre,m:msg}))}')">Ver mensaje</button>
             <button class="btn btn-sm" onclick="marcarVenta(${v.id})">Marcar listo</button>`
    });
  });
  S.clientes.forEach(c => {
    const s = semCliente(c);
    if (filtro === 'azul') return;
    if (filtro === 'rojo' && s.cls !== 'b-red') return;
    if (filtro === 'naranja' && s.cls !== 'b-amber') return;
    if (filtro === 'verde' && s.cls !== 'b-green') return;
    const msg = msgCliente(c);
    html += contactCard({
      nombre: c.nombre, subtipo: c.tipo,
      meta: getMotoNombre(c.motoInt) + ' · hace ' + ago(c.fecha) + 'd',
      nota: c.notas, sem: s,
      btns: `<button class="btn btn-primary btn-sm" onclick="verMsg('${encodeURI(JSON.stringify({t:'Seguimiento · '+c.nombre,m:msg}))}')">Ver mensaje</button>
             <button class="btn btn-sm" onclick="quitarCliente(${c.id})">Quitar</button>`
    });
  });
  el('seg-list').innerHTML = html || `<div class="empty"><div class="empty-icon">✓</div><div class="empty-text">Nada en esta categoria</div></div>`;
}

function segFilter(chip, val) {
  document.querySelectorAll('.fchip').forEach(c => c.classList.remove('on'));
  chip.classList.add('on');
  renderSeg(val);
}

/* ── RENDER PROSPECTOS ───────────────────────────── */
function renderProspectos() {
  const q = (el('psearch') || {}).value || '';
  const list = S.clientes.filter(c =>
    !q || c.nombre.toLowerCase().includes(q.toLowerCase()) || getMotoNombre(c.motoInt).toLowerCase().includes(q.toLowerCase())
  );
  el('prosp-list').innerHTML = list.map(c => {
    const s = semCliente(c);
    const msg = msgCliente(c);
    return contactCard({
      nombre: c.nombre, subtipo: c.tipo,
      meta: getMotoNombre(c.motoInt) + ' · ' + c.tel,
      nota: c.notas, sem: s,
      btns: `<button class="btn btn-primary btn-sm" onclick="verMsg('${encodeURI(JSON.stringify({t:'Msg · '+c.nombre,m:msg}))}')">Mensaje</button>
             <button class="btn btn-sm" onclick="abrirVentaDesde(${c.id})">+ Venta</button>
             <button class="btn btn-danger btn-sm" onclick="quitarCliente(${c.id})">Quitar</button>`
    });
  }).join('') || `<div class="empty"><div class="empty-icon">+</div><div class="empty-text">Agrega tu primer prospecto</div></div>`;
}

/* ── CATALOGO ─────────────────────────────────────── */
let _catFiltro = 'todas';

function catFilter(chip, val) {
  document.querySelectorAll('#cat-filters .fchip').forEach(c => c.classList.remove('on'));
  chip.classList.add('on');
  _catFiltro = val;
  renderStock();
}

function renderStock() {
  const q = (el('cat-search') || {}).value || '';
  let motos = S.motos.filter(m => {
    const match = !q || (m.marca + ' ' + m.modelo).toLowerCase().includes(q.toLowerCase());
    if (!match) return false;
    if (_catFiltro === 'con-stock') return m.stock > 0;
    if (_catFiltro === 'sin-stock') return m.stock === 0;
    return true;
  });

  el('stock-list').innerHTML = motos.map(m => {
    const sc = m.stock === 0 ? 'stock-out' : m.stock <= 2 ? 'stock-low' : 'stock-ok';
    const sl = m.stock === 0 ? 'Sin stock' : m.stock === 1 ? '1 unidad' : m.stock + ' unidades';
    const dots = (m.colores || []).map(c => `<div class="cdot" style="background:${COLORES_HEX[c]||'#999'}" title="${c}"></div>`).join('');
    const colLabel = (m.colores || []).join(' · ');

    const fotoHtml = m.foto
      ? `<img src="${m.foto}" style="width:100%;height:160px;object-fit:cover;border-radius:10px 10px 0 0;display:block" onerror="this.style.display='none';this.nextSibling.style.display='flex'">`
      : '';
    const placeholderHtml = `<div style="width:100%;height:160px;background:linear-gradient(135deg,#EEEDFE 0%,#E1F5EE 100%);border-radius:10px 10px 0 0;display:${m.foto?'none':'flex'};align-items:center;justify-content:center;flex-direction:column;gap:6px">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9B92E8" stroke-width="1.2"><path d="M12 12m-8 0a8 8 0 1016 0a8 8 0 10-16 0"/><path d="M5 12h2m10 0h2M12 5v2m0 10v2"/><circle cx="12" cy="12" r="3" fill="#EEEDFE" stroke="#9B92E8"/></svg>
      <span style="font-size:11px;color:#9B92E8;font-weight:500">${m.marca} ${m.modelo}</span>
    </div>`;

    return `<div class="moto-card" style="padding:0;overflow:hidden;cursor:pointer" onclick="verMotoDetalle(${m.id})">
      ${fotoHtml}${placeholderHtml}
      <div style="padding:13px 14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px">
          <div>
            <div class="moto-brand">${m.marca}</div>
            <div class="moto-model" style="margin:0">${m.modelo}</div>
          </div>
          <span class="${sc}">${sl}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:baseline;margin:6px 0 2px">
          <div class="moto-price">${pesos(m.precio)}</div>
          <div style="font-size:11px;color:var(--gray)">· Cuota ${pesos(m.cuota)}/mes</div>
        </div>
        <div class="moto-specs" style="margin:6px 0">
          ${m.cc ? `<span class="spec-chip">${m.cc}</span>` : ''}
          ${m.consumo ? `<span class="spec-chip">${m.consumo} km/l</span>` : ''}
          ${m.hp ? `<span class="spec-chip">${m.hp} HP</span>` : ''}
          ${m.peso ? `<span class="spec-chip">${m.peso} kg</span>` : ''}
          <span class="spec-chip" style="background:var(--purple-l);color:var(--purple-d)">${m.perfil}</span>
        </div>
        <div class="cdots">${dots}<span class="cdot-label">${colLabel}</span></div>
        ${m.desc ? `<div style="font-size:11px;color:var(--gray);margin-top:6px;line-height:1.5;font-style:italic">"${m.desc}"</div>` : ''}
        <div style="display:flex;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="event.stopPropagation();adjStock(${m.id},-1)">− Stock</button>
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="event.stopPropagation();adjStock(${m.id},1)">+ Stock</button>
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();editarMoto(${m.id})">Editar</button>
        </div>
      </div>
    </div>`;
  }).join('') || `<div class="empty"><div class="empty-icon">🏍</div><div class="empty-text">No hay motos en esta categoria</div></div>`;
}

function verMotoDetalle(id) {
  const m = getMoto(id);
  const sc = m.stock === 0 ? 'stock-out' : m.stock <= 2 ? 'stock-low' : 'stock-ok';
  const sl = m.stock === 0 ? 'Sin stock' : m.stock === 1 ? '1 unidad' : m.stock + ' unidades';
  const dots = (m.colores||[]).map(c => `<div class="cdot" style="background:${COLORES_HEX[c]||'#999'};width:20px;height:20px" title="${c}"></div>`).join('');

  const specs = [
    ['Cilindrada', m.cc],['Consumo', m.consumo ? m.consumo+' km/l' : ''],
    ['Potencia', m.hp ? m.hp+' HP' : ''],['Peso', m.peso ? m.peso+' kg' : ''],
    ['Precio lista', pesos(m.precio)],['Cuota 12 meses', pesos(m.cuota)],
    ['Financiacion 18m', m.cuota ? pesos(Math.round(m.precio/18*1.3)) : ''],
    ['Perfil ideal', m.perfil],['Stock', sl],
  ].filter(s => s[1]);

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;overflow-y:auto';
  overlay.innerHTML = `<div style="background:var(--white);min-height:100vh">
    ${m.foto ? `<img src="${m.foto}" style="width:100%;height:220px;object-fit:cover;display:block">` :
      `<div style="width:100%;height:220px;background:linear-gradient(135deg,#EEEDFE,#E1F5EE);display:flex;align-items:center;justify-content:center">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9B92E8" stroke-width="1"><path d="M12 12m-8 0a8 8 0 1016 0a8 8 0 10-16 0"/><circle cx="12" cy="12" r="3" fill="#EEEDFE" stroke="#9B92E8"/></svg>
      </div>`}
    <button onclick="this.closest('[style*=fixed]').remove()" style="position:fixed;top:14px;right:14px;background:rgba(0,0,0,0.4);border:none;border-radius:50%;width:36px;height:36px;color:white;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:201">✕</button>
    <div style="padding:18px">
      <div style="font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.06em">${m.marca}</div>
      <div style="font-size:24px;font-weight:600;color:var(--gray-d);margin:2px 0 4px">${m.modelo}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <div style="font-size:22px;font-weight:600;color:var(--purple)">${pesos(m.precio)}</div>
        <span class="${sc}" style="font-size:11px;font-weight:600">${sl}</span>
      </div>
      ${m.desc ? `<div style="background:var(--purple-l);border-radius:10px;padding:12px 14px;font-size:13px;color:var(--purple-d);line-height:1.6;margin-bottom:14px;font-style:italic">"${m.desc}"</div>` : ''}
      <div style="background:var(--white);border-radius:12px;border:1px solid var(--border);overflow:hidden;margin-bottom:14px">
        ${specs.map((s,i) => `<div style="display:flex;justify-content:space-between;padding:10px 14px;${i>0?'border-top:1px solid var(--border)':''}">
          <span style="font-size:12px;color:var(--gray)">${s[0]}</span>
          <span style="font-size:12px;font-weight:600;color:var(--gray-d)">${s[1]}</span>
        </div>`).join('')}
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--gray);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Colores disponibles</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${dots}
          <span style="font-size:12px;color:var(--gray)">${(m.colores||[]).join(', ')}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" style="flex:1" onclick="adjStock(${m.id},-1);this.closest('[style*=fixed]').remove();renderStock()">− Stock</button>
        <button class="btn btn-ghost" style="flex:1" onclick="adjStock(${m.id},1);this.closest('[style*=fixed]').remove();renderStock()">+ Stock</button>
        <button class="btn btn-primary" onclick="this.closest('[style*=fixed]').remove();editarMoto(${m.id})">Editar</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

function editarMoto(id) {
  const m = getMoto(id);
  el('sh-moto-title').textContent = 'Editar moto';
  el('moto-edit-id').value = id;
  el('mm').value = m.marca || '';
  el('mmo').value = m.modelo || '';
  el('mpr').value = m.precio || '';
  el('mcu').value = m.cuota || '';
  el('mcc').value = m.cc || '';
  el('mcon').value = m.consumo || '';
  el('mhp').value = m.hp || '';
  el('mpeso').value = m.peso || '';
  el('mcol').value = (m.colores||[]).join(', ');
  el('mst').value = m.stock || '';
  el('mperf').value = m.perfil || 'Primerizo/a';
  el('mdesc').value = m.desc || '';
  el('foto-url').value = m.foto && m.foto.startsWith('http') ? m.foto : '';
  if (m.foto) {
    el('foto-img').src = m.foto;
    el('foto-img').style.display = 'block';
    el('foto-placeholder').style.display = 'none';
  }
  openSheet('sh-moto');
}

function resetMotoForm() {
  el('sh-moto-title').textContent = 'Nueva moto al catalogo';
  el('moto-edit-id').value = '';
  el('foto-img').src = '';
  el('foto-img').style.display = 'none';
  el('foto-placeholder').style.display = 'block';
  el('foto-url').value = '';
  ['mm','mmo','mpr','mcu','mcc','mcon','mhp','mpeso','mcol','mst','mdesc'].forEach(id => { const e = el(id); if(e) e.value=''; });
}

function handleFotoFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    el('foto-img').src = e.target.result;
    el('foto-img').style.display = 'block';
    el('foto-placeholder').style.display = 'none';
    el('foto-url').value = '';
  };
  reader.readAsDataURL(file);
}

function handleFotoUrl(url) {
  if (!url) {
    el('foto-img').src = '';
    el('foto-img').style.display = 'none';
    el('foto-placeholder').style.display = 'block';
    return;
  }
  el('foto-img').src = url;
  el('foto-img').style.display = 'block';
  el('foto-placeholder').style.display = 'none';
}

/* ── RENDER TIPS ─────────────────────────────────── */
const TIPS = [
  { tag:'Apertura', color:'#4C3FD4', badge:'b-purple', texto:'"Es la primera vez que venis, o ya conoces las motos que tenemos?"' },
  { tag:'Apertura', color:'#4C3FD4', badge:'b-purple', texto:'"Para que la usarias — trabajo, fin de semana, o todavia no tenes claro?"' },
  { tag:'Cierre', color:'#0E7A5F', badge:'b-green', texto:'"La llevas hoy o necesitas que te reserve una? Tenemos disponibilidad esta semana."' },
  { tag:'Cierre', color:'#0E7A5F', badge:'b-green', texto:'"Entonces: la [moto], en [color], con [cuotas]. Arrancamos con los papeles?"' },
  { tag:'Objecion', color:'#C47B0A', badge:'b-amber', texto:'"Que es lo que todavia no te termina de convencer? Capaz te doy info que ayuda."' },
  { tag:'Objecion', color:'#C47B0A', badge:'b-amber', texto:'"Es el precio, la moto en si, o algo operativo como el credito?"' },
  { tag:'Urgencia', color:'#D94040', badge:'b-red', texto:'"Esta modelo en negro quedo con 2 unidades — si te gusta no esperaria mucho."' },
  { tag:'Conexion', color:'#1A6BB5', badge:'b-blue', texto:'"Toma mi contacto — cuando estes mas cerca de decidirte, me escribis directo a mi."' },
  { tag:'Postventa', color:'#4C3FD4', badge:'b-purple', texto:'"Como estas con la moto? Si conoces a alguien que busque, ya sabes donde estoy!"' },
];

function renderTips() {
  el('tips-list').innerHTML = TIPS.map(t => `
    <div class="tip-card" style="border-left-color:${t.color}">
      <span class="badge ${t.badge}">${t.tag}</span>
      <div class="tip-text">${t.texto}</div>
    </div>`).join('');
}

/* ── MSG SHEET ───────────────────────────────────── */
function verMsg(encoded) {
  const d = JSON.parse(decodeURI(encoded));
  el('msg-title').textContent = d.t;
  el('msg-txt').value = d.m;
  openSheet('sh-msg');
}
function copyMsg() {
  const txt = el('msg-txt').value;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => { closeSheet('sh-msg'); toast('Mensaje copiado! Pegalo en WhatsApp'); });
  } else {
    el('msg-txt').select();
    document.execCommand('copy');
    closeSheet('sh-msg');
    toast('Mensaje copiado!');
  }
}

/* ── SAVES ───────────────────────────────────────── */
function saveCliente() {
  const nombre = el('cn').value.trim();
  const tel = el('ct').value.trim();
  if (!nombre || !tel) { toast('Nombre y telefono son obligatorios'); return; }
  S.clientes.unshift({
    id: S.nextId++, nombre, tel,
    tipo: el('cti').value,
    motoInt: parseInt(el('cmi').value),
    prioridad: el('cpr').value,
    notas: el('cno').value.trim(),
    fecha: todayStr()
  });
  save(); closeSheet('sh-cliente');
  ['cn','ct','cno'].forEach(id => el(id).value = '');
  toast('Prospecto guardado!');
  renderAll();
}

function saveVenta() {
  const motoId = parseInt(el('vm').value);
  const moto = getMoto(motoId);
  const clienteId = el('vc').value;
  const clienteNombre = clienteId
    ? (S.clientes.find(c => c.id == clienteId) || {nombre:'Cliente'}).nombre
    : 'Cliente';
  S.ventas.unshift({
    id: S.nextId++, clienteNombre, motoId,
    motoNombre: moto.marca + ' ' + moto.modelo,
    color: el('vcol').value || '',
    precio: parseInt(el('vpr').value) || 0,
    pago: el('vpago').value,
    notas: el('vno').value.trim(),
    fecha: todayStr(),
    postventa: 'pendiente'
  });
  if (moto.stock > 0) moto.stock--;
  if (clienteId) S.clientes = S.clientes.filter(c => c.id != clienteId);
  save(); closeSheet('sh-venta');
  ['vcol','vpr','vno'].forEach(id => el(id).value = '');
  toast('Venta registrada! Te aviso el post-venta en 15 dias.');
  renderAll();
}

function saveMoto() {
  const marca = el('mm').value.trim();
  const modelo = el('mmo').value.trim();
  if (!marca || !modelo) { toast('Marca y modelo son obligatorios'); return; }

  const fotoEl = el('foto-img');
  const foto = fotoEl && fotoEl.style.display !== 'none' && fotoEl.src ? fotoEl.src : '';
  const editId = el('moto-edit-id') ? el('moto-edit-id').value : '';

  const data = {
    marca, modelo,
    precio: parseInt(el('mpr').value) || 0,
    cuota: parseInt(el('mcu').value) || 0,
    cc: el('mcc').value.trim(),
    consumo: el('mcon').value.trim(),
    hp: (el('mhp') || {}).value || '',
    peso: (el('mpeso') || {}).value || '',
    colores: el('mcol').value.split(',').map(s => s.trim()).filter(Boolean),
    stock: parseInt(el('mst').value) || 0,
    perfil: el('mperf').value,
    desc: (el('mdesc') || {}).value || '',
    foto
  };

  if (editId) {
    const idx = S.motos.findIndex(m => m.id == editId);
    if (idx > -1) S.motos[idx] = { ...S.motos[idx], ...data };
    toast('Moto actualizada!');
  } else {
    S.motos.push({ id: S.nextId++, ...data });
    toast('Moto agregada al catalogo!');
  }

  save(); closeSheet('sh-moto'); resetMotoForm();
  renderStock(); populateSelects();
}

/* ── ACTIONS ─────────────────────────────────────── */
function marcarVenta(id) {
  const v = S.ventas.find(x => x.id === id);
  if (v) v.postventa = 'completado';
  save(); toast('Post-venta completado!'); renderAll();
}
function quitarCliente(id) {
  S.clientes = S.clientes.filter(c => c.id !== id);
  save(); toast('Contacto quitado.'); renderAll();
}
function adjStock(id, delta) {
  const m = S.motos.find(x => x.id === id);
  if (m) { m.stock = Math.max(0, m.stock + delta); save(); renderStock(); renderStats(); }
}
function abrirVentaDesde(id) {
  const c = S.clientes.find(x => x.id === id);
  openSheet('sh-venta');
  setTimeout(() => {
    const vc = el('vc'); if (vc) vc.value = id;
    const vm = el('vm'); if (vm && c) vm.value = c.motoInt;
  }, 100);
}

/* ── COMISIONES ──────────────────────────────────── */
const COM_DEFAULT = { tipo:'porcentaje', pct:3, fijo:15000, notas:'' };

function getComConfig() { return S.comConfig || COM_DEFAULT; }

function calcComision(venta) {
  const cfg = getComConfig();
  if (cfg.tipo === 'fijo') return cfg.fijo || 0;
  return Math.round(venta.precio * (cfg.pct || 3) / 100);
}

function totalComisionVentas(ventas) { return ventas.reduce((a,v) => a + calcComision(v), 0); }

function ventasMes(mes, anio) {
  return S.ventas.filter(v => {
    const d = new Date(v.fecha);
    return d.getMonth() === mes && d.getFullYear() === anio;
  });
}

function renderComisiones() {
  const cfg = getComConfig();
  const mesActual = NOW.getMonth();
  const anioActual = NOW.getFullYear();

  // Ultimos 6 meses
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anioActual, mesActual - i, 1);
    const vs = ventasMes(d.getMonth(), d.getFullYear());
    meses.push({
      label: d.toLocaleDateString('es-AR', { month:'short', year:'2-digit' }),
      mes: d.getMonth(), anio: d.getFullYear(),
      ventas: vs, total: totalComisionVentas(vs), cant: vs.length
    });
  }

  const mesHoy = meses[meses.length - 1];
  const maxBar = Math.max(...meses.map(m => m.total), 1);

  // Config badge
  const cfgLabel = cfg.tipo === 'porcentaje'
    ? `${cfg.pct}% del precio de venta`
    : `${pesos(cfg.fijo)} fijo por moto`;

  let html = `
  <div style="background:var(--purple);border-radius:14px;padding:16px;margin-bottom:14px;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>
    <div style="font-size:11px;color:rgba(255,255,255,0.6);font-weight:500;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Comision del mes</div>
    <div style="font-size:32px;font-weight:600;color:#fff;letter-spacing:-1px">${pesos(mesHoy.total)}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px">${mesHoy.cant} venta${mesHoy.cant !== 1 ? 's' : ''} en ${mesHoy.label}</div>
    <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:11px;color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.1);padding:4px 10px;border-radius:20px">${cfgLabel}</span>
      <button onclick="abrirComConfig()" style="font-size:11px;color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.2);border-radius:20px;padding:4px 12px;cursor:pointer">Cambiar</button>
    </div>
  </div>

  <div class="section-label">Evolucion mensual</div>
  <div style="background:var(--white);border-radius:14px;border:1px solid var(--border);padding:16px;margin-bottom:14px">
    <div style="display:flex;align-items:flex-end;gap:8px;height:100px;margin-bottom:8px">
      ${meses.map(m => {
        const h = Math.max(Math.round((m.total / maxBar) * 100), m.total > 0 ? 4 : 2);
        const isHoy = m.mes === mesActual && m.anio === anioActual;
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:9px;color:var(--gray);text-align:center">${m.total > 0 ? pesos(m.total).replace('$','') : ''}</div>
          <div style="width:100%;border-radius:4px 4px 0 0;background:${isHoy ? 'var(--purple)' : '#C4BFEE'};height:${h}px;transition:height .3s"></div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:8px">
      ${meses.map(m => {
        const isHoy = m.mes === mesActual && m.anio === anioActual;
        return `<div style="flex:1;text-align:center;font-size:9px;font-weight:${isHoy?'600':'400'};color:${isHoy?'var(--purple)':'var(--gray)'}">${m.label}</div>`;
      }).join('')}
    </div>
  </div>

  <div class="section-label">Detalle por mes</div>`;

  // Mostrar meses de mas reciente a mas viejo
  [...meses].reverse().forEach(m => {
    if (m.cant === 0) return;
    html += `<div style="background:var(--white);border-radius:14px;border:1px solid var(--border);margin-bottom:10px;overflow:hidden">
      <div style="padding:12px 15px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--gray-d);text-transform:capitalize">${new Date(m.anio,m.mes,1).toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</div>
          <div style="font-size:11px;color:var(--gray)">${m.cant} venta${m.cant!==1?'s':''}</div>
        </div>
        <div style="font-size:17px;font-weight:600;color:var(--purple)">${pesos(m.total)}</div>
      </div>
      ${m.ventas.map(v => `
      <div style="padding:10px 15px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:12px;font-weight:500;color:var(--gray-d)">${v.clienteNombre}</div>
          <div style="font-size:11px;color:var(--gray)">${v.motoNombre} · ${fmtDate(v.fecha)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;font-weight:600;color:var(--teal)">${pesos(calcComision(v))}</div>
          <div style="font-size:10px;color:var(--gray)">${pesos(v.precio)}</div>
        </div>
      </div>`).join('')}
    </div>`;
  });

  if (S.ventas.length === 0) {
    html += `<div class="empty"><div class="empty-icon">$</div><div class="empty-text">Registra tu primera venta para ver las comisiones</div></div>`;
  }

  el('com-content').innerHTML = html;
}

function abrirComConfig() {
  const cfg = getComConfig();
  el('com-tipo').value = cfg.tipo;
  el('com-pct').value = cfg.pct;
  el('com-fijo').value = cfg.fijo;
  el('com-notas').value = cfg.notas || '';
  toggleComFields();
  openSheet('sh-comconfig');
}

function toggleComFields() {
  const tipo = el('com-tipo').value;
  el('com-field-pct').style.display = tipo === 'porcentaje' ? 'block' : 'none';
  el('com-field-fijo').style.display = tipo === 'fijo' ? 'block' : 'none';
}

function saveComConfig() {
  S.comConfig = {
    tipo: el('com-tipo').value,
    pct: parseFloat(el('com-pct').value) || 3,
    fijo: parseInt(el('com-fijo').value) || 0,
    notas: el('com-notas').value
  };
  save(); closeSheet('sh-comconfig');
  toast('Configuracion guardada!');
  renderComisiones(); renderStats();
}

/* ── ASISTENTE IA (Groq - gratis) ────────────────── */
const GROQ_KEY_NAME = 'ambar_groq_key';

function getGroqKey() {
  try { return localStorage.getItem(GROQ_KEY_NAME) || ''; } catch(e) { return ''; }
}
function setGroqKey(k) {
  try { localStorage.setItem(GROQ_KEY_NAME, k); } catch(e) {}
}

async function groqCall(systemPrompt, userPrompt) {
  const key = getGroqKey();
  if (!key) throw new Error('NO_KEY');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Error de API');
  }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

function catalogoResumen() {
  return S.motos.map(m =>
    `- ${m.marca} ${m.modelo}: $${Math.round(m.precio/1000)}k, cuota $${Math.round(m.cuota/1000)}k/mes, ${m.cc}, ${m.consumo}km/l, perfil: ${m.perfil}, stock: ${m.stock}, colores: ${(m.colores||[]).join('/')}`
  ).join('\n');
}

function renderIA() {
  const key = getGroqKey();
  const keyHtml = `
  <div style="background:var(--white);border-radius:14px;border:1px solid var(--border);padding:14px;margin-bottom:14px">
    <div style="font-size:12px;font-weight:600;color:var(--gray);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em">API Key de Groq</div>
    <div style="display:flex;gap:8px">
      <input id="groq-key-input" type="password" placeholder="gsk_..." value="${key}"
        style="flex:1;font-size:13px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d);font-family:var(--font)">
      <button class="btn btn-primary" onclick="guardarGroqKey()" style="flex-shrink:0">Guardar</button>
    </div>
    <div style="font-size:10px;color:var(--gray);margin-top:6px">Gratis en <b>console.groq.com</b> → API Keys → Create API Key</div>
  </div>`;

  const sugerirHtml = `
  <div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden;margin-bottom:14px">
    <div style="background:linear-gradient(135deg,#4C3FD4,#7C6FE8);padding:14px 16px">
      <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:2px">Sugerir moto al cliente</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.7)">La IA analiza el perfil y elige la mejor opcion del catalogo</div>
    </div>
    <div style="padding:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div class="field" style="margin:0"><label>Presupuesto maximo</label>
          <select id="ia-presupuesto" style="width:100%;font-size:13px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d)">
            <option value="200000">Hasta $200k</option>
            <option value="300000">Hasta $300k</option>
            <option value="400000" selected>Hasta $400k</option>
            <option value="500000">Hasta $500k</option>
            <option value="650000">Hasta $650k</option>
            <option value="9999999">Sin limite</option>
          </select>
        </div>
        <div class="field" style="margin:0"><label>Uso principal</label>
          <select id="ia-uso" style="width:100%;font-size:13px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d)">
            <option>Trabajo diario</option>
            <option>Fin de semana</option>
            <option>Viajes largos</option>
            <option>Deporte/velocidad</option>
            <option>Primera moto</option>
            <option>Economizar combustible</option>
          </select>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div class="field" style="margin:0"><label>Tipo de pago</label>
          <select id="ia-pago" style="width:100%;font-size:13px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d)">
            <option>Contado</option>
            <option>Financiacion</option>
            <option>No lo sabe aun</option>
          </select>
        </div>
        <div class="field" style="margin:0"><label>Experiencia</label>
          <select id="ia-exp" style="width:100%;font-size:13px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d)">
            <option>Primera moto</option>
            <option>Ya tuvo motos</option>
            <option>Muy experimentado</option>
          </select>
        </div>
      </div>
      <div class="field" style="margin-bottom:10px"><label>Notas adicionales (opcional)</label>
        <input id="ia-notas" placeholder="Ej: tiene pareja, quiere color oscuro, le preocupa el consumo..."
          style="width:100%;font-size:13px;padding:9px 12px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d);font-family:var(--font)">
      </div>
      <button class="btn btn-primary" style="width:100%;min-height:44px;font-size:14px" onclick="iaSugerirMoto()">
        Sugerir moto y argumento de cierre
      </button>
      <div id="ia-resultado-sugerir" style="margin-top:12px"></div>
    </div>
  </div>`;

  const mensajeHtml = `
  <div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden;margin-bottom:14px">
    <div style="background:linear-gradient(135deg,#0E7A5F,#2DBEAA);padding:14px 16px">
      <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:2px">Generar mensaje de WhatsApp</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.7)">La IA escribe el mensaje personalizado para cada situacion</div>
    </div>
    <div style="padding:14px">
      <div class="field" style="margin-bottom:10px"><label>Situacion</label>
        <select id="ia-msg-tipo" style="width:100%;font-size:13px;padding:9px 12px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d)">
          <option value="seguimiento">Seguimiento — visito y no compro</option>
          <option value="postventa">Post-venta — ya compro</option>
          <option value="promo">Anunciar promo o nuevo modelo</option>
          <option value="cierre">Intentar cerrar venta</option>
          <option value="reactivar">Reactivar cliente inactivo</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <div class="field" style="margin:0"><label>Nombre del cliente</label>
          <input id="ia-msg-nombre" placeholder="Sofia" style="width:100%;font-size:13px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d);font-family:var(--font)">
        </div>
        <div class="field" style="margin:0"><label>Moto de interes</label>
          <input id="ia-msg-moto" placeholder="Honda CB 190R" style="width:100%;font-size:13px;padding:8px 10px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d);font-family:var(--font)">
        </div>
      </div>
      <div class="field" style="margin-bottom:10px"><label>Contexto extra (opcional)</label>
        <input id="ia-msg-contexto" placeholder="Ej: dijo que la semana que viene vuelve, tiene dudas del precio..."
          style="width:100%;font-size:13px;padding:9px 12px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d);font-family:var(--font)">
      </div>
      <button class="btn btn-teal" style="width:100%;min-height:44px;font-size:14px" onclick="iaGenerarMensaje()">
        Generar mensaje
      </button>
      <div id="ia-resultado-mensaje" style="margin-top:12px"></div>
    </div>
  </div>`;

  const cargaHtml = `
  <div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden;margin-bottom:14px">
    <div style="background:linear-gradient(135deg,#C47B0A,#F0A830);padding:14px 16px">
      <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:2px">Carga rapida con IA</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.8)">Describis la venta en lenguaje natural y la IA la registra</div>
    </div>
    <div style="padding:14px">
      <div class="field" style="margin-bottom:10px"><label>Describir la venta</label>
        <textarea id="ia-carga-texto" placeholder="Ej: Le vendi una Honda CB 190R roja a Lucas Fernandez, pago en 12 cuotas, precio 490000, incluyo casco"
          style="width:100%;min-height:80px;font-size:13px;padding:9px 12px;border-radius:8px;border:1.5px solid var(--border-m);background:var(--gray-ll);color:var(--gray-d);font-family:var(--font);line-height:1.5;resize:vertical"></textarea>
      </div>
      <button class="btn" style="width:100%;min-height:44px;font-size:14px;background:var(--amber-l);color:#633806;border-color:var(--amber-m)" onclick="iaCargaRapida()">
        Interpretar y pre-cargar formulario
      </button>
      <div id="ia-resultado-carga" style="margin-top:12px"></div>
    </div>
  </div>`;

  el('ia-content').innerHTML = keyHtml + sugerirHtml + mensajeHtml + cargaHtml;
}

function guardarGroqKey() {
  const k = el('groq-key-input').value.trim();
  if (!k.startsWith('gsk_')) { toast('La clave debe empezar con gsk_'); return; }
  setGroqKey(k);
  toast('Clave guardada! Ya podes usar el asistente.');
}

function iaShowLoading(containerId) {
  el(containerId).innerHTML = `<div style="text-align:center;padding:20px;color:var(--gray)">
    <div style="font-size:13px;animation:pulse 1s infinite">Pensando...</div>
  </div>`;
}

function iaShowError(containerId, msg) {
  el(containerId).innerHTML = `<div style="background:var(--red-l);border-radius:10px;padding:12px;font-size:12px;color:var(--red-d)">${msg}</div>`;
}

async function iaSugerirMoto() {
  if (!getGroqKey()) { toast('Primero guarda tu API Key de Groq arriba'); return; }
  if (S.motos.length === 0) { toast('Agrega motos al catalogo primero'); return; }

  iaShowLoading('ia-resultado-sugerir');

  const presupuesto = parseInt(el('ia-presupuesto').value);
  const uso = el('ia-uso').value;
  const pago = el('ia-pago').value;
  const exp = el('ia-exp').value;
  const notas = el('ia-notas').value;

  const system = `Sos Ambar, vendedora experta de motos en Argentina. Analizas el perfil del cliente y sugeris la mejor moto del catalogo disponible. Respondas en espanol argentino, de forma directa y util para la vendedora. Tu respuesta tiene 3 partes: 1) MOTO RECOMENDADA (nombre y por que), 2) ARGUMENTO DE CIERRE (frase exacta para decirle al cliente), 3) OBJECIONES POSIBLES Y RESPUESTAS (maximo 2). Total maximo 200 palabras.`;

  const user = `CATALOGO DISPONIBLE:\n${catalogoResumen()}\n\nPERFIL DEL CLIENTE:\n- Presupuesto maximo: $${presupuesto.toLocaleString('es-AR')}\n- Uso: ${uso}\n- Pago: ${pago}\n- Experiencia: ${exp}\n${notas ? '- Notas: ' + notas : ''}\n\nSugeri la mejor moto y dame el argumento de cierre exacto.`;

  try {
    const resp = await groqCall(system, user);
    el('ia-resultado-sugerir').innerHTML = `
      <div style="background:var(--purple-l);border-radius:10px;padding:14px;border:1px solid var(--purple-m)">
        <div style="font-size:11px;font-weight:600;color:var(--purple-d);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em">Sugerencia de la IA</div>
        <div style="font-size:13px;color:var(--gray-d);line-height:1.7;white-space:pre-line">${resp}</div>
      </div>`;
  } catch(e) {
    iaShowError('ia-resultado-sugerir', e.message === 'NO_KEY' ? 'Guarda tu API Key primero' : 'Error: ' + e.message);
  }
}

async function iaGenerarMensaje() {
  if (!getGroqKey()) { toast('Primero guarda tu API Key de Groq arriba'); return; }

  iaShowLoading('ia-resultado-mensaje');

  const tipo = el('ia-msg-tipo').value;
  const nombre = el('ia-msg-nombre').value || 'el/la cliente';
  const moto = el('ia-msg-moto').value || 'la moto';
  const contexto = el('ia-msg-contexto').value;

  const tipoDesc = {
    seguimiento: 'seguimiento a un cliente que visito el local pero no compro',
    postventa: 'post-venta para un cliente que ya compro la moto',
    promo: 'anunciar una promocion o nuevo modelo disponible',
    cierre: 'intentar cerrar la venta con un cliente que esta dudando',
    reactivar: 'reactivar contacto con un cliente que no responde hace tiempo'
  };

  const system = `Sos Ambar, vendedora de motos en Argentina. Escribis mensajes de WhatsApp naturales, calidos y efectivos. Mensajes cortos (maximo 5 lineas), en espanol argentino informal, sin emojis exagerados, que suenen a persona real no a bot. Solo respondas con el mensaje, nada mas.`;

  const user = `Escribi un mensaje de WhatsApp de ${tipoDesc[tipo]}.\nNombre del cliente: ${nombre}\nMoto: ${moto}\n${contexto ? 'Contexto: ' + contexto : ''}\nFirma siempre como Ambar de la concesionaria.`;

  try {
    const resp = await groqCall(system, user);
    el('ia-resultado-mensaje').innerHTML = `
      <div style="background:var(--teal-l);border-radius:10px;padding:14px;border:1px solid var(--teal-m)">
        <div style="font-size:13px;color:#085041;line-height:1.7;white-space:pre-line">${resp}</div>
        <button class="btn btn-teal" style="margin-top:10px;width:100%" onclick="copiarTexto(\`${resp.replace(/`/g,"'")}\`)">Copiar mensaje</button>
      </div>`;
  } catch(e) {
    iaShowError('ia-resultado-mensaje', e.message === 'NO_KEY' ? 'Guarda tu API Key primero' : 'Error: ' + e.message);
  }
}

async function iaCargaRapida() {
  if (!getGroqKey()) { toast('Primero guarda tu API Key de Groq arriba'); return; }
  const texto = el('ia-carga-texto').value.trim();
  if (!texto) { toast('Describe la venta primero'); return; }

  iaShowLoading('ia-resultado-carga');

  const system = `Extraes datos de ventas de motos desde texto en espanol. Respondas SOLO con JSON valido, sin explicaciones, sin markdown. Formato: {"clienteNombre":"","motoMarca":"","motoModelo":"","color":"","precio":0,"pago":"","notas":""}. Si no encontras un dato, deja string vacio o 0.`;

  try {
    const resp = await groqCall(system, texto);
    const clean = resp.replace(/```json|```/g,'').trim();
    const datos = JSON.parse(clean);

    el('ia-resultado-carga').innerHTML = `
      <div style="background:var(--amber-l);border-radius:10px;padding:14px;border:1px solid var(--amber-m);margin-bottom:10px">
        <div style="font-size:11px;font-weight:600;color:#633806;margin-bottom:8px">Datos detectados:</div>
        ${Object.entries(datos).filter(([,v])=>v).map(([k,v])=>`<div style="font-size:12px;color:var(--gray-d);padding:3px 0;border-bottom:1px solid rgba(0,0,0,0.05)"><b>${k}:</b> ${v}</div>`).join('')}
      </div>
      <button class="btn btn-primary" style="width:100%" id="btn-abrir-venta">Abrir formulario de venta con estos datos</button>`;
    document.getElementById('btn-abrir-venta').addEventListener('click', () => iaAbrirVentaConDatos(datos));
  } catch(e) {
    iaShowError('ia-resultado-carga', e.message === 'NO_KEY' ? 'Guarda tu API Key primero' : 'No pude interpretar el texto. Intenta ser mas especifico.');
  }
}

function iaAbrirVentaConDatos(datos) {
  try {
    openSheet('sh-venta');
    setTimeout(() => {
      if (datos.precio) el('vpr').value = datos.precio;
      if (datos.color) el('vcol').value = datos.color;
      if (datos.notas) el('vno').value = datos.notas;
      if (datos.pago) {
        const p = el('vpago');
        const pg = datos.pago.toLowerCase();
        if (pg.includes('12')) p.value = 'Cuotas x12';
        else if (pg.includes('18')) p.value = 'Cuotas x18';
        else if (pg.includes('24')) p.value = 'Cuotas x24';
        else if (pg.includes('contado')) p.value = 'Contado';
      }
      if (datos.motoModelo) {
        const moto = S.motos.find(m =>
          m.modelo.toLowerCase().includes(datos.motoModelo.toLowerCase()) ||
          (m.marca + ' ' + m.modelo).toLowerCase().includes(datos.motoModelo.toLowerCase())
        );
        if (moto) el('vm').value = moto.id;
      }
      if (datos.clienteNombre) {
        const cliente = S.clientes.find(c =>
          c.nombre.toLowerCase().includes(datos.clienteNombre.toLowerCase())
        );
        if (cliente) el('vc').value = cliente.id;
      }
    }, 200);
  } catch(e) { toast('Error al cargar datos: ' + e.message); }
}

function copiarTexto(txt) {
  navigator.clipboard.writeText(txt).then(() => toast('Copiado!')).catch(() => toast('Selecciona el texto manualmente'));
}

/* ── INIT ────────────────────────────────────────── */
function renderAll() {
  renderStats();
  const active = document.querySelector('.screen.active');
  if (!active) return;
  const name = active.id.replace('sc-', '');
  ({ inicio: renderInicio, seguimiento: () => renderSeg('todos'), prospectos: renderProspectos, stock: renderStock, comisiones: renderComisiones, ia: renderIA, tips: renderTips })[name]?.();
}

function setGreeting() {
  const h = NOW.getHours();
  el('hgreeting').textContent = h < 12 ? 'Buen dia' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  el('hdate').textContent = NOW.toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' });
}

S = loadState();
setGreeting();
renderAll();
renderTips();
