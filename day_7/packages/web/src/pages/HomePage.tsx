import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2 } from 'lucide-react';
import type { Property } from '@property-portal/shared';
import apiClient from '../lib/apiClient';
import PropertyCard from '../components/properties/PropertyCard';
import Layout from '../components/layout/Layout';

export default function HomePage() {
  const [featured, setFeatured] = useState<Property[]>([]);

  useEffect(() => {
    apiClient
      .get<{ data: Property[]; total: number }>('/api/properties', {
        params: { status: 'active', limit: 6, page: 1 },
      })
      .then((r) => setFeatured(r.data.data ?? []))
      .catch(() => {});
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-blue-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Property in Myanmar</h1>
          <p className="text-blue-200 mb-8 text-lg">
            Browse thousands of listings across Yangon, Mandalay and beyond.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Search size={18} />
            Browse All Properties
          </Link>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
          <Link to="/properties" className="text-blue-700 hover:underline text-sm font-medium">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Building2 size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No listings available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
