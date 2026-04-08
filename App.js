/**
 * BladeBook — Barber Shop Reservation & Management CRM
 * Single-file React app — Tailwind loaded via CDN in public/index.html
 * All state in-memory via useReducer + Context (resets on page reload)
 *
 * Demo credentials:
 *   Client  →  username: client  |  password: barber1234
 *   Shop    →  username: shop    |  password: shop1234
 */

import { createContext, useContext, useReducer, useState, useEffect } from "react";

// ─────────────────────────────────────────────
// SECTION 1: SEED DATA
// Realistic demo state seeded on first render
// ─────────────────────────────────────────────

const today = new Date();

const getDateOffset = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
};

const fmt = (date, h, m = 0) => {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const SEED_SHOPS = [
  {
    id: "shop1",
    name: "The Sharp Edge",
    address: "142 West 34th Street, New York, NY 10001",
    rating: 4.8,
    reviewCount: 312,
    tagline: "Precision cuts. Timeless style.",
    color: "#1a1a2e",
  },
  {
    id: "shop2",
    name: "Blade & Bone",
    address: "88 Mission Street, San Francisco, CA 94105",
    rating: 4.6,
    reviewCount: 198,
    tagline: "Where craft meets culture.",
    color: "#16213e",
  },
];

const SEED_BARBERS = [
  { id: "b1", shopId: "shop1", name: "Marcus Webb",    specialties: ["Fades", "Skin Taper", "Beard Design"],       initials: "MW", color: "#e63946" },
  { id: "b2", shopId: "shop1", name: "Jordan Ellis",   specialties: ["Classic Cuts", "Hot Towel Shave", "Pompadour"], initials: "JE", color: "#457b9d" },
  { id: "b3", shopId: "shop2", name: "Priya Okonkwo",  specialties: ["Textured Hair", "Loc Maintenance", "Color"],  initials: "PO", color: "#2a9d8f" },
  { id: "b4", shopId: "shop2", name: "Devon Salazar",  specialties: ["Skin Fade", "Line-Up", "Beard Trim"],         initials: "DS", color: "#e9a020" },
];

const SERVICES = ["Haircut", "Beard Trim", "Full Service"];

const SEED_APPOINTMENTS = [
  // TODAY
  { id: "a1",  shopId: "shop1", barberId: "b1", clientName: "Alex Turner",   clientPhone: "555-0101", service: "Full Service", startTime: fmt(today, 9),              status: "Confirmed" },
  { id: "a2",  shopId: "shop1", barberId: "b1", clientName: "Sam Rivera",    clientPhone: "555-0102", service: "Haircut",      startTime: fmt(today, 10),             status: "Confirmed" },
  { id: "a3",  shopId: "shop1", barberId: "b2", clientName: "Chris Park",    clientPhone: "555-0103", service: "Beard Trim",   startTime: fmt(today, 11),             status: "Confirmed" },
  { id: "a4",  shopId: "shop1", barberId: "b2", clientName: "Morgan Lee",    clientPhone: "555-0104", service: "Haircut",      startTime: fmt(today, 13),             status: "Confirmed" },
  { id: "a5",  shopId: "shop2", barberId: "b3", clientName: "Taylor Kim",    clientPhone: "555-0105", service: "Full Service", startTime: fmt(today, 10),             status: "Confirmed" },
  { id: "a6",  shopId: "shop2", barberId: "b4", clientName: "Jamie Russo",   clientPhone: "555-0106", service: "Haircut",      startTime: fmt(today, 14),             status: "Confirmed" },
  // YESTERDAY (past/completed)
  { id: "a7",  shopId: "shop1", barberId: "b1", clientName: "Alex Turner",   clientPhone: "555-0101", service: "Haircut",      startTime: fmt(getDateOffset(-1), 10), status: "Completed" },
  { id: "a8",  shopId: "shop1", barberId: "b2", clientName: "Sam Rivera",    clientPhone: "555-0102", service: "Beard Trim",   startTime: fmt(getDateOffset(-1), 14), status: "Completed" },
  // TOMORROW
  { id: "a9",  shopId: "shop1", barberId: "b1", clientName: "Sam Rivera",    clientPhone: "555-0102", service: "Full Service", startTime: fmt(getDateOffset(1), 11),  status: "Confirmed" },
  { id: "a10", shopId: "shop2", barberId: "b3", clientName: "Alex Turner",   clientPhone: "555-0101", service: "Haircut",      startTime: fmt(getDateOffset(1), 9),   status: "Confirmed" },
  // DAY AFTER TOMORROW
  { id: "a11", shopId: "shop1", barberId: "b1", clientName: "Chris Park",    clientPhone: "555-0103", service: "Beard Trim",   startTime: fmt(getDateOffset(2), 15),  status: "Confirmed" },
  { id: "a12", shopId: "shop2", barberId: "b4", clientName: "Morgan Lee",    clientPhone: "555-0104", service: "Full Service", startTime: fmt(getDateOffset(2), 12),  status: "Confirmed" },
];

// ─────────────────────────────────────────────
// SECTION 2: STATE MANAGEMENT
// Single useReducer drives all app state
// ─────────────────────────────────────────────

const initialState = {
  currentUser: null,
  shops: SEED_SHOPS,
  barbers: SEED_BARBERS,
  appointments: SEED_APPOINTMENTS,
  activeTab: "home",
  selectedShop: null,
  selectedBarber: null,
  toasts: [],
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUser: action.payload, activeTab: "home" };
    case "LOGOUT":
      return { ...state, currentUser: null, activeTab: "home", selectedShop: null, selectedBarber: null };
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    case "SELECT_SHOP":
      return { ...state, selectedShop: action.payload, selectedBarber: null, activeTab: "shop_detail" };
    case "SELECT_BARBER":
      return { ...state, selectedBarber: action.payload, activeTab: "book" };
    case "BOOK_APPOINTMENT": {
      const newAppt = { ...action.payload, id: "a" + Date.now(), status: "Confirmed" };
      return { ...state, appointments: [...state.appointments, newAppt], activeTab: "my_appointments" };
    }
    case "CANCEL_APPOINTMENT":
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.payload ? { ...a, status: "Cancelled" } : a
        ),
      };
    case "UPDATE_APPOINTMENT_STATUS":
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.payload.id ? { ...a, status: action.payload.status } : a
        ),
      };
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ─────────────────────────────────────────────
// SECTION 3: UTILITY HELPERS
// ─────────────────────────────────────────────

// 30-minute slots from 9 AM to 7 PM
const HOURS = Array.from({ length: 20 }, (_, i) => {
  const h = 9 + Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  return { h, m, label: `${h > 12 ? h - 12 : h}:${m === 0 ? "00" : "30"} ${h >= 12 ? "PM" : "AM"}` };
});

const isSameDay = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
};

const getWeekDays = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d);
    nd.setDate(d.getDate() + i);
    return nd;
  });
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

const statusColor = {
  Confirmed: { bg: "bg-blue-100",  text: "text-blue-700" },
  Completed: { bg: "bg-green-100", text: "text-green-700" },
  Cancelled: { bg: "bg-gray-100",  text: "text-gray-500" },
  "No-Show": { bg: "bg-red-100",   text: "text-red-700" },
};

// ─────────────────────────────────────────────
// SECTION 4: AUTH SCREEN
// ─────────────────────────────────────────────

const ACCOUNTS = [
  { id: "client1",   name: "Alex Turner",           role: "client", username: "client", password: "barber1234" },
  { id: "shop_mgr1", name: "Sharp Edge Manager",    role: "shop",   shopId: "shop1", username: "shop", password: "shop1234" },
];

function AuthScreen() {
  const { dispatch } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const acct = ACCOUNTS.find((a) => a.username === username && a.password === password);
    if (!acct) { setError("Invalid credentials. Try client / barber1234 or shop / shop1234"); return; }
    dispatch({ type: "LOGIN", payload: acct });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9 text-gray-950" stroke="currentColor" strokeWidth="2">
              <path d="M6 3v12M6 3l4 3M6 3l-4 3M18 3v12M18 3l4 3M18 3l-4 3M6 21h12M12 15v6" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-1px" }}>
            BladeBook
          </h1>
          <p className="text-gray-400 mt-1 text-sm tracking-widest uppercase">Barber Shop CRM</p>
        </div>

        {/* Demo credentials hint */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
          <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-widest">Demo Credentials</p>
          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500">Client:</span>
              <span className="font-mono text-amber-300">client / barber1234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shop:</span>
              <span className="font-mono text-amber-300">shop / shop1234</span>
            </div>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-amber-500 transition-colors"
                  placeholder="Enter password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
          <button type="submit"
            className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-widest">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 5: TOAST NOTIFICATIONS
// Auto-dismiss after 3.5s
// ─────────────────────────────────────────────

function ToastContainer() {
  const { state, dispatch } = useApp();
  useEffect(() => {
    state.toasts.forEach((t) => {
      const timer = setTimeout(() => dispatch({ type: "REMOVE_TOAST", payload: t.id }), 3500);
      return () => clearTimeout(timer);
    });
  }, [state.toasts, dispatch]);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 space-y-2 pointer-events-none">
      {state.toasts.map((t) => (
        <div key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border animate-fade-in
            ${t.type === "success" ? "bg-gray-900 border-green-500 text-green-400" :
              t.type === "error"   ? "bg-gray-900 border-red-500 text-red-400" :
                                     "bg-gray-900 border-amber-500 text-amber-400"}`}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "!"}</span>
          <span className="text-gray-200">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 6: SIDEBAR / BOTTOM NAV
// Dark sidebar on desktop, bottom tab bar on mobile
// ─────────────────────────────────────────────

function Sidebar() {
  const { state, dispatch } = useApp();
  const { currentUser, activeTab } = state;
  const isShop = currentUser?.role === "shop";

  const clientNav = [
    { icon: "⌂", label: "Explore Shops",    tab: "home" },
    { icon: "◷", label: "My Appointments",  tab: "my_appointments" },
  ];
  const shopNav = [
    { icon: "⊞", label: "Dashboard",  tab: "shop_dashboard" },
    { icon: "◷", label: "Schedule",   tab: "shop_schedule" },
    { icon: "◈", label: "Analytics",  tab: "shop_analytics" },
  ];
  const navItems = isShop ? shopNav : clientNav;
  const setTab = (tab) => dispatch({ type: "SET_TAB", payload: tab });

  const isActive = (tab) =>
    activeTab === tab ||
    (tab === "home" && (activeTab === "shop_detail" || activeTab === "book")) ||
    (tab === "shop_dashboard" && activeTab === "shop_dashboard");

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-950 border-r border-gray-800 h-screen sticky top-0 p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-950" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 3v12M6 3l4 3M6 3l-4 3M18 3v12M18 3l4 3M18 3l-4 3M6 21h12M12 15v6" />
            </svg>
          </div>
          <div>
            <div className="text-white font-black text-lg leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              BladeBook
            </div>
            <div className="text-gray-500 text-xs">{isShop ? "Shop View" : "Client View"}</div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="space-y-1 flex-1">
          {navItems.map((n) => (
            <button key={n.tab} onClick={() => setTab(n.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${isActive(n.tab) ? "bg-amber-500 text-gray-950" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              <span className="text-lg leading-none">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 bg-opacity-20 text-amber-400 text-xs font-bold flex items-center justify-center">
              {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-gray-500 text-xs capitalize">{currentUser.role}</p>
            </div>
          </div>
          <button onClick={() => dispatch({ type: "LOGOUT" })}
            className="w-full text-left px-4 py-2 text-gray-500 hover:text-red-400 text-sm transition-colors rounded-lg hover:bg-gray-800">
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-40 flex">
        {navItems.map((n) => (
          <button key={n.tab} onClick={() => setTab(n.tab)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors
              ${isActive(n.tab) ? "text-amber-500" : "text-gray-500"}`}>
            <span className="text-xl leading-none">{n.icon}</span>
            <span className="text-xs">{n.label}</span>
          </button>
        ))}
        <button onClick={() => dispatch({ type: "LOGOUT" })}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500">
          <span className="text-xl leading-none">⏻</span>
          <span className="text-xs">Sign Out</span>
        </button>
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────
// SECTION 7: CLIENT — SHOP LIST
// ─────────────────────────────────────────────

function ShopList() {
  const { state, dispatch } = useApp();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Find Your Barber
        </h1>
        <p className="text-gray-500 mt-1">Book with the best shops in your area</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.shops.map((shop) => (
          <div key={shop.id}
            onClick={() => dispatch({ type: "SELECT_SHOP", payload: shop.id })}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-amber-300 transition-all group">
            {/* Photo placeholder with gradient */}
            <div className="h-40 relative" style={{ background: `linear-gradient(135deg, ${shop.color}, #2d2d2d)` }}>
              <div className="absolute inset-0 flex items-end p-4">
                <div>
                  <p className="text-white text-opacity-60 text-xs uppercase tracking-widest mb-1">Barber Shop</p>
                  <p className="text-white text-xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{shop.name}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-lg px-2 py-1 flex items-center gap-1">
                <span className="text-amber-500 text-sm">★</span>
                <span className="text-gray-900 text-sm font-bold">{shop.rating}</span>
                <span className="text-gray-400 text-xs">({shop.reviewCount})</span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-500 text-sm flex items-center gap-1">📍 {shop.address}</p>
              <p className="text-gray-400 text-xs italic mt-2">"{shop.tagline}"</p>
              <button className="mt-4 w-full bg-gray-950 text-white text-sm font-bold py-2 rounded-lg group-hover:bg-amber-500 group-hover:text-gray-950 transition-all">
                View Barbers →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 8: CLIENT — SHOP DETAIL (barbers)
// ─────────────────────────────────────────────

function ShopDetail() {
  const { state, dispatch } = useApp();
  const shop    = state.shops.find((s) => s.id === state.selectedShop);
  const barbers = state.barbers.filter((b) => b.shopId === state.selectedShop);
  if (!shop) return null;

  return (
    <div>
      <button onClick={() => dispatch({ type: "SET_TAB", payload: "home" })}
        className="text-gray-500 hover:text-amber-500 text-sm mb-6 flex items-center gap-1 transition-colors">
        ← Back to Shops
      </button>

      {/* Shop hero */}
      <div className="mb-8 p-6 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${shop.color}, #1a1a1a)` }}>
        <h1 className="text-3xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{shop.name}</h1>
        <p className="text-white mt-1" style={{ opacity: 0.6 }}>{shop.address}</p>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-amber-400">★</span>
          <span className="font-bold">{shop.rating}</span>
          <span className="text-white text-sm" style={{ opacity: 0.5 }}>({shop.reviewCount} reviews)</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Our Barbers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {barbers.map((barber) => (
          <div key={barber.id}
            onClick={() => dispatch({ type: "SELECT_BARBER", payload: barber.id })}
            className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black mb-4"
              style={{ backgroundColor: barber.color }}>
              {barber.initials}
            </div>
            <h3 className="text-gray-900 font-bold text-lg">{barber.name}</h3>
            <div className="flex flex-wrap gap-1 justify-center mt-3">
              {barber.specialties.map((s) => (
                <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
            <button className="mt-5 w-full bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold py-2 rounded-lg transition-colors">
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 9: CLIENT — BOOKING CALENDAR
// Pure CSS Grid weekly view, no third-party lib
// ─────────────────────────────────────────────

function BookingCalendar() {
  const { state, dispatch } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: state.currentUser?.name || "", phone: "", service: "Haircut" });
  const [step, setStep] = useState("calendar"); // "calendar" | "confirm"

  const barber = state.barbers.find((b) => b.id === state.selectedBarber);
  const shop   = state.shops.find((s) => s.id === barber?.shopId);

  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  // Booked slots for this barber (excluding cancelled)
  const bookedTimes = state.appointments
    .filter((a) => a.barberId === state.selectedBarber && a.status !== "Cancelled")
    .map((a) => new Date(a.startTime).getTime());

  const isBooked = (day, slot) => {
    const dt = new Date(day); dt.setHours(slot.h, slot.m, 0, 0);
    return bookedTimes.includes(dt.getTime());
  };
  const isPast = (day, slot) => {
    const dt = new Date(day); dt.setHours(slot.h, slot.m, 0, 0);
    return dt < new Date();
  };
  const isSelected = (day, slot) =>
    selectedSlot &&
    isSameDay(day, selectedSlot.day) &&
    selectedSlot.slot.h === slot.h &&
    selectedSlot.slot.m === slot.m;

  const handleSlotClick = (day, slot) => {
    if (isBooked(day, slot) || isPast(day, slot)) return;
    setSelectedSlot({ day, slot });
    setStep("confirm");
  };

  const handleBook = () => {
    const startDt = new Date(selectedSlot.day);
    startDt.setHours(selectedSlot.slot.h, selectedSlot.slot.m, 0, 0);
    dispatch({
      type: "BOOK_APPOINTMENT",
      payload: { shopId: shop.id, barberId: barber.id, clientName: form.name, clientPhone: form.phone, service: form.service, startTime: startDt.toISOString() },
    });
    dispatch({ type: "ADD_TOAST", payload: { type: "success", message: `Appointment booked with ${barber.name}!` } });
  };

  if (!barber) return null;

  return (
    <div>
      <button
        onClick={() => step === "confirm" ? setStep("calendar") : dispatch({ type: "SET_TAB", payload: "shop_detail" })}
        className="text-gray-500 hover:text-amber-500 text-sm mb-6 flex items-center gap-1 transition-colors">
        ← Back
      </button>

      {/* Barber header card */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-white rounded-2xl border border-gray-200">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl flex-shrink-0"
          style={{ backgroundColor: barber.color }}>{barber.initials}</div>
        <div>
          <h2 className="text-xl font-black text-gray-900">{barber.name}</h2>
          <p className="text-gray-500 text-sm">{shop?.name}</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {barber.specialties.map((s) => (
              <span key={s} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calendar view ── */}
      {step === "calendar" && (
        <>
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {weekDays[0].toLocaleDateString([], { month: "short", day: "numeric" })} –{" "}
              {weekDays[6].toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setWeekOffset(weekOffset - 1)} disabled={weekOffset <= 0}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center disabled:opacity-30 hover:bg-gray-200 transition-colors">‹</button>
              <button onClick={() => setWeekOffset(weekOffset + 1)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">›</button>
            </div>
          </div>

          {/* CSS Grid calendar */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
              <div className="p-2" />
              {weekDays.map((d, i) => (
                <div key={i} className={`p-2 text-center border-l border-gray-100 ${isSameDay(d, today) ? "bg-amber-50" : ""}`}>
                  <p className="text-xs text-gray-400 uppercase">{d.toLocaleDateString([], { weekday: "short" })}</p>
                  <p className={`text-sm font-bold ${isSameDay(d, today) ? "text-amber-500" : "text-gray-900"}`}>{d.getDate()}</p>
                </div>
              ))}
            </div>

            {/* Scrollable time slots */}
            <div className="overflow-y-auto" style={{ maxHeight: "460px" }}>
              {HOURS.map((slot) => (
                <div key={`${slot.h}-${slot.m}`} className="grid border-b border-gray-50"
                  style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}>
                  <div className="p-2 text-xs text-gray-400 text-right pr-3 pt-2 flex-shrink-0">
                    {slot.m === 0 ? slot.label : ""}
                  </div>
                  {weekDays.map((d, di) => {
                    const booked   = isBooked(d, slot);
                    const past     = isPast(d, slot);
                    const selected = isSelected(d, slot);
                    return (
                      <div key={di} onClick={() => handleSlotClick(d, slot)}
                        className={`border-l border-gray-100 min-h-8 cursor-pointer transition-colors flex items-center justify-center
                          ${booked   ? "bg-red-50 cursor-not-allowed" :
                            past     ? "bg-gray-50 opacity-40 cursor-not-allowed" :
                            selected ? "bg-amber-500" :
                                       "hover:bg-amber-50"}`}>
                        {booked && <span className="text-red-400 text-xs">●</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block bg-red-100" /> Booked</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block bg-amber-500" /> Selected</span>
          </div>
        </>
      )}

      {/* ── Confirm booking form ── */}
      {step === "confirm" && selectedSlot && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Confirm Appointment</h3>
          <p className="text-gray-500 text-sm mb-6">
            {selectedSlot.day.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })} at{" "}
            {selectedSlot.slot.label} with {barber.name}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-amber-500"
                placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 outline-none focus:border-amber-500"
                placeholder="555-0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Service</label>
              <div className="grid grid-cols-3 gap-2">
                {SERVICES.map((s) => (
                  <button key={s} onClick={() => setForm({ ...form, service: s })}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all
                      ${form.service === s
                        ? "bg-amber-500 border-amber-500 text-gray-950 font-bold"
                        : "border-gray-200 text-gray-600 hover:border-amber-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep("calendar")}
              className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Back
            </button>
            <button onClick={handleBook} disabled={!form.name || !form.phone}
              className="flex-1 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-bold transition-colors disabled:opacity-40">
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 10: CLIENT — MY APPOINTMENTS
// List with cancel capability
// ─────────────────────────────────────────────

function MyAppointments() {
  const { state, dispatch } = useApp();
  const clientName = state.currentUser.name;

  const appts = state.appointments
    .filter((a) => a.clientName === clientName)
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const upcoming = appts.filter((a) => new Date(a.startTime) >= new Date() && a.status === "Confirmed");
  const past     = appts.filter((a) => new Date(a.startTime) < new Date() || a.status === "Cancelled" || a.status === "Completed");

  const cancel = (id) => {
    dispatch({ type: "CANCEL_APPOINTMENT", payload: id });
    dispatch({ type: "ADD_TOAST", payload: { type: "info", message: "Appointment cancelled." } });
  };

  const ApptCard = ({ appt }) => {
    const barber = state.barbers.find((b) => b.id === appt.barberId);
    const shop   = state.shops.find((s) => s.id === appt.shopId);
    const isFuture = new Date(appt.startTime) > new Date() && appt.status === "Confirmed";
    const sc = statusColor[appt.status] || statusColor.Confirmed;
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: barber?.color || "#888" }}>{barber?.initials}</div>
            <div>
              <p className="font-bold text-gray-900">{barber?.name}</p>
              <p className="text-gray-500 text-xs">{shop?.name}</p>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${sc.bg} ${sc.text}`}>{appt.status}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          <span>📅 {formatDate(appt.startTime)}</span>
          <span>🕐 {formatTime(appt.startTime)}</span>
          <span>✂️ {appt.service}</span>
        </div>
        {isFuture && (
          <button onClick={() => cancel(appt.id)}
            className="mt-4 text-sm text-red-500 hover:text-red-400 font-medium transition-colors">
            Cancel Appointment
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        My Appointments
      </h1>
      {appts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✂️</p>
          <p className="text-lg font-medium">No appointments yet</p>
          <button onClick={() => dispatch({ type: "SET_TAB", payload: "home" })}
            className="mt-4 bg-amber-500 text-gray-950 text-sm font-bold px-6 py-2 rounded-lg hover:bg-amber-400 transition-colors">
            Book Now
          </button>
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Upcoming</h2>
          <div className="space-y-3">{upcoming.map((a) => <ApptCard key={a.id} appt={a} />)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Past</h2>
          <div className="space-y-3">{past.map((a) => <ApptCard key={a.id} appt={a} />)}</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 11: SHOP — DASHBOARD
// Today's appointments + status actions
// ─────────────────────────────────────────────

function ShopDashboard() {
  const { state, dispatch } = useApp();
  const shopId = state.currentUser.shopId;

  const todayAppts = state.appointments
    .filter((a) => a.shopId === shopId && isSameDay(a.startTime, today) && a.status !== "Cancelled")
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const barbers = state.barbers.filter((b) => b.shopId === shopId);

  const stats = [
    { label: "Today's Bookings", value: todayAppts.length },
    { label: "Confirmed",        value: todayAppts.filter((a) => a.status === "Confirmed").length },
    { label: "Completed",        value: todayAppts.filter((a) => a.status === "Completed").length },
    { label: "Barbers On",       value: barbers.length },
  ];

  const updateStatus = (id, status) => {
    dispatch({ type: "UPDATE_APPOINTMENT_STATUS", payload: { id, status } });
    dispatch({ type: "ADD_TOAST", payload: { type: "success", message: `Marked as ${status}` } });
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Today's Dashboard
      </h1>
      <p className="text-gray-500 mb-8">
        {today.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Appointment list */}
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">All Appointments Today</h2>
      {todayAppts.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
          No appointments scheduled for today
        </div>
      ) : (
        <div className="space-y-3">
          {todayAppts.map((a) => {
            const barber = state.barbers.find((b) => b.id === a.barberId);
            const sc = statusColor[a.status] || statusColor.Confirmed;
            return (
              <div key={a.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-12">
                    <p className="text-lg font-black text-amber-500">{formatTime(a.startTime)}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{a.clientName}</p>
                    <p className="text-sm text-gray-500">{a.service} · {barber?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${sc.bg} ${sc.text}`}>{a.status}</span>
                  {a.status === "Confirmed" && (
                    <>
                      <button onClick={() => updateStatus(a.id, "Completed")}
                        className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-400 text-white rounded-lg font-medium transition-colors">
                        Done
                      </button>
                      <button onClick={() => updateStatus(a.id, "No-Show")}
                        className="text-xs px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors">
                        No-Show
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 12: SHOP — SCHEDULE (per-barber weekly grid)
// ─────────────────────────────────────────────

function ShopSchedule() {
  const { state, dispatch } = useApp();
  const shopId  = state.currentUser.shopId;
  const barbers = state.barbers.filter((b) => b.shopId === shopId);
  const [selectedBarber, setSelectedBarber] = useState(barbers[0]?.id);
  const [weekOffset, setWeekOffset]         = useState(0);

  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(baseDate);

  const appts = state.appointments.filter(
    (a) => a.barberId === selectedBarber && a.status !== "Cancelled"
  );

  const getSlotAppt = (day, slot) =>
    appts.find((a) => {
      const d = new Date(a.startTime);
      return isSameDay(d, day) && d.getHours() === slot.h && d.getMinutes() === slot.m;
    });

  const updateStatus = (id, status) => {
    dispatch({ type: "UPDATE_APPOINTMENT_STATUS", payload: { id, status } });
    dispatch({ type: "ADD_TOAST", payload: { type: "success", message: `Marked as ${status}` } });
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Schedule
      </h1>

      {/* Barber selector tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {barbers.map((b) => (
          <button key={b.id} onClick={() => setSelectedBarber(b.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium
              ${selectedBarber === b.id
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-gray-200 text-gray-600 hover:border-amber-300"}`}>
            <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold"
              style={{ backgroundColor: b.color }}>{b.initials}</span>
            {b.name}
          </button>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-gray-900 text-sm">
          {weekDays[0].toLocaleDateString([], { month: "short", day: "numeric" })} –{" "}
          {weekDays[6].toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setWeekOffset(weekOffset - 1)}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">‹</button>
          <button onClick={() => setWeekOffset(0)}
            className="px-3 h-8 rounded-lg bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200 transition-colors">Today</button>
          <button onClick={() => setWeekOffset(weekOffset + 1)}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">›</button>
        </div>
      </div>

      {/* CSS Grid weekly schedule */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: "72px repeat(7, 1fr)" }}>
          <div className="p-2" />
          {weekDays.map((d, i) => (
            <div key={i} className={`p-2 text-center border-l border-gray-200 ${isSameDay(d, today) ? "bg-amber-50" : ""}`}>
              <p className="text-xs text-gray-400 uppercase">{d.toLocaleDateString([], { weekday: "short" })}</p>
              <p className={`text-sm font-bold ${isSameDay(d, today) ? "text-amber-500" : "text-gray-800"}`}>{d.getDate()}</p>
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
          {HOURS.map((slot) => (
            <div key={`${slot.h}-${slot.m}`} className="grid border-b border-gray-50" style={{ gridTemplateColumns: "72px repeat(7, 1fr)", minHeight: "40px" }}>
              <div className="text-xs text-gray-400 text-right pr-3 pt-2 flex-shrink-0">
                {slot.m === 0 ? slot.label : ""}
              </div>
              {weekDays.map((d, di) => {
                const appt = getSlotAppt(d, slot);
                const sc   = appt ? statusColor[appt.status] : null;
                return (
                  <div key={di} className="border-l border-gray-100 p-1">
                    {appt && (
                      <div className={`rounded text-xs p-1.5 leading-tight h-full ${sc?.bg} ${sc?.text}`}>
                        <p className="font-bold truncate">{appt.clientName}</p>
                        <p className="truncate opacity-80">{appt.service}</p>
                        {appt.status === "Confirmed" && (
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => updateStatus(appt.id, "Completed")}
                              className="bg-green-500 text-white rounded px-1 py-0.5 font-bold hover:bg-green-400 transition-colors"
                              style={{ fontSize: "9px" }}>✓</button>
                            <button onClick={() => updateStatus(appt.id, "No-Show")}
                              className="bg-red-500 text-white rounded px-1 py-0.5 font-bold hover:bg-red-400 transition-colors"
                              style={{ fontSize: "9px" }}>✕</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 13: SHOP — ANALYTICS
// Weekly summary metrics + bar chart
// ─────────────────────────────────────────────

function ShopAnalytics() {
  const { state } = useApp();
  const shopId   = state.currentUser.shopId;
  const weekDays = getWeekDays(today);
  const weekStart = weekDays[0];
  const weekEnd   = weekDays[6];

  const weekAppts = state.appointments.filter((a) => {
    const d = new Date(a.startTime);
    return a.shopId === shopId && d >= weekStart && d <= weekEnd && a.status !== "Cancelled";
  });

  const svcCounts = SERVICES
    .map((s) => ({ service: s, count: weekAppts.filter((a) => a.service === s).length }))
    .sort((a, b) => b.count - a.count);

  const dayCounts = weekDays.map((d) => ({
    day:   d.toLocaleDateString([], { weekday: "short" }),
    count: weekAppts.filter((a) => isSameDay(a.startTime, d)).length,
    date:  d,
  }));
  const busiestDay = [...dayCounts].sort((a, b) => b.count - a.count)[0];
  const completed  = weekAppts.filter((a) => a.status === "Completed").length;
  const rate       = weekAppts.length > 0 ? Math.round((completed / weekAppts.length) * 100) : 0;
  const maxCount   = Math.max(...dayCounts.map((d) => d.count), 1);

  const summaryStats = [
    { label: "Total This Week",  value: weekAppts.length, icon: "📅" },
    { label: "Completed",        value: completed,         icon: "✓"  },
    { label: "Completion Rate",  value: `${rate}%`,        icon: "◎"  },
    { label: "Top Service",      value: svcCounts[0]?.service || "—", icon: "✂️" },
    { label: "Busiest Day",      value: busiestDay?.count > 0 ? busiestDay.day : "—", icon: "🔥" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Analytics
      </h1>
      <p className="text-gray-500 mb-8">
        Week of {weekStart.toLocaleDateString([], { month: "long", day: "numeric" })}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {summaryStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xl mb-2">{s.icon}</p>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart — appointments by day */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-800 mb-6 text-xs uppercase tracking-widest">Appointments by Day</h3>
        <div className="flex items-end gap-3" style={{ height: "128px" }}>
          {dayCounts.map((d, i) => {
            const heightPct = (d.count / maxCount) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2" style={{ height: "100%" }}>
                <span className="text-xs font-bold text-gray-600">{d.count || ""}</span>
                <div className="w-full rounded-t transition-all flex-1 flex items-end">
                  <div className="w-full rounded-t"
                    style={{
                      height: `${Math.max(heightPct, 4)}%`,
                      backgroundColor: isSameDay(d.date, today) ? "#f59e0b" : "#e5e7eb",
                      minHeight: "4px",
                    }} />
                </div>
                <span className={`text-xs ${isSameDay(d.date, today) ? "text-amber-500 font-bold" : "text-gray-400"}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-widest">Service Breakdown</h3>
        <div className="space-y-3">
          {svcCounts.map(({ service, count }) => {
            const pct = weekAppts.length > 0 ? (count / weekAppts.length) * 100 : 0;
            return (
              <div key={service}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{service}</span>
                  <span className="text-gray-500">{count} ({Math.round(pct)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 14: MAIN APP SHELL
// Layout wrapper — sidebar + content area
// ─────────────────────────────────────────────

function AppShell() {
  const { state } = useApp();
  const { activeTab } = state;
  const isShop = state.currentUser?.role === "shop";

  const renderContent = () => {
    if (isShop) {
      if (activeTab === "shop_schedule")  return <ShopSchedule />;
      if (activeTab === "shop_analytics") return <ShopAnalytics />;
      return <ShopDashboard />;
    }
    if (activeTab === "my_appointments") return <MyAppointments />;
    if (activeTab === "shop_detail")     return <ShopDetail />;
    if (activeTab === "book")            return <BookingCalendar />;
    return <ShopList />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24 md:pb-8">
          {renderContent()}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION 15: ROOT EXPORT
// Context provider wraps everything
// ─────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {state.currentUser ? <AppShell /> : <AuthScreen />}
    </AppContext.Provider>
  );
}
