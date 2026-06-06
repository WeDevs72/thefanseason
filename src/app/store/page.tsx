import React from 'react';
import { createServerComponentClient } from '@/lib/supabase-server';
import ProductStore from '@/components/ProductStore';
import { DigitalProduct } from '@/lib/types';

export const revalidate = 0; // Fresh products/purchases always

export default async function StorePage() {
  const supabase = createServerComponentClient();

  // 1. Fetch user session
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch all active products
  const { data: productsData } = await supabase
    .from('digital_products')
    .select('*')
    .eq('is_active', true);

  const products: DigitalProduct[] = (productsData as DigitalProduct[]) || [];

  // 3. Fetch list of purchased product IDs for current user
  let purchasedProductIds: string[] = [];
  if (user) {
    const { data: paidOrders } = await supabase
      .from('orders')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('status', 'paid');

    if (paidOrders) {
      purchasedProductIds = paidOrders
        .map(o => o.product_id)
        .filter((id): id is string => !!id);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Title Header */}
      <section className="bg-[#070709] border-b border-border-dark py-6 text-center select-none">
        <h1 className="text-xl sm:text-2xl font-mono font-black tracking-widest text-white uppercase">
          🛒 DIGITAL PRODUCTS STORE
        </h1>
        <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-wider">
          Acquire exclusive World Cup spreadsheets, tactics strategy booklets, and themed wallpaper sets.
        </p>
      </section>

      {/* Interactive Shop Grid */}
      <ProductStore initialProducts={products} purchasedProductIds={purchasedProductIds} />
    </div>
  );
}
