'use client';

import React, { useState, useEffect } from 'react';
import { DigitalProduct, Order } from '@/lib/types';
import ProductCard from './ProductCard';
import { useToast } from './Toast';
import { useAuth } from './AuthContext';
import { ShoppingBag, Star, Download, ShieldCheck } from 'lucide-react';

interface ProductStoreProps {
  initialProducts: DigitalProduct[];
  purchasedProductIds: string[];
}

const CATEGORIES = ['All', 'Templates', 'Wallpapers', 'Tools', 'Bundles'];

export default function ProductStore({ initialProducts, purchasedProductIds }: ProductStoreProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  // States
  const [products] = useState<DigitalProduct[]>(initialProducts);
  const [purchasedIds, setPurchasedIds] = useState<string[]>(purchasedProductIds);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [downloadLinks, setDownloadLinks] = useState<{ [productId: string]: string }>({});

  // Load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };

  // Trigger Razorpay Checkout for Digital Product
  const handleBuyProduct = async (product: DigitalProduct) => {
    if (!user) {
      showToast('error', 'Auth Required', 'Please sign in to buy digital products.');
      return;
    }

    try {
      showToast('info', 'Connecting Checkout...', `Setting up secure pipeline for ${product.name}.`);
      await loadRazorpay();

      // 1. Create Razorpay order on our backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price_inr,
          productId: product.id,
          userId: user.id
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initialize order');
      }

      // 2. Setup options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: product.price_inr * 100, // paise
        currency: 'INR',
        name: 'TheFanSeason Store 2026',
        description: product.name,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          showToast('info', 'Confirming Payment...', 'Verifying digital asset purchase.');

          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...response,
              productId: product.id,
              userId: user.id,
              amountInr: product.price_inr,
              isMock: orderData.isMock
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            showToast('success', 'Purchase Complete! 🎉', `${product.name} has been added to your vault.`);
            setPurchasedIds(prev => [...prev, product.id]);
          } else {
            showToast('error', 'Verification Failed', verifyData.error || 'Signature verification error.');
          }
        },
        prefill: {
          name: user.email?.split('@')[0] || 'Fan',
          email: user.email || '',
        },
        theme: { color: '#00C853' }
      };

      // 3. Open Razorpay Dialog (mock if local dev/placeholders)
      if (orderData.isMock) {
        setTimeout(() => {
          options.handler({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_signature'
          });
        }, 1000);
      } else {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Checkout Interrupted', err.message || 'Payment pipeline failed.');
    }
  };

  // Fetch download URL secure link from API
  const handleDownload = async (productId: string) => {
    // If we already resolved the download url, redirect to it immediately
    if (downloadLinks[productId]) {
      window.open(downloadLinks[productId], '_blank');
      return;
    }

    try {
      showToast('info', 'Generating Download Link', 'Acquiring authorized file access token.');

      const res = await fetch(`/api/products/download/${productId}`);
      const data = await res.json();

      if (!res.ok || !data.downloadUrl) {
        throw new Error(data.error || 'Failed to acquire download URL');
      }

      // Cache the download URL locally
      setDownloadLinks(prev => ({ ...prev, [productId]: data.downloadUrl }));
      window.open(data.downloadUrl, '_blank');
      showToast('success', 'Download Initiated!', 'Redirecting to your file path.');
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Download Failed', err.message || 'Verification or storage link generation error.');
    }
  };

  // Filter products by category
  const filteredProducts = products.filter(
    p => selectedCategory === 'All' || p.category === selectedCategory
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full select-none">

      {/* Category Toggles Panel */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border-dark/60 pb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-all border ${selectedCategory === cat
                ? 'border-gaming-green bg-gaming-green/10 text-gaming-green shadow-[0_0_10px_rgba(0,200,83,0.15)]'
                : 'border-border-dark text-text-muted hover:border-gaming-green/20 hover:text-white'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isPurchased = purchasedIds.includes(product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                isPurchased={isPurchased}
                downloadUrl={isPurchased ? '#' : undefined}
                onBuy={isPurchased ? () => handleDownload(product.id) : handleBuyProduct}
              />
            );
          })}
        </div>
      ) : (
        <div className="gaming-panel rounded-2xl p-12 text-center border-dashed border-border-dark/80 max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-text-muted mx-auto mb-3 animate-pulse" />
          <h4 className="text-sm font-black uppercase text-white font-mono tracking-widest">
            Category Empty
          </h4>
          <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-wider">
            Check back later for newly published digital assets!
          </p>
        </div>
      )}
    </div>
  );
}
