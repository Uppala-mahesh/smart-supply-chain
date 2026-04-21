import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { customer, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', show: !!customer },
    { path: '/orders', label: 'Orders', show: !!customer },
    { path: '/logs', label: 'Logs', show: isAdmin }
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-50/50 to-white backdrop-blur-xl"></div>
      <div className="absolute inset-0 border-b border-white/20 shadow-sm"></div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Logo with animation */}
        <Link
          to="/dashboard"
          className="group flex items-center gap-2 transition-all duration-300"
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-cyan-600 shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/50 transition-all">
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-lg font-bold text-white">⚡</span>
            </div>
          </div>
          <span className="hidden text-lg font-bold gradient-text sm:block group-hover:scale-105 transition-transform">
            Smart Supply Chain
          </span>
          <span className="text-lg font-bold gradient-text sm:hidden">
            SSC
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-wrap items-center gap-1 text-sm">
          {customer ? (
            <>
              {navLinks.map(
                (link) =>
                  link.show && (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-4 py-2 rounded-lg transition-all duration-300 group ${
                        isActive(link.path)
                          ? 'text-brand-600 bg-blue-100/60 font-semibold'
                          : 'text-slate-700 hover:text-brand-600'
                      }`}
                    >
                      <span className="relative z-10">{link.label}</span>
                      {isActive(link.path) && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-500/10 to-cyan-500/10 -z-0 animate-pulse"></div>
                      )}
                      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-brand-600 to-cyan-600 group-hover:w-full transition-all duration-300"></div>
                    </Link>
                  )
              )}
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg bg-gradient-to-r from-brand-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/40 hover:scale-105 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-gradient-to-r from-brand-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/40 hover:scale-105 active:scale-95"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative group p-2 text-slate-700 hover:text-brand-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="animate-slide-down md:hidden border-t border-white/20 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 space-y-2">
            {customer ? (
              <>
                {navLinks.map(
                  (link) =>
                    link.show && (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-4 py-2 transition-all duration-300 ${
                          isActive(link.path)
                            ? 'bg-blue-100/60 text-brand-600 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {link.label}
                      </Link>
                    )
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-all duration-300 hover:shadow-lg mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg bg-gradient-to-r from-brand-600 to-cyan-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-md shadow-brand-500/25"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
