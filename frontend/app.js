/* ============ Bismillah – shared JS ============ */

const API = 'https://bismillah-restaurant-api.onrender.com/api';


// ---------- Cart (localStorage) ----------

const Cart = {

  key: 'bismillah_cart',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  },

  save(c) {
    localStorage.setItem(this.key, JSON.stringify(c));
    this.render();
  },

  add(item) {

    const c = this.get();

    const ex = c.find(x => x.id === item.id);

    if (ex)
      ex.qty++;

    else
      c.push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        qty: 1
      });

    this.save(c);

  },

  inc(id) {

    const c = this.get();

    const x = c.find(i => i.id === id);

    if (x) {
      x.qty++;
      this.save(c);
    }

  },

  dec(id) {

    let c = this.get();

    const x = c.find(i => i.id === id);

    if (!x) return;

    x.qty--;

    if (x.qty <= 0)
      c = c.filter(i => i.id !== id);

    this.save(c);

  },

  clear() {

    localStorage.removeItem(this.key);

    this.render();

  },

  count() {

    return this.get().reduce((s, i) => s + i.qty, 0);

  },

  total() {

    return this.get().reduce((s, i) => s + i.qty * i.price, 0);

  },

  qtyOf(id) {

    const x = this.get().find(i => i.id === id);

    return x ? x.qty : 0;

  },

  render() {

    const bar = document.getElementById("cartBar");

    if (!bar) return;

    if (this.count() === 0) {

      bar.classList.add("hidden");

      return;

    }

    bar.classList.remove("hidden");

    bar.querySelector(".cart-info").textContent =
        `${this.count()} item(s) • ₹${this.total().toFixed(0)}`;

  }

};


// ---------- API Helper ----------

async function api(path, opts = {}) {

  const res = await fetch(API + path, {

    headers: {
      "Content-Type": "application/json"
    },

    ...opts,

    body: opts.body
        ? JSON.stringify(opts.body)
        : undefined

  });

  if (!res.ok)
    throw new Error("API " + res.status);

  return res.json();

}


// ---------- Notification Sound ----------

function playChime() {

  try {

    const ctx =
        new (window.AudioContext || window.webkitAudioContext)();

    [880, 1320].forEach((f, i) => {

      const o = ctx.createOscillator();

      const g = ctx.createGain();

      o.frequency.value = f;

      o.type = "sine";

      o.connect(g);

      g.connect(ctx.destination);

      const t = ctx.currentTime + i * 0.15;

      g.gain.setValueAtTime(0.0001, t);

      g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);

      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      o.start(t);

      o.stop(t + 0.4);

    });

  }

  catch (e) {}

}


// ---------- Header / Footer ----------

function injectChrome(active) {

  const header = `

    <nav class="nav">

        <a href="index.html" class="brand">

            Bismillah

            <small>HOUSE OF BIRYANIS & KEBABS</small>

        </a>

        <ul>

            ${[

    ['index.html','Home'],
    ['menu.html','Menu'],
    ['dine-in.html','Dine-In'],
    ['order-online.html','Order Online'],
    ['track.html','Track'],
    ['admin.html','Admin']

  ]

      .map(([h,l]) =>

          `<li>

                    <a href="${h}"

                       class="${active===h?'active':''}">

                       ${l}

                    </a>

                </li>`

      ).join('')}

        </ul>

    </nav>

    `;


  const footer = `

    <footer>

        <strong>

            Bismillah – House of Biryanis & Kebabs

        </strong>

        <br>

        Vadlamudi, Guntur-522213, Andhra Pradesh

        <br>

        <small>

            © ${new Date().getFullYear()} All rights reserved.

        </small>

    </footer>

    `;


  document.body.insertAdjacentHTML("afterbegin", header);

  document.body.insertAdjacentHTML("beforeend", footer);

  document.body.insertAdjacentHTML("beforeend", `

        <div id="cartBar"

             class="cart-bar hidden">

            <span class="cart-info"></span>

            <a href="order-online.html?step=details"

               class="btn small gold">

               View Cart

            </a>

        </div>

    `);

  Cart.render();

}
// ---------- Menu rendering ----------

async function renderMenu(containerId, opts = {}) {

  const c = document.getElementById(containerId);

  c.innerHTML = "Loading menu...";

  const items = await api("/menu");

  const cats = [...new Set(items.map(i => i.category))];

  let active = "All";

  let lang = "both";

  let search = "";

  function draw() {

    const filtered = items.filter(i => {

      const categoryMatch =
          active === "All" || i.category === active;

      const searchMatch =
          i.name.toLowerCase().includes(search.toLowerCase()) ||

          (i.nameTe &&
              i.nameTe.toLowerCase().includes(search.toLowerCase()));

      return categoryMatch && searchMatch;

    });

    c.innerHTML = `

        <div class="filters">

            <span><strong>Language :</strong></span>

            ${['en','te','both'].map(l=>`

                <button
                    class="chip ${lang===l?'active':''}"
                    data-lang="${l}">

                    ${
        {
          en:'English',
          te:'తెలుగు',
          both:'Both'
        }[l]
    }

                </button>

            `).join('')}

        </div>

        <div class="filters">

            ${['All',...cats].map(cat=>`

                <button
                    class="chip ${active===cat?'active':''}"
                    data-cat="${cat}">

                    ${cat}

                </button>

            `).join('')}

        </div>

        <div class="card">

            ${filtered.length===0 ?

        `<center>
                    <h3>No dishes found 🍽️</h3>
                </center>`

        :

        filtered.map(i=>`

                <div class="menu-item">

                    <div class="info">

                        <h4>

                            <span class="veg-dot ${i.isVeg?'veg':'nonveg'}"></span>

                            ${lang!=="te"?i.name:""}

                            ${lang==="both" && i.nameTe?"<br>":""}

                            ${lang!=="en"

            ?`<span class="te">${i.nameTe||""}</span>`

            :""

        }

                        </h4>

                        <div class="price">

                            ₹${Number(i.price).toFixed(0)}

                        </div>

                    </div>

                    <div>

                        ${Cart.qtyOf(i.id)===0

            ?

            `<button
                                class="btn small"
                                data-add="${i.id}">

                                Add

                            </button>`

            :

            `<div class="qty">

                                <button data-dec="${i.id}">−</button>

                                <span>${Cart.qtyOf(i.id)}</span>

                                <button data-inc="${i.id}">+</button>

                            </div>`

        }

                    </div>

                </div>

                `).join("")

    }

        </div>

        `;

    c.querySelectorAll("[data-cat]").forEach(b=>{

      b.onclick=()=>{

        active=b.dataset.cat;

        draw();

      };

    });

    c.querySelectorAll("[data-lang]").forEach(b=>{

      b.onclick=()=>{

        lang=b.dataset.lang;

        draw();

      };

    });

    const searchBox=document.getElementById("searchMenu");

    if(searchBox){

      searchBox.onkeyup=function(){

        search=this.value;

        draw();

      };

    }

    c.querySelectorAll("[data-add]").forEach(b=>{

      b.onclick=()=>{

        const item=items.find(x=>x.id==b.dataset.add);

        Cart.add(item);

        draw();

      };

    });

    c.querySelectorAll("[data-inc]").forEach(b=>{

      b.onclick=()=>{

        Cart.inc(+b.dataset.inc);

        draw();

      };

    });

    c.querySelectorAll("[data-dec]").forEach(b=>{

      b.onclick=()=>{

        Cart.dec(+b.dataset.dec);

        draw();

      };

    });

  }

  draw();

}