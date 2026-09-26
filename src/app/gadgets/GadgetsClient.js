'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useAtmosphere } from '@/context/AtmosphereContext';

export default function GadgetsClient({ products, tabs }) {
  const [activeTab, setActiveTab] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere('gadgets');
  }, [setCurrentAtmosphere]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setVisibleCount(20);
  };

  const filtered = activeTab === 'all'
    ? products
    : products.filter(p => p.subcategory === activeTab || p.subcategory?.includes(activeTab));

  return (
    <>
      <section className="category-hero category-hero--light" id="gadgets-hero" style={{
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(250,250,250,0.96) 100%), url(/images/gadgets_hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div className="category-hero-content">
          <div className="category-badge" style={{
            display: 'inline-block',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--color-crimson)',
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            NEXT-GEN TECH ESSENTIALS
          </div>
          <h1 style={{ color: '#0f172a' }}>GADGETS &amp; TECH GEAR</h1>
          <p style={{ color: '#475569' }}>Phone Cases · 9H Screen Guards · Sound Systems · Smart Accessories</p>
        </div>
      </section>

      <section className="products-section" id="gadgets-products">
        <div className="container">
          {/* Subcategory filter tabs */}
          <div className="category-tabs" style={{ marginBottom: '32px' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`category-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="products-grid">
            {filtered.slice(0, visibleCount).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button 
                className="btn-magnetic" 
                onClick={() => setVisibleCount(prev => prev + 20)}
              >
                LOAD MORE
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'var(--color-gray-300)',
              fontFamily: 'var(--font-subheading)',
              fontStyle: 'italic',
            }}>
              No gadgets found in this category yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
