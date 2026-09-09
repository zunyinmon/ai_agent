import React, { useEffect, useState } from 'react';
import type { Property } from '@property-portal/shared';
import apiClient from '../lib/apiClient';
import Layout from '../components/layout/Layout';
import PropertyCard from '../components/properties/PropertyCard';
import { Heart } from 'lucide-react';

export default function SavedListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<Property[]>('/api/favourites')
      .then((r) => setProperties(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFavouriteChange = (id: number, isFav: boolean) => {
    if (!isFav) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Listings</h1>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            <Heart size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No saved listings yet.</p>
            <p className="text-sm mt-1">Click the heart icon on any listing to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onFavouriteChange={handleFavouriteChange}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
