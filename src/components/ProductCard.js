'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { generatePlaceholder } from '@/lib/imageUtils';

// Placeholder gradient for missing images
function getPlaceholderGradient(id, index = 0) {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue1 = (hash + index * 47) % 360;
  const hue2 = (hash * 7 + index * 31) % 360;
  return `linear-gradient(${135 + index * 45}deg, hsl(${hue1}, 25%, 85%) 0%, hsl(${hue2}, 20%, 75%) 100%)`;
}

// Short label for colour name (truncate to ~7 chars for small thumb label)
function shortName(name) {
  if (name.length <= 8) return name;
  const first = name.split('/')[0].trim();
  return first.length <= 8 ? first : first.slice(0, 7) + '…';
}

export default function ProductCard({ product, hideColorThumbs = false }) {
  const { addItem } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());
  const cardRef = useRef(null);
  const touchStartX = useRef(null);

  const images = product.images || [];
  const colorImages = product.colorImages || {};
  const hasMultipleImages = images.length > 1;
  const colors = product.colors || [];

  // Only colours that have a mapped image index are shown as thumbnails
  const colorEntries = colors
    .map(c => ({ color: c, idx: colorImages[c] }))
    .filter(e => e.idx !== undefined && images[e.idx]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    setActiveIndex(Math.max(0, Math.min(idx, images.length - 1)));
  }, [images.length]);

  const goPrev = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goNext = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // ── Touch swipe ──────────────────────────────────────────────────────────
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0
        ? setActiveIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
        : setActiveIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }
    touchStartX.current = null;
  };

  // ── Colour thumb click ───────────────────────────────────────────────────
  const handleColorThumbClick = useCallback((e, idx) => {
    e.preventDefault(); e.stopPropagation();
    goTo(idx);
  }, [goTo]);

  // ── Quick add ────────────────────────────────────────────────────────────
  const handleQuickAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    addItem(product, product.sizes?.[0] || 'One Size', product.colors?.[0] || '', product.minOrderQuantity || 1);
  };

  const handleImageError = useCallback((index) => {
    setFailedImages(prev => { const n = new Set(prev); n.add(index); return n; });
  }, []);

  // ── Image renderer ───────────────────────────────────────────────────────
  const renderImage = (index) => {
    const src = images[index];
    const hasFailed = failedImages.has(index);
    if (src && !hasFailed) {
      const altText = index === 0
        ? `${product.name} by ${product.brand || 'Skplore'} - Buy in Hyderabad`
        : `${product.name} - ${product.brand || 'Skplore'} photo ${index + 1}`;
      return (
        <Image
          src={src}
          alt={altText}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          quality={85}
          placeholder="blur"
          blurDataURL={generatePlaceholder(product.category)}
          style={{ objectFit: 'cover' }}
          onError={() => handleImageError(index)}
          draggable={false}
        />
      );
    }
    return (
      <div style={{
        width: '100%', height: '100%',
        background: getPlaceholderGradient(product.id, index),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'rgba(0,0,0,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {product.subcategory}
        </span>
      </div>
    );
  };

  // ── Colour thumbnail renderer ────────────────────────────────────────────
  const renderColorThumb = (imgIndex, colorName) => {
    const src = images[imgIndex];
    const hasFailed = failedImages.has(imgIndex);
    if (src && !hasFailed) {
      return (
        <Image
          src={src}
          alt={colorName}
          fill
          sizes="60px"
          style={{ objectFit: 'cover' }}
          onError={() => handleImageError(imgIndex)}
          draggable={false}
        />
      );
    }
    return (
      <div style={{ width: '100%', height: '100%', background: getPlaceholderGradient(product.id, imgIndex) }} />
    );
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card"
      id={`product-${product.id}`}
      ref={cardRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* ── Main carousel image ─────────────────────────────────────────── */}
      <div
        className="product-card-image"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {product.badge && <span className="product-card-badge">{product.badge}</span>}
        {product.minOrderQuantity > 1 && (
          <span
            className="product-card-badge"
            style={{
              left: product.badge ? 'auto' : '10px',
              right: product.badge ? '10px' : 'auto',
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '0.62rem',
              letterSpacing: '0.08em',
            }}
          >
            MIN ORDER: {product.minOrderQuantity}
          </span>
        )}

        {/* Stacked image layers */}
        <div className="product-card-image-stack">
          {images.length > 0 ? (
            images.map((_, i) => (
              <div key={i} className={`product-card-layer ${i === activeIndex ? 'active' : ''}`}>
                {renderImage(i)}
              </div>
            ))
          ) : (
            <div className="product-card-layer active">{renderImage(0)}</div>
          )}
        </div>

        {/* ← → arrows on hover (desktop only) */}
        {hasMultipleImages && isHovering && (
          <>
            <button className="pc-arrow pc-arrow--left" onClick={goPrev} aria-label="Previous image">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="pc-arrow pc-arrow--right" onClick={goNext} aria-label="Next image">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </>
        )}

        {/* Dots — only shown when no colour thumbs */}
        {hasMultipleImages && colorEntries.length === 0 && (
          <div className="pc-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`pc-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Desktop: slide-up Quick Add bar on hover */}
        <button className="product-card-quick-add product-card-quick-add--bar" onClick={handleQuickAdd}>
          {product.minOrderQuantity > 1 ? `Quick Add (${product.minOrderQuantity} pcs)` : 'Quick Add'}
        </button>

        {/* Mobile: persistent small cart icon (always visible, bottom-right) */}
        <button
          className="product-card-cart-icon"
          onClick={handleQuickAdd}
          aria-label="Add to bag"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </button>
      </div>

      {/* ── Product info ─────────────────────────────────────────────────── */}
      <div className="product-card-info">
        <div className="product-card-brand">{product.brand}</div>
        <div className="product-card-name">{product.name}</div>
        <div className="product-card-price">
          ₹{product.price.toLocaleString()}
          {product.originalPrice && (
            <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        {product.minOrderQuantity > 1 && (
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--color-crimson)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            marginTop: '2px',
          }}>
            Min Order: {product.minOrderQuantity} units
          </div>
        )}
        {product.productCode && (
          <div className="product-card-code">#{product.productCode}</div>
        )}
      </div>

      {/* ── Colour image thumbnails (hidden on home page) ─────────────────── */}
      {!hideColorThumbs && colorEntries.length > 0 && (
        <div className="pc-color-thumbs">
          {colorEntries.map(({ color, idx }) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={color}
                className={`pc-color-thumb ${isActive ? 'active' : ''}`}
                onClick={(e) => handleColorThumbClick(e, idx)}
                title={color}
                aria-label={`View ${color}`}
              >
                <div className="pc-color-thumb-img">
                  {renderColorThumb(idx, color)}
                </div>
                <span className="pc-color-thumb-label">{shortName(color)}</span>
              </button>
            );
          })}
        </div>
      )}
    </Link>
  );
}
