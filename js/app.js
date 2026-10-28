(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const money = amount => new Intl.NumberFormat("en-IN", {style:"currency", currency:"INR", maximumFractionDigits:0}).format(amount);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const products = window.PRODUCTS || [];
  let toastTimer;

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }
  function getCart() { return read("northstar-cart", []); }
  function saveCart(cart) { write("northstar-cart", cart); updateHeaderCounts(); }
  function getWishlist() { return read("northstar-wishlist", []); }
  function saveWishlist(list) { write("northstar-wishlist", list); updateHeaderCounts(); }
  function productById(id) { return products.find(p => p.id === Number(id)); }
  function updateHeaderCounts() {
    const cartCount = getCart().reduce((sum, item) => sum + item.qty, 0);
    const wishCount = getWishlist().length;
    if ($("#cart-count")) $("#cart-count").textContent = cartCount;
    if ($("#wishlist-count")) $("#wishlist-count").textContent = wishCount;
  }
  function productCard(p) {
    const wished = getWishlist().includes(p.id);
    return `<article class="product-card">
      <div class="product-image-wrap"><a href="product.html?id=${p.id}" class="product-image-link" aria-label="View ${p.name}"><img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag ${p.tag ? "" : "hidden"}">${p.tag || ""}</span></a>
      <button class="heart-button ${wished ? "is-wished" : ""}" data-wishlist="${p.id}" aria-label="${wished ? "Remove from" : "Add to"} wishlist">${wished ? "♥" : "♡"}</button></div>
      <div class="product-info"><div class="product-meta"><span>${p.category}</span><span class="rating">★ ${p.rating}</span></div><a class="product-name" href="product.html?id=${p.id}">${p.name}</a><div class="product-bottom"><div><strong>${money(p.price)}</strong><del>${money(p.oldPrice)}</del></div><button class="add-mini" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div></div></article>`;
  }
  function renderGrid(target, items) {
    const el = $(target); if (!el) return;
    el.innerHTML = items.map(productCard).join("");
  }
  function addToCart(id, qty=1) {
    const cart = getCart(); const found = cart.find(item => item.id === Number(id));
    if (found) found.qty = Math.min(99, found.qty + qty); else cart.push({id:Number(id), qty:Math.min(99,qty)});
    saveCart(cart); toast("Added to your bag.");
  }
  function toggleWishlist(id) {
    id = Number(id); let list = getWishlist();
    if (list.includes(id)) { list = list.filter(item => item !== id); toast("Removed from wishlist."); }
    else { list.push(id); toast("Saved to your wishlist."); }
    saveWishlist(list);
    const card = $(`[data-wishlist="${id}"]`);
    if (card) { const active = list.includes(id); card.classList.toggle("is-wished", active); card.textContent = active ? "♥" : "♡"; card.setAttribute("aria-label", `${active ? "Remove from" : "Add to"} wishlist`); }
    if ($("#wishlist-products")) renderWishlist();
  }
  function renderFeatured() { renderGrid("#featured-products", products.filter(p => [1,2,3,5,6,9,10,11].includes(p.id))); }
  function renderShop() {
    if (!$("#shop-products")) return;
    const params = new URLSearchParams(location.search);
    let category = params.get("category") || "All";
    const categoryRadio = $(`input[name="category"][value="${category}"]`);
    if (categoryRadio) categoryRadio.checked = true; else category = "All";
    const search = ($("#search-input")?.value || "").trim().toLowerCase();
    const maxPrice = Number($("#price-range")?.value || 10000);
    const highRated = $("#rating-filter")?.checked || false;
    let filtered = products.filter(p => (category === "All" || p.category === category) && p.price <= maxPrice && (!highRated || p.rating >= 4.5) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(search));
    const sort = $("#sort-select")?.value || "featured";
    if (sort === "price-low") filtered.sort((a,b)=>a.price-b.price);
    if (sort === "price-high") filtered.sort((a,b)=>b.price-a.price);
    if (sort === "rating") filtered.sort((a,b)=>b.rating-a.rating);
    if (sort === "name") filtered.sort((a,b)=>a.name.localeCompare(b.name));
    $("#results-count").textContent = `Showing ${filtered.length} of ${products.length} products`;
    $("#price-value").textContent = money(maxPrice);
    $("#empty-results").classList.toggle("hidden", filtered.length > 0);
    $("#shop-products").classList.toggle("hidden", filtered.length === 0);
    renderGrid("#shop-products", filtered);
  }
  function renderWishlist() {
    const ids = getWishlist();
    const items = ids.map(productById).filter(Boolean);
    renderGrid("#wishlist-products", items);
    $("#wishlist-empty")?.classList.toggle("hidden", items.length > 0);
    $("#wishlist-products")?.classList.toggle("hidden", items.length === 0);
  }
  function renderProduct() {
    const host = $("#product-detail"); if (!host) return;
    const id = new URLSearchParams(location.search).get("id") || "1";
    const p = productById(id);
    if (!p) { host.innerHTML = `<div class="empty-state"><h2>We couldn't find that product.</h2><a class="button button-dark" href="shop.html">Back to shop</a></div>`; return; }
    $("#product-breadcrumb").textContent = p.name; document.title = `${p.name} | Northstar`;
    const wished = getWishlist().includes(p.id);
    host.innerHTML = `<div class="detail-image"><img src="${p.image}" alt="${p.name}"></div><div class="detail-copy"><p class="eyebrow">${p.category.toUpperCase()} / NORTHSTAR EDIT</p><h1>${p.name}</h1><div class="detail-rating"><span class="rating">★ ${p.rating}</span> <span>${p.reviews} reviews</span></div><div class="detail-price"><strong>${money(p.price)}</strong><del>${money(p.oldPrice)}</del><span class="discount-pill">${Math.round((1-p.price/p.oldPrice)*100)}% off</span></div><p class="detail-description">${p.description}</p><div class="detail-spec"><span>Colour</span><strong>${p.color}</strong></div><div class="detail-spec"><span>Availability</span><strong class="stock">● In stock</strong></div><div class="detail-buy"><label>Quantity <input id="detail-qty" type="number" min="1" max="10" value="1"></label><button class="button button-dark" id="detail-add">Add to bag — ${money(p.price)} ↗</button></div><button class="button button-outline button-wide" id="detail-wish">${wished ? "♥ Saved to wishlist" : "♡ Add to wishlist"}</button><div class="detail-perks"><p>✓ Secure demo checkout</p><p>✓ Free shipping over ${money(2499)}</p><p>✓ Easy-to-use shopping experience</p></div></div>`;
    $("#detail-add").addEventListener("click",()=>{ const qty = Math.max(1, Math.min(10, Number($("#detail-qty").value)||1)); addToCart(p.id,qty); });
    $("#detail-wish").addEventListener("click",()=>{ toggleWishlist(p.id); const active=getWishlist().includes(p.id); $("#detail-wish").textContent=active?"♥ Saved to wishlist":"♡ Add to wishlist"; });
    renderGrid("#related-products", products.filter(item=>item.category===p.category && item.id!==p.id).slice(0,4));
  }
  function cartTotals(cart) {
    const subtotal = cart.reduce((sum,item)=>{ const p=productById(item.id); return sum+(p?p.price*item.qty:0); },0);
    const shipping = subtotal === 0 || subtotal >= 2499 ? 0 : 99;
    return {subtotal,shipping,total:subtotal+shipping};
  }
  function cartRow(item) {
    const p=productById(item.id); if(!p) return "";
    return `<article class="cart-row"><a href="product.html?id=${p.id}" class="cart-thumb"><img src="${p.image}" alt="${p.name}"></a><div class="cart-product"><a href="product.html?id=${p.id}"><strong>${p.name}</strong></a><span>${p.category} · ${p.color}</span><button class="plain-button remove-item" data-remove="${p.id}">Remove</button></div><div class="qty-control"><button data-qty="${p.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${p.id}" data-delta="1" aria-label="Increase quantity">+</button></div><strong class="cart-line-total">${money(p.price*item.qty)}</strong></article>`;
  }
  function renderCart() {
    const host=$("#cart-content"); if(!host)return;
    const cart=getCart().filter(item=>productById(item.id)); const empty=cart.length===0;
    $("#cart-empty").classList.toggle("hidden",!empty); host.classList.toggle("hidden",empty);
    if(empty){host.innerHTML="";return;}
    const t=cartTotals(cart); const toFree=Math.max(0,2499-t.subtotal);
    host.innerHTML=`<section class="cart-items"><div class="cart-items-head"><span>PRODUCT</span><span>QUANTITY</span><span>TOTAL</span></div>${cart.map(cartRow).join("")}<div class="cart-bottom-links"><a href="shop.html" class="text-link">← Continue shopping</a><button class="plain-button" id="clear-cart">Clear bag</button></div></section><aside class="summary-card"><p class="eyebrow">ORDER SUMMARY</p><h2>Your total.</h2>${toFree>0?`<div class="shipping-progress"><p>Add <strong>${money(toFree)}</strong> for free shipping.</p><div><span style="width:${Math.min(100,t.subtotal/2499*100)}%"></span></div></div>`:`<p class="free-shipping">✳ You've unlocked free shipping.</p>`}<div class="summary-line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div><div class="summary-line"><span>Shipping</span><span>${t.shipping===0?"FREE":money(t.shipping)}</span></div><div class="summary-line total-line"><strong>Total</strong><strong>${money(t.total)}</strong></div><p class="muted tiny">Taxes included where applicable. Demo prices only.</p><a href="checkout.html" class="button button-dark button-wide">Continue to checkout ↗</a><div class="secure-note">⌑ Safe, simple demo checkout</div></aside>`;
    $$("[data-qty]",host).forEach(btn=>btn.addEventListener("click",()=>{ const id=Number(btn.dataset.qty),delta=Number(btn.dataset.delta); let c=getCart(); const row=c.find(x=>x.id===id); if(row){row.qty+=delta;if(row.qty<1)c=c.filter(x=>x.id!==id);if(row.qty>99)row.qty=99;}saveCart(c);renderCart(); }));
    $$("[data-remove]",host).forEach(btn=>btn.addEventListener("click",()=>{saveCart(getCart().filter(x=>x.id!==Number(btn.dataset.remove)));renderCart();toast("Item removed.");}));
    $("#clear-cart")?.addEventListener("click",()=>{saveCart([]);renderCart();toast("Your bag is empty.");});
  }
  function renderCheckout() {
    const form=$("#checkout-form"); if(!form)return;
    const cart=getCart().filter(item=>productById(item.id));
    if(!cart.length){$("#checkout-content").classList.add("hidden");$("#checkout-empty").classList.remove("hidden");return;}
    const t=cartTotals(cart);
    $("#checkout-summary").innerHTML=`<p class="eyebrow">IN YOUR BAG</p><h2>Order summary</h2><div class="checkout-items">${cart.map(item=>{const p=productById(item.id);return `<div class="checkout-item"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><small>Qty ${item.qty}</small></div><span>${money(p.price*item.qty)}</span></div>`;}).join("")}</div><div class="summary-line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div><div class="summary-line"><span>Shipping</span><span>${t.shipping===0?"FREE":money(t.shipping)}</span></div><div class="summary-line total-line"><strong>Total</strong><strong>${money(t.total)}</strong></div>`;
    form.addEventListener("submit", event=>{
      event.preventDefault(); if(!form.reportValidity())return;
      const data=Object.fromEntries(new FormData(form).entries());
      const order={orderId:"NS-"+Date.now().toString().slice(-8),date:new Date().toISOString(),customer:{name:data.name,email:data.email,phone:data.phone,address:data.address,city:data.city,pin:data.pin},payment:data.payment,items:cart.map(item=>({id:item.id,qty:item.qty})),subtotal:t.subtotal,shipping:t.shipping,total:t.total,status:"Confirmed (demo)"};
      const orders=read("northstar-orders",[]);orders.unshift(order);write("northstar-orders",orders);saveCart([]);
      location.href=`orders.html?placed=${encodeURIComponent(order.orderId)}`;
    },{once:true});
  }
  function renderOrders() {
    const host=$("#orders-list"); if(!host)return;
    const orders=read("northstar-orders",[]);
    $("#orders-empty").classList.toggle("hidden",orders.length>0);host.classList.toggle("hidden",orders.length===0);
    const placed=new URLSearchParams(location.search).get("placed");
    if(placed)toast(`Order ${placed} placed successfully (demo).`);
    host.innerHTML=orders.map(order=>`<article class="order-card"><div class="order-card-head"><div><p class="eyebrow">ORDER ${order.orderId}</p><strong>${new Date(order.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</strong></div><span class="status-pill">${order.status}</span></div><div class="order-product-list">${order.items.map(item=>{const p=productById(item.id);return p?`<div class="order-product"><img src="${p.image}" alt=""><span>${p.name} <small>× ${item.qty}</small></span><strong>${money(p.price*item.qty)}</strong></div>`:"";}).join("")}</div><div class="order-card-foot"><span>Ship to ${order.customer.city}, ${order.customer.pin}</span><strong>Total ${money(order.total)}</strong></div></article>`).join("");
  }
  function initAccount() {
    const form=$("#account-form");if(!form)return;
    let mode="login";
    const setMode = next => {mode=next;$$(".tab-button").forEach(b=>b.classList.toggle("active",b.dataset.tab===mode));$("#account-name-wrap").classList.toggle("hidden",mode!=="signup");$("#account-name-wrap input").required=mode==="signup";$("#account-heading").textContent=mode==="login"?"Welcome back.":"Make yourself at home.";$("#account-subheading").textContent=mode==="login"?"Use any valid email to try this demo.":"Create a local demo profile.";$("#account-submit").textContent=mode==="login"?"Sign in ↗":"Create demo account ↗";};
    $$(".tab-button").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.tab)));
    form.addEventListener("submit",e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const name=data.get("name")||String(data.get("email")).split("@")[0];write("northstar-demo-user",{name,email:data.get("email")});$("#account-status").classList.remove("hidden");$("#account-status").innerHTML=`<span>✳</span><h3>${mode==="login"?"You're signed in for this demo.":"Your demo profile is ready."}</h3><p>Welcome, ${name.replace(/[<>&"]/g,"")}.</p><a class="button button-dark" href="orders.html">View your orders ↗</a><button id="demo-signout" class="button button-outline button-wide">Sign out of demo</button>`;$("#demo-signout").addEventListener("click",()=>{localStorage.removeItem("northstar-demo-user");$("#account-status").classList.add("hidden");toast("Signed out of demo.");});});
  }
  function init() {
    updateHeaderCounts();
    const menu=$(".menu-toggle");menu?.addEventListener("click",()=>{const nav=$(".main-nav");const open=nav.classList.toggle("nav-open");menu.setAttribute("aria-expanded",String(open));});
    document.addEventListener("click",e=>{const add=e.target.closest("[data-add]");if(add)addToCart(Number(add.dataset.add));const wish=e.target.closest("[data-wishlist]");if(wish)toggleWishlist(Number(wish.dataset.wishlist));});
    renderFeatured(); renderShop(); renderWishlist(); renderProduct(); renderCart(); renderCheckout(); renderOrders(); initAccount();
    ["search-input","sort-select","price-range","rating-filter"].forEach(id=>$("#"+id)?.addEventListener(id==="search-input"?"input":"change",renderShop));
    $$('input[name="category"]').forEach(input=>input.addEventListener("change",()=>{const url=new URL(location.href);if(input.value==="All")url.searchParams.delete("category");else url.searchParams.set("category",input.value);history.replaceState({}, "", url);renderShop();}));
    const clear=()=>{if($("#search-input"))$("#search-input").value="";if($("#sort-select"))$("#sort-select").value="featured";if($("#price-range"))$("#price-range").value="10000";if($("#rating-filter"))$("#rating-filter").checked=false;const all=$('input[name="category"][value="All"]');if(all)all.checked=true;const url=new URL(location.href);url.searchParams.delete("category");history.replaceState({}, "", url);renderShop();};
    $("#clear-filters")?.addEventListener("click",clear);$("#empty-clear")?.addEventListener("click",clear);
    $("#mobile-filter-toggle")?.addEventListener("click",()=>$(".filters")?.classList.toggle("filters-open"));
    $("#newsletter-form")?.addEventListener("submit",e=>{e.preventDefault();toast("Thanks for your interest — this form is a demo.");e.target.reset();});
  }
  document.addEventListener("DOMContentLoaded",init);
})();