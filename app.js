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
  const renders = { inicio: renderInicio, seguimiento: () => renderSeg('todos'), prospectos: renderProspectos, stock: renderStock, tips: renderTips };
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
  const comision = S.ventas.reduce((a, v) => a + v.precio * 0.03, 0);
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

/* ── RENDER STOCK ─────────────────────────────────── */
function renderStock() {
  el('stock-list').innerHTML = S.motos.map(m => {
    const sc = m.stock === 0 ? 'stock-out' : m.stock <= 2 ? 'stock-low' : 'stock-ok';
    const sl = m.stock === 0 ? 'Sin stock' : m.stock === 1 ? '1 unidad' : m.stock + ' unidades';
    const dots = (m.colores || []).map(c => `<div class="cdot" style="background:${COLORES_HEX[c]||'#999'}" title="${c}"></div>`).join('');
    const colLabel = (m.colores || []).join(', ');
    return `<div class="moto-card">
      <div class="moto-top">
        <div>
          <div class="moto-brand">${m.marca}</div>
          <div class="moto-model">${m.modelo}</div>
        </div>
        <span class="${sc}">${sl}</span>
      </div>
      <div class="moto-price">${pesos(m.precio)}</div>
      <div class="moto-cuota">Cuota 12 meses: ${pesos(m.cuota)}</div>
      <div class="moto-specs">
        <span class="spec-chip">${m.cc}</span>
        <span class="spec-chip">${m.consumo} km/l</span>
        <span class="spec-chip">${m.perfil}</span>
      </div>
      <div class="cdots">${dots}<span class="cdot-label">${colLabel}</span></div>
      <div class="stock-row">
        <span style="font-size:11px;color:var(--gray)">Ajustar stock:</span>
        <div class="stock-btns">
          <button class="btn btn-ghost btn-sm" onclick="adjStock(${m.id},-1)">– Uno</button>
          <button class="btn btn-ghost btn-sm" onclick="adjStock(${m.id},1)">+ Uno</button>
        </div>
      </div>
    </div>`;
  }).join('');
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
  S.motos.push({
    id: S.nextId++, marca, modelo,
    precio: parseInt(el('mpr').value) || 0,
    cuota: parseInt(el('mcu').value) || 0,
    cc: el('mcc').value.trim(),
    consumo: el('mcon').value.trim(),
    colores: el('mcol').value.split(',').map(s => s.trim()).filter(Boolean),
    stock: parseInt(el('mst').value) || 0,
    perfil: el('mperf').value
  });
  save(); closeSheet('sh-moto');
  ['mm','mmo','mpr','mcu','mcc','mcon','mcol','mst'].forEach(id => el(id).value = '');
  toast('Moto agregada al catalogo!');
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

/* ── INIT ────────────────────────────────────────── */
function renderAll() {
  renderStats();
  const active = document.querySelector('.screen.active');
  if (!active) return;
  const name = active.id.replace('sc-', '');
  ({ inicio: renderInicio, seguimiento: () => renderSeg('todos'), prospectos: renderProspectos, stock: renderStock, tips: renderTips })[name]?.();
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
