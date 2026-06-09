'use client';

import React from 'react';
import { DigitalProduct } from '@/lib/types';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: DigitalProduct;
  onBuy: (product: DigitalProduct) => void;
  isPurchased?: boolean;
  downloadUrl?: string;
}

export default function ProductCard({ product, onBuy, isPurchased, downloadUrl }: ProductCardProps) {
  return (
    <div className="gaming-panel rounded-xl overflow-hidden transition-all duration-300 hover:border-gaming-green/40 flex flex-col h-full group">
      {/* Product Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={product.preview_image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-[#0a0a0c]/80 backdrop-blur border border-border-dark text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider text-gaming-neon">
          {product.category}
        </span>
      </div>

      {/* Details Area */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-gaming-green transition-colors line-clamp-1 font-mono">
          {product.name}
        </h3>

        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed flex-1">
          {product.description || 'Exclusive digital fan asset for  World Cup 2026.'}
        </p>

        {/* Action Panel */}
        <div className="flex items-center justify-between border-t border-border-dark/40 pt-3 mt-2">
          {/* Price tag */}
          <div className="flex flex-col">
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Price</span>
            <span className="text-sm font-black font-mono text-white">
              ${product.price_inr}
            </span>
          </div>

          {/* Trigger button */}
          {isPurchased && downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-gaming-green text-black font-black text-[10px] uppercase tracking-wider hover:bg-gaming-green/90 transition-colors flex items-center gap-1 shadow-[0_0_8px_rgba(0,200,83,0.3)]"
            >
              Download
              <ArrowRight className="w-3 h-3 shrink-0" />
            </a>
          ) : (
            <button
              onClick={() => onBuy(product)}
              className="px-3.5 py-1.5 rounded-lg btn-gaming-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
            >
              Buy Now
              <ShoppingBag className="w-3 h-3 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
