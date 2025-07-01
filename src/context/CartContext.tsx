
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from './LanguageContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('scout-cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('scout-cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (product: Product, size?: string) => {
    setCartItems(prevItems => {
      const itemIdentifier = size ? `${product.id}-${size}` : product.id;
      const existingItem = prevItems.find(item => (item.size ? `${item.id}-${item.size}` : item.id) === itemIdentifier);

      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item =>
          (item.size ? `${item.id}-${item.size}` : item.id) === itemIdentifier
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new item to cart
      return [...prevItems, { ...product, quantity: 1, size }];
    });
    toast({
        title: t('cart.addedTitle'),
        description: t('cart.addedDescription'),
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
