import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Property, Location } from '@property-portal/shared';
import apiClient from '../lib/apiClient';
import Layout from '../components/layout/Layout';
import { formatMMK } from '../lib/formatMMK';
import MapView from '../components/map/MapView';
import EnquiryForm from '../components/properties/EnquiryForm';
import FavouriteButton from '../components/properties/FavouriteButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const listingTypeBadge: Record<string, string> = {
  buy: 'bg-green-100 text-green-800',
  sell: 'bg-blue-100 text-blue-800',
  rent: 'bg-orange-100 text-orange-800',
};

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [imageIdx, setImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get<Property>(`/api/properties/${id}`),
      apiClient.get<Location[]>('/api/locations'),
    ])
      .then(([propRes, locRes]) => {
        setProperty(propRes.data);
        setLocations(locRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24 text-gray-500">Loading...</div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24 text-gray-500">
          Property not found.
        </div>
      </Layout>
    );
  }

  const images = property.images ?? [];
  const currentImage = images[imageIdx];
  const imageUrl = currentImage
    ? `/uploads/${currentImage.filename}`
    : 'https://placehold.co/800x500?text=No+Image';

  // Resolve map coordinates
  const mapLat = property.latitude ?? locations.find((l) => l.id === property.location_id)?.latitude;
  const mapLng = property.longitude ?? locations.find((l) => l.id === property.location_id)?.longitude;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to="/properties" className="text-blue-700 hover:underline text-sm mb-4 inline-block">
          ← Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imageUrl}
                alt={property.title}
                className="w-full h-80 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/800x500?text=No+Image';
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIdx((i) => Math.max(0, i - 1))}
                    disabled={imageIdx === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 disabled:opacity-40"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setImageIdx((i) => Math.min(images.length - 1, i + 1))}
                    disabled={imageIdx === images.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 disabled:opacity-40"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setImageIdx(i)}>
                    <img
                      src={`/uploads/${img.filename}`}
                      alt=""
                      className={`h-16 w-24 object-cover rounded flex-shrink-0 border-2 ${
                        i === imageIdx ? 'border-blue-600' : 'border-transparent'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Title + details */}
            <div>
              <div className="flex items-start gap-3">
                <h1 className="text-2xl font-bold text-gray-900 flex-1">{property.title}</h1>
                <FavouriteButton propertyId={property.id} />
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-700">
                {formatMMK(property.price_mmk)}
              </p>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm font-medium px-2.5 py-1 rounded-full ${listingTypeBadge[property.listing_type] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {property.listing_type.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Status: {property.status}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Map */}
            {mapLat != null && mapLng != null && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Location</h2>
                <MapView latitude={mapLat} longitude={mapLng} title={property.title} />
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <EnquiryForm propertyId={property.id} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
