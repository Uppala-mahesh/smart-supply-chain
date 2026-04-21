import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { fetchLogs, fetchOrders, fetchProducts, loginCustomer, placeOrder, registerCustomer } from './api';
import Navbar from './components/Navbar';
import { Notifications } from './components/Notifications';
import Spinner from './components/Spinner';

const categories = ['All', 'Electronics', 'Furniture', 'Stationery'];
const warehouses = [
  { warehouse_id: 3010, warehouse_name: 'Warehouse Central' },
  { warehouse_id: 3006, warehouse_name: 'Warehouse North' },
  { warehouse_id: 3007, warehouse_name: 'Warehouse South' },
  { warehouse_id: 3008, warehouse_name: 'Warehouse East' },
  { warehouse_id: 3009, warehouse_name: 'Warehouse West' }
];

const createSvgProductImage = (label, symbol, start, end) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${start}"/>
          <stop offset="100%" stop-color="${end}"/>
        </linearGradient>
        <radialGradient id="glow" cx="35%" cy="20%" r="80%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="700" rx="36" fill="url(#bg)"/>
      <circle cx="190" cy="120" r="280" fill="url(#glow)"/>
      <circle cx="740" cy="120" r="240" fill="#ffffff" fill-opacity="0.08"/>
      <rect x="70" y="530" width="760" height="110" rx="28" fill="#0f172a" fill-opacity="0.28"/>
      <text x="92" y="597" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="800" fill="#ffffff">${label}</text>
      <text x="92" y="640" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="700" fill="#e2e8f0" opacity="0.9">Smart Supply Chain Product</text>
      <text x="595" y="225" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif" font-size="200" font-weight="700" fill="#ffffff" text-anchor="middle">${symbol}</text>
      <circle cx="685" cy="250" r="58" fill="#ffffff" fill-opacity="0.18"/>
      <circle cx="740" cy="320" r="90" fill="#ffffff" fill-opacity="0.10"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
};

const productVisualsByName = {
  'asus laptop': { image: createSvgProductImage('Asus Laptop', '💻', '#0ea5e9', '#155e75'), gradient: 'from-sky-500/80 to-cyan-600/80' },
  backpack: { image: createSvgProductImage('Backpack', '🎒', '#f59e0b', '#c2410c'), gradient: 'from-amber-500/80 to-orange-600/80' },
  'canon printer': { image: createSvgProductImage('Canon Printer', '🖨️', '#475569', '#1f2937'), gradient: 'from-slate-500/80 to-gray-700/80' },
  'casual shoes': { image: createSvgProductImage('Casual Shoes', '👟', '#78716c', '#3f3f46'), gradient: 'from-stone-500/80 to-zinc-700/80' },
  'colored pencil': { image: createSvgProductImage('Colored Pencil', '✏️', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  'corsair keyboard': { image: createSvgProductImage('Corsair Keyboard', '⌨️', '#6366f1', '#6d28d9'), gradient: 'from-indigo-500/80 to-violet-700/80' },
  'dell laptop': { image: createSvgProductImage('Dell Laptop', '💻', '#0ea5e9', '#155e75'), gradient: 'from-sky-500/80 to-cyan-600/80' },
  diary: { image: createSvgProductImage('Diary', '📓', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  eraser: { image: createSvgProductImage('Eraser', '🧽', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  'filing cabinet': { image: createSvgProductImage('Filing Cabinet', '🗄️', '#10b981', '#0f766e'), gradient: 'from-emerald-500/80 to-teal-600/80' },
  'gaming chair': { image: createSvgProductImage('Gaming Chair', '🪑', '#10b981', '#0f766e'), gradient: 'from-emerald-500/80 to-teal-600/80' },
  'glass table': { image: createSvgProductImage('Glass Table', '🪟', '#10b981', '#0f766e'), gradient: 'from-emerald-500/80 to-teal-600/80' },
  'hp laptop': { image: createSvgProductImage('HP Laptop', '💻', '#0ea5e9', '#155e75'), gradient: 'from-sky-500/80 to-cyan-600/80' },
  'hp mouse': { image: createSvgProductImage('HP Mouse', '🖱️', '#06b6d4', '#0369a1'), gradient: 'from-cyan-500/80 to-sky-700/80' },
  'lg monitor': { image: createSvgProductImage('LG Monitor', '🖥️', '#3b82f6', '#334155'), gradient: 'from-blue-500/80 to-slate-700/80' },
  'logitech mouse': { image: createSvgProductImage('Logitech Mouse', '🖱️', '#06b6d4', '#0369a1'), gradient: 'from-cyan-500/80 to-sky-700/80' },
  marker: { image: createSvgProductImage('Marker', '🖊️', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  'microsoft keyboard': { image: createSvgProductImage('Microsoft Keyboard', '⌨️', '#6366f1', '#6d28d9'), gradient: 'from-indigo-500/80 to-violet-700/80' },
  notebook: { image: createSvgProductImage('Notebook', '📒', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  'office chair': { image: createSvgProductImage('Office Chair', '🪑', '#10b981', '#0f766e'), gradient: 'from-emerald-500/80 to-teal-600/80' },
  pen: { image: createSvgProductImage('Pen', '🖊️', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  pencil: { image: createSvgProductImage('Pencil', '✏️', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  'running shoes': { image: createSvgProductImage('Running Shoes', '👟', '#78716c', '#3f3f46'), gradient: 'from-stone-500/80 to-zinc-700/80' },
  'samsung monitor': { image: createSvgProductImage('Samsung Monitor', '🖥️', '#3b82f6', '#334155'), gradient: 'from-blue-500/80 to-slate-700/80' },
  sharpener: { image: createSvgProductImage('Sharpener', '🔧', '#d946ef', '#7c3aed'), gradient: 'from-fuchsia-500/80 to-violet-600/80' },
  slippers: { image: createSvgProductImage('Slippers', '🥿', '#78716c', '#3f3f46'), gradient: 'from-stone-500/80 to-zinc-700/80' },
  'socks pair': { image: createSvgProductImage('Socks Pair', '🧦', '#78716c', '#3f3f46'), gradient: 'from-stone-500/80 to-zinc-700/80' },
  'storage cabinet': { image: createSvgProductImage('Storage Cabinet', '🗄️', '#10b981', '#0f766e'), gradient: 'from-emerald-500/80 to-teal-600/80' },
  'tote bag': { image: createSvgProductImage('Tote Bag', '👜', '#f59e0b', '#c2410c'), gradient: 'from-amber-500/80 to-orange-600/80' },
  'wooden table': { image: createSvgProductImage('Wooden Table', '🪵', '#10b981', '#0f766e'), gradient: 'from-emerald-500/80 to-teal-600/80' }
};

const defaultProductVisual = {
  image: createSvgProductImage('Product', '📦', '#0ea5e9', '#0284c7'),
  gradient: 'from-brand-600/80 to-cyan-600/80'
};

const getProductVisual = (product) => {
  const name = String(product?.product_name || '').trim().toLowerCase();
  const category = String(product?.product_category || '').trim().toLowerCase();

  if (productVisualsByName[name]) {
    return productVisualsByName[name];
  }

  const categoryFallbacks = {
    electronics: {
      image: createSvgProductImage('Electronics', '⚡', '#0ea5e9', '#155e75'),
      gradient: 'from-sky-500/80 to-cyan-600/80'
    },
    furniture: {
      image: createSvgProductImage('Furniture', '🪑', '#10b981', '#0f766e'),
      gradient: 'from-emerald-500/80 to-teal-600/80'
    },
    stationery: {
      image: createSvgProductImage('Stationery', '✏️', '#d946ef', '#7c3aed'),
      gradient: 'from-fuchsia-500/80 to-violet-600/80'
    },
    accessories: {
      image: createSvgProductImage('Accessories', '🎒', '#f59e0b', '#c2410c'),
      gradient: 'from-amber-500/80 to-orange-600/80'
    },
    footwear: {
      image: createSvgProductImage('Footwear', '👟', '#78716c', '#3f3f46'),
      gradient: 'from-stone-500/80 to-zinc-700/80'
    }
  };

  return categoryFallbacks[category] ?? defaultProductVisual;
};

const PrivateRoute = ({ children }) => {
  const { customer, token } = useAuth();
  if (!customer || !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PremiumInput = ({ label, className = '', ...props }) => (
  <label className="block group">
    <span className="text-sm font-semibold text-slate-700 block mb-2 group-focus-within:text-brand-600 transition-colors">{label}</span>
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 focus:border-brand-500 focus:from-white focus:to-blue-50 focus:shadow-lg focus:shadow-brand-500/20 group-focus-within:border-brand-400 hover:border-brand-300 ${className}`}
    />
  </label>
);

const PremiumSelect = ({ label, children, className = '', ...props }) => (
  <label className="block group">
    <span className="text-sm font-semibold text-slate-700 block mb-2 group-focus-within:text-brand-600 transition-colors">{label}</span>
    <select
      {...props}
      className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 outline-none transition-all duration-300 focus:border-brand-500 focus:from-white focus:to-blue-50 focus:shadow-lg focus:shadow-brand-500/20 group-focus-within:border-brand-400 hover:border-brand-300 appearance-none cursor-pointer ${className}`}
    >
      {children}
    </select>
  </label>
);

const PremiumButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:scale-105 disabled:shadow-none disabled:scale-100',
    secondary: 'border-2 border-brand-600 text-brand-600 hover:bg-blue-50 hover:scale-105',
    glass: 'glass-effect-sm text-slate-800 hover:from-white hover:to-blue-50 hover:scale-105'
  };

  return (
    <button
      {...props}
      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const PremiumCard = ({ children, className = '', hover = true }) => (
  <div className={`rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-card backdrop-blur-sm transition-all duration-300 ${hover ? 'hover:shadow-card-lg hover:border-brand-500/30 hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);

const Dashboard = () => {
  const { customer, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [isOrderPlacing, setIsOrderPlacing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchProducts(search, category === 'All' ? '' : category);
        setProducts(result);
      } catch (error) {
        setNotifications((current) => [
          ...current,
          { id: Date.now(), type: 'error', message: error.message || 'Unable to load products' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category]);

  useEffect(() => {
    if (!notifications.length) return;
    const timer = window.setTimeout(() => {
      setNotifications((current) => current.slice(1));
    }, 3800);
    return () => window.clearTimeout(timer);
  }, [notifications]);

  const dynamicSuggestions = useMemo(
    () => Array.from(new Set(products.map((product) => product.product_name))).slice(0, 7),
    [products]
  );

  const handleQuantityChange = (productId, quantity) => {
    const numQuantity = Math.max(1, parseInt(quantity) || 1);
    setProductQuantities((current) => ({
      ...current,
      [productId]: numQuantity
    }));
  };

  const handleDirectOrder = async (product) => {
    if (!token) return;
    
    const quantity = productQuantities[product.product_id] || 1;
    
    if (quantity > product.stock) {
      return setNotifications((current) => [
        ...current,
        { id: Date.now(), type: 'error', message: `Only ${product.stock} units available in stock.` }
      ]);
    }

    try {
      setIsOrderPlacing(true);
      const result = await placeOrder(token, 0, [{ product_id: product.product_id, quantity }]);
      
      setOrderConfirmation({
        order_id: result.order_id,
        product_name: product.product_name,
        product_price: product.product_price,
        quantity: quantity,
        total: Number(product.product_price) * quantity,
        order_time: result.order_time,
        warehouse_name: result.warehouse_name || 'Warehouse'
      });
      
      setNotifications((current) => [
        ...current,
        { id: Date.now(), type: 'success', message: 'Order placed successfully! 🎉' }
      ]);
      
      setProductQuantities((current) => ({ ...current, [product.product_id]: 1 }));
      const updatedProducts = await fetchProducts(search, category === 'All' ? '' : category);
      setProducts(updatedProducts);
    } catch (error) {
      setNotifications((current) => [
        ...current,
        { id: Date.now(), type: 'error', message: error.message || 'Order placement failed.' }
      ]);
    } finally {
      setIsOrderPlacing(false);
    }
  };

  const closeOrderConfirmation = () => {
    setOrderConfirmation(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(240,249,255,0.94))]" />
      <div className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute right-[-5rem] top-[32rem] -z-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl animate-pulse-slow" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header Section */}
        <PremiumCard className="mb-8 animate-fade-in overflow-hidden bg-gradient-to-br from-white via-blue-50 to-brand-50/30 p-0">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_40%)]" />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.35em] font-bold text-brand-600 opacity-80">👋 Welcome back</p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-800 to-brand-600 bg-clip-text text-transparent sm:text-5xl">
                    Hello, {customer?.customer_name}!
                  </h1>
                  <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
                    Search for products, pick a quantity, and place orders with a premium experience designed for speed and clarity.
                  </p>
                </div>
              </div>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fast Search</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">Find products instantly</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Smart Order</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">Quantity aware checkout</p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Inventory</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">Updated stock visibility</p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 via-cyan-600 to-sky-700 px-6 py-8 sm:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.38),_transparent_35%)]" />
              <div className="relative max-w-sm text-white">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">Premium Supply Chain</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">A polished shopping view for every item.</h2>
                <p className="mt-3 text-sm leading-6 text-white/85">
                  Visual cards, stronger contrast, and product-specific imagery make the catalog easier to scan.
                </p>
                <div className="mt-6 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-glow">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/75">Catalog</p>
                      <p className="mt-1 text-xl font-bold">Elevated UI</p>
                    </div>
                    <div className="rounded-2xl bg-white/15 px-4 py-2 text-right">
                      <p className="text-xs uppercase tracking-widest text-white/75">Status</p>
                      <p className="font-semibold">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            {/* Search Filters */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <PremiumInput
                list="product-suggestions"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                label="🔍 Search Products"
                placeholder="e.g., Dell, Laptop, Chair..."
              />
              <datalist id="product-suggestions">
                {dynamicSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>

              <PremiumSelect
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                label="📂 Filter by Category"
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </PremiumSelect>
            </div>
          </div>
        </PremiumCard>

        {/* Products Grid */}
        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <PremiumCard className="border-dashed bg-gradient-to-br from-slate-50 to-slate-100 text-center py-16 animate-fade-in">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-cyan-100 text-4xl shadow-inner-glow">📦</div>
            <p className="text-xl font-semibold text-slate-800">No products found</p>
            <p className="mt-2 text-slate-500">Try adjusting your search criteria or browse all categories.</p>
          </PremiumCard>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-fade-in">
            {products.map((product, idx) => (
              <div
                key={product.product_id}
                className="animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <PremiumCard className="flex h-full flex-col overflow-hidden p-0 group">
                  {(() => {
                    const visual = getProductVisual(product);
                    return (
                      <div className="relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-90`} />
                        <img
                          src={visual.image}
                          alt={product.product_name}
                          loading="lazy"
                          className="relative h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                        <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
                          {product.product_category}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                          <div className="max-w-[70%] text-white drop-shadow-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/75">Featured Product</p>
                            <p className="mt-2 text-sm font-semibold text-white/90">Details shown below</p>
                          </div>
                          <div className="rounded-2xl bg-white/15 px-4 py-2 text-right text-white backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">Price</p>
                            <p className="text-xl font-black">${Number(product.product_price).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex flex-1 flex-col p-6">
                  {/* Product Header */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 opacity-70">Warehouse Ready</p>
                        <h2 className="mt-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-brand-600 line-clamp-2">{product.product_name}</h2>
                      </div>
                    </div>

                    {/* Stock Badge */}
                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                        product.stock > 0
                          ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 shadow-sm shadow-emerald-200'
                          : 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 shadow-sm shadow-rose-200'
                      }`}>
                        {product.stock > 0 ? (
                          <>
                            <span className="text-lg">✓</span>
                            {product.stock} in stock
                          </>
                        ) : (
                          <>
                            <span className="text-lg">⚠</span>
                            Out of stock
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Input & Order Button */}
                  <div className="mt-6 border-t border-slate-200/60 pt-6 flex flex-col gap-3">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-600 block mb-2">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={productQuantities[product.product_id] || 1}
                        onChange={(event) => handleQuantityChange(product.product_id, event.target.value)}
                        disabled={product.stock === 0}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none transition-all focus:border-brand-500 focus:bg-white focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </label>
                    <PremiumButton
                      onClick={() => handleDirectOrder(product)}
                      disabled={product.stock === 0 || isOrderPlacing}
                      variant="primary"
                      className="w-full"
                    >
                      {isOrderPlacing ? '⏳ Placing Order...' : '🛒 Place Order'}
                    </PremiumButton>
                  </div>
                  </div>
                </PremiumCard>
              </div>
            ))}
          </div>
        )}

        {/* Order Confirmation Modal */}
        {orderConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl animate-scale-in overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-500 p-6">
                <p className="text-xs uppercase tracking-widest font-bold text-white opacity-90">✓ Order Confirmed</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Order #{orderConfirmation.order_id}</h2>
              </div>

              {/* Content */}
              <div className="space-y-4 p-6">
                {/* Product */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Product</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{orderConfirmation.product_name}</p>
                </div>

                {/* Quantity & Price Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Quantity</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{orderConfirmation.quantity}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Unit Price</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">${Number(orderConfirmation.product_price).toFixed(2)}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-lg shadow-emerald-200/50">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Total Amount</p>
                  <p className="mt-2 text-4xl font-bold text-emerald-900">${Number(orderConfirmation.total).toFixed(2)}</p>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Warehouse</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{orderConfirmation.warehouse_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Order Time</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{new Date(orderConfirmation.order_time).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-6">
                <PremiumButton
                  onClick={closeOrderConfirmation}
                  variant="primary"
                  className="w-full"
                >
                  🛍️ Continue Shopping
                </PremiumButton>
              </div>
            </div>
          </div>
        )}
      </div>

      <Notifications notifications={notifications} />
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      return setMessage({ type: 'error', text: 'Please enter both email and password.' });
    }

    try {
      setLoading(true);
      const data = await loginCustomer(email, password);
      login(data.customer, data.token);
      navigate('/dashboard');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Invalid login credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <PremiumCard className="bg-gradient-to-br from-white to-blue-50 border-brand-200/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 shadow-lg shadow-brand-500/30 mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-brand-600">Secure Portal</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Customer Login</h1>
            <p className="mt-2 text-slate-600">Access your supply chain account</p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-4 flex gap-3 animate-slide-down">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <p className="text-sm text-rose-800 font-medium">{message.text}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <PremiumInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              label="📧 Email Address"
              placeholder="you@example.com"
            />
            <PremiumInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              label="🔑 Password"
              placeholder="Enter your password"
            />
            <PremiumButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? '⏳ Signing in...' : '→ Sign In'}
            </PremiumButton>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600">Don't have an account? 
              <button 
                onClick={() => navigate('/register')}
                className="ml-1 font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Create one now
              </button>
            </p>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!name || !email || !password) {
      return setMessage({ type: 'error', text: 'All fields are required.' });
    }
    if (password.length < 6) {
      return setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
    }

    try {
      setLoading(true);
      const data = await registerCustomer(name, email, password);
      login(data.customer, data.token);
      navigate('/dashboard');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <PremiumCard className="bg-gradient-to-br from-white to-blue-50 border-brand-200/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30 mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-emerald-600">Create Account</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Register Here</h1>
            <p className="mt-2 text-slate-600">Join our supply chain platform</p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-4 flex gap-3 animate-slide-down">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <p className="text-sm text-rose-800 font-medium">{message.text}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <PremiumInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              label="👤 Full Name"
              placeholder="John Doe"
            />
            <PremiumInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              label="📧 Email Address"
              placeholder="you@example.com"
            />
            <PremiumInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              label="🔑 Create Password"
              placeholder="At least 6 characters"
            />
            <PremiumButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full"
            >
              {loading ? '⏳ Creating Account...' : '→ Create Account'}
            </PremiumButton>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600">Already registered? 
              <button 
                onClick={() => navigate('/login')}
                className="ml-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await fetchOrders(token);
        setOrders(data);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Unable to load orders.' });
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [token]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 min-h-screen pb-16">
      {/* Header */}
      <PremiumCard className="mb-8 animate-fade-in bg-gradient-to-br from-white via-purple-50 to-brand-50/30">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-purple-600 opacity-80">📦 Order History</p>
          <h1 className="mt-3 text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-brand-600 bg-clip-text text-transparent">
            Your Orders
          </h1>
          <p className="mt-3 text-slate-600">Review your past purchases and track your order details</p>
        </div>
      </PremiumCard>

      {message && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-4 flex gap-3 animate-fade-in">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <p className="text-sm text-rose-800 font-medium">{message.text}</p>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <PremiumCard className="bg-gradient-to-br from-slate-50 to-slate-100 border-dashed text-center py-16 animate-fade-in">
          <div className="text-5xl mb-4">🛍️</div>
          <p className="text-slate-600 text-lg font-medium">No orders yet</p>
          <p className="text-slate-500 mt-2">Start shopping to see your orders here</p>
        </PremiumCard>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {orders.map((order, idx) => (
            <div
              key={order.order_id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <PremiumCard className="overflow-hidden">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Order ID</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">#{order.order_id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Order Date</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(order.order_time || order.order_date).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Warehouse</p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <span>📍</span>
                      {order.warehouse_name}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                        <th className="px-4 py-3 text-left font-bold text-slate-700">Product</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-700">Quantity</th>
                        <th className="px-4 py-3 text-right font-bold text-slate-700">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={`${order.order_id}-${item.product_id}`} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{item.product_name}</td>
                          <td className="px-4 py-3 font-medium text-slate-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-bold text-brand-600">${Number(item.product_price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </PremiumCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LogsPage = () => {
  const { token, isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const pageSize = 15;

  useEffect(() => {
    if (!token || !isAdmin) return;
    const loadLogs = async () => {
      try {
        setLoading(true);
        const data = await fetchLogs(token, page, pageSize);
        setLogs(data.logs);
        setTotal(data.total);
      } catch (error) {
        setMessage({ type: 'error', text: error.message || 'Unable to load logs.' });
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [page, token, isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 min-h-screen pb-16">
      {/* Header */}
      <PremiumCard className="mb-8 animate-fade-in bg-gradient-to-br from-white via-orange-50 to-red-50/30">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-orange-600 opacity-80">⚙️ Admin Panel</p>
          <h1 className="mt-3 text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-800 to-red-600 bg-clip-text text-transparent">
            Stock Inventory Logs
          </h1>
          <p className="mt-3 text-slate-600">Monitor all stock changes across warehouses with detailed transaction history</p>
        </div>
      </PremiumCard>

      {message && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-4 flex gap-3 animate-fade-in">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <p className="text-sm text-rose-800 font-medium">{message.text}</p>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <PremiumCard className="overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-orange-50">
                  <th className="px-4 py-4 text-left font-bold text-slate-700 text-sm">Product</th>
                  <th className="px-4 py-4 text-left font-bold text-slate-700 text-sm">Warehouse</th>
                  <th className="px-4 py-4 text-left font-bold text-slate-700 text-sm">Type</th>
                  <th className="px-4 py-4 text-center font-bold text-slate-700 text-sm">Quantity</th>
                  <th className="px-4 py-4 text-left font-bold text-slate-700 text-sm">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log, idx) => (
                  <tr 
                    key={log.log_id}
                    className="hover:bg-orange-50/50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{log.product_name}</td>
                    <td className="px-4 py-3 text-slate-600 flex items-center gap-2">
                      <span>📍</span>
                      {log.warehouse_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        log.change_type === 'inbound'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {log.change_type === 'inbound' ? '📥 Inbound' : '📤 Outbound'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{log.change_quantity}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{new Date(log.log_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600 font-medium">
              Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span> • Total: <span className="font-bold text-slate-900">{total}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};

const AppRoutes = () => {
  const { customer, token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={customer ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={customer ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <PrivateRoute>
            <LogsPage />
          </PrivateRoute>
        }
      />
      <Route path="/*" element={customer ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-slate-900">
      <Navbar />
      <AppRoutes />
    </div>
  </AuthProvider>
);

export default App;
