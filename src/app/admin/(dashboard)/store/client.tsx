'use client';

import React, { useState } from 'react';
import { Plus, X, Eye, EyeOff, Trash2, ShoppingBag, Upload } from 'lucide-react';

const CATEGORIES = ['Templates', 'Wallpapers', 'Tools', 'Bundles'] as const;
type Category = typeof CATEGORIES[number];

const defaultForm = {
  name: '',
  description: '',
  price_inr: '',
  category: 'Templates' as Category,
  file_url: '',
  preview_image: '',
};

const statusColors: Record<string, string> = {
  paid: 'text-gaming-green border-gaming-green/30 bg-gaming-green/10',
  pending: 'text-gaming-gold border-gaming-gold/30 bg-gaming-gold/10',
  failed: 'text-red-400 border-red-800/50 bg-red-950/30',
};

export default function AdminStoreClient({
  initialProducts,
  initialOrders,
}: {
  initialProducts: any[];
  initialOrders: any[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [orders] = useState(initialOrders);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [addLoading, setAddLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // File Upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [manualFileUrl, setManualFileUrl] = useState(false);
  const [manualPreviewUrl, setManualPreviewUrl] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'file_url' | 'preview_image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'file_url') {
      setUploadingFile(true);
    } else {
      setUploadingPreview(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.fileUrl) {
        setForm(prev => ({ ...prev, [field]: data.fileUrl }));
        showToast('success', `Uploaded ${file.name}!`);
      } else {
        showToast('error', data.error || 'Failed to upload file');
      }
    } catch (err) {
      showToast('error', 'An error occurred during upload.');
    } finally {
      if (field === 'file_url') {
        setUploadingFile(false);
      } else {
        setUploadingPreview(false);
      }
    }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price_inr || !form.category) return;
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price_inr: Number(form.price_inr) }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(prev => [data.product, ...prev]);
        setForm(defaultForm);
        setManualFileUrl(false);
        setManualPreviewUrl(false);
        setShowAddForm(false);
        showToast('success', 'Product created!');
      } else {
        showToast('error', data.error || 'Failed to create product');
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleActive = async (productId: string, current: boolean) => {
    setToggleLoading(productId);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, is_active: !current }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_active: !current } : p));
        showToast('success', `Product ${!current ? 'activated' : 'deactivated'}.`);
      }
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast('success', 'Product deleted.');
      }
    } catch {
      showToast('error', 'Delete failed.');
    }
  };

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum: number, o: any) => sum + (o.amount_inr || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider shadow-xl border ${
          toast.type === 'success' ? 'bg-gaming-green/10 border-gaming-green/30 text-gaming-green' : 'bg-red-950/50 border-red-800/50 text-red-400'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-mono font-black uppercase tracking-widest text-white">
            Store <span className="text-gaming-gold">Management</span>
          </h1>
          <p className="text-[11px] text-text-muted font-bold mt-1 uppercase tracking-wider">
            {products.length} products · ${totalRevenue.toLocaleString()} revenue
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg btn-gaming-primary text-xs font-black uppercase"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="gaming-panel rounded-xl border border-gaming-gold/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-black uppercase tracking-widest text-gaming-gold">New Product</h2>
            <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleAddProduct} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="World Cup Templates Pack" className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white placeholder-text-muted focus:outline-none focus:border-gaming-gold/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Price (USD) *</label>
              <input type="number" value={form.price_inr} onChange={e => setForm(f => ({ ...f, price_inr: e.target.value }))}
                placeholder="10" className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white placeholder-text-muted focus:outline-none focus:border-gaming-gold/50" />
            </div>
            <div>
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white focus:outline-none focus:border-gaming-gold/50">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-[10px] text-text-muted font-bold uppercase block mb-1">Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="A collection of..." className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white placeholder-text-muted focus:outline-none focus:border-gaming-gold/50" />
            </div>
            {/* Product File Upload / URL */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Product File (ZIP, PDF, XLSX) *</label>
                <button
                  type="button"
                  onClick={() => setManualFileUrl(!manualFileUrl)}
                  className="text-[9px] text-gaming-gold hover:underline font-bold uppercase"
                >
                  {manualFileUrl ? 'Switch to Upload' : 'Enter URL instead'}
                </button>
              </div>

              {manualFileUrl ? (
                <input
                  type="text"
                  value={form.file_url}
                  onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white placeholder-text-muted focus:outline-none focus:border-gaming-gold/50"
                />
              ) : (
                <div className="space-y-1">
                  {form.file_url ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-gaming-gold/20 text-xs">
                      <span className="truncate text-white max-w-[150px] font-mono text-[10px]">{form.file_url}</span>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, file_url: '' }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border border-dashed border-border-dark hover:border-gaming-gold/50 rounded-lg py-2.5 px-3 cursor-pointer bg-surface/30 hover:bg-surface/50 transition-all text-center">
                      <Upload className={`w-4 h-4 text-text-muted mb-1 ${uploadingFile ? 'animate-bounce' : ''}`} />
                      <span className="text-[9px] text-text-muted font-bold uppercase">
                        {uploadingFile ? 'Uploading File...' : 'Upload File'}
                      </span>
                      <input
                        type="file"
                        accept=".zip,.pdf,.xlsx,.xls,.doc,.docx"
                        onChange={e => handleFileUpload(e, 'file_url')}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Preview Image Upload / URL */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-text-muted font-bold uppercase">Preview Image URL</label>
                <button
                  type="button"
                  onClick={() => setManualPreviewUrl(!manualPreviewUrl)}
                  className="text-[9px] text-gaming-gold hover:underline font-bold uppercase"
                >
                  {manualPreviewUrl ? 'Switch to Upload' : 'Enter URL instead'}
                </button>
              </div>

              {manualPreviewUrl ? (
                <input
                  type="text"
                  value={form.preview_image}
                  onChange={e => setForm(f => ({ ...f, preview_image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-dark text-xs text-white placeholder-text-muted focus:outline-none focus:border-gaming-gold/50"
                />
              ) : (
                <div className="space-y-1">
                  {form.preview_image ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-gaming-gold/20 text-xs">
                      <span className="truncate text-white max-w-[150px] font-mono text-[10px]">{form.preview_image}</span>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, preview_image: '' }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border border-dashed border-border-dark hover:border-gaming-gold/50 rounded-lg py-2.5 px-3 cursor-pointer bg-surface/30 hover:bg-surface/50 transition-all text-center">
                      <Upload className={`w-4 h-4 text-text-muted mb-1 ${uploadingPreview ? 'animate-bounce' : ''}`} />
                      <span className="text-[9px] text-text-muted font-bold uppercase">
                        {uploadingPreview ? 'Uploading Image...' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e, 'preview_image')}
                        className="hidden"
                        disabled={uploadingPreview}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-end justify-end gap-2 col-span-2 md:col-span-1">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg btn-gaming-secondary text-xs font-black uppercase">Cancel</button>
              <button type="submit" disabled={addLoading} className="px-4 py-2 rounded-lg btn-gaming-gold text-xs font-black uppercase disabled:opacity-50">
                {addLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['products', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${
              activeTab === t ? 'bg-gaming-gold/10 text-gaming-gold border-gaming-gold/30' : 'text-text-muted border-border-dark hover:text-white'
            }`}
          >
            {t} ({t === 'products' ? products.length : orders.length})
          </button>
        ))}
      </div>

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#070709] text-[9px] text-text-muted font-black uppercase tracking-wider border-b border-border-dark">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Category</th>
                  <th className="px-4 py-3 text-center">Price</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-xs text-text-muted font-bold uppercase">No products yet.</td></tr>
                ) : products.map(product => (
                  <tr key={product.id} className="border-b border-border-dark/30 last:border-0 hover:bg-surface/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.preview_image ? (
                          <img src={product.preview_image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-border-dark" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gaming-gold/5 border border-border-dark flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-gaming-gold" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">{product.name}</p>
                          {product.description && <p className="text-[9px] text-text-muted">{product.description.slice(0, 40)}...</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[9px] font-black uppercase text-gaming-purple border border-gaming-purple/30 bg-gaming-purple/10 px-2 py-0.5 rounded">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-black text-gaming-gold">${product.price_inr}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${product.is_active ? 'text-gaming-green border-gaming-green/30 bg-gaming-green/10' : 'text-zinc-400 border-zinc-700 bg-zinc-800/50'}`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                          disabled={toggleLoading === product.id}
                          className="p-1.5 rounded text-text-muted hover:text-gaming-green hover:bg-gaming-green/10 transition-colors"
                          title={product.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {product.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-950/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="gaming-panel rounded-xl border border-border-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#070709] text-[9px] text-text-muted font-black uppercase tracking-wider border-b border-border-dark">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Date</th>
                  <th className="px-4 py-3 text-left">Razorpay ID</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-xs text-text-muted font-bold uppercase">No orders yet.</td></tr>
                ) : orders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border-dark/30 last:border-0 hover:bg-surface/20 transition-colors text-xs">
                    <td className="px-4 py-2.5 font-bold text-gaming-neon">@{order.profiles?.username}</td>
                    <td className="px-4 py-2.5 font-bold text-white">{order.digital_products?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-center font-mono font-black text-gaming-gold">${order.amount_inr}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-[9px] text-text-muted font-bold">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[9px] text-text-muted">{order.razorpay_payment_id || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
