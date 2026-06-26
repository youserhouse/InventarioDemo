// ── FIREBASE ─────────────────────────────────────────
// IMPORTANTE: sustituye estos valores con los de tu proyecto
// Firebase Console → ⚙ Configuración del proyecto → General → tus apps → SDK setup
const firebaseConfig = {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_PROYECTO.firebaseapp.com',
  projectId: 'TU_PROYECTO',
  storageBucket: 'TU_PROYECTO.appspot.com',
  messagingSenderId: 'TU_SENDER_ID',
  appId: 'TU_APP_ID',
};

let auth = null, db = null;
try {
  if(typeof firebase !== 'undefined' && firebaseConfig.apiKey !== 'TU_API_KEY'){
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db   = firebase.firestore();
  }
} catch(e){ console.warn('Firebase no inicializado:', e); }

// ── AUTH ─────────────────────────────────────────────
function checkAuth(){
  if(!auth){ showLogin(); return; }
  auth.onAuthStateChanged(user => {
    if(user){ showSplash(); }
    else { showLogin(); }
  });
}

async function login(){
  const email = document.getElementById('login_email').value.trim();
  const pass  = document.getElementById('login_pass').value;
  const errEl = document.getElementById('login_error');
  const btn   = document.getElementById('login_btn');
  errEl.textContent = '';
  btn.disabled = true; btn.textContent = 'Entrando…';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(error){
    errEl.textContent = 'Correo o contraseña incorrectos.';
    btn.disabled = false; btn.textContent = 'Iniciar sesión';
  }
}

async function logout(){
  await auth.signOut();
}

function showLogin(){
  document.getElementById('screen-login').style.display = 'flex';
  document.getElementById('screen-splash').style.display = 'none';
  document.querySelector('header').style.display = 'none';
  document.querySelector('nav').style.display    = 'none';
  document.querySelector('main').style.display   = 'none';
}

function showSplash(){
  document.getElementById('screen-login').style.display = 'none';
  document.getElementById('screen-splash').style.display = 'flex';
  document.querySelector('header').style.display = 'none';
  document.querySelector('nav').style.display    = 'none';
  document.querySelector('main').style.display   = 'none';
  setTimeout(showApp, 2200);
}

function showApp(){
  document.getElementById('screen-splash').style.display = 'none';
  document.querySelector('header').style.display = '';
  document.querySelector('nav').style.display    = '';
  document.querySelector('main').style.display   = '';
}

// ── THEME ────────────────────────────────────────────
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  document.getElementById('themeIcon').textContent  = isDark ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isDark ? 'Claro' : 'Oscuro';
  localStorage.setItem('ic_theme', theme);
}

function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function loadTheme(){
  const saved = localStorage.getItem('ic_theme') || 'dark';
  applyTheme(saved);
}

// ── CONFIG ──────────────────────────────────────────
let CFG = { meatBox:72, breadBox:30, priceJam:13.50, priceEsp:15.50 };

function loadConfig(){
  const s = localStorage.getItem('ic_config');
  if(s){
    const parsed = JSON.parse(s);
    CFG = {...CFG,...parsed};
    if(!CFG.meatBox  || CFG.meatBox  < 1) CFG.meatBox  = 72;
    if(!CFG.breadBox || CFG.breadBox < 1) CFG.breadBox = 30;
  }
  document.getElementById('cfg_meat_box').value  = CFG.meatBox;
  document.getElementById('cfg_bread_box').value = CFG.breadBox;
  document.getElementById('cfg_price_jam').value = CFG.priceJam;
  document.getElementById('cfg_price_esp').value = CFG.priceEsp;
  updateAvgPrice();
}

function saveConfig(){
  CFG.meatBox  = Math.max(1, +document.getElementById('cfg_meat_box').value  || 72);
  CFG.breadBox = Math.max(1, +document.getElementById('cfg_bread_box').value || 30);
  CFG.priceJam = +document.getElementById('cfg_price_jam').value || 13.50;
  CFG.priceEsp = +document.getElementById('cfg_price_esp').value || 15.50;
  localStorage.setItem('ic_config', JSON.stringify(CFG));
  updateAvgPrice();
}

function updateAvgPrice(){
  const avg = ((CFG.priceJam + CFG.priceEsp) / 2).toFixed(2).replace('.',',');
  document.getElementById('cfg_avg_price').textContent = '€'+avg;
}

function avgPrice(){ return (CFG.priceJam + CFG.priceEsp) / 2; }

// ── EVENTO ──────────────────────────────────────────
function loadEvento(){
  const ev = localStorage.getItem('ic_evento') || '';
  document.getElementById('cfg_evento').value = ev;
  updateHeaderEvento();
}

function saveEvento(){
  const ev = document.getElementById('cfg_evento').value.trim();
  localStorage.setItem('ic_evento', ev);
  updateHeaderEvento();
}

function updateHeaderEvento(){
  const ev = localStorage.getItem('ic_evento') || '';
  const fecha = localStorage.getItem('ic_fecha_jornada') || todayISO();
  const el = document.getElementById('headerEvento');
  const fechaFmt = new Date(fecha+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase();
  const parts = [ev, fechaFmt].filter(Boolean);
  if(parts.length){ el.textContent = parts.join(' · '); el.style.display = ''; }
  else { el.textContent = ''; el.style.display = 'none'; }
}

// ── FECHA JORNADA ────────────────────────────────────
function todayISO(){
  return new Date().toISOString().slice(0,10);
}

function loadFechaJornada(){
  const f = localStorage.getItem('ic_fecha_jornada') || todayISO();
  document.getElementById('cfg_fecha_jornada').value = f;
  updateHeaderEvento();
}

function saveFechaJornada(){
  const f = document.getElementById('cfg_fecha_jornada').value || todayISO();
  localStorage.setItem('ic_fecha_jornada', f);
  updateHeaderEvento();
}

// ── DATE ────────────────────────────────────────────
function setDate(){
  const d = new Date();
  document.getElementById('headerDate').textContent =
    d.toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
}

// ── TABS ────────────────────────────────────────────
const tabs = document.querySelectorAll('.tab');
const secs = document.querySelectorAll('.section');

function goTo(n){
  tabs.forEach((t,i)=>{ t.classList.toggle('active',i===n); });
  secs.forEach((s,i)=>{ s.classList.toggle('active',i===n); });
  if(n===3) buildCuadre();
  if(n===5) loadHistorial();
}

// ── CALCS ───────────────────────────────────────────
function calc(prefix){
  var meatPerBox  = parseInt(document.getElementById('cfg_meat_box').value,10);
  var breadPerBox = parseInt(document.getElementById('cfg_bread_box').value,10);
  if(!meatPerBox  || meatPerBox  < 1) meatPerBox  = 72;
  if(!breadPerBox || breadPerBox < 1) breadPerBox = 30;

  var meatBoxesEl  = document.getElementById(prefix+'_meat_boxes');
  var meatLooseEl  = document.getElementById(prefix+'_meat_loose');
  var meatTotalEl  = document.getElementById(prefix+'_meat_total');
  var breadBoxesEl = document.getElementById(prefix+'_bread_boxes');
  var breadLooseEl = document.getElementById(prefix+'_bread_loose');
  var breadTotalEl = document.getElementById(prefix+'_bread_total');

  if(!meatBoxesEl || !meatTotalEl || !breadBoxesEl || !breadTotalEl) return;

  var boxes  = parseInt(meatBoxesEl.value,10)  || 0;
  var loose  = parseInt(meatLooseEl ? meatLooseEl.value : '0',10) || 0;
  meatTotalEl.textContent = (boxes * meatPerBox + loose) + ' ud';

  var bboxes = parseInt(breadBoxesEl.value,10) || 0;
  var bloose = parseInt(breadLooseEl ? breadLooseEl.value : '0',10) || 0;
  breadTotalEl.textContent = (bboxes * breadPerBox + bloose) + ' ud';
}

function calcVentas(){
  const card = +(document.getElementById('v_card').value)||0;
  const cash = +(document.getElementById('v_cash').value)||0;
  const total = card+cash;
  document.getElementById('v_total').textContent = '€'+total.toFixed(2).replace('.',',');
  const est = total / avgPrice();
  document.getElementById('v_est_burgers').textContent = '~'+Math.round(est);
}

// ── SAVE STEPS ──────────────────────────────────────
function saveApertura(){
  const d = {
    meat_boxes:+(document.getElementById('a_meat_boxes').value)||0,
    meat_loose:+(document.getElementById('a_meat_loose').value)||0,
    bread_boxes:+(document.getElementById('a_bread_boxes').value)||0,
    bread_loose:+(document.getElementById('a_bread_loose').value)||0,
    sauce_rosa:+(document.getElementById('a_sauce_rosa').value)||0,
    sauce_white:+(document.getElementById('a_sauce_white').value)||0,
  };
  localStorage.setItem('ic_apertura', JSON.stringify(d));
  tabs[0].classList.add('done'); tabs[0].classList.remove('active');
  goTo(1);
}

function saveVentas(){
  const d = {
    card:+(document.getElementById('v_card').value)||0,
    cash:+(document.getElementById('v_cash').value)||0,
  };
  localStorage.setItem('ic_ventas', JSON.stringify(d));
  tabs[1].classList.add('done'); tabs[1].classList.remove('active');
  goTo(2);
}

function saveCierre(){
  const d = {
    meat_boxes:+(document.getElementById('c_meat_boxes').value)||0,
    meat_loose:+(document.getElementById('c_meat_loose').value)||0,
    bread_boxes:+(document.getElementById('c_bread_boxes').value)||0,
    bread_loose:+(document.getElementById('c_bread_loose').value)||0,
    sauce_rosa:+(document.getElementById('c_sauce_rosa').value)||0,
    sauce_white:+(document.getElementById('c_sauce_white').value)||0,
  };
  localStorage.setItem('ic_cierre', JSON.stringify(d));
  tabs[2].classList.add('done'); tabs[2].classList.remove('active');
  goTo(3);
  buildCuadre();
}

// ── CUADRE ──────────────────────────────────────────
let cuadreData = null;

function buildCuadre(){
  const A = JSON.parse(localStorage.getItem('ic_apertura')||'{}');
  const V = JSON.parse(localStorage.getItem('ic_ventas')||'{}');
  const C = JSON.parse(localStorage.getItem('ic_cierre')||'{}');

  if(!A.meat_boxes && A.meat_boxes!==0){ showAlert('warn','Datos incompletos','Falta registrar la apertura del día.'); return; }

  const initMeat  = (A.meat_boxes||0)*CFG.meatBox  + (A.meat_loose||0);
  const initBread = (A.bread_boxes||0)*CFG.breadBox + (A.bread_loose||0);
  const finalMeat  = (C.meat_boxes||0)*CFG.meatBox  + (C.meat_loose||0);
  const finalBread = (C.bread_boxes||0)*CFG.breadBox + (C.bread_loose||0);

  const meatConsumed  = initMeat  - finalMeat;
  const breadConsumed = initBread - finalBread;

  const totalRevenue = (V.card||0) + (V.cash||0);
  const burgersByMoney = totalRevenue / avgPrice();
  const burgersByMoneyR = Math.round(burgersByMoney);

  const meatDiff  = meatConsumed  - burgersByMoneyR;
  const breadDiff = breadConsumed - burgersByMoneyR;

  let confirmedDiff;
  if (meatDiff > 0 && breadDiff > 0) {
    confirmedDiff = Math.min(meatDiff, breadDiff);
  } else if (meatDiff < 0 && breadDiff < 0) {
    confirmedDiff = Math.max(meatDiff, breadDiff);
  } else {
    confirmedDiff = 0;
  }

  const diffDisplay = -confirmedDiff;
  const completeBurgers = Math.min(meatConsumed, breadConsumed);
  const expectedRevenue = completeBurgers * avgPrice();
  const revenueDiff = totalRevenue - expectedRevenue;

  const rosaDiff  = (A.sauce_rosa||0)  - (C.sauce_rosa||0);
  const whiteDiff = (A.sauce_white||0) - (C.sauce_white||0);

  // Guardar datos calculados para Firebase
  cuadreData = {
    burgers_by_money: burgersByMoneyR,
    complete_burgers: completeBurgers,
    meat_consumed: meatConsumed,
    bread_consumed: breadConsumed,
    meat_diff: meatDiff,
    bread_diff: breadDiff,
    confirmed_diff: confirmedDiff,
    total_revenue: totalRevenue,
    expected_revenue: expectedRevenue,
    revenue_diff: revenueDiff,
    rosa_diff: rosaDiff,
    white_diff: whiteDiff,
  };

  // Restaurar botón guardar
  const btn = document.getElementById('btnGuardarJornada');
  if(btn && !btn.classList.contains('btn-save-db--saved')){
    btn.textContent='💾 Guardar jornada en historial'; btn.disabled=false; btn.className='btn-save-db';
  }

  // ── fill KPIs ──
  document.getElementById('r_burgers_money').textContent = burgersByMoneyR;
  document.getElementById('r_total_money').textContent   = '€'+totalRevenue.toFixed(2).replace('.',',');
  document.getElementById('r_diff').textContent          = (diffDisplay > 0 ? '+' : '') + diffDisplay;
  document.getElementById('r_diff_sub').textContent      = confirmedDiff===0 ? '✓ cuadre perfecto' : confirmedDiff>0 ? 'faltan hamburguesas' : 'hay más stock del esperado';

  const meatEl = document.getElementById('r_meat_diff_text');
  const meatBadge = document.getElementById('r_meat_diff_badge');
  if(meatDiff > 0){
    meatEl.textContent = 'Faltan '+meatDiff+' carne'+(meatDiff!==1?'s':'');
    meatBadge.className='badge bad'; meatBadge.textContent='−'+meatDiff;
  } else if(meatDiff < 0){
    meatEl.textContent = 'Sobran '+Math.abs(meatDiff)+' carne'+(Math.abs(meatDiff)!==1?'s':'');
    meatBadge.className='badge warn'; meatBadge.textContent='+'+Math.abs(meatDiff);
  } else {
    meatEl.textContent = 'Carne cuadra perfectamente';
    meatBadge.className='badge ok'; meatBadge.textContent='✓';
  }

  const breadEl = document.getElementById('r_bread_diff_text');
  const breadBadge = document.getElementById('r_bread_diff_badge');
  if(breadDiff > 0){
    breadEl.textContent = 'Faltan '+breadDiff+' pan'+(breadDiff!==1?'es':'');
    breadBadge.className='badge bad'; breadBadge.textContent='−'+breadDiff;
  } else if(breadDiff < 0){
    breadEl.textContent = 'Sobran '+Math.abs(breadDiff)+' pan'+(Math.abs(breadDiff)!==1?'es':'');
    breadBadge.className='badge warn'; breadBadge.textContent='+'+Math.abs(breadDiff);
  } else {
    breadEl.textContent = 'Pan cuadra perfectamente';
    breadBadge.className='badge ok'; breadBadge.textContent='✓';
  }

  var rosaEl  = document.getElementById('r_rosa_diff_text');
  var whiteEl = document.getElementById('r_white_diff_text');

  if(rosaDiff > 0){
    rosaEl.textContent = 'Salsa Rosa: '+rosaDiff+' bote'+(rosaDiff!==1?'s':'')+' usados';
    document.getElementById('r_rosa_badge').className='badge ok';
    document.getElementById('r_rosa_badge').textContent='−'+rosaDiff;
  } else if(rosaDiff < 0){
    rosaEl.textContent = 'Salsa Rosa: sobran '+Math.abs(rosaDiff)+' bote'+(Math.abs(rosaDiff)!==1?'s':'');
    document.getElementById('r_rosa_badge').className='badge warn';
    document.getElementById('r_rosa_badge').textContent='+'+Math.abs(rosaDiff);
  } else {
    rosaEl.textContent = 'Salsa Rosa: sin cambio';
    document.getElementById('r_rosa_badge').className='badge ok';
    document.getElementById('r_rosa_badge').textContent='—';
  }

  if(whiteDiff > 0){
    whiteEl.textContent = 'Salsa Blanca: '+whiteDiff+' bote'+(whiteDiff!==1?'s':'')+' usados';
    document.getElementById('r_white_badge').className='badge ok';
    document.getElementById('r_white_badge').textContent='−'+whiteDiff;
  } else if(whiteDiff < 0){
    whiteEl.textContent = 'Salsa Blanca: sobran '+Math.abs(whiteDiff)+' bote'+(Math.abs(whiteDiff)!==1?'s':'');
    document.getElementById('r_white_badge').className='badge warn';
    document.getElementById('r_white_badge').textContent='+'+Math.abs(whiteDiff);
  } else {
    whiteEl.textContent = 'Salsa Blanca: sin cambio';
    document.getElementById('r_white_badge').className='badge ok';
    document.getElementById('r_white_badge').textContent='—';
  }

  document.getElementById('r_expected_revenue').textContent = '€'+expectedRevenue.toFixed(2).replace('.',',');
  document.getElementById('r_real_revenue').textContent     = '€'+totalRevenue.toFixed(2).replace('.',',');
  const rb = document.getElementById('r_revenue_badge');
  const absDiff = Math.abs(revenueDiff);
  if(absDiff < 2){ rb.className='badge ok'; rb.textContent='± €'+absDiff.toFixed(2).replace('.',','); }
  else if(absDiff < 15){ rb.className='badge warn'; rb.textContent='± €'+absDiff.toFixed(2).replace('.',','); }
  else{ rb.className='badge bad'; rb.textContent='± €'+absDiff.toFixed(2).replace('.',','); }

  if(confirmedDiff === 0){
    showAlert('ok','✓ Todo cuadra','El inventario consumido coincide con las ventas registradas. Sin anomalías detectadas.');
  } else if(confirmedDiff > 0 && confirmedDiff <= 2){
    showAlert('warn','⚠ Diferencia pequeña',
      confirmedDiff+' hamburguesa(s) consumidas sin ingreso registrado. Puede ser un error de precio (Space Jam vs Especial) o una cortesía. Revisar.');
  } else if(confirmedDiff > 2){
    showAlert('danger','🚨 Alerta de inventario',
      confirmedDiff+' hamburguesas consumidas que no aparecen en ventas. Revisar urgentemente.');
  } else {
    showAlert('warn','📊 Diferencia inversa',
      Math.abs(confirmedDiff)+' hamburguesas cobradas más de las que refleja el stock. Posible error al contar inventario o ventas duplicadas.');
  }
}

// ── GUARDAR EN FIREBASE ──────────────────────────────
async function saveToFirebase(){
  if(!cuadreData){ alert('Primero completa el cuadre del día.'); return; }
  if(!db){
    alert('Firebase no está configurado. Añade tu firebaseConfig en app.js.');
    return;
  }
  const btn = document.getElementById('btnGuardarJornada');
  btn.textContent = '⏳ Guardando…'; btn.disabled = true;

  const fecha = localStorage.getItem('ic_fecha_jornada') || todayISO();
  const evento = localStorage.getItem('ic_evento') || '';

  try {
    await db.collection('registros').add({
      fecha,
      evento,
      apertura: JSON.parse(localStorage.getItem('ic_apertura')||'{}'),
      ventas:   JSON.parse(localStorage.getItem('ic_ventas')||'{}'),
      cierre:   JSON.parse(localStorage.getItem('ic_cierre')||'{}'),
      cuadre:   cuadreData,
      config:   {...CFG},
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
    });
    btn.textContent = '✓ Jornada guardada';
    btn.disabled = true;
    btn.className = 'btn-save-db btn-save-db--saved';
  } catch(error){
    btn.textContent = '❌ Error — reintentar';
    btn.disabled = false;
    btn.className = 'btn-save-db btn-save-db--error';
    console.error('Firebase error:', error);
  }
}

// ── HISTORIAL ────────────────────────────────────────
async function loadHistorial(){
  const container = document.getElementById('hist_content');
  if(!db){
    container.innerHTML = `<div class="hist-error">Firebase no configurado.</div>`;
    return;
  }
  container.innerHTML = '<div class="hist-loading">Cargando historial…</div>';

  let snap;
  try {
    snap = await db.collection('registros')
      .orderBy('fecha', 'desc')
      .orderBy('created_at', 'desc')
      .limit(60)
      .get();
  } catch(error){
    container.innerHTML = `<div class="hist-error">No se pudo cargar el historial.<br><span style="font-size:10px;opacity:.6">${error.message}</span></div>`;
    return;
  }

  if(snap.empty){
    container.innerHTML = '<div class="hist-empty">Todavía no hay jornadas guardadas.<br>Completa el cuadre y pulsa "Guardar jornada".</div>';
    return;
  }

  const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  container.innerHTML = data.map(r => {
    const Q = r.cuadre || {};
    const diff = Q.confirmed_diff || 0;
    const status = diff === 0 ? 'ok' : (Math.abs(diff) <= 2 ? 'warn' : 'bad');
    const statusLabel = diff === 0 ? '✓ Cuadra' : (diff > 0 ? `−${diff} uds` : `+${Math.abs(diff)} uds`);
    const total = Q.total_revenue !== undefined ? '€'+Number(Q.total_revenue).toFixed(2).replace('.',',') : '—';
    const burgers = Q.burgers_by_money !== undefined ? Q.burgers_by_money : '—';
    const fechaFmt = r.fecha
      ? new Date(r.fecha+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase()
      : '—';
    const eventoEsc = (r.evento||'').replace(/"/g,'&quot;');
    return `
      <div class="hist-item" data-id="${r.id}">
        <div class="hist-item-header">
          <div class="hist-item-left" onclick="toggleHistDetail(this.closest('.hist-item'))">
            <div class="hist-fecha" id="hf-${r.id}">${fechaFmt}</div>
            <div class="hist-evento" id="he-${r.id}">${r.evento || '<span style="opacity:.4">Sin nombre</span>'}</div>
          </div>
          <div class="hist-item-right">
            <div class="hist-kpi"><span class="hist-kpi-val">${total}</span><span class="hist-kpi-label">recaudado</span></div>
            <div class="hist-kpi"><span class="hist-kpi-val">${burgers}</span><span class="hist-kpi-label">burgers</span></div>
            <div class="badge ${status}">${statusLabel}</div>
            <button class="hist-btn-edit" onclick="startEditRegistro('${r.id}','${r.fecha||''}','${eventoEsc}')" title="Editar fecha/evento">✏️</button>
            <button class="hist-btn-del" onclick="deleteRegistro('${r.id}',this)" title="Eliminar">🗑</button>
            <span class="hist-chevron" onclick="toggleHistDetail(this.closest('.hist-item'))">▸</span>
          </div>
        </div>
        <div class="hist-edit-form" id="hef-${r.id}" style="display:none">
          <div class="hist-edit-row">
            <label>Fecha</label>
            <input type="date" id="hed-${r.id}" value="${r.fecha||''}">
          </div>
          <div class="hist-edit-row">
            <label>Evento</label>
            <input type="text" id="hee-${r.id}" value="${r.evento||''}" placeholder="Nombre del evento">
          </div>
          <div class="hist-edit-actions">
            <button class="hist-btn-save" onclick="saveEditRegistro('${r.id}')">Guardar</button>
            <button class="hist-btn-cancel" onclick="cancelEditRegistro('${r.id}')">Cancelar</button>
          </div>
        </div>
        <div class="hist-detail" id="hdet-${r.id}" style="display:none">
          ${buildHistDetail(r)}
        </div>
      </div>`;
  }).join('');
}

function toggleHistDetail(item){
  const detail = item.querySelector('.hist-detail');
  const chevron = item.querySelector('.hist-chevron');
  const open = detail.style.display !== 'none';
  detail.style.display = open ? 'none' : 'block';
  chevron.textContent = open ? '▸' : '▾';
}

function startEditRegistro(id, fecha, evento){
  document.getElementById('hef-'+id).style.display = 'block';
  document.getElementById('hed-'+id).value = fecha;
  document.getElementById('hee-'+id).value = evento;
}

function cancelEditRegistro(id){
  document.getElementById('hef-'+id).style.display = 'none';
}

async function saveEditRegistro(id){
  const fecha = document.getElementById('hed-'+id).value;
  const evento = document.getElementById('hee-'+id).value.trim();
  if(!fecha){ alert('La fecha no puede estar vacía.'); return; }

  try {
    await db.collection('registros').doc(id).update({ fecha, evento });
  } catch(error){ alert('Error al guardar: '+error.message); return; }

  // Actualizar la vista sin recargar todo
  const fechaFmt = new Date(fecha+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
  document.getElementById('hf-'+id).textContent = fechaFmt;
  document.getElementById('he-'+id).innerHTML = evento || '<span style="opacity:.4">Sin nombre</span>';
  document.getElementById('hef-'+id).style.display = 'none';
}

async function deleteRegistro(id, btn){
  if(!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
  btn.textContent = '⏳'; btn.disabled = true;
  try {
    await db.collection('registros').doc(id).delete();
  } catch(error){ alert('Error al eliminar: '+error.message); btn.textContent='🗑'; btn.disabled=false; return; }
  document.querySelector(`.hist-item[data-id="${id}"]`).remove();
  const container = document.getElementById('hist_content');
  if(!container.querySelector('.hist-item')){
    container.innerHTML = '<div class="hist-empty">Todavía no hay jornadas guardadas.</div>';
  }
}

function buildHistDetail(r){
  const A = r.apertura || {};
  const V = r.ventas   || {};
  const C = r.cierre   || {};
  const Q = r.cuadre   || {};
  const fmt = v => (v !== undefined && v !== null) ? v : '—';
  const eur = v => (v !== undefined && v !== null) ? '€'+Number(v).toFixed(2).replace('.',',') : '—';
  return `
    <div class="hist-detail-grid">
      <div class="hist-detail-block">
        <div class="hist-detail-title">🟡 Apertura</div>
        <div class="hist-detail-row"><span>Carne</span><span>${fmt(A.meat_boxes)} caj + ${fmt(A.meat_loose)} suel</span></div>
        <div class="hist-detail-row"><span>Pan</span><span>${fmt(A.bread_boxes)} caj + ${fmt(A.bread_loose)} suel</span></div>
        <div class="hist-detail-row"><span>Salsa Rosa</span><span>${fmt(A.sauce_rosa)} botes</span></div>
        <div class="hist-detail-row"><span>Salsa Blanca</span><span>${fmt(A.sauce_white)} botes</span></div>
      </div>
      <div class="hist-detail-block">
        <div class="hist-detail-title">🔵 Cierre</div>
        <div class="hist-detail-row"><span>Carne</span><span>${fmt(C.meat_boxes)} caj + ${fmt(C.meat_loose)} suel</span></div>
        <div class="hist-detail-row"><span>Pan</span><span>${fmt(C.bread_boxes)} caj + ${fmt(C.bread_loose)} suel</span></div>
        <div class="hist-detail-row"><span>Salsa Rosa</span><span>${fmt(C.sauce_rosa)} botes</span></div>
        <div class="hist-detail-row"><span>Salsa Blanca</span><span>${fmt(C.sauce_white)} botes</span></div>
      </div>
      <div class="hist-detail-block">
        <div class="hist-detail-title">💳 Ventas</div>
        <div class="hist-detail-row"><span>Tarjeta</span><span>${eur(V.card)}</span></div>
        <div class="hist-detail-row"><span>Efectivo</span><span>${eur(V.cash)}</span></div>
        <div class="hist-detail-row"><span>Total</span><span>${eur((V.card||0)+(V.cash||0))}</span></div>
      </div>
      <div class="hist-detail-block">
        <div class="hist-detail-title">📊 Cuadre</div>
        <div class="hist-detail-row"><span>Burgers vendidas</span><span>${fmt(Q.burgers_by_money)}</span></div>
        <div class="hist-detail-row"><span>Burgers consumidas</span><span>${fmt(Q.complete_burgers)}</span></div>
        <div class="hist-detail-row"><span>Ingr. esperados</span><span>${eur(Q.expected_revenue)}</span></div>
        <div class="hist-detail-row"><span>Diferencia €</span><span>${eur(Q.revenue_diff)}</span></div>
      </div>
    </div>`;
}

function setBadge(id, diff, label){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = label;
  if(Math.abs(diff)===0) { el.className='badge ok'; }
  else if(Math.abs(diff)<=2) { el.className='badge warn'; }
  else { el.className='badge bad'; }
}

function showAlert(type, title, body){
  document.getElementById('cuadre_alert').innerHTML =
    `<div class="alert ${type}"><div class="alert-title">${title}</div><div class="alert-body">${body}</div></div>`;
}

// ── RESET ───────────────────────────────────────────
function resetDay(){
  if(!confirm('¿Iniciar un nuevo día? Se borrarán los datos de hoy.')) return;
  ['ic_apertura','ic_ventas','ic_cierre'].forEach(k=>localStorage.removeItem(k));
  cuadreData = null;
  localStorage.setItem('ic_fecha_jornada', todayISO());
  document.getElementById('cfg_fecha_jornada').value = todayISO();
  updateHeaderEvento();
  ['a_meat_boxes','a_meat_loose','a_bread_boxes','a_bread_loose','a_sauce_rosa','a_sauce_white',
   'c_meat_boxes','c_meat_loose','c_bread_boxes','c_bread_loose','c_sauce_rosa','c_sauce_white',
   'v_card','v_cash'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=0;});
  document.getElementById('v_total').textContent='€0,00';
  document.getElementById('v_est_burgers').textContent='~0';
  document.getElementById('a_meat_total').textContent='0 ud';
  document.getElementById('a_bread_total').textContent='0 ud';
  document.getElementById('c_meat_total').textContent='0 ud';
  document.getElementById('c_bread_total').textContent='0 ud';
  document.getElementById('cuadre_alert').innerHTML='';
  const btn = document.getElementById('btnGuardarJornada');
  if(btn){ btn.textContent='💾 Guardar jornada en historial'; btn.disabled=false; btn.className='btn-save-db'; }
  tabs.forEach((t,i)=>{t.classList.remove('done','active');if(i===0)t.classList.add('active');});
  goTo(0);
}

// ── INIT ────────────────────────────────────────────
(function(){
  const s = localStorage.getItem('ic_config');
  if(s){ try{ const p=JSON.parse(s); if(!p.meatBox||p.meatBox<1||!p.breadBox||p.breadBox<1){ localStorage.removeItem('ic_config'); } }catch(e){ localStorage.removeItem('ic_config'); } }
})();
loadTheme();
loadConfig();
loadEvento();
loadFechaJornada();
setDate();
checkAuth();

['a_meat_boxes','a_meat_loose','a_bread_boxes','a_bread_loose'].forEach(function(id){
  var el = document.getElementById(id);
  if(el){
    ['input','change','keyup'].forEach(function(ev){
      el.addEventListener(ev, function(){ calc('a'); });
    });
  }
});
['c_meat_boxes','c_meat_loose','c_bread_boxes','c_bread_loose'].forEach(function(id){
  var el = document.getElementById(id);
  if(el){
    ['input','change','keyup'].forEach(function(ev){
      el.addEventListener(ev, function(){ calc('c'); });
    });
  }
});
