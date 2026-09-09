import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { CreatePropertySchema } from '@property-portal/shared';
import type { Property, Location, Category, Image, ListingType, PropertyStatus } from '@property-portal/shared';
import apiClient from '../../lib/apiClient';
import Layout from '../../components/layout/Layout';
import toast from 'react-hot-toast';
import { Trash2, Upload } from 'lucide-react';

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

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreatePropertySchema) as any,
  });

  useEffect(() => {
    Promise.all([
      apiClient.get<Location[]>('/api/locations'),
      apiClient.get<Category[]>('/api/categories'),
      apiClient.get<Property>(`/api/properties/${id}`),
    ]).then(([locRes, catRes, propRes]) => {
      setLocations(locRes.data);
      setCategories(catRes.data);
      const p = propRes.data;
      setImages(p.images ?? []);
      reset({
        title: p.title,
        description: p.description,
        price_mmk: p.price_mmk,
        listing_type: p.listing_type,
        status: p.status,
        location_id: p.location_id,
        category_id: p.category_id,
        latitude: p.latitude ?? undefined,
        longitude: p.longitude ?? undefined,
      });
    });
  }, [id, reset]);

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      await apiClient.put(`/api/properties/${id}`, {
        ...data,
        price_mmk: Number(data.price_mmk),
        location_id: Number(data.location_id),
        category_id: Number(data.category_id),
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
      });
      toast.success('Listing updated!');
      navigate('/agent/dashboard');
    } catch {
      toast.error('Failed to update listing.');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    try {
      const res = await apiClient.post<{ images: Image[] }>(
        `/api/properties/${id}/images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setImages((prev) => [...prev, ...(res.data.images ?? [])]);
      toast.success('Images uploaded!');
    } catch {
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await apiClient.delete(`/api/properties/${id}/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Listing</h1>

        {/* Image Management */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Images</h2>
          <div className="flex gap-3 flex-wrap mb-4">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={`/uploads/${img.filename}`}
                  alt=""
                  className="w-24 h-20 object-cover rounded border border-gray-200"
                />
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer border border-dashed border-gray-300 rounded-md px-4 py-3 hover:bg-gray-50 w-fit">
            <Upload size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Upload images'}
            </span>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Property Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white border border-gray-200 rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              {...register('title')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
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
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="rent">Rent</option>
              </select>
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
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                {...register('category_id', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                {...register('latitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                {...register('longitude', { valueAsNumber: true })}
                type="number"
                step="any"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-700 text-white py-2.5 rounded-md hover:bg-blue-800 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/agent/dashboard')}
              className="flex-1 border border-gray-300 py-2.5 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
