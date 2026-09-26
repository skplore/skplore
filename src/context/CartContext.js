'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  computeCartTotals,
  fetchDynamicDiscountPercentages,
  toDecimalRates,
  DEFAULT_DISCOUNT_PERCENTAGES,
  DEFAULT_DISCOUNT_RATES,
} from '@/lib/discounts';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [discountPercentages, setDiscountPercentages] = useState(DEFAULT_DISCOUNT_PERCENTAGES);
  const [discountRates, setDiscountRates] = useState(DEFAULT_DISCOUNT_RATES);

  // Load dynamic category discounts from Supabase Storage on mount
  useEffect(() => {
    fetchDynamicDiscountPercentages()
      .then((pcts) => {
        setDiscountPercentages(pcts);
        setDiscountRates(toDecimalRates(pcts));
      })
      .catch(() => {});
  }, []);

  const addItem = useCallback((product, size, color, quantity = null) => {
    // Determine dynamic ordering limits
    const minQty = Math.max(1, parseInt(product.minOrderQuantity, 10) || 1);
    const maxOrderQty = product.maxOrderQuantity ? parseInt(product.maxOrderQuantity, 10) : null;
    const stockQty = (product.stockQuantity !== null && product.stockQuantity !== undefined && product.stockQuantity !== '')
      ? parseInt(product.stockQuantity, 10)
      : null;

    let upperLimit = null;
    if (maxOrderQty !== null && stockQty !== null) {
      upperLimit = Math.min(maxOrderQty, stockQty);
    } else if (maxOrderQty !== null) {
      upperLimit = maxOrderQty;
    } else if (stockQty !== null) {
      upperLimit = stockQty;
    }

    const addQty = quantity !== null ? Math.max(minQty, parseInt(quantity, 10)) : minQty;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size && item.color === color
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        let newQty = currentQty + (quantity !== null ? addQty : 1);
        if (upperLimit !== null && newQty > upperLimit) {
          newQty = upperLimit;
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          minOrderQuantity: minQty,
          maxOrderQuantity: maxOrderQty,
          stockQuantity: stockQty,
          effectiveUpperLimit: upperLimit,
        };
        return updated;
      }

      let finalQty = addQty;
      if (upperLimit !== null && finalQty > upperLimit) {
        finalQty = upperLimit;
      }

      return [
        ...prev,
        {
          ...product,
          size,
          color,
          quantity: finalQty,
          minOrderQuantity: minQty,
          maxOrderQuantity: maxOrderQty,
          stockQuantity: stockQty,
          effectiveUpperLimit: upperLimit,
          cartId: Date.now(),
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((cartId) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId, desiredQty) => {
    setItems((prev) => {
      const item = prev.find((i) => i.cartId === cartId);
      if (!item) return prev;

      if (desiredQty <= 0) {
        return prev.filter((i) => i.cartId !== cartId);
      }

      const minQty = Math.max(1, parseInt(item.minOrderQuantity, 10) || 1);
      const upperLimit = item.effectiveUpperLimit !== undefined && item.effectiveUpperLimit !== null
        ? item.effectiveUpperLimit
        : null;

      let clampedQty = desiredQty;
      if (clampedQty < minQty) {
        clampedQty = minQty;
      }
      if (upperLimit !== null && clampedQty > upperLimit) {
        clampedQty = upperLimit;
      }

      return prev.map((i) =>
        i.cartId === cartId ? { ...i, quantity: clampedQty } : i
      );
    });
  }, []);

  // Compute all totals with dynamic category discounts
  const cartTotals = useMemo(
    () => computeCartTotals(items, discountRates),
    [items, discountRates]
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartTotals.originalTotal;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        subtotal,
        discountRates,
        discountPercentages,
        // Discount-aware totals
        originalTotal: cartTotals.originalTotal,
        savingsByCategory: cartTotals.savingsByCategory,
        totalSavings: cartTotals.totalSavings,
        finalTotal: cartTotals.finalTotal,
        itemBreakdown: cartTotals.itemBreakdown,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
