import React, { useState, useEffect } from 'react';
import { X } from '@mui/icons-material';
import { fetchCategories } from '../api/Woocommerce';

export default function FiltersDrawer({ open, onClose, onApply, initial = {} }) {
  const [categories, setCategories] = useState([]);
  const [local, setLocal] = useState(initial);

  useEffect(() => setLocal(initial), [initial]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchCategories({ per_page: 50 });
        if (mounted) setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => (mounted = false);
  }, []);

  const apply = () => onApply(local);
  const clearAll = () => setLocal({});

  return (
    <div id="filters-drawer" className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white p-6 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-clash">Filters</h4>
          <button onClick={onClose} aria-label="Close filters" className="p-2"><X /></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs text-black/60 mb-2 font-clash">Category</label>
            <select
              value={local.category || ''}
              onChange={(e) => setLocal((s) => ({ ...s, category: e.target.value || null }))}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-black/60 mb-2 font-clash">Price range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={local.minPrice || ''} onChange={(e) => setLocal((s) => ({ ...s, minPrice: e.target.value }))} className="w-1/2 border rounded px-3 py-2 text-sm" />
              <input type="number" placeholder="Max" value={local.maxPrice || ''} onChange={(e) => setLocal((s) => ({ ...s, maxPrice: e.target.value }))} className="w-1/2 border rounded px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={apply} className="flex-1 rounded-full bg-black text-white py-2 font-clash">Apply</button>
            <button onClick={clearAll} className="rounded-full border px-4 py-2 text-sm">Clear</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
