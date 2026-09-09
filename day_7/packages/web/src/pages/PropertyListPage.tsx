import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Property } from '@property-portal/shared';
import apiClient from '../lib/apiClient';
import Layout from '../components/layout/Layout';
import PropertyCard from '../components/properties/PropertyCard';
import FilterSidebar, { type FilterState } from '../components/filters/FilterSidebar';
import ListingsMapView from '../components/map/ListingsMapView';
import { Map, Grid3X3 } from 'lucide-react';

const PAGE_SIZE = 9;

export default function PropertyListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const currentPage = parseInt(searchParams.get('page') ?? '1', 10);

  const filters: FilterState = {
    location_id: searchParams.get('location_id') ?? '',
    category_id: searchParams.get('category_id') ?? '',
    listing_type: searchParams.get('listing_type') ?? '',
    min_price_mmk: searchParams.get('min_price_mmk') ?? '',
    max_price_mmk: searchParams.get('max_price_mmk') ?? '',
  };

  const fetchProperties = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page: currentPage, limit: PAGE_SIZE };
    if (filters.location_id) params.location_id = filters.location_id;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.listing_type) params.listing_type = filters.listing_type;
    if (filters.min_price_mmk) params.min_price_mmk = filters.min_price_mmk;
    if (filters.max_price_mmk) params.max_price_mmk = filters.max_price_mmk;

    apiClient
      .get<{ data: Property[]; total: number }>('/api/properties', { params })
      .then((r) => {
        setProperties(r.data.data ?? []);
        setTotal(r.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleFilterChange = (f: FilterState) => {
    const params: Record<string, string> = { page: '1' };
    if (f.location_id) params.location_id = f.location_id;
    if (f.category_id) params.category_id = f.category_id;
    if (f.listing_type) params.listing_type = f.listing_type;
    if (f.min_price_mmk) params.min_price_mmk = f.min_price_mmk;
    if (f.max_price_mmk) params.max_price_mmk = f.max_price_mmk;
    setSearchParams(params);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <FilterSidebar value={filters} onChange={handleFilterChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Map toggle */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {total} propert{total !== 1 ? 'ies' : 'y'} found
              </p>
              <button
                onClick={() => setShowMap((s) => !s)}
                className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
              >
                {showMap ? <Grid3X3 size={14} /> : <Map size={14} />}
                {showMap ? 'Grid View' : 'Map View'}
              </button>
            </div>

            {showMap && (
              <div className="mb-6">
                <ListingsMapView properties={properties} />
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-gray-500">Loading...</div>
            ) : properties.length === 0 ? (
              <div className="py-16 text-center text-gray-500">No properties found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const p = new URLSearchParams(prev);
                      p.set('page', String(currentPage - 1));
                      return p;
                    })
                  }
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const p = new URLSearchParams(prev);
                      p.set('page', String(currentPage + 1));
                      return p;
                    })
                  }
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
