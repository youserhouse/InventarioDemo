// ── SUPABASE ─────────────────────────────────────────
// IMPORTANTE: sustituye estas dos líneas con los valores de tu proyecto
// supabase.com → Settings → API → Project URL + anon public key
const SUPA_URL = 'TU_SUPABASE_URL';       // ej: https://abcxyz.supabase.co
const SUPA_KEY = 'TU_SUPABASE_ANON_KEY';  // clave "anon public"

let supa = null;
try {
  if(typeof supabase !== 'undefined' && SUPA_URL !== 'TU_SUPABASE_URL'){
    supa = supabase.createClient(SUPA_URL, SUPA_KEY);
  }
} catch(e){ console.warn('Supabase no inicializado:', e); }

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
  updateHeaderEvento(ev);
}

function saveEvento(){
  const ev = document.getElementById('cfg_evento').value.trim();
  localStorage.setItem('ic_evento', ev);
  updateHeaderEvento(ev);
}

function updateHeaderEvento(ev){
  const el = document.getElementById('headerEvento');
  if(ev){ el.textContent = ev; el.style.display = ''; }
  else { el.textContent = ''; el.style.display = 'none'; }
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

  // Guardar datos calculados para Supabase
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

// ── GUARDAR EN SUPABASE ──────────────────────────────
async function saveToSupabase(){
  if(!cuadreData){ alert('Primero completa el cuadre del día.'); return; }
  if(!supa){
    alert('Supabase no está configurado. Añade tu URL y anon key en app.js (líneas 5-6).');
    return;
  }
  const btn = document.getElementById('btnGuardarJornada');
  btn.textContent = '⏳ Guardando…'; btn.disabled = true;

  const fecha = new Date().toISOString().slice(0,10);
  const evento = localStorage.getItem('ic_evento') || '';

  const { error } = await supa.from('registros').insert({
    fecha,
    evento,
    apertura: JSON.parse(localStorage.getItem('ic_apertura')||'{}'),
    ventas:   JSON.parse(localStorage.getItem('ic_ventas')||'{}'),
    cierre:   JSON.parse(localStorage.getItem('ic_cierre')||'{}'),
    cuadre:   cuadreData,
    config:   {...CFG},
  });

  if(error){
    btn.textContent = '❌ Error — reintentar';
    btn.disabled = false;
    btn.className = 'btn-save-db btn-save-db--error';
    console.error('Supabase error:', error);
  } else {
    btn.textContent = '✓ Jornada guardada';
    btn.disabled = true;
    btn.className = 'btn-save-db btn-save-db--saved';
  }
}

// ── HISTORIAL ────────────────────────────────────────
async function loadHistorial(){
  const container = document.getElementById('hist_content');
  if(!supa){
    container.innerHTML = `<div class="hist-error">Supabase no configurado.<br><span style="font-size:10px;opacity:.6">Añade tu URL y anon key en app.js (líneas 5-6) y vuelve a publicar.</span></div>`;
    return;
  }
  container.innerHTML = '<div class="hist-loading">Cargando historial…</div>';

  const { data, error } = await supa
    .from('registros')
    .select('*')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(60);

  if(error){
    container.innerHTML = `<div class="hist-error">No se pudo cargar el historial.<br><span style="font-size:10px;opacity:.6">${error.message}</span></div>`;
    return;
  }

  if(!data || data.length === 0){
    container.innerHTML = '<div class="hist-empty">Todavía no hay jornadas guardadas.<br>Completa el cuadre y pulsa "Guardar jornada".</div>';
    return;
  }

  container.innerHTML = data.map((r,i) => {
    const Q = r.cuadre || {};
    const diff = Q.confirmed_diff || 0;
    const status = diff === 0 ? 'ok' : (Math.abs(diff) <= 2 ? 'warn' : 'bad');
    const statusLabel = diff === 0 ? '✓ Cuadra' : (diff > 0 ? `−${diff} uds` : `+${Math.abs(diff)} uds`);
    const total = Q.total_revenue !== undefined ? '€'+Number(Q.total_revenue).toFixed(2).replace('.',',') : '—';
    const burgers = Q.burgers_by_money !== undefined ? Q.burgers_by_money : '—';
    const fechaFmt = r.fecha
      ? new Date(r.fecha+'T12:00:00').toLocaleDateString('es-ES',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).toUpperCase()
      : '—';
    return `
      <div class="hist-item">
        <div class="hist-item-header" onclick="toggleHistDetail(this)">
          <div class="hist-item-left">
            <div class="hist-fecha">${fechaFmt}</div>
            <div class="hist-evento">${r.evento || '<span style="opacity:.4">Sin nombre</span>'}</div>
          </div>
          <div class="hist-item-right">
            <div class="hist-kpi"><span class="hist-kpi-val">${total}</span><span class="hist-kpi-label">recaudado</span></div>
            <div class="hist-kpi"><span class="hist-kpi-val">${burgers}</span><span class="hist-kpi-label">burgers</span></div>
            <div class="badge ${status}">${statusLabel}</div>
            <span class="hist-chevron">▸</span>
          </div>
        </div>
        <div class="hist-detail" style="display:none">
          ${buildHistDetail(r)}
        </div>
      </div>`;
  }).join('');
}

function toggleHistDetail(header){
  const detail = header.nextElementSibling;
  const chevron = header.querySelector('.hist-chevron');
  const open = detail.style.display !== 'none';
  detail.style.display = open ? 'none' : 'block';
  chevron.textContent = open ? '▸' : '▾';
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
setDate();

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
