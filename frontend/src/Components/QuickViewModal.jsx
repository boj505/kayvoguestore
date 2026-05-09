import React from 'react';
import { X } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const fmt = (n) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

const getProductImage = (product) => {
  const raw = product.images?.[0]?.src || product.image
  if (!raw) return 'https://via.placeholder.com/600x750?text=Product'
  return raw.startsWith('http')
    ? `/api/proxy-image?src=${encodeURIComponent(raw)}`
    : raw
}

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  const image = getProductImage(product)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-lg">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-[#f3efe8]">
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="md:w-1/2 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase text-black/50 font-clash">{product.categories?.[0]?.name || 'Brand'}</p>
                <h2 className="mt-2 text-2xl font-cormorant font-semibold">{product.name}</h2>
              </div>
              <button onClick={onClose} aria-label="Close" className="p-2"><X /></button>
            </div>

            <div className="mt-4">
              <div className="text-xl font-clash font-semibold">{fmt(product.price)}</div>
              <p className="mt-3 text-sm text-black/60">{product.short_description || product.description || ''}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => onAddToCart?.(product)} className="flex-1 rounded-full bg-black text-white py-3 font-clash">Add to cart</button>
              <Link to={`/product/${product.id}`} className="flex-1 rounded-full border py-3 text-center">View product</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
