'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAtmosphere } from '@/context/AtmosphereContext';

export default function FashionPage() {
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere('clothing');
  }, [setCurrentAtmosphere]);

  return (
    <section className="split-hero" id="fashion-hero">
      <Link href="/fashion/men" className="split-half">
        <div className="split-half-bg" style={{
          backgroundImage: 'url(/images/fashion-men-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="split-half-overlay" />
        <div className="split-half-content">
          <h2>SHOP MEN</h2>
          <p>Clothing · Footwear · Accessories</p>
          <span className="btn-magnetic" style={{ marginTop: '16px', display: 'inline-block' }}>
            EXPLORE MEN
          </span>
        </div>
      </Link>

      <Link href="/fashion/women" className="split-half">
        <div className="split-half-bg" style={{
          backgroundImage: 'url(/images/fashion-women-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="split-half-overlay" />
        <div className="split-half-content">
          <h2>SHOP WOMEN</h2>
          <p>Clothing · Footwear · Accessories</p>
          <span className="btn-magnetic" style={{ marginTop: '16px', display: 'inline-block' }}>
            EXPLORE WOMEN
          </span>
        </div>
      </Link>
    </section>
  );
}
