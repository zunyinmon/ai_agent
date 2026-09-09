import React, { useEffect, useState } from 'react';
import type { Location, Category } from '@property-portal/shared';
import apiClient from '../../lib/apiClient';

export interface FilterState {
  location_id: string;
  category_id: string;
  listing_type: string;
  min_price_mmk: string;
  max_price_mmk: string;
}

interface FilterSidebarProps {
  value: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterSidebar({ value, onChange }: FilterSidebarProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiClient.get<Location[]>('/api/locations').then((r) => setLocations(r.data));
    apiClient.get<Category[]>('/api/categories').then((r) => setCategories(r.data));
  }, []);

  const update = (field: keyof FilterState, val: string) =>
    onChange({ ...value, [field]: val });

  const clear = () =>
    onChange({
      location_id: '',
      category_id: '',
      listing_type: '',
      min_price_mmk: '',
      max_price_mmk: '',
    });

  return (
    <aside className="bg-white rounded-lg border border-gray-200 p-4 space-y-5 w-full">
      <h2 className="font-semibold text-gray-800 text-base">Filters</h2>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
        <select
          value={value.location_id}
          onChange={(e) => update('location_id', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
        <select
          value={value.category_id}
          onChange={(e) => update('category_id', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Listing Type</label>
        <select
          value={value.listing_type}
          onChange={(e) => update('listing_type', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
          <option value="rent">Rent</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Min Price (MMK)
        </label>
        <input
          type="number"
          step="1"
          min="0"
          value={value.min_price_mmk}
          onChange={(e) => update('min_price_mmk', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="0"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Max Price (MMK)
        </label>
        <input
          type="number"
          step="1"
          min="0"
          value={value.max_price_mmk}
          onChange={(e) => update('max_price_mmk', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="No limit"
        />
      </div>

      <button
        onClick={clear}
        className="w-full border border-gray-300 rounded-md py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        Clear Filters
      </button>
    </aside>
  );
}
