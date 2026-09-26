'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { buildWhatsAppMessage } from '@/lib/discounts';

// Updated WhatsApp number for store owner
const OWNER_PHONE = '917731962101';

function fmt(n) {
  return Math.round(n).toLocaleString('en-IN');
}

/** Shows the first product image; falls back to a styled text placeholder. */
function CartItemImage({ item }) {
  const [failed, setFailed] = useState(false);
  const src = item.images?.[0];

  if (src && !failed) {
    return (
      <div className="cart-item-image">
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Image
            src={src}
            alt={item.name}
            fill
            sizes="80px"
            style={{ objectFit: 'cover' }}
            onError={() => setFailed(true)}
          />
        </div>
      </div>
    );
  }

  const colours = {
    clothing: '#1a1014',
    footwear: '#0f1320',
    accessories: '#12101a',
    gadgets: '#0f172a',
  };
  const bg = colours[item.category] || '#1a1a1a';
  const initials = item.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="cart-item-image" style={{ background: bg }}>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '4px',
      }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.05em',
        }}>{initials}</span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.5rem',
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>{item.subcategory || item.category}</span>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    itemBreakdown,
    originalTotal,
    savingsByCategory,
    totalSavings,
    finalTotal,
    discountRates,
  } = useCart();

  // Customer Delivery Details State
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  // Validation: Name (2+ chars), Phone (10 digits), Address (5+ chars), PIN code (5-6 chars)
  const cleanPhone = customer.phone.replace(/\D/g, '');
  const isCustomerValid =
    customer.name.trim().length >= 2 &&
    cleanPhone.length >= 10 &&
    customer.address.trim().length >= 5 &&
    customer.pincode.trim().length >= 5;

  const handleCustomerChange = (field, val) => {
    setCustomer(prev => ({ ...prev, [field]: val }));
  };

  const handleWhatsApp = () => {
    if (!isCustomerValid) return;
    const totals = { originalTotal, savingsByCategory, totalSavings, finalTotal };
    const message = buildWhatsAppMessage(itemBreakdown, totals, discountRates, customer);
    const url = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} id="cart-drawer">
        <div className="cart-drawer-header">
          <h3>YOUR BAG ({totalQty})</h3>
          <button
            className="cart-drawer-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer-empty">
            <div className="cart-drawer-empty-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h4 className="cart-empty-title">Your shopping bag is empty</h4>
            <p className="cart-empty-subtitle">Discover our exclusive luxury collections and start shopping.</p>
            <button className="cart-empty-shop-btn" onClick={() => setIsOpen(false)}>
              <span>EXPLORE COLLECTIONS</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {itemBreakdown.map((item) => (
                <div className="cart-item" key={item.cartId}>
                  <CartItemImage item={item} />
                  <div className="cart-item-details">
                    <span className="cart-item-name">{item.name}</span>
                    {item.productCode && (
                      <span className="cart-item-code">Code: {item.productCode}</span>
                    )}
                    <span className="cart-item-meta">
                      {item.size ? `Size: ${item.size}` : ''}
                      {item.size && item.color ? '  |  ' : ''}
                      {item.color ? `Colour: ${item.color}` : ''}
                    </span>

                    {/* Price with dynamic discount */}
                    <div className="cart-item-price-row">
                      {item.rate > 0 ? (
                        <>
                          <span className="cart-item-price-original">₹{fmt(item.price)}</span>
                          <span className="cart-item-price-discounted">
                            ₹{fmt(item.price * (1 - item.rate))}
                          </span>
                          <span className="cart-item-discount-badge">
                            {Math.round(item.rate * 100)}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="cart-item-price-standard" style={{ fontWeight: 600 }}>
                          ₹{fmt(item.price)}
                        </span>
                      )}
                    </div>

                    <div className="cart-item-line-total">
                      Line total: ₹{fmt(item.discountedLineTotal)}
                      {item.saving > 0 && (
                        <span className="cart-item-line-saving"> (save ₹{fmt(item.saving)})</span>
                      )}
                    </div>

                    {/* Constraint badge for gadgets & limited stock */}
                    {(item.minOrderQuantity > 1 || (item.effectiveUpperLimit !== null && item.effectiveUpperLimit !== undefined)) && (
                      <div style={{
                        marginTop: '4px',
                        fontSize: '0.68rem',
                        color: '#475569',
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                      }}>
                        {item.minOrderQuantity > 1 ? `Min order: ${item.minOrderQuantity}` : ''}
                        {item.minOrderQuantity > 1 && item.effectiveUpperLimit ? ' · ' : ''}
                        {item.effectiveUpperLimit ? `Max: ${item.effectiveUpperLimit}` : ''}
                      </div>
                    )}
                  </div>

                  <div className="cart-item-actions">
                    <div className="cart-qty-control">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        disabled={item.quantity <= (item.minOrderQuantity || 1)}
                        style={{
                          cursor: item.quantity <= (item.minOrderQuantity || 1) ? 'not-allowed' : 'pointer',
                          opacity: item.quantity <= (item.minOrderQuantity || 1) ? 0.35 : 1,
                        }}
                        title={item.quantity <= (item.minOrderQuantity || 1) ? `Minimum required order is ${item.minOrderQuantity || 1}` : 'Decrease quantity'}
                      >−</button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        disabled={item.effectiveUpperLimit !== null && item.effectiveUpperLimit !== undefined && item.quantity >= item.effectiveUpperLimit}
                        style={{
                          cursor: (item.effectiveUpperLimit && item.quantity >= item.effectiveUpperLimit) ? 'not-allowed' : 'pointer',
                          opacity: (item.effectiveUpperLimit && item.quantity >= item.effectiveUpperLimit) ? 0.35 : 1,
                        }}
                        title={(item.effectiveUpperLimit && item.quantity >= item.effectiveUpperLimit) ? `Maximum order limit is ${item.effectiveUpperLimit}` : 'Increase quantity'}
                      >+</button>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeItem(item.cartId)}
                      style={{ marginTop: '4px' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* ── Customer Delivery Details Form ── */}
              <div className="cart-customer-section">
                <div className="cart-customer-header">
                  <div className="cart-customer-header-left">
                    <span className="cart-customer-icon">📍</span>
                    <span className="cart-customer-title">DELIVERY INFORMATION</span>
                  </div>
                  <span className={`cart-customer-badge ${isCustomerValid ? 'complete' : ''}`}>
                    {isCustomerValid ? '✓ DETAILS COMPLETE' : '* REQUIRED TO ORDER'}
                  </span>
                </div>

                <div className="cart-customer-fields">
                  {/* Slot 1: Full Name */}
                  <div className="cart-slot">
                    <div className="cart-slot-label-row">
                      <label className="cart-slot-label" htmlFor="cart-customer-name">Full Name *</label>
                      {customer.name.trim().length >= 2 && <span className="cart-slot-check">✓</span>}
                    </div>
                    <input
                      type="text"
                      className="cart-field-input"
                      value={customer.name}
                      onChange={(e) => handleCustomerChange('name', e.target.value)}
                      required
                      id="cart-customer-name"
                      autoComplete="name"
                    />
                  </div>

                  {/* Slot 2 & 3: WhatsApp Number + PIN Code */}
                  <div className="cart-slots-split">
                    {/* Phone Slot */}
                    <div className="cart-slot cart-slot-phone">
                      <div className="cart-slot-label-row">
                        <label className="cart-slot-label" htmlFor="cart-customer-phone">WhatsApp Number *</label>
                        {cleanPhone.length >= 10 && <span className="cart-slot-check">✓</span>}
                      </div>
                      <div className="cart-phone-input-wrap">
                        <span className="cart-phone-prefix">+91</span>
                        <input
                          type="tel"
                          className="cart-field-input cart-field-phone"
                          value={customer.phone}
                          onChange={(e) => handleCustomerChange('phone', e.target.value)}
                          maxLength={15}
                          required
                          id="cart-customer-phone"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    {/* PIN Code Slot */}
                    <div className="cart-slot cart-slot-pin">
                      <div className="cart-slot-label-row">
                        <label className="cart-slot-label" htmlFor="cart-customer-pincode">PIN Code *</label>
                        {customer.pincode.trim().length >= 5 && <span className="cart-slot-check">✓</span>}
                      </div>
                      <input
                        type="text"
                        className="cart-field-input"
                        maxLength={6}
                        value={customer.pincode}
                        onChange={(e) => handleCustomerChange('pincode', e.target.value)}
                        required
                        id="cart-customer-pincode"
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>

                  {/* Slot 4: Complete Address */}
                  <div className="cart-slot">
                    <div className="cart-slot-label-row">
                      <label className="cart-slot-label" htmlFor="cart-customer-address">Complete Address *</label>
                      {customer.address.trim().length >= 5 && <span className="cart-slot-check">✓</span>}
                    </div>
                    <textarea
                      className="cart-field-textarea"
                      rows={2}
                      value={customer.address}
                      onChange={(e) => handleCustomerChange('address', e.target.value)}
                      required
                      id="cart-customer-address"
                      autoComplete="street-address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bill Breakdown & Order Button ── */}
            <div className="cart-drawer-footer">
              <div className="cart-bill">
                <div className="cart-bill-row cart-bill-original">
                  <span>Original Total</span>
                  <span>₹{fmt(originalTotal)}</span>
                </div>

                {/* Per-category savings dynamically rendered */}
                {Object.entries(savingsByCategory).map(([cat, saving]) => {
                  if (saving <= 0) return null;
                  const rate = discountRates?.[cat] || 0;
                  const pct = Math.round(rate * 100);
                  const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
                  const label = pct > 0 ? `${catName} (${pct}% off)` : `${catName} Discount`;
                  return (
                    <div className="cart-bill-row cart-bill-saving-row" key={cat}>
                      <span>{label}</span>
                      <span className="cart-bill-saving-amount">−₹{fmt(saving)}</span>
                    </div>
                  );
                })}

                {totalSavings > 0 && (
                  <div className="cart-bill-row cart-bill-you-save">
                    <span>🎉 YOU SAVE</span>
                    <span>₹{fmt(totalSavings)}</span>
                  </div>
                )}

                <div className="cart-bill-divider" />

                <div className="cart-bill-row cart-bill-total">
                  <span>TOTAL</span>
                  <span>₹{fmt(finalTotal)}</span>
                </div>
              </div>

              {!isCustomerValid && (
                <div className="cart-validation-hint">
                  <span style={{ marginRight: '4px' }}>⚠️</span>
                  Please fill your Name, 10-digit Phone, Delivery Address &amp; PIN code above to activate WhatsApp Order.
                </div>
              )}

              {/* WhatsApp CTA — Activated only when customer details are filled */}
              <button
                className={`cart-whatsapp-btn ${!isCustomerValid ? 'disabled' : ''}`}
                id="cart-whatsapp-btn"
                onClick={handleWhatsApp}
                disabled={!isCustomerValid}
                aria-label="Send order on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {isCustomerValid ? 'Send Order on WhatsApp' : 'Enter Details to Send Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
