import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { CreatePropertySchema } from '@property-portal/shared';
import type { Location, Category, ListingType, PropertyStatus } from '@property-portal/shared';
import apiClient from '../../lib/apiClient';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';

interface PropertyFormValues {
  title: string;
  description: string;
  price_mmk: number;
  listing_type: ListingType;
  status: PropertyStatus;
  location_id: number;
  category_id: number;
  latitude?: number | null;
  longitude?: number | null;
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiClient.get<Location[]>('/api/locations').then((r) => setLocations(r.data));
    apiClient.get<Category[]>('/api/categories').then((r) => setCategories(r.data));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreatePropertySchema) as any,
    defaultValues: { status: 'active' },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      const res = await apiClient.post<{ id: number }>('/api/properties', {
        ...data,
        price_mmk: Number(data.price_mmk),
        location_id: Number(data.location_id),
        category_id: Number(data.category_id),
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
      });
      toast.success('Listing created!');
      navigate(`/agent/listings/${res.data.id}/edit`);
    } catch {
      toast.error('Failed to create listing. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Listing</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              {...register('title')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="e.g. 2BR Apartment in Yangon"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (MMK) *</label>
            <input
              {...register('price_mmk', { valueAsNumber: true })}
              type="number"
              step="1"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="150000000"
            />
            {errors.price_mmk && (
              <p className="text-red-500 text-xs mt-1">{errors.price_mmk.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type *</label>
              <select
                {...register('listing_type')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select type</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="rent">Rent</option>
              </select>
              {errors.listing_type && (
                <p className="text-red-500 text-xs mt-1">{errors.listing_type.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                {...register('status')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <select
                {...register('location_id', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="text-red-500 text-xs mt-1">{errors.location_id.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                {...register('category_id', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude (optional)
              </label>
              <input
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="16.8661"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude (optional)
              </label>
              <input
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="96.1951"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-700 text-white py-2.5 rounded-md hover:bg-blue-800 disabled:opacity-50 font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Create Listing & Add Images'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
