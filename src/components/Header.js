'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/fashion',      label: 'Fashion' },
    { href: '/gadgets',      label: 'Gadgets' },
    { href: '/contact',      label: 'Contact' },
  ];

  return (
    <header className="header" style={scrolled ? { background: 'rgba(13,13,13,0.98)' } : {}} id="site-header">

      {/* ── Row 1: logo + cart ── */}
      <div className="header-inner">
        <Link href="/" className="header-logo" id="brand-logo">
          <span>SKPLORE</span>
        </Link>

        {/* Desktop nav (hidden on mobile) */}
        <nav className="header-nav" aria-label="Main navigation">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="cart-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open cart"
            id="cart-button"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
        </div>
      </div>

      {/* ── Row 2: mobile-only nav bar ── */}
      <nav className="header-mobile-nav" aria-label="Mobile navigation">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname.startsWith(link.href) ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
