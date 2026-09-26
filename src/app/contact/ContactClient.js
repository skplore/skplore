'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAtmosphere } from '@/context/AtmosphereContext';

export default function ContactClient() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const { setCurrentAtmosphere } = useAtmosphere();

  useEffect(() => {
    setCurrentAtmosphere('default');
  }, [setCurrentAtmosphere]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <section className="category-hero" id="contact-hero">
        <div className="category-hero-bg" style={{ background: '#1A1A1A' }}>
          <Image
            src="/images/contact_hero_v2.jpg"
            alt="Skplore Hyderabad — Get In Touch"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.5 }}
          />
        </div>
        <div className="category-hero-content">
          <h1>GET IN TOUCH</h1>
          <p>Visit us at the heart of Hyderabad</p>
        </div>
      </section>

      <section className="contact-section" id="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.8rem',
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                LEAVE A FEEDBACK
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '0.95rem',
                  color: 'var(--color-gray-400)',
                  fontStyle: 'italic',
                  marginBottom: '32px',
                }}
              >
                We&apos;d love to hear from you. Reach out for inquiries, orders, or just to say hello.
              </p>

              {submitted ? (
                <div
                  style={{
                    padding: '40px',
                    background: 'rgba(39,174,96,0.08)',
                    border: '1px solid rgba(39,174,96,0.3)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✓</div>
                  <p style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>
                    MESSAGE SENT SUCCESSFULLY
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-gray-400)', marginTop: '4px' }}>
                    We&apos;ll get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="contact-form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="phone">Phone / WhatsApp</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you're looking for..."
                    />
                  </div>
                  <button type="submit" className="btn-magnetic" style={{ width: '100%' }} id="contact-submit">
                    SEND MESSAGE
                  </button>
                </form>
              )}
            </div>

            {/* Map & Details */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.8rem',
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                OUR STORE
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '0.95rem',
                  color: 'var(--color-gray-400)',
                  fontStyle: 'italic',
                  marginBottom: '32px',
                }}
              >
                Come experience premium fashion &amp; gadgets in person
              </p>

              {/* Google Maps Embed */}
              <iframe
                className="contact-map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.039620587847!2d78.4335!3d17.4156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDI0JzU2LjIiTiA3OMKwMjYnMDAuNiJF!5e0!3m2!1sen!2sin!4v1"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Skplore Store Location - Banjara Hills Road No 12 Hyderabad"
                id="store-map"
                style={{ marginBottom: '32px' }}
              />

              {/* Address + Phone */}
              <div className="contact-store-row">
                {/* Address */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-crimson)"
                    strokeWidth="2"
                    style={{ flexShrink: 0, marginTop: '2px' }}
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <strong style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
                      SKPLORE
                    </strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-400)', lineHeight: 1.8, marginTop: '4px' }}>
                      Banjara Hills, Road No. 12,<br />
                      Near City Center,<br />
                      Hyderabad – 500034<br />
                      Telangana
                    </p>
                  </div>
                </div>

                {/* Phone + WhatsApp */}
                <div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--color-crimson)"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div>
                      <a
                        href="tel:+917731962101"
                        style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.1em', fontSize: '1.1rem' }}
                      >
                        77319 62101
                      </a>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>Call &amp; WhatsApp</p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/917731962101?text=Hi Skplore! I'd like to visit your store."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-magnetic"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#25D366',
                      borderColor: '#25D366',
                      marginTop: '8px',
                    }}
                    id="contact-whatsapp"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WHATSAPP US
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
