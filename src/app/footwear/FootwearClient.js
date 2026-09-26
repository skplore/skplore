'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAtmosphere } from '@/context/AtmosphereContext';

export default function FootwearClient() {
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere('footwear');
  }, [setCurrentAtmosphere]);

  return (
    <section className="split-hero" id="footwear-hero">
      <Link href="/footwear/men" className="split-half">
        <div
          className="split-half-bg"
          style={{
            backgroundImage: 'url(/images/mens-footwear-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="split-half-overlay" />
        <div className="split-half-content">
          <h2>SHOP MEN</h2>
          <p>Casual · Funky · Sports</p>
          <span className="btn-magnetic" style={{ marginTop: '16px', display: 'inline-block' }}>
            EXPLORE
          </span>
        </div>
      </Link>

      <Link href="/footwear/women" className="split-half">
        <div
          className="split-half-bg"
          style={{
            backgroundImage: 'url(/images/womens-footwear-hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="split-half-overlay" />
        <div className="split-half-content">
          <h2>SHOP WOMEN</h2>
          <p>Casual · Funky · Sports</p>
          <span className="btn-magnetic" style={{ marginTop: '16px', display: 'inline-block' }}>
            EXPLORE
          </span>
        </div>
      </Link>
    </section>
  );
}
