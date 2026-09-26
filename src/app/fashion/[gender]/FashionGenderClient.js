'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { useAtmosphere } from '@/context/AtmosphereContext';

export default function FashionGenderClient({ products, tabs, gender }) {
  const [activeTab, setActiveTab] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere(activeTab === 'footwear' ? 'footwear' : activeTab === 'accessories' ? 'accessories' : 'clothing');
  }, [activeTab, setCurrentAtmosphere]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setActiveSubTab('all');
    setVisibleCount(20);
  };

  // Filter products by category tab
  const categoryFiltered = activeTab === 'all'
    ? products
    : products.filter(p => p.category === activeTab);

  // Available subcategories for the active tab
  const subcategories = activeTab === 'all' 
    ? [] 
    : [...new Set(categoryFiltered.map(p => p.subcategory).filter(Boolean))];

  // Further filter by subcategory if selected
  const filtered = activeSubTab === 'all'
    ? categoryFiltered
    : categoryFiltered.filter(p => p.subcategory === activeSubTab);

  const title = gender === 'men' ? "MEN'S FASHION" : "WOMEN'S FASHION";
  const heroBg = gender === 'men'
    ? 'linear-gradient(135deg, rgba(20,20,30,0.92) 0%, rgba(13,13,13,0.95) 100%), url(/images/fashion-men-hero.png)'
    : 'linear-gradient(135deg, rgba(35,15,30,0.92) 0%, rgba(13,13,13,0.95) 100%), url(/images/fashion-women-hero.png)';

  return (
    <>
      <section className="category-hero" id="fashion-hero" style={{
        backgroundImage: heroBg,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        position: 'relative',
      }}>
        <div className="category-hero-content">
          <div className="category-badge" style={{
            display: 'inline-block',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--color-gold)',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
            HYDERABAD CURATED
          </div>
          <h1>{title}</h1>
          <p>Clothes · Footwear · Luxury Accessories</p>
        </div>
      </section>

      <section className="products-section" id="fashion-products">
        <div className="container">
          {/* Main aggregation tabs: All | Clothing | Footwear | Accessories */}
          <div className="category-tabs" style={{ marginBottom: subcategories.length > 0 ? '16px' : '32px' }}>
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

          {/* Subcategory pills if available */}
          {subcategories.length > 1 && (
            <div className="subcategory-pills">
              <button
                className={`subcategory-pill ${activeSubTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('all')}
              >
                All {activeTab}
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub}
                  className={`subcategory-pill ${activeSubTab === sub ? 'active' : ''}`}
                  onClick={() => setActiveSubTab(sub)}
                >
                  {sub.replace('-', ' ')}
                </button>
              ))}
            </div>
          )}

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
              No items found in this section yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
