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
    // Guard: box sizes can never be 0 or negative
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
}

// ── CALCS ───────────────────────────────────────────
function calc(prefix){
  // Read box sizes directly from config inputs — no CFG dependency
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
  const burgersByStock = Math.min(meatConsumed, breadConsumed); // ambos ingredientes deben confirmar el déficit

  const totalRevenue = (V.card||0) + (V.cash||0);
  const burgersByMoney = totalRevenue / avgPrice();
  const burgersByMoneyR = Math.round(burgersByMoney);

  const diff = burgersByStock - burgersByMoneyR; // positive = more consumed than sold (missing)
  const diffDisplay = burgersByMoneyR - burgersByStock; // negative = missing burgers (intuitive)
  const expectedRevenue = burgersByStock * avgPrice();
  const revenueDiff = totalRevenue - expectedRevenue;

  // ── fill KPIs ──
  document.getElementById('r_burgers_money').textContent = burgersByMoneyR;
  document.getElementById('r_total_money').textContent   = '€'+totalRevenue.toFixed(2).replace('.',',');
  document.getElementById('r_diff').textContent          = (diffDisplay > 0 ? '+' : '') + diffDisplay;
  document.getElementById('r_diff_sub').textContent      = diff===0 ? '✓ cuadre perfecto' : diff>0 ? 'faltan hamburguesas' : 'hay más stock del esperado';

  // ── diferencia de inventario: desglose por ingrediente ──
  const meatDiff  = meatConsumed  - burgersByMoneyR; // >0 = más consumidas que vendidas
  const breadDiff = breadConsumed - burgersByMoneyR;

  // texto carne
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

  // texto pan
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



  // ── salsas (dentro de diferencia de inventario) ──
  var rosaDiff  = (A.sauce_rosa||0)  - (C.sauce_rosa||0);
  var whiteDiff = (A.sauce_white||0) - (C.sauce_white||0);

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

  // meat badge (meatDiff / breadDiff ya declarados arriba)
  setBadge('r_meat_badge', meatDiff, meatConsumed+' consumidas');
  setBadge('r_bread_badge', breadDiff, breadConsumed+' consumidas');

  // revenue
  document.getElementById('r_expected_revenue').textContent = '€'+expectedRevenue.toFixed(2).replace('.',',');
  document.getElementById('r_real_revenue').textContent     = '€'+totalRevenue.toFixed(2).replace('.',',');
  const rb = document.getElementById('r_revenue_badge');
  const absDiff = Math.abs(revenueDiff);
  if(absDiff < 2){ rb.className='badge ok'; rb.textContent='± €'+absDiff.toFixed(2).replace('.',','); }
  else if(absDiff < 15){ rb.className='badge warn'; rb.textContent='± €'+absDiff.toFixed(2).replace('.',','); }
  else{ rb.className='badge bad'; rb.textContent='± €'+absDiff.toFixed(2).replace('.',','); }

  // ── main alert ──
  if(diff === 0){
    showAlert('ok','✓ Todo cuadra','El inventario consumido coincide con las ventas registradas. Sin anomalías detectadas.');
  } else if(diff > 0 && diff <= 2){
    showAlert('warn','⚠ Diferencia pequeña',
      diff+' hamburguesa(s) consumidas sin ingreso registrado. Puede ser un error de precio (Space Jam vs Especial) o una cortesía. Revisar.');
  } else if(diff > 2){
    showAlert('danger','🚨 Alerta de inventario',
      diff+' hamburguesas consumidas que no aparecen en ventas. Revisar urgentemente.');
  } else {
    showAlert('warn','📊 Diferencia inversa',
      Math.abs(diff)+' hamburgesas cobradas más de las que refleja el stock. Posible error al contar inventario o ventas duplicadas.');
  }
}

function setBadge(id, diff, label){
  const el = document.getElementById(id);
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
  tabs.forEach((t,i)=>{t.classList.remove('done','active');if(i===0)t.classList.add('active');});
  goTo(0);
}

// ── INIT ────────────────────────────────────────────
// Reset corrupted config if box sizes are invalid
(function(){
  const s = localStorage.getItem('ic_config');
  if(s){ try{ const p=JSON.parse(s); if(!p.meatBox||p.meatBox<1||!p.breadBox||p.breadBox<1){ localStorage.removeItem('ic_config'); } }catch(e){ localStorage.removeItem('ic_config'); } }
})();
loadTheme();
loadConfig();
setDate();

// Extra safety: bind calc via addEventListener in case oninput doesn't fire on this browser
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
