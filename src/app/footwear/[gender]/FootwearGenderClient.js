'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useAtmosphere } from '@/context/AtmosphereContext';

export default function FootwearGenderClient({ products, tabs, gender }) {
  const [activeTab, setActiveTab] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere('footwear');
  }, [setCurrentAtmosphere]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setVisibleCount(20);
  };

  const filtered = activeTab === 'all'
    ? products
    : products.filter(p => p.subcategory === activeTab);

  const title = gender === 'men' ? "MEN'S FOOTWEAR" : "WOMEN'S FOOTWEAR";

  return (
    <>
      <section className="category-hero" id="footwear-hero">
        <div className="category-hero-bg" style={{
          background: gender === 'men'
            ? 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #E74C3C 100%)'
            : 'linear-gradient(135deg, #2C1654 0%, #1A1A2E 50%, #E84393 100%)',
        }} />
        <div className="category-hero-content">
          <h1>{title}</h1>
          <p>Step into your style</p>
        </div>
      </section>

      <section className="products-section" id="footwear-products">
        <div className="container">
          <div className="category-tabs">
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
              No products found
            </div>
          )}
        </div>
      </section>
    </>
  );
}
