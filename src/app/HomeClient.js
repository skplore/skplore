'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap/dist/gsap';
import ProductCard from '@/components/ProductCard';
import { useAtmosphere } from '@/context/AtmosphereContext';
import { useCart } from '@/context/CartContext';
import { getDiscountBannerItems } from '@/lib/discounts';

/* ── Dynamic Animated Discount Banner ── */
function DiscountBanner() {
  const { discountPercentages } = useCart();
  const bannerItems = getDiscountBannerItems(discountPercentages);
  // Duplicate items so the scroll loops seamlessly
  const tickers = [...bannerItems, ...bannerItems, ...bannerItems, ...bannerItems];

  return (
    <div className="discount-banner" aria-label="Current promotions">
      <div className="discount-banner-label">OFFERS</div>
      <div className="discount-ticker-wrap">
        <div className="discount-ticker">
          {tickers.map((item, i) => (
            <div className="discount-ticker-item" key={i}>
              <span className="dt-emoji">{item.emoji}</span>
              <span className="dt-pct">{item.pct}</span>
              <span className="dt-desc">{item.desc}</span>
              <span className="dt-sep">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeClient({ featured, newArrivals }) {
  const heroRef = useRef(null);
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere('default');
  }, [setCurrentAtmosphere]);

  useEffect(() => {
    if (!heroRef.current) return;

    // Respect OS accessibility setting only
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set('.hero-badge, .hero h1, .hero-subtitle, .hero-cta-group', { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to('.hero-badge', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      });

      tl.to('.hero h1', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.3');

      tl.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.4');

      tl.to('.hero-cta-group', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }, '-=0.3');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const [clientParticles, setClientParticles] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClientParticles(Array.from({ length: 20 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${10 + Math.random() * 10}s`,
        width: `${1 + Math.random() * 3}px`,
        height: `${1 + Math.random() * 3}px`,
      })));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero" ref={heroRef} id="hero-section">
        <div className="hero-bg" />
        <div className="hero-particles">
          {clientParticles && clientParticles.map((p, i) => (
            <div
              key={i}
              className="hero-particle"
              style={p}
            />
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">Est. Hyderabad</div>
          <h1>
            SKPLORE
          </h1>
          <p className="hero-subtitle">
            Hyderabad&apos;s premier destination for curated fashion for men &amp; women, luxury footwear, and cutting-edge tech gadgets &amp; accessories
          </p>
          <div className="hero-cta-group">
            <Link href="/fashion" className="btn-magnetic">
              EXPLORE FASHION
            </Link>
            <Link href="/gadgets" className="btn-magnetic btn-magnetic--outline" style={{ borderColor: '#fff', color: '#fff' }}>
              EXPLORE GADGETS
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span>SCROLL</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="14" height="22" rx="7"/>
            <circle cx="8" cy="8" r="2" fill="currentColor">
              <animate attributeName="cy" values="8;16;8" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>
      </section>

      {/* DISCOUNT BANNER */}
      <DiscountBanner />

      {/* ATMOSPHERES - 2 WORLDS: FASHION & GADGETS */}
      <section className="atmospheres-section" id="atmospheres">
        <div className="container">
          <h2 className="section-title">EXPLORE OUR WORLDS</h2>
          <div className="atmospheres-grid atmospheres-grid--two">
            <Link href="/fashion" className="atmosphere-card">
              <div className="atmosphere-card-bg" style={{
                backgroundImage: 'url(/images/fashion_atmosphere_v2.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              <div className="atmosphere-card-overlay" />
              <div className="atmosphere-card-content">
                <span className="atmosphere-card-badge">COLLECTION</span>
                <h3 className="atmosphere-card-title">FASHION</h3>
                <p className="atmosphere-card-desc">Men &amp; Women · Clothing · Footwear · Luxury Accessories</p>
                <span className="atmosphere-card-link">ENTER WORLD &rarr;</span>
              </div>
            </Link>

            <Link href="/gadgets" className="atmosphere-card">
              <div className="atmosphere-card-bg" style={{
                backgroundImage: 'url(/images/gadgets_world_v2.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              <div className="atmosphere-card-overlay" />
              <div className="atmosphere-card-content">
                <span className="atmosphere-card-badge">TECH &amp; GEAR</span>
                <h3 className="atmosphere-card-title">GADGETS</h3>
                <p className="atmosphere-card-desc">Phone Cases · Screen Guards · Sound Systems · Smart Gear</p>
                <span className="atmosphere-card-link">ENTER WORLD &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="trending-section" id="trending">
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>TRENDING NOW</h2>
          <div className="products-grid">
            {featured.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} hideColorThumbs />
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="products-section" id="new-arrivals">
        <div className="container">
          <h2 className="section-title">NEW ARRIVALS</h2>
          <div className="products-grid">
            {newArrivals.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} hideColorThumbs />
            ))}
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="brand-story" id="brand-story">
        <div className="container">
          <div className="brand-story-grid">
            {/* Visual FIRST on all screen sizes */}
            <div className="brand-story-visual" style={{ position: 'relative' }}>
              <Image
                src="/images/brand_story_v2.jpg"
                alt="Skplore — Born in the City of Pearls, Hyderabad"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
            {/* Content below / on right */}
            <div className="brand-story-content">
              <h2>BORN IN THE <span className="accent-text">CITY OF PEARLS</span></h2>
              <p>
                From the historic grandeur of the Charminar to the soaring modern pulse of 
                HITEC City, Skplore was founded with a singular ambition: to create 
                Hyderabad&apos;s most distinctive destination for modern lifestyle. 
                We unite high-end fashion for both men and women with next-generation tech gadgets 
                and premium accessories under one visionary roof.
              </p>
              <p>
                Every garment, pair of shoes, handcrafted accessory, and cutting-edge tech gear 
                in our collection is curated with the dynamic spirit of Hyderabad—a seamless blend 
                of timeless elegance, futuristic innovation, and everyday sophistication. 
                Whether you are refining your personal wardrobe or elevating your digital gear, 
                Skplore delivers luxury crafted for how you live today.
              </p>
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <a
                  href="https://www.google.com/maps/search/Skplore+Hyderabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-magnetic"
                >
                  VISIT OUR STORE
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
