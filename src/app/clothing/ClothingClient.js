'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { useAtmosphere } from '@/context/AtmosphereContext';

export default function ClothingClient({ allProducts, tabs }) {
  const [activeTab, setActiveTab] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere('clothing');
  }, [setCurrentAtmosphere]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setVisibleCount(20);
  };

  const products = activeTab === 'all'
    ? allProducts
    : allProducts.filter(p => p.subcategory === activeTab);

  return (
    <>
      <section className="category-hero" id="clothing-hero">
        <div className="category-hero-bg" style={{ background: '#1A1A1A' }}>
          <Image
            src="/images/clothing_hero.png"
            alt="Men's Clothing Collection at Skplore Hyderabad"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center top', opacity: 0.55 }}
          />
        </div>
        <div className="category-hero-content">
          <h1>MEN&apos;S CLOTHING</h1>
          <p>Urban sophistication meets timeless style</p>
        </div>
      </section>

      <section className="products-section" id="clothing-products">
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
            {products.slice(0, visibleCount).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {visibleCount < products.length && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button 
                className="btn-magnetic" 
                onClick={() => setVisibleCount(prev => prev + 20)}
              >
                LOAD MORE
              </button>
            </div>
          )}

          {products.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'var(--color-gray-300)',
              fontFamily: 'var(--font-subheading)',
              fontStyle: 'italic',
            }}>
              No products found in this category
            </div>
          )}
        </div>
      </section>
    </>
  );
}
