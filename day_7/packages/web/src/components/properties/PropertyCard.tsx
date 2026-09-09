import React from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '@property-portal/shared';
import { formatMMK } from '../../lib/formatMMK';
import FavouriteButton from './FavouriteButton';

interface PropertyCardProps {
  property: Property;
  onFavouriteChange?: (id: number, isFav: boolean) => void;
}

const listingTypeBadge: Record<string, string> = {
  buy: 'bg-green-100 text-green-800',
  sell: 'bg-blue-100 text-blue-800',
  rent: 'bg-orange-100 text-orange-800',
};

export default function PropertyCard({ property, onFavouriteChange }: PropertyCardProps) {
  const firstImage = property.images?.[0];
  const imageUrl = firstImage
    ? `/uploads/${firstImage.filename}`
    : 'https://placehold.co/400x250?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/properties/${property.id}`}>
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x250?text=No+Image';
          }}
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/properties/${property.id}`}
            className="font-semibold text-gray-900 hover:text-blue-700 line-clamp-2"
          >
            {property.title}
          </Link>
          <FavouriteButton propertyId={property.id} onToggle={onFavouriteChange} />
        </div>
        <p className="mt-1 text-blue-700 font-bold">{formatMMK(property.price_mmk)}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${listingTypeBadge[property.listing_type] ?? 'bg-gray-100 text-gray-700'}`}
          >
            {property.listing_type.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
