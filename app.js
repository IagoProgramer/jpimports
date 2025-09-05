/* product data */
const PRODUCTS = [
  {
    id: "al-abiyad",
    title: "Al Abiyad — Oud Collection",
    desc: "Forte e sofisticada: notas de oud, âmbar e madeiras raras. Concentração alta, longa fixação.",
    price: 259.90,
    size: "50ml",
    img: "/al-abiyad-oud.png",
    notes: ["Top: Bergamota, Especiarias", "Heart: Oud, Rosa", "Base: Âmbar, Madeira"],
    stock: 8,
    rating: 4.8
  },
  {
    id: "sahara-rose",
    title: "Sahara Rose",
    desc: "Doce e floral com toque oriental: rosa damascena, incenso e sândalo.",
    price: 199.90,
    size: "50ml",
    img: "/sahara-rose-perfume.png",
    notes: ["Top: Rosa Damascena", "Heart: Incenso, Jasmim", "Base: Sândalo, Baunilha"],
    stock: 12,
    rating: 4.6
  },
  {
    id: "desert-night",
    title: "Desert Night",
    desc: "Aromas intensos de tâmaras, baunilha e especiarias — noite árabe em um frasco.",
    price: 179.00,
    size: "50ml",
    img: "/desert-night-perfume.png",
    notes: ["Top: Tâmara, Bergamota", "Heart: Especiarias, Rosa", "Base: Baunilha, Musk"],
    stock: 5,
    rating: 4.5
  },
  {
    id: "royal-oud",
    title: "Royal Oud",
    desc: "Clássico real: oud nobre, patchouli e notas ambaradas — presença marcante.",
    price: 329.00,
    size: "50ml",
    img: "/royal-oud-perfume.png",
    notes: ["Top: Cítricos sutis", "Heart: Oud, Patchouli", "Base: Âmbar, Resinas"],
    stock: 3,
    rating: 4.9
  }
];

/* utilities */
const whatsappNumber = "5514997788691";
function formatBRL(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function whatsappLink(product){
  const text = `Olá! Tenho interesse no produto *${product.title}* (${product.size}) - ${formatBRL(product.price)}. Gostaria de mais informações e/ ou finalizar a compra.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

// add interactivity: card tilt on mousemove & reset on leave
function bindCardTilt(card){
  const media = card.querySelector(".card-media");
  if(!media) return;
  card.classList.add("tilt");
  card.addEventListener("mousemove", (e)=>{
    const r = card.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width;
    const my = (e.clientY - r.top) / r.height;
    const rx = (my - 0.5) * -8; // rotateX
    const ry = (mx - 0.5) * 10; // rotateY
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    card.style.boxShadow = `0 28px 60px rgba(3,10,25,0.12)`;
    card.style.setProperty('--mx', `${mx * 100}%`);
    card.style.setProperty('--my', `${my * 100}%`);
  });
  card.addEventListener("mouseleave", ()=> {
    card.style.transform = "";
    card.style.boxShadow = "";
  });
}

/* render catalog */
const catalogEl = document.getElementById("catalog");
const cart = [];

function createCard(p){
  const card = document.createElement("article");
  card.className = "card appear";
  card.innerHTML = `
    <div class="card-media">
      <div class="badge">${p.size}</div>
      <img loading="lazy" src="${p.img}" alt="${p.title}" />
    </div>
    <div class="card-body">
      <h3 class="prod-title">${p.title}</h3>
      <p class="prod-desc">${p.desc}</p>
      <div class="price-row">
        <div class="price">${formatBRL(p.price)}</div>
        <div class="meta">Ref: ${p.id}</div>
      </div>
      <div class="card-actions">
        <button class="btn subtle viewBtn">Ver</button>
        <a class="btn primary buyBtn" target="_blank" rel="noopener" href="${whatsappLink(p)}">Comprar</a>
      </div>
    </div>
  `;
  // attach handlers
  card.querySelector(".viewBtn").addEventListener("click",()=> animateOpenFromCard(card, p));
  card.querySelector(".buyBtn").addEventListener("click", ()=> addToCartAndNotify(p));
  // interactive: tilt + ripple on buttons
  bindCardTilt(card);
  Array.from(card.querySelectorAll(".btn")).forEach(btn=>{
    btn.classList.add("ripple");
    btn.addEventListener("click", (ev)=>{
      const b = ev.currentTarget;
      b.classList.remove("active");
      void b.offsetWidth;
      b.classList.add("active");
      setTimeout(()=> b.classList.remove("active"), 520);
    });
  });
  return card;
}

function renderCatalog(){
  PRODUCTS.forEach(p => {
    const c = createCard(p);
    catalogEl.appendChild(c);
  });
}
renderCatalog();

/* subtle appear animations using GSAP + ScrollTrigger */
gsap.utils.toArray(".card.appear").forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: "top 85%" },
    duration: 0.9,
    y: 36,
    opacity: 0,
    scale: 0.96,
    ease: "power3.out",
    delay: i * 0.06
  });
});

/* splash auto-hide + animation (uses GSAP already loaded) */
const splash = document.getElementById("splash");
if (window.gsap && splash) {
  gsap.from(".splash-card", {y:20, opacity:0, duration:0.8, ease:"power3.out"});
  // hide after 1800ms or on click
  const hideSplash = ()=> {
    gsap.to(".splash-card", {y:-12, opacity:0, duration:0.45, ease:"power2.in"});
    gsap.to("#splash", {opacity:0, duration:0.5, delay:0.15, onComplete: ()=> splash.remove()});
    // refresh ScrollTrigger to ensure proper trigger positions after splash removal
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };
  setTimeout(hideSplash, 1800);
  splash.addEventListener("click", hideSplash, {once:true});
}

/* modal logic */
const modal = document.getElementById("productModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalMeta = document.getElementById("modalMeta");
const modalBuy = document.getElementById("modalBuy");
const addCartBtn = document.getElementById("addCart");

// animate card image with a dramatic 3D spin/scale then open modal
function animateOpenFromCard(card, product){
  const img = card.querySelector(".card-media img");
  if(!window.gsap || !img){ openModal(product); return; }
  // create a lightweight flyout clone for smoother animation
  const clone = img.cloneNode(true);
  const rect = img.getBoundingClientRect();
  Object.assign(clone.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: 9999,
    borderRadius: "10px",
    transformOrigin: "50% 50%",
    pointerEvents: "none",
  });
  document.body.appendChild(clone);
  // animate: quick lift, full 3D spin and scale, then fade into modal
  gsap.timeline({
    onComplete: ()=> {
      clone.remove();
      openModal(product);
    }
  })
  .to(clone, {duration:0.35, y:-18, ease:"power2.out"})
  .to(clone, {duration:0.7, rotationY: 360, rotationX: 18, scale:1.25, ease:"expo.inOut"}, "-=0.08")
  .to(clone, {duration:0.25, opacity:0, scale:1.35, ease:"power2.in"}, "-=0.18");
}

/* update openModal to populate new fields */
function openModal(product){
  modalImg.src = product.img;
  modalImg.alt = product.title;
  modalTitle.textContent = product.title;
  modalDesc.textContent = product.desc;

  // populate notes list
  const notesEl = document.getElementById("modalNotes");
  notesEl.innerHTML = "";
  if(product.notes && Array.isArray(product.notes)){
    product.notes.forEach(n => {
      const li = document.createElement("li");
      li.textContent = n;
      notesEl.appendChild(li);
    });
  }

  // stock pill
  const stockEl = document.getElementById("modalStock");
  stockEl.textContent = product.stock > 0 ? `${product.stock} em estoque` : "Esgotado";
  stockEl.setAttribute("aria-live","polite");

  // rating stars
  const stars = document.getElementById("modalStars");
  stars.innerHTML = renderStars(product.rating || 0);

  modalPrice.textContent = formatBRL(product.price);
  modalMeta.textContent = `Ref: ${product.id} • ${product.size}`;
  modalBuy.onclick = ()=> window.open(whatsappLink(product), "_blank");
  addCartBtn.onclick = ()=> { addToCart(product); };
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
  modal.querySelector(".modal-card").style.transformOrigin = "center center";
  gsap.fromTo(".modal-card", {scale:0.98, opacity:0, y:20}, {scale:1, opacity:1, y:0, duration:0.4, ease:"power2.out"});
  setTimeout(()=> document.querySelector(".modal-close").focus(), 250);
}

/* small helper to render star markup */
function renderStars(val){
  const full = Math.floor(val);
  const half = (val - full) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '✩'.repeat(empty) + ` <span class="prod-desc" style="margin-left:8px">${val.toFixed(1)}</span>`;
}

document.querySelectorAll("[data-close]").forEach(el=>{
  el.addEventListener("click", ()=> closeModal());
});
document.addEventListener("keydown", (e)=> {
  if(e.key === "Escape") closeModal();
});
function closeModal(){
  gsap.to(".modal-card", {scale:0.98, opacity:0, y:8, duration:0.28, ease:"power2.in", onComplete: ()=> {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden","true");
    modal.querySelector(".modal-card").style.transformOrigin = "";
  }});
}

/* cart logic */
const cartCountEl = document.getElementById("cartCount");
const cartBtn = document.getElementById("cartBtn");

/* improve addToCart feedback: cart button pulse */
function addToCart(product){
  cart.push(product);
  updateCartUI();
  closeModal();
  // visual feedback on cart button
  gsap.fromTo(cartBtn, {scale:1}, {scale:1.08, duration:0.12, yoyo:true, repeat:1});
  cartBtn.classList.add("cart-pop");
  setTimeout(()=> cartBtn.classList.remove("cart-pop"), 420);
}

function addToCartAndNotify(product){
  addToCart(product);
  // opening whatsapp already handled by anchor; we also open small prefilled message in new tab (redundant if anchor clicked)
  window.open(whatsappLink(product), "_blank");
}

function updateCartUI(){
  cartCountEl.textContent = cart.length;
  cartBtn.title = `Itens no carrinho: ${cart.length}`;
}

/* new: build cart modal dynamically so every page can show it */
function ensureCartModal(){
  if (document.getElementById("cartModal")) return;
  const tpl = document.createElement("div");
  tpl.id = "cartModal";
  tpl.className = "cart-modal";
  tpl.innerHTML = `
    <div class="cart-backdrop" data-close></div>
    <div class="cart-card" role="dialog" aria-modal="true">
      <button class="cart-close" data-close aria-label="Fechar">✕</button>
      <h3>Carrinho (<span id="cartTotalCount">0</span>)</h3>
      <div class="cart-list"></div>
      <div class="cart-footer">
        <div class="cart-sum"><span id="cartSum">R$0,00</span></div>
        <div class="cart-actions">
          <button id="clearCart" class="btn subtle">Limpar</button>
          <button id="sendCart" class="btn primary">Enviar pedido via WhatsApp</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(tpl);
  document.querySelectorAll("#cartModal [data-close]").forEach(el=> el.addEventListener("click", closeCart));
  document.getElementById("clearCart").addEventListener("click", ()=> { cart.length = 0; renderCart(); closeCart(); updateCartUI(); });
  document.getElementById("sendCart").addEventListener("click", ()=> {
    if(cart.length === 0) return;
    const lines = cart.map((p,i)=> `${i+1}. ${p.title} — ${p.size} — ${formatBRL(p.price)}`);
    const total = cart.reduce((s,p)=> s + p.price, 0);
    const text = `Olá! Gostaria de comprar:\n${lines.join("\n")}\n\nTotal: ${formatBRL(total)}\n\nPodem confirmar disponibilidade e forma de pagamento?`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  });
}

function renderCart(){
  ensureCartModal();
  const list = document.querySelector("#cartModal .cart-list");
  const totalCount = document.getElementById("cartTotalCount");
  const sumEl = document.getElementById("cartSum");
  list.innerHTML = "";
  if(cart.length === 0){
    list.innerHTML = '<p class="prod-desc" style="padding:12px">Seu carrinho está vazio.</p>';
  } else {
    cart.forEach((p, idx)=>{
      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `<div class="row-left"><img src="${p.img}" alt="${p.title}" /><div><strong>${p.title}</strong><div class="prod-desc">${p.size} • ${formatBRL(p.price)}</div></div></div><button class="btn subtle remove" data-idx="${idx}">Remover</button>`;
      list.appendChild(row);
    });
    list.querySelectorAll(".remove").forEach(btn=>{
      btn.addEventListener("click", (e)=>{
        const i = Number(e.currentTarget.dataset.idx);
        cart.splice(i,1);
        renderCart();
        updateCartUI();
      });
    });
  }
  const total = cart.reduce((s,p)=> s + p.price, 0);
  sumEl.textContent = formatBRL(total);
  totalCount.textContent = cart.length;
}

/* open cart handler */
cartBtn && cartBtn.addEventListener("click", ()=> {
  ensureCartModal();
  renderCart();
  document.getElementById("cartModal").classList.add("show");
});

/* close cart */
function closeCart(){ const m = document.getElementById("cartModal"); if(m) m.classList.remove("show"); }

/* initial small product entrance stage animation for the hero */
gsap.from(".hero-inner", {y: 10, opacity: 0, duration: 0.7, ease:"power2.out"});

/* accessibility: ensure focus trap not required for this simple modal; keep simple and keyboard closable */

// theme toggle: persist and apply
const themeToggle = document.getElementById("themeToggle");
const preferDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
const saved = localStorage.getItem("jp_theme");
function applyTheme(mode){
  if(mode === "dark"){
    document.documentElement.classList.add("dark");
    themeToggle.textContent = "☀️";
    themeToggle.setAttribute("aria-pressed","true");
  } else {
    document.documentElement.classList.remove("dark");
    themeToggle.textContent = "🌙";
    themeToggle.setAttribute("aria-pressed","false");
  }
}
const initial = saved || (preferDark ? "dark" : "light");
applyTheme(initial);
themeToggle.addEventListener("click", ()=>{
  const isDark = document.documentElement.classList.toggle("dark");
  const mode = isDark ? "dark" : "light";
  applyTheme(mode);
  localStorage.setItem("jp_theme", mode);
});

// Use GSAP UMD globals loaded via script tags (gsap and ScrollTrigger on window)
// ensure plugin registration if available
if (window.gsap) {
  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }
}

/* modal image: enable wheel zoom and drag to pan */
(function enableModalImageInteractions(){
  let scale = 1, originX=0, originY=0, dragging=false, start={x:0,y:0}, pan={x:0,y:0};
  const img = modalImg;
  function apply(){ img.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`; }
  modalImg.addEventListener("wheel", (e)=>{
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    scale = Math.min(2.6, Math.max(1, scale + delta));
    apply();
  }, {passive:false});
  modalImg.addEventListener("mousedown", (e)=>{
    if(scale <= 1) return;
    dragging = true; start = {x:e.clientX, y:e.clientY};
    img.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", (e)=>{
    if(!dragging) return;
    pan.x += (e.clientX - start.x);
    pan.y += (e.clientY - start.y);
    start = {x:e.clientX, y:e.clientY};
    apply();
  });
  window.addEventListener("mouseup", ()=> { dragging=false; img.style.cursor="grab"; });
  // reset on modal close/open
  const origOpen = openModal;
  openModal = function(product){
    scale = 1; pan = {x:0,y:0}; img.style.transform = ""; origOpen(product);
  };
})();

/* subtle staggered shine effect on badges when appear */
gsap.utils.toArray(".badge").forEach((b,i)=>{
  gsap.fromTo(b, {y:-6, opacity:0}, {y:0, opacity:1, duration:0.6, delay:0.06*i, ease:"power2.out"});
});

/* ripple enhancement: ensure CSS fallback applied for other buttons */
document.querySelectorAll(".btn.ripple").forEach(btn=>{
  btn.addEventListener("pointerdown", (e)=>{
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.background = "rgba(255,255,255,0.12)";
    ripple.style.borderRadius = "50%";
    ripple.style.transform = "scale(0)";
    ripple.style.pointerEvents = "none";
    ripple.style.transition = "transform .48s cubic-bezier(.2,.9,.2,1), opacity .48s";
    btn.appendChild(ripple);
    requestAnimationFrame(()=> ripple.style.transform = "scale(1.8)");
    setTimeout(()=> { ripple.style.opacity = "0"; setTimeout(()=> ripple.remove(), 520); }, 360);
  });
});