/* ===================================================================
   Bismillah — Admin Dashboard (standalone)
   Talks to Spring Boot backend at API base below.
   =================================================================== */
const API = "https://bismillah-restaurant-api.onrender.com/api";
const POLL_MS = 4000;

/* ---------- Small helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const fmt = n => '₹' + Number(n||0).toFixed(0);
const escapeHtml = s => String(s??'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

async function api(path, opts={}) {
  const res = await fetch(API + path, {
    headers:{'Content-Type':'application/json'},
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  if (!res.ok) throw new Error('API ' + res.status + ' ' + path);
  const ct = res.headers.get('content-type')||'';
  return ct.includes('json') ? res.json() : res.text();
}

/* ---------- Chime + toast ---------- */
function playChime() {
  if (!$('#soundOn')?.checked) return;
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    [880,1320,1760].forEach((f,i)=>{
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value=f; o.type='sine';
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i*0.13;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.35,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.35);
      o.start(t); o.stop(t+0.4);
    });
  } catch(e){}
}
function toast(html, ms=5000){
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  $('#toasts').appendChild(el);
  setTimeout(()=>{el.style.opacity='0'; setTimeout(()=>el.remove(),300);}, ms);
}

/* ---------- Login ---------- */
async function doLogin(){
  const pin = $('#pinInput').value.trim();
  $('#loginErr').textContent='';
  if(!pin) return;
  try{
    const r = await api('/admin/login',{method:'POST',body:{pin}});
    if(!r.ok){ $('#loginErr').textContent='Wrong PIN.'; return; }
    sessionStorage.setItem('bismillah_admin_ok','1');
    enterApp();
  }catch(e){ $('#loginErr').textContent='Backend unreachable. Start Spring Boot on :8080.'; }
}
function logout(){
  sessionStorage.removeItem('bismillah_admin_ok');
  location.reload();
}
function enterApp(){
  $('#loginScreen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  bindNav();
  startPolling();
  switchView('dashboard');
}
if(sessionStorage.getItem('bismillah_admin_ok')==='1') {
  document.addEventListener('DOMContentLoaded', enterApp);
}

/* ---------- Navigation ---------- */
const VIEW_META = {
  dashboard:{title:'Dashboard', sub:"Overview of today's activity"},
  dinein  :{title:'🍽️ Dine-In Orders', sub:'Orders placed from tables/rooms'},
  delivery:{title:'🚚 Delivery Orders', sub:'Home delivery orders'},
  menu    :{title:'🍛 Menu Management', sub:'Add, edit, delete items · toggle stock'},
  reports :{title:'📈 Reports', sub:'Sales & performance insights'},
  notifs  :{title:'🔔 Live Notifications', sub:'Recent activity feed'},
};
function bindNav(){
  $$('.nav-item').forEach(a=>{
    a.onclick = ()=> switchView(a.dataset.view);
  });
}
let currentView='dashboard';
function switchView(v){
  currentView=v;
  $$('.nav-item').forEach(a=>a.classList.toggle('active',a.dataset.view===v));
  $$('.view').forEach(s=>s.classList.add('hidden'));
  $('#view-'+v).classList.remove('hidden');
  $('#viewTitle').textContent = VIEW_META[v].title;
  $('#viewSub').textContent = VIEW_META[v].sub;
  render();
}

/* ---------- State ---------- */
let state = { orders:[], rooms:[], bookings:[], menu:[], categories:[], notifs:[] };
let seenOrderIds = new Set();
let firstLoad = true;
let pollTimer = null;

function startPolling(){
  refresh();
  clearInterval(pollTimer);
  pollTimer = setInterval(refresh, POLL_MS);
}

async function refresh(){
  try{
    const [orders, rooms, bookings, menu, categories] = await Promise.all([
      api('/orders'), api('/rooms'), api('/bookings'),
      api('/menu'), api('/menu/categories').catch(()=>[])
    ]);
    state.orders = orders; state.rooms = rooms; state.bookings = bookings;
    state.menu = menu; state.categories = categories;

    // detect brand-new NEW orders
    const fresh = orders.filter(o => o.status==='NEW' && !seenOrderIds.has(o.id));
    if(!firstLoad && fresh.length){
      playChime();
      fresh.forEach(o=>{
        const label = o.type==='DINE_IN'
          ? `🍽 Dine-In · ${o.customerName||('Room '+(o.roomId??'—'))}`
          : `🚚 Delivery · ${o.customerName||'Guest'}`;
        toast(`<b>New order ${escapeHtml(o.orderNumber)}</b><br>${label}<br>${fmt(o.total)}`);
        state.notifs.unshift({
          id:o.id, order:o.orderNumber,
          text:`New ${o.type==='DINE_IN'?'Dine-In':'Delivery'} order ${o.orderNumber} — ${fmt(o.total)}`,
          when:new Date()
        });
      });
      if(state.notifs.length>50) state.notifs.length=50;
    }
    orders.forEach(o=>seenOrderIds.add(o.id));
    firstLoad = false;

    // sidebar badges
    setBadge('#badgeDine', orders.filter(o=>o.type==='DINE_IN' && o.status==='NEW').length);
    setBadge('#badgeDel',  orders.filter(o=>o.type==='DELIVERY' && o.status==='NEW').length);
    setBadge('#badgeNotif',state.notifs.length);

    render();
  }catch(e){
    console.error(e);
  }
}
function setBadge(sel,n){
  const el = $(sel); if(!el) return;
  el.textContent = n>0 ? n : '';
  el.classList.toggle('show', n>0);
}

/* ---------- Render router ---------- */
function render(){
  if(currentView==='dashboard') renderDashboard();
  if(currentView==='dinein')    renderOrders('dinein');
  if(currentView==='delivery')  renderOrders('delivery');
  if(currentView==='menu')      renderMenu();
  if(currentView==='reports')   renderReports();
  if(currentView==='notifs')    renderNotifs();
}

/* ---------- Dashboard ---------- */
function isToday(d){
  const t = new Date(d); const n = new Date();
  return t.getFullYear()===n.getFullYear() && t.getMonth()===n.getMonth() && t.getDate()===n.getDate();
}
function renderDashboard(){
  const o = state.orders;
  const today = o.filter(x=>isToday(x.createdAt));
  const rev = today.filter(x=>x.status!=='CANCELLED').reduce((s,x)=>s+Number(x.total||0),0);
  const newC = o.filter(x=>x.status==='NEW').length;
  const active = o.filter(x=>['ACCEPTED','READY','OUT_FOR_DELIVERY'].includes(x.status)).length;
  const occRooms = (state.rooms||[]).filter(r=>r.occupied).length;
  const totalRooms = (state.rooms||[]).length;

  $('#view-dashboard').innerHTML = `
    <div class="grid grid-4">
      <div class="card stat"><div class="n">${today.length}</div><div class="l">Today's Orders</div><div class="sub">All channels</div></div>
      <div class="card stat ok"><div class="n">${fmt(rev)}</div><div class="l">Today's Revenue</div><div class="sub">Excludes cancelled</div></div>
      <div class="card stat danger"><div class="n">${newC}</div><div class="l">New / Pending</div><div class="sub">Need action</div></div>
      <div class="card stat warn"><div class="n">${active}</div><div class="l">In Progress</div><div class="sub">Accepted → Out</div></div>
    </div>

    <div class="grid grid-2" style="margin-top:18px">
      <div class="card">
        <h3 class="section-title">🍽️ Room Occupancy</h3>
        <div class="muted small" style="margin-bottom:10px">${occRooms} / ${totalRooms} occupied</div>
        <div class="grid" style="grid-template-columns:repeat(5,1fr);gap:8px">
          ${(state.rooms||[]).map(r=>`
            <div class="card" style="padding:10px;text-align:center;background:${r.occupied?'#3a1010':'#0f2a1a'};border-color:${r.occupied?'#5a1a1a':'#1e5533'}">
              <div style="font-weight:700">${escapeHtml(r.name)}</div>
              <div class="small" style="color:${r.occupied?'#ff9b9b':'#8ee6b0'};margin-bottom:6px">${r.occupied?'OCCUPIED':'FREE'}</div>
              <button class="btn sm ${r.occupied?'ok':'warn'}" onclick="toggleRoom(${r.id}, ${!r.occupied})">${r.occupied?'Mark Free':'Mark Occupied'}</button>
            </div>`).join('') || '<div class="empty">No rooms configured</div>'}
        </div>
      </div>
      <div class="card">
        <h3 class="section-title">🕒 Recent Orders</h3>
        ${o.slice(0,6).map(x=>`
          <div class="notif-item">
            <div>
              <div><b>${escapeHtml(x.orderNumber)}</b> · <span class="status st-${x.status}">${x.status}</span></div>
              <div class="small muted">${x.type==='DINE_IN'?'🍽 Dine-In':'🚚 Delivery'} · ${fmt(x.total)}</div>
            </div>
            <div class="when">${new Date(x.createdAt).toLocaleTimeString()}</div>
          </div>`).join('') || '<div class="empty">No orders yet</div>'}
      </div>
    </div>`;
}

/* ---------- Orders (Dine-In / Delivery) ---------- */
function statusActions(o){
  const b = (label, next, cls) =>
    `<button class="btn sm ${cls}" onclick="updateStatus(${o.id},'${next}')">${label}</button>`;
  if(o.status==='NEW') return b('✅ Accept','ACCEPTED','ok') + b('✗ Cancel','CANCELLED','danger');
  if(o.status==='ACCEPTED') return b('🍽 Mark Ready','READY','blue');
  if(o.status==='READY' && o.type==='DELIVERY') return b('🚚 Out for Delivery','OUT_FOR_DELIVERY','warn');
  if(o.status==='READY' || o.status==='OUT_FOR_DELIVERY') return b('✔ Complete','DELIVERED','ok');
  return '';
}
async function updateStatus(id,status){
  await api(`/orders/${id}/status`,{method:'PUT',body:{status}});
  refresh();
}
window.updateStatus = updateStatus;

function orderCard(o){
  let items = [];
  try { items = JSON.parse(o.itemsJson||'[]'); } catch { items = []; }
  const isNew = o.status==='NEW';
  const room = o.roomId ? (state.rooms.find(r=>r.id===o.roomId)?.name || ('Room '+o.roomId)) : null;
  return `
    <div class="order ${isNew?'new':''}">
      <div class="order-head">
        <div>
          <div class="order-title">${escapeHtml(o.orderNumber)} ${o.type==='DINE_IN'?`· 🍽 ${escapeHtml(room||'')}`:'· 🚚 Delivery'}</div>
          <div class="order-meta">⏰ ${new Date(o.createdAt).toLocaleString()} · 💳 ${escapeHtml(o.paymentMethod||'—')}</div>
        </div>
        <span class="status st-${o.status}">${o.status.replace(/_/g,' ')}</span>
      </div>
      ${o.type==='DELIVERY' ? `
        <div class="customer-box">
          <b>${escapeHtml(o.customerName||'Guest')}</b> · ${escapeHtml(o.customerPhone||'—')}<br>
          <span class="muted">${escapeHtml(o.address||'')}</span>
        </div>` : (o.customerName ? `<div class="customer-box"><b>${escapeHtml(o.customerName)}</b> · ${escapeHtml(o.customerPhone||'')}</div>`:'')
      }
      <div class="order-items">
        ${items.map(it=>`<div>${escapeHtml(it.name)} × ${it.qty} <span class="muted">= ${fmt(it.qty*it.price)}</span></div>`).join('') || '<div class="muted small">No items</div>'}
      </div>
      <div class="order-total">Total: ${fmt(o.total)}</div>
      <div class="order-actions">${statusActions(o)}</div>
    </div>`;
}
function renderOrders(kind){
  const type = kind==='dinein' ? 'DINE_IN' : 'DELIVERY';
  const list = state.orders.filter(o=>o.type===type);

  const filters = ['ALL','NEW','ACCEPTED','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'];
  const view = $('#view-'+kind);
  const active = view.dataset.filter || 'ALL';
  const shown = active==='ALL' ? list : list.filter(o=>o.status===active);

  view.innerHTML = `
    <div class="filters">
      ${filters.map(f=>`<button class="chip ${active===f?'active':''}" data-f="${f}">${f.replace(/_/g,' ')}</button>`).join('')}
      <span class="muted small" style="margin-left:auto;align-self:center">${shown.length} shown · ${list.length} total</span>
    </div>
    <div>${shown.map(orderCard).join('') || '<div class="empty">No orders in this view.</div>'}</div>`;
  view.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{view.dataset.filter=b.dataset.f;renderOrders(kind);});
}

/* ---------- Menu Management ---------- */
let menuFilter = 'All';
function renderMenu(){
  const cats = ['All', ...new Set(state.menu.map(i=>i.category))];
  const items = menuFilter==='All' ? state.menu : state.menu.filter(i=>i.category===menuFilter);
  $('#view-menu').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:8px">
      <div class="filters" style="margin:0">
        ${cats.map(c=>`<button class="chip ${menuFilter===c?'active':''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
      </div>
      <button class="btn gold" onclick="openItemModal()">+ Add Item</button>
    </div>
    <div class="card" style="padding:0;overflow:auto">
      <table class="tbl">
        <thead><tr>
          <th>#</th><th>Item</th><th>Telugu</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${items.map(i=>`
            <tr>
              <td class="muted">${i.id}</td>
              <td><span class="veg ${i.isVeg?'':'nonveg'}"></span>${escapeHtml(i.name)}</td>
              <td class="muted">${escapeHtml(i.nameTe||'—')}</td>
              <td>${escapeHtml(i.category)}</td>
              <td>${fmt(i.price)}</td>
              <td><span class="pill-avail ${i.available?'on':'off'}">${i.available?'Available':'Out of stock'}</span></td>
              <td>
                <button class="btn sm ${i.available?'warn':'ok'}" onclick="toggleAvail(${i.id}, ${!i.available})">${i.available?'Mark Out':'Mark In'}</button>
                <button class="btn sm blue" onclick="openItemModal(${i.id})">Edit</button>
                <button class="btn sm danger" onclick="deleteItem(${i.id})">Delete</button>
              </td>
            </tr>`).join('') || `<tr><td colspan="7"><div class="empty">No items</div></td></tr>`}
        </tbody>
      </table>
    </div>`;
  $$('#view-menu [data-cat]').forEach(b=>b.onclick=()=>{menuFilter=b.dataset.cat;renderMenu();});
}
async function toggleAvail(id, next){
  await api(`/menu/${id}/available`,{method:'PATCH',body:{available:next}});
  refresh();
}
async function deleteItem(id){
  if(!confirm('Delete this item permanently?')) return;
  await api(`/menu/${id}`,{method:'DELETE'});
  refresh();
}
window.toggleAvail = toggleAvail;
window.deleteItem  = deleteItem;

function openItemModal(id){
  const existing = id ? state.menu.find(i=>i.id===id) : null;
  const cats = state.categories.length ? state.categories
    : [...new Map(state.menu.map(m=>[m.categoryId,{id:m.categoryId,name:m.category}])).values()];
  const el = document.createElement('div');
  el.className='modal-bg';
  el.innerHTML = `
    <form class="modal" onsubmit="event.preventDefault(); saveItem(${id||'null'}, this)">
      <h3>${existing?'Edit Item':'Add Item'}</h3>
      <div class="form-grid">
        <label>Name (English)<input class="input" name="name" required value="${escapeHtml(existing?.name||'')}"></label>
        <label>Name (Telugu)<input class="input" name="nameTe" value="${escapeHtml(existing?.nameTe||'')}"></label>
        <label>Category
          <select class="input" name="categoryId" required>
            ${cats.map(c=>`<option value="${c.id}" ${existing?.categoryId===c.id?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </label>
        <label>Price (₹)<input class="input" name="price" type="number" step="1" min="0" required value="${existing?.price??''}"></label>
        <label style="flex-direction:row;align-items:center;gap:8px;margin-top:14px">
          <input type="checkbox" name="isVeg" ${existing?.isVeg?'checked':''}> Vegetarian
        </label>
        <label style="flex-direction:row;align-items:center;gap:8px;margin-top:14px">
          <input type="checkbox" name="available" ${existing==null||existing.available?'checked':''}> Available
        </label>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn ghost" onclick="this.closest('.modal-bg').remove()">Cancel</button>
        <button type="submit" class="btn gold">${existing?'Save changes':'Create item'}</button>
      </div>
    </form>`;
  document.body.appendChild(el);
}
window.openItemModal = openItemModal;

async function saveItem(id, form){
  const fd = new FormData(form);
  const body = {
    name: fd.get('name'),
    nameTe: fd.get('nameTe')||'',
    categoryId: Number(fd.get('categoryId')),
    price: Number(fd.get('price')),
    isVeg: fd.get('isVeg')==='on',
    available: fd.get('available')==='on'
  };
  if(id) await api(`/menu/${id}`,{method:'PUT',body});
  else   await api('/menu',{method:'POST',body});
  form.closest('.modal-bg').remove();
  refresh();
}
window.saveItem = saveItem;

/* ---------- Reports ---------- */
function renderReports(){
  const o = state.orders;
  const today = o.filter(x=>isToday(x.createdAt));
  const rev = today.filter(x=>x.status!=='CANCELLED').reduce((s,x)=>s+Number(x.total||0),0);
  const avg = today.length ? rev/today.length : 0;
  const dine = today.filter(x=>x.type==='DINE_IN').length;
  const del  = today.filter(x=>x.type==='DELIVERY').length;

  // top items today
  const counts = {};
  today.forEach(o=>{
    try{ JSON.parse(o.itemsJson||'[]').forEach(it=>{
      counts[it.name] = (counts[it.name]||0) + Number(it.qty||0);
    });}catch{}
  });
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const max = top[0]?.[1] || 1;

  // last 7 days revenue
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
    const dNext = new Date(d); dNext.setDate(d.getDate()+1);
    const dayOrders = o.filter(x=>{
      const t = new Date(x.createdAt);
      return t>=d && t<dNext && x.status!=='CANCELLED';
    });
    days.push({
      label: d.toLocaleDateString(undefined,{weekday:'short'}),
      total: dayOrders.reduce((s,x)=>s+Number(x.total||0),0)
    });
  }
  const dMax = Math.max(1, ...days.map(d=>d.total));

  // payment breakdown
  const pay = {};
  today.forEach(x=>{ const k=x.paymentMethod||'—'; pay[k]=(pay[k]||0)+1; });

  $('#view-reports').innerHTML = `
    <div class="grid grid-4">
      <div class="card stat"><div class="n">${today.length}</div><div class="l">Orders Today</div></div>
      <div class="card stat ok"><div class="n">${fmt(rev)}</div><div class="l">Revenue Today</div></div>
      <div class="card stat"><div class="n">${fmt(avg)}</div><div class="l">Avg. Order Value</div></div>
      <div class="card stat warn"><div class="n">${dine} / ${del}</div><div class="l">Dine-In / Delivery</div></div>
    </div>

    <div class="grid grid-2" style="margin-top:18px">
      <div class="card">
        <h3 class="section-title">🏆 Top Items Today</h3>
        ${top.length ? top.map(([n,c])=>`
          <div class="bar-row">
            <div class="lbl">${escapeHtml(n)}</div>
            <div class="bar"><span style="width:${(c/max)*100}%"></span></div>
            <div class="val">${c}</div>
          </div>`).join('') : '<div class="empty">No sales yet today</div>'}
      </div>
      <div class="card">
        <h3 class="section-title">📅 Last 7 Days Revenue</h3>
        ${days.map(d=>`
          <div class="bar-row">
            <div class="lbl">${d.label}</div>
            <div class="bar"><span style="width:${(d.total/dMax)*100}%"></span></div>
            <div class="val">${fmt(d.total)}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-top:18px">
      <h3 class="section-title">💳 Payment Methods (Today)</h3>
      ${Object.keys(pay).length ? Object.entries(pay).map(([k,v])=>`
        <div class="bar-row">
          <div class="lbl">${escapeHtml(k)}</div>
          <div class="bar"><span style="width:${(v/today.length)*100}%"></span></div>
          <div class="val">${v}</div>
        </div>`).join('') : '<div class="empty">No orders today</div>'}
    </div>`;
}

/* ---------- Live Notifications ---------- */
function renderNotifs(){
  $('#view-notifs').innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <h3 class="section-title" style="margin:0">Recent Activity</h3>
        <button class="btn ghost sm" onclick="clearNotifs()">Clear</button>
      </div>
      ${state.notifs.length ? state.notifs.map(n=>`
        <div class="notif-item">
          <div>🔔 ${escapeHtml(n.text)}</div>
          <div class="when">${n.when.toLocaleTimeString()}</div>
        </div>`).join('') : '<div class="empty">No notifications yet. New orders will appear here in real time.</div>'}
    </div>`;
}
function clearNotifs(){ state.notifs=[]; setBadge('#badgeNotif',0); renderNotifs(); }
window.clearNotifs = clearNotifs;

/* ---------- Room toggle ---------- */
async function toggleRoom(id, occupied){
  try {
    await api(`/rooms/${id}/occupied`, { method:'PUT', body:{ occupied } });
    const r = (state.rooms||[]).find(x=>x.id===id);
    if (r) r.occupied = occupied;
    render();
    toast(`Room marked ${occupied?'occupied':'free'}`, 2500);
  } catch(e){ toast('Failed to update room: '+e.message, 4000); }
}
window.toggleRoom = toggleRoom;
