import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CardNav = ({
  logo = '⚡ TBI KIT',
  logoAlt = 'SMART TBI Survival Kit',
  items = [],
  ease = 'power3.out',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNavAction = (item) => {
    if (!item.href) {
      setActiveDropdown(null);
      setMobileOpen(false);
      return;
    }
    
    if (item.href.startsWith('http') || item.href.startsWith('mailto')) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else if (item.href.startsWith('#')) {
      const el = document.querySelector(item.href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(item.href);
    }
    setActiveDropdown(null);
    setMobileOpen(false);
  };

  const toggleDropdown = (label) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  };

  const hasDropdown = (item) => {
    return item.dropdown && Array.isArray(item.dropdown) && item.dropdown.length > 0;
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-dark/80 backdrop-blur-xl border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <span className="text-2xl font-black text-accent group-hover:text-yellow-400 transition-colors">
              {logo}
            </span>
            <span className="hidden sm:inline text-white/60 text-sm font-medium tracking-wider">
              {logoAlt}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <div key={item.label} className="relative">
                {hasDropdown(item) ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                    >
                      {item.label}
                      <svg className="w-4 h-4 transition-transform duration-200" style={{ transform: activeDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className="absolute top-full left-0 mt-2 py-1.5 rounded-2xl shadow-2xl min-w-[190px] overflow-hidden"
                      style={{
                        background: 'rgba(10,14,35,0.95)',
                        backdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        opacity: activeDropdown === item.label ? 1 : 0,
                        transform: activeDropdown === item.label ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.96)',
                        transition: `all 0.18s ${ease === 'power3.out' ? 'cubic-bezier(0.215,0.61,0.355,1)' : 'ease'}`,
                        pointerEvents: activeDropdown === item.label ? 'auto' : 'none',
                      }}
                    >
                      {item.dropdown.map((sub) => (
                        <button
                          key={sub.label}
                          onClick={() => handleNavAction(sub)}
                          className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          {sub.icon && <span>{sub.icon}</span>}
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleNavAction(item)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all shadow-lg text-sm" style={{ boxShadow: '0 4px 20px rgba(245,183,0,0.3)' }}>
              Get Started
            </Link>
          </div>

          <button onClick={() => setMobileOpen((p) => !p)} className="md:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors" aria-label="Toggle navigation menu">
            <div className="relative w-5 h-4 flex flex-col justify-between">
              <span className="absolute top-0 left-0 block h-0.5 w-full bg-current origin-center transition-all duration-300" style={{ transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
              <span className="block h-0.5 w-full bg-current transition-all duration-300 self-center" style={{ opacity: mobileOpen ? 0 : 1 }} />
              <span className="absolute bottom-0 left-0 block h-0.5 w-full bg-current origin-center transition-all duration-300" style={{ transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
            </div>
          </button>
        </div>
      </div>

      <div className="md:hidden overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: mobileOpen ? '480px' : '0', background: 'rgba(10,14,35,0.98)', backdropFilter: 'blur(18px)', borderTop: mobileOpen ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
        <div className="px-4 py-4 space-y-2">
          {items.map((item) => (
            <div key={item.label}>
              {hasDropdown(item) ? (
                <>
                  <button onClick={() => toggleDropdown(item.label + '_mob')} className="w-full flex items-center justify-between px-3 py-3 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                    <span className="font-medium">{item.label}</span>
                    <svg className="w-4 h-4 transition-transform duration-200" style={{ transform: activeDropdown === item.label + '_mob' ? 'rotate(180deg)' : 'rotate(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="pl-4 overflow-hidden transition-all duration-200 space-y-1" style={{ maxHeight: activeDropdown === item.label + '_mob' ? '220px' : '0', opacity: activeDropdown === item.label + '_mob' ? 1 : 0 }}>
                    {item.dropdown.map((sub) => (
                      <button key={sub.label} onClick={() => handleNavAction(sub)} className="w-full text-left px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button onClick={() => handleNavAction(item)} className="w-full text-left px-3 py-3 text-sm font-medium rounded-xl transition-colors text-white/70 hover:text-white hover:bg-white/10">
                  {item.label}
                </button>
              )}
            </div>
          ))}
          <div className="pt-4 space-y-2 border-t border-white/10">
            <Link to="/login" className="block w-full px-3 py-2.5 text-center text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link to="/register" className="block w-full px-3 py-2.5 text-center bg-accent text-dark font-bold rounded-xl hover:bg-yellow-400 transition-all text-sm" onClick={() => setMobileOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// THIS IS THE IMPORTANT LINE - MAKE SURE THIS EXISTS:
export default CardNav;