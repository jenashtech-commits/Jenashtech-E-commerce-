import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart, User, Search, Home, Store, Package, Truck, Phone, Mail,
  MessageCircle, MapPin, X, Plus, Minus, Trash2, Check, ChevronRight,
  LogOut, Star, CreditCard, Smartphone, Banknote, ClipboardCheck,
  Navigation, Clock, ShieldCheck, Menu, Tag, ShoppingBag,
} from "lucide-react";
import Logo from "./Logo.jsx";
import { load, save } from "./storage.js";
import {
  PAY_NOTE, GHS, uid, orderNo, CATEGORIES, catEmoji, PRODUCTS,
  DEFAULT_COURIERS, TIMELINE, WA, TEL1, TEL2, EMAIL,
} from "./data.js";

export default function App() {
  const [splash, setSplash] = useState(true);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() => load("jenash:session", null));
  const [users, setUsers] = useState(() => load("jenash:users", []));
  const [cart, setCart] = useState(() => load("jenash:cart", []));
  const [orders, setOrders] = useState(() => load("jenash:orders", []));
  const [couriers, setCouriers] = useState(() => load("jenash:couriers", DEFAULT_COURIERS));
  const [sellerProducts, setSellerProducts] = useState(() => load("jenash:products", []));
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* logo splash on open */
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => save("jenash:users", users), [users]);
  useEffect(() => save("jenash:session", user), [user]);
  useEffect(() => save("jenash:cart", cart), [cart]);
  useEffect(() => save("jenash:orders", orders), [orders]);
  useEffect(() => save("jenash:couriers", couriers), [couriers]);
  useEffect(() => save("jenash:products", sellerProducts), [sellerProducts]);

  const allProducts = useMemo(() => [...sellerProducts, ...PRODUCTS], [sellerProducts]);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const addToCart = (p, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
      return [...c, { id: p.id, name: p.name, price: p.price, emoji: p.emoji, sellerId: p.sellerId, sellerName: p.sellerName, qty }];
    });
    flash(`${p.name} added to cart`);
  };
  const setQty = (id, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i))));

  const go = (p) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  const myOrders = useMemo(
    () => orders.filter((o) => user && o.userId === user.id).sort((a, b) => b.ts - a.ts),
    [orders, user]
  );

  const addProduct = (data) => {
    const p = {
      id: uid(), rating: 5, sold: 0,
      sellerId: user.id, sellerName: user.name,
      emoji: catEmoji(data.cat), ...data, price: Number(data.price),
    };
    setSellerProducts((s) => [p, ...s]);
    flash("Product listed — it's now in the store");
  };
  const removeProduct = (id) => setSellerProducts((s) => s.filter((p) => p.id !== id));

  const placeOrder = ({ courier, address, method }) => {
    const o = {
      id: uid(), no: orderNo(), userId: user.id, items: cart,
      total: cartTotal + courier.fee, delivery: courier.fee,
      courier, address, method, stage: 1, status: "Processing", ts: Date.now(),
    };
    setOrders((o2) => [o, ...o2]);
    setCart([]);
    go("account");
    flash("Order placed — thank you!");
  };

  const advance = (id) =>
    setOrders((os) =>
      os.map((o) => {
        if (o.id !== id) return o;
        const stage = Math.min(o.stage + 1, TIMELINE.length - 1);
        const status = stage >= 5 ? "Delivered" : stage >= 3 ? "In Transit" : "Processing";
        return { ...o, stage, status };
      })
    );

  return (
    <div className="jn-root">
      {splash && <Splash />}
      <Header
        cartCount={cartCount} user={user} go={go} query={query} setQuery={setQuery}
        onSearch={() => go("shop")} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
      />

      <main className="jn-main">
        {page === "home" && <HomeView products={allProducts} go={go} addToCart={addToCart} open={setSelected} setActiveCat={setActiveCat} user={user} />}
        {page === "shop" && <ShopView products={allProducts} query={query} activeCat={activeCat} setActiveCat={setActiveCat} addToCart={addToCart} open={setSelected} />}
        {page === "cart" && <CartView cart={cart} total={cartTotal} setQty={setQty} go={go} user={user} />}
        {page === "checkout" && <Checkout cart={cart} total={cartTotal} couriers={couriers} user={user} go={go} placeOrder={placeOrder} />}
        {page === "account" && <Account user={user} setUser={setUser} users={users} setUsers={setUsers} orders={myOrders} allOrders={orders} sellerProducts={sellerProducts} addProduct={addProduct} removeProduct={removeProduct} advance={advance} go={go} flash={flash} />}
        {page === "couriers" && <Couriers couriers={couriers} setCouriers={setCouriers} flash={flash} />}
        {page === "contact" && <Contact />}
      </main>

      <Footer go={go} />
      <BottomNav page={page} go={go} cartCount={cartCount} />

      {selected && <ProductModal p={selected} close={() => setSelected(null)} addToCart={addToCart} />}
      {toast && <Toast msg={toast} />}
    </div>
  );
}

/* ============================ Splash ============================ */
function Splash() {
  return (
    <div className="jn-splash">
      <div className="jn-splash-inner">
        <Logo variant="stacked" onLight />
      </div>
    </div>
  );
}

/* ============================ Header ============================ */
function Header({ cartCount, user, go, query, setQuery, onSearch, menuOpen, setMenuOpen }) {
  return (
    <header className="jn-header">
      <div className="jn-stripe" />
      <div className="jn-header-row">
        <button className="jn-logo-btn" onClick={() => go("home")} aria-label="Jenash home">
          <Logo variant="row" />
        </button>

        <div className="jn-search jn-search-lg">
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} placeholder="Search phones, fashion, groceries…" />
          <button onClick={onSearch}>Search</button>
        </div>

        <nav className="jn-nav-lg">
          <button onClick={() => go("shop")}>Shop</button>
          <button onClick={() => go("couriers")}>Couriers</button>
          <button onClick={() => go("contact")}>Contact</button>
          <button className="jn-icon-btn" onClick={() => go("account")}>
            <User size={20} /><span className="jn-acct-name">{user ? user.name.split(" ")[0] : "Sign in"}</span>
          </button>
          <button className="jn-icon-btn jn-cart-btn" onClick={() => go("cart")} aria-label="Cart">
            <ShoppingCart size={20} />{cartCount > 0 && <em>{cartCount}</em>}
          </button>
        </nav>

        <button className="jn-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="jn-search jn-search-sm">
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} placeholder="Search Jenash…" />
      </div>

      {menuOpen && (
        <div className="jn-drawer">
          <button onClick={() => go("shop")}><Store size={18} /> Shop</button>
          <button onClick={() => go("account")}><User size={18} /> {user ? "My account" : "Sign in"}</button>
          <button onClick={() => go("couriers")}><Truck size={18} /> Courier partners</button>
          <button onClick={() => go("contact")}><Phone size={18} /> Contact us</button>
        </div>
      )}
    </header>
  );
}

/* ============================ Home ============================ */
function HomeView({ products, go, addToCart, open, setActiveCat, user }) {
  const trending = products.slice().sort((a, b) => b.sold - a.sold).slice(0, 8);
  return (
    <>
      <section className="jn-hero">
        <div className="jn-hero-text">
          <p className="jn-eyebrow">Accra · Ghana · Delivered to your door</p>
          <h1>Buy and sell,<br /><span>all in one trusted place.</span></h1>
          <p className="jn-hero-sub">
            Shop phones, fashion, home and groceries — or open your own shop and start selling.
            Pay with Mobile Money or card, and track every order to your door.
          </p>
          <div className="jn-hero-cta">
            <button className="jn-btn-primary" onClick={() => go("shop")}>Start shopping <ChevronRight size={18} /></button>
            <button className="jn-btn-ghost" onClick={() => go("account")}>{user ? "My account" : "Sell on Jenash"}</button>
          </div>
          <div className="jn-trust">
            <span><ShieldCheck size={16} /> Secure checkout</span>
            <span><Truck size={16} /> Courier network</span>
            <span><Banknote size={16} /> MoMo &amp; card</span>
          </div>
        </div>
        <div className="jn-hero-card">
          <Logo variant="stacked" onLight />
        </div>
      </section>

      <section className="jn-cats">
        {CATEGORIES.map((c) => (
          <button key={c} className="jn-cat" onClick={() => { setActiveCat(c); go("shop"); }}>
            <span className="jn-cat-emoji">{catEmoji(c)}</span>{c}
          </button>
        ))}
      </section>

      <section className="jn-section">
        <div className="jn-section-head">
          <h2>Trending now</h2>
          <button onClick={() => go("shop")}>See all <ChevronRight size={16} /></button>
        </div>
        <div className="jn-grid">
          {trending.map((p) => <Card key={p.id} p={p} addToCart={addToCart} open={open} />)}
        </div>
      </section>

      <section className="jn-banner">
        <div>
          <h3>Sell on Jenash</h3>
          <p>Open a shop in minutes, list your products and reach buyers across Ghana. Couriers handle delivery.</p>
        </div>
        <button className="jn-btn-primary" onClick={() => go("account")}>Open your shop</button>
      </section>
    </>
  );
}

/* ============================ Shop ============================ */
function ShopView({ products, query, activeCat, setActiveCat, addToCart, open }) {
  const list = products.filter(
    (p) => (activeCat === "All" || p.cat === activeCat) && p.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <section className="jn-section">
      <h2 className="jn-page-title">Shop</h2>
      <div className="jn-filters">
        <button className={activeCat === "All" ? "on" : ""} onClick={() => setActiveCat("All")}>All</button>
        {CATEGORIES.map((c) => <button key={c} className={activeCat === c ? "on" : ""} onClick={() => setActiveCat(c)}>{c}</button>)}
      </div>
      {list.length === 0 ? (
        <Empty icon={<Search size={28} />} title="Nothing matched" note="Try another word or pick a different category." />
      ) : (
        <div className="jn-grid">{list.map((p) => <Card key={p.id} p={p} addToCart={addToCart} open={open} />)}</div>
      )}
    </section>
  );
}

function Card({ p, addToCart, open }) {
  return (
    <div className="jn-card">
      <button className="jn-card-img" onClick={() => open(p)}><span>{p.emoji}</span></button>
      <div className="jn-card-body">
        <p className="jn-card-cat">{p.cat}</p>
        <button className="jn-card-name" onClick={() => open(p)}>{p.name}</button>
        <div className="jn-card-rate"><Star size={13} fill="currentColor" /> {p.rating} · {p.sold} sold</div>
        {p.sellerId !== "jenash" && <span className="jn-seller-tag">by {p.sellerName}</span>}
        <div className="jn-card-foot">
          <strong>{GHS(p.price)}</strong>
          <button className="jn-add" onClick={() => addToCart(p)} aria-label="Add to cart"><Plus size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ p, close, addToCart }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="jn-overlay" onClick={close}>
      <div className="jn-modal" onClick={(e) => e.stopPropagation()}>
        <button className="jn-modal-x" onClick={close}><X size={20} /></button>
        <div className="jn-modal-img">{p.emoji}</div>
        <div className="jn-modal-body">
          <p className="jn-card-cat">{p.cat}</p>
          <h3>{p.name}</h3>
          <div className="jn-card-rate"><Star size={14} fill="currentColor" /> {p.rating} · {p.sold} sold · {p.sellerName}</div>
          <p className="jn-modal-desc">{p.desc}</p>
          <div className="jn-price-lg">{GHS(p.price)}</div>
          <div className="jn-qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}><Plus size={16} /></button>
          </div>
          <button className="jn-btn-primary jn-full" onClick={() => { addToCart(p, qty); close(); }}>
            <ShoppingCart size={18} /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Cart ============================ */
function CartView({ cart, total, setQty, go, user }) {
  if (cart.length === 0)
    return (
      <section className="jn-section">
        <h2 className="jn-page-title">Your cart</h2>
        <Empty icon={<ShoppingCart size={28} />} title="Your cart is empty" note="Browse the store and add items you love." action={<button className="jn-btn-primary" onClick={() => go("shop")}>Go to shop</button>} />
      </section>
    );
  return (
    <section className="jn-section jn-cart-layout">
      <div>
        <h2 className="jn-page-title">Your cart</h2>
        <div className="jn-cart-list">
          {cart.map((i) => (
            <div key={i.id} className="jn-cart-item">
              <div className="jn-cart-emoji">{i.emoji}</div>
              <div className="jn-cart-info"><strong>{i.name}</strong><span>{GHS(i.price)}</span></div>
              <div className="jn-qty sm">
                <button onClick={() => setQty(i.id, i.qty - 1)}><Minus size={14} /></button>
                <span>{i.qty}</span>
                <button onClick={() => setQty(i.id, i.qty + 1)}><Plus size={14} /></button>
              </div>
              <button className="jn-trash" onClick={() => setQty(i.id, 0)}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
      <aside className="jn-summary">
        <h3>Order summary</h3>
        <div className="jn-row"><span>Subtotal</span><span>{GHS(total)}</span></div>
        <div className="jn-row muted"><span>Delivery</span><span>Chosen at checkout</span></div>
        <div className="jn-row total"><span>Total</span><span>{GHS(total)}</span></div>
        <button className="jn-btn-primary jn-full" onClick={() => go(user ? "checkout" : "account")}>
          {user ? "Proceed to checkout" : "Sign in to checkout"}
        </button>
        <p className="jn-note"><ShieldCheck size={14} /> {PAY_NOTE}</p>
      </aside>
    </section>
  );
}

/* ============================ Checkout ============================ */
function Checkout({ cart, total, couriers, user, go, placeOrder }) {
  const [address, setAddress] = useState({ name: user?.name || "", phone: "", line: "", city: "Accra" });
  const [courierId, setCourierId] = useState(couriers[0]?.id);
  const [method, setMethod] = useState("momo");
  const [momoNet, setMomoNet] = useState("MTN MoMo");
  const [paying, setPaying] = useState(false);

  const courier = couriers.find((c) => c.id === courierId) || couriers[0];
  const grand = total + (courier?.fee || 0);

  if (cart.length === 0)
    return <section className="jn-section"><Empty icon={<ShoppingCart size={28} />} title="Nothing to check out" note="Add items first." action={<button className="jn-btn-primary" onClick={() => go("shop")}>Go to shop</button>} /></section>;

  const valid = address.name && address.phone && address.line;

  const pay = () => {
    if (!valid) return;
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      placeOrder({ courier, address, method: method === "momo" ? momoNet : method === "card" ? "Card" : "Cash on delivery" });
    }, 1400);
  };

  return (
    <section className="jn-section jn-checkout">
      <div className="jn-checkout-main">
        <h2 className="jn-page-title">Checkout</h2>

        <div className="jn-block">
          <h3><MapPin size={18} /> Delivery address</h3>
          <div className="jn-form-grid">
            <input placeholder="Full name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
            <input placeholder="Phone (e.g. 024 000 0000)" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
            <input className="jn-span2" placeholder="Street / area / landmark" value={address.line} onChange={(e) => setAddress({ ...address, line: e.target.value })} />
            <input className="jn-span2" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          </div>
        </div>

        <div className="jn-block">
          <h3><Truck size={18} /> Choose your courier</h3>
          <p className="jn-block-note">When you place the order, a pickup request goes to the courier you pick.</p>
          <div className="jn-courier-list">
            {couriers.map((c) => (
              <label key={c.id} className={"jn-courier " + (courierId === c.id ? "on" : "")}>
                <input type="radio" name="courier" checked={courierId === c.id} onChange={() => setCourierId(c.id)} />
                <div><strong>{c.name}</strong><span>{c.area} · {c.eta}</span></div>
                <em>{GHS(c.fee)}</em>
              </label>
            ))}
          </div>
        </div>

        <div className="jn-block">
          <h3><CreditCard size={18} /> Payment method</h3>
          <div className="jn-pay-tabs">
            <button className={method === "momo" ? "on" : ""} onClick={() => setMethod("momo")}><Smartphone size={16} /> Mobile Money</button>
            <button className={method === "card" ? "on" : ""} onClick={() => setMethod("card")}><CreditCard size={16} /> Card</button>
            <button className={method === "cod" ? "on" : ""} onClick={() => setMethod("cod")}><Banknote size={16} /> Cash on delivery</button>
          </div>
          {method === "momo" && (
            <div className="jn-pay-fields">
              <select value={momoNet} onChange={(e) => setMomoNet(e.target.value)}>
                <option>MTN MoMo</option><option>Telecel Cash</option><option>AirtelTigo Money</option>
              </select>
              <input placeholder="MoMo number" />
            </div>
          )}
          {method === "card" && (
            <div className="jn-pay-fields">
              <input className="jn-span2" placeholder="Card number" />
              <input placeholder="MM/YY" /><input placeholder="CVV" />
            </div>
          )}
          {method === "cod" && <p className="jn-block-note">Pay the courier in cash when your order arrives.</p>}
        </div>
      </div>

      <aside className="jn-summary">
        <h3>Summary</h3>
        {cart.map((i) => <div key={i.id} className="jn-row sm"><span>{i.emoji} {i.name} ×{i.qty}</span><span>{GHS(i.price * i.qty)}</span></div>)}
        <div className="jn-row"><span>Subtotal</span><span>{GHS(total)}</span></div>
        <div className="jn-row"><span>Delivery ({courier?.name})</span><span>{GHS(courier?.fee || 0)}</span></div>
        <div className="jn-row total"><span>Total</span><span>{GHS(grand)}</span></div>
        <button className="jn-btn-primary jn-full" disabled={!valid || paying} onClick={pay}>{paying ? "Processing…" : `Pay ${GHS(grand)}`}</button>
        {!valid && <p className="jn-warn">Fill in your name, phone and address to continue.</p>}
        <p className="jn-note"><ShieldCheck size={14} /> Simulated payment — no real charge.</p>
      </aside>
    </section>
  );
}

/* ============================ Account ============================ */
function Account({ user, setUser, users, setUsers, orders, allOrders, sellerProducts, addProduct, removeProduct, advance, go, flash }) {
  if (!user) return <Auth users={users} setUsers={setUsers} setUser={setUser} flash={flash} />;

  const isSeller = user.role === "seller";
  const [view, setView] = useState(isSeller ? "sell" : "buy");

  return (
    <section className="jn-section">
      <div className="jn-acct-head">
        <div>
          <h2 className="jn-page-title">Hi, {user.name.split(" ")[0]}</h2>
          <p className="jn-muted">{user.email} · <span className="jn-role-pill">{isSeller ? "Seller" : "Buyer"}</span></p>
        </div>
        <button className="jn-btn-ghost" onClick={() => { setUser(null); flash("Signed out"); go("home"); }}><LogOut size={16} /> Sign out</button>
      </div>

      {isSeller && (
        <div className="jn-toggle">
          <button className={view === "sell" ? "on" : ""} onClick={() => setView("sell")}><Store size={16} /> My shop</button>
          <button className={view === "buy" ? "on" : ""} onClick={() => setView("buy")}><ShoppingBag size={16} /> My orders</button>
        </div>
      )}

      {isSeller && view === "sell"
        ? <SellerDashboard user={user} sellerProducts={sellerProducts} allOrders={allOrders} addProduct={addProduct} removeProduct={removeProduct} go={go} />
        : <BuyerTracking orders={orders} advance={advance} go={go} />}
    </section>
  );
}

function BuyerTracking({ orders, advance, go }) {
  const [tab, setTab] = useState("All");
  const tabs = ["All", "Processing", "In Transit", "Delivered"];
  const counts = {
    All: orders.length,
    Processing: orders.filter((o) => o.status === "Processing").length,
    "In Transit": orders.filter((o) => o.status === "In Transit").length,
    Delivered: orders.filter((o) => o.status === "Delivered").length,
  };
  const filtered = tab === "All" ? orders : orders.filter((o) => o.status === tab);

  return (
    <>
      <div className="jn-stat-row">
        <Stat label="Orders" value={counts.All} icon={<Package size={18} />} />
        <Stat label="Processing" value={counts.Processing} icon={<Clock size={18} />} />
        <Stat label="In transit" value={counts["In Transit"]} icon={<Navigation size={18} />} />
        <Stat label="Delivered" value={counts.Delivered} icon={<ClipboardCheck size={18} />} />
      </div>
      <h3 className="jn-sub">Order tracking</h3>
      <div className="jn-filters">
        {tabs.map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t} ({counts[t]})</button>)}
      </div>
      {filtered.length === 0 ? (
        <Empty icon={<Package size={28} />} title="No orders here yet" note="When you place an order it shows up here with live tracking." action={<button className="jn-btn-primary" onClick={() => go("shop")}>Start shopping</button>} />
      ) : (
        <div className="jn-orders">{filtered.map((o) => <OrderCard key={o.id} o={o} advance={advance} />)}</div>
      )}
    </>
  );
}

function SellerDashboard({ user, sellerProducts, allOrders, addProduct, removeProduct, go }) {
  const [form, setForm] = useState({ name: "", cat: "Phones", price: "", desc: "" });
  const myProducts = sellerProducts.filter((p) => p.sellerId === user.id);
  const myIds = new Set(myProducts.map((p) => p.id));
  const sales = allOrders.filter((o) => o.items.some((i) => myIds.has(i.id))).sort((a, b) => b.ts - a.ts);

  const submit = () => {
    if (!form.name || !form.price) return;
    addProduct(form);
    setForm({ name: "", cat: "Phones", price: "", desc: "" });
  };

  const revenue = sales.reduce(
    (s, o) => s + o.items.filter((i) => myIds.has(i.id)).reduce((x, i) => x + i.price * i.qty, 0), 0
  );

  return (
    <>
      <div className="jn-stat-row">
        <Stat label="Listings" value={myProducts.length} icon={<Tag size={18} />} />
        <Stat label="Orders" value={sales.length} icon={<Package size={18} />} />
        <Stat label="Revenue" value={GHS(revenue)} icon={<Banknote size={18} />} small />
        <Stat label="Delivered" value={sales.filter((o) => o.status === "Delivered").length} icon={<ClipboardCheck size={18} />} />
      </div>

      <div className="jn-seller-grid">
        <div className="jn-block">
          <h3><Plus size={18} /> List a new product</h3>
          <div className="jn-form-grid">
            <input className="jn-span2" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Price (₵)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <textarea className="jn-span2" rows={3} placeholder="Short description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
          </div>
          <button className="jn-btn-primary jn-full" onClick={submit}>List product</button>
        </div>

        <div className="jn-block">
          <h3><Store size={18} /> My listings</h3>
          {myProducts.length === 0 ? (
            <p className="jn-block-note">No products yet. List your first item — it appears in the store instantly.</p>
          ) : (
            <div className="jn-listing-list">
              {myProducts.map((p) => (
                <div key={p.id} className="jn-listing">
                  <span className="jn-listing-emoji">{p.emoji}</span>
                  <div><strong>{p.name}</strong><span>{p.cat} · {GHS(p.price)}</span></div>
                  <button className="jn-trash" onClick={() => removeProduct(p.id)}><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h3 className="jn-sub">Incoming orders</h3>
      {sales.length === 0 ? (
        <Empty icon={<Package size={28} />} title="No sales yet" note="When a buyer orders one of your products it shows here, ready for courier pickup." />
      ) : (
        <div className="jn-orders">
          {sales.map((o) => (
            <div key={o.id} className="jn-order">
              <div className="jn-order-top static">
                <div>
                  <strong>{o.no}</strong>
                  <span className="jn-muted">{new Date(o.ts).toLocaleDateString()} · ship to {o.address.name}, {o.address.city} · {o.courier.name}</span>
                </div>
                <span className={"jn-badge " + o.status.replace(" ", "")}>{o.status}</span>
              </div>
              <div className="jn-order-items pad">
                {o.items.filter((i) => myIds.has(i.id)).map((i) => <span key={i.id}>{i.emoji} {i.name} ×{i.qty} — {GHS(i.price * i.qty)}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function OrderCard({ o, advance }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="jn-order">
      <button className="jn-order-top" onClick={() => setOpen(!open)}>
        <div><strong>{o.no}</strong><span className="jn-muted">{new Date(o.ts).toLocaleDateString()} · {o.items.length} item(s) · {GHS(o.total)}</span></div>
        <span className={"jn-badge " + o.status.replace(" ", "")}>{o.status}</span>
      </button>
      {open && (
        <div className="jn-order-detail">
          <div className="jn-track">
            {TIMELINE.map((step, idx) => {
              const done = idx <= o.stage, current = idx === o.stage;
              return (
                <div key={step} className={"jn-track-step " + (done ? "done " : "") + (current ? "current" : "")}>
                  <span className="jn-track-dot">{done ? <Check size={12} /> : idx + 1}</span>
                  <div className="jn-track-label"><strong>{step}</strong>{current && idx === 2 && <em>{o.courier.name} assigned</em>}</div>
                </div>
              );
            })}
          </div>
          <div className="jn-order-meta">
            <p><Truck size={14} /> Courier: <strong>{o.courier.name}</strong> ({o.courier.eta})</p>
            <p><MapPin size={14} /> {o.address.line}, {o.address.city}</p>
            <p><CreditCard size={14} /> Paid via {o.method}</p>
          </div>
          <div className="jn-order-items">{o.items.map((i) => <span key={i.id}>{i.emoji} {i.name} ×{i.qty}</span>)}</div>
          {o.status !== "Delivered" && (
            <button className="jn-btn-ghost jn-full" onClick={() => advance(o.id)}>Simulate next step → {TIMELINE[Math.min(o.stage + 1, 5)]}</button>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon, small }) {
  return (
    <div className="jn-stat">
      <span className="jn-stat-icon">{icon}</span>
      <strong className={small ? "sm" : ""}>{value}</strong>
      <span className="jn-stat-label">{label}</span>
    </div>
  );
}

/* ============================ Auth (buyer / seller) ============================ */
function Auth({ users, setUsers, setUser, flash }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = () => {
    setErr("");
    const email = form.email.trim().toLowerCase();
    if (mode === "signup") {
      if (!form.name || !email || !form.password) return setErr("Fill in every field to create your account.");
      if (users.some((u) => u.email === email)) return setErr("An account with this email already exists. Try signing in.");
      const u = { id: uid(), name: form.name, email, password: form.password, role };
      setUsers([...users, u]); setUser(u);
      flash(role === "seller" ? "Welcome — your shop is ready!" : "Welcome to Jenash!");
    } else {
      const u = users.find((x) => x.email === email && x.password === form.password);
      if (!u) return setErr("Email or password is incorrect.");
      setUser(u); flash(`Welcome back, ${u.name.split(" ")[0]}`);
    }
  };

  return (
    <div className="jn-auth">
      <div className="jn-auth-card">
        <Logo variant="row" />
        <h2>{mode === "login" ? "Sign in to Jenash" : "Create your account"}</h2>
        <p className="jn-muted">{mode === "login" ? "Access your cart, orders, shop and tracking." : "Join as a buyer to shop, or a seller to start your own shop."}</p>

        {mode === "signup" && (
          <div className="jn-role-grid">
            <button className={"jn-role-card " + (role === "buyer" ? "on" : "")} onClick={() => setRole("buyer")}>
              <ShoppingBag size={22} /><strong>I want to buy</strong><span>Shop and track orders</span>
            </button>
            <button className={"jn-role-card " + (role === "seller" ? "on" : "")} onClick={() => setRole("seller")}>
              <Store size={22} /><strong>I want to sell</strong><span>Open a shop and list products</span>
            </button>
          </div>
        )}

        {mode === "signup" && <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <p className="jn-warn">{err}</p>}
        <button className="jn-btn-primary jn-full" onClick={submit}>{mode === "login" ? "Sign in" : role === "seller" ? "Create seller account" : "Create buyer account"}</button>

        <p className="jn-switch">
          {mode === "login" ? "New to Jenash?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>{mode === "login" ? "Create one" : "Sign in"}</button>
        </p>
      </div>
    </div>
  );
}

/* ============================ Couriers ============================ */
function Couriers({ couriers, setCouriers, flash }) {
  const [form, setForm] = useState({ name: "", area: "Greater Accra", eta: "Same day", fee: "", phone: "", email: "" });
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!form.name || !form.fee || !form.phone) return;
    setCouriers([...couriers, { id: uid(), name: form.name, area: form.area, eta: form.eta, fee: Number(form.fee) }]);
    setDone(true); flash(`${form.name} added to the courier network`);
    setForm({ name: "", area: "Greater Accra", eta: "Same day", fee: "", phone: "", email: "" });
  };

  return (
    <section className="jn-section jn-courier-page">
      <div className="jn-courier-intro">
        <h2 className="jn-page-title">Courier partners</h2>
        <p>Register your delivery company. Once added you appear at checkout — when a customer selects you, a pickup request is sent your way automatically.</p>
        <div className="jn-perk-row">
          <Perk icon={<Package size={18} />} t="Get pickup jobs" d="Receive orders the moment a customer picks you." />
          <Perk icon={<Navigation size={18} />} t="Cover your zone" d="Set the areas and delivery times you serve." />
          <Perk icon={<Banknote size={18} />} t="Set your fee" d="You decide the delivery price shown to buyers." />
        </div>
      </div>

      <div className="jn-courier-form">
        <h3>Register your company</h3>
        <div className="jn-form-grid">
          <input className="jn-span2" placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}><option>Greater Accra</option><option>Accra &amp; Tema</option><option>Kumasi</option><option>Nationwide</option></select>
          <select value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })}><option>Same day</option><option>Next day</option><option>1–3 days</option></select>
          <input placeholder="Delivery fee (₵)" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
          <input placeholder="Contact phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="jn-span2" placeholder="Company email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <button className="jn-btn-primary jn-full" onClick={submit}>Submit registration</button>
        {done && <p className="jn-ok"><Check size={16} /> You're in the network. You now appear as a delivery option at checkout.</p>}

        <h4 className="jn-sub">Active couriers</h4>
        <div className="jn-courier-list">
          {couriers.map((c) => <div key={c.id} className="jn-courier static"><div><strong>{c.name}</strong><span>{c.area} · {c.eta}</span></div><em>{GHS(c.fee)}</em></div>)}
        </div>
      </div>
    </section>
  );
}

function Perk({ icon, t, d }) {
  return <div className="jn-perk"><span>{icon}</span><strong>{t}</strong><p>{d}</p></div>;
}

/* ============================ Contact ============================ */
function Contact() {
  return (
    <section className="jn-section jn-contact">
      <h2 className="jn-page-title">Contact us</h2>
      <p className="jn-muted">We're in Accra and ready to help with orders, deliveries and partnerships.</p>
      <div className="jn-contact-grid">
        <a className="jn-contact-card wa" href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"><MessageCircle size={24} /><strong>WhatsApp</strong><span>Chat with us now</span><em>+233 54 381 3320</em></a>
        <a className="jn-contact-card call" href={`tel:${TEL1}`}><Phone size={24} /><strong>Call us</strong><span>Mon–Sat, 8am–7pm</span><em>054 381 3320</em></a>
        <a className="jn-contact-card call2" href={`tel:${TEL2}`}><Phone size={24} /><strong>Second line</strong><span>Orders &amp; support</span><em>054 172 5662</em></a>
        <a className="jn-contact-card mail" href={`mailto:${EMAIL}`}><Mail size={24} /><strong>Email</strong><span>We reply within a day</span><em>{EMAIL}</em></a>
      </div>
      <div className="jn-map"><MapPin size={18} /> <strong>Location:</strong> Accra, Ghana</div>
    </section>
  );
}

/* ============================ Footer / Nav / bits ============================ */
function Footer({ go }) {
  return (
    <footer className="jn-footer">
      <div className="jn-footer-grid">
        <div>
          <Logo variant="row" onLight />
          <p>Your trusted Ghanaian marketplace. Buy, sell, pay and track — all in one place.</p>
        </div>
        <div><h5>Shop</h5><button onClick={() => go("shop")}>All products</button><button onClick={() => go("cart")}>Cart</button><button onClick={() => go("account")}>My account</button></div>
        <div><h5>Sell &amp; deliver</h5><button onClick={() => go("account")}>Open a shop</button><button onClick={() => go("couriers")}>Become a courier</button><button onClick={() => go("contact")}>Contact</button></div>
        <div><h5>Reach us</h5><a href={`https://wa.me/${WA}`}>WhatsApp</a><a href={`tel:${TEL1}`}>054 381 3320</a><a href={`mailto:${EMAIL}`}>{EMAIL}</a><span><MapPin size={13} /> Accra, Ghana</span></div>
      </div>
      <p className="jn-copy">© {new Date().getFullYear()} Jenash E-Commerce · Accra, Ghana</p>
    </footer>
  );
}

function BottomNav({ page, go, cartCount }) {
  const items = [
    { k: "home", icon: <Home size={20} />, label: "Home" },
    { k: "shop", icon: <Store size={20} />, label: "Shop" },
    { k: "cart", icon: <ShoppingCart size={20} />, label: "Cart", badge: cartCount },
    { k: "account", icon: <User size={20} />, label: "Account" },
  ];
  return (
    <nav className="jn-bottom">
      {items.map((i) => (
        <button key={i.k} className={page === i.k ? "on" : ""} onClick={() => go(i.k)}>
          <span className="jn-bottom-ic">{i.icon}{i.badge > 0 && <em>{i.badge}</em>}</span>{i.label}
        </button>
      ))}
    </nav>
  );
}

function Empty({ icon, title, note, action }) {
  return <div className="jn-empty"><span className="jn-empty-ic">{icon}</span><strong>{title}</strong><p>{note}</p>{action}</div>;
}

function Toast({ msg }) {
  return <div className="jn-toast"><Check size={16} /> {msg}</div>;
}
