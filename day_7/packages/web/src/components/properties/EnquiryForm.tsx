import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnquirySchema, type EnquiryInput } from '@property-portal/shared';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';

interface EnquiryFormProps {
  propertyId: number;
}

export default function EnquiryForm({ propertyId }: EnquiryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({ resolver: zodResolver(EnquirySchema) });

  const onSubmit = async (data: EnquiryInput) => {
    try {
      await apiClient.post(`/api/properties/${propertyId}/enquiries`, data);
      toast.success('Enquiry sent successfully!');
      reset();
    } catch {
      toast.error('Failed to send enquiry. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Send an Enquiry</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            {...register('sender_name')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your full name"
          />
          {errors.sender_name && (
            <p className="text-red-500 text-xs mt-1">{errors.sender_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            {...register('sender_email')}
            type="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
          {errors.sender_email && (
            <p className="text-red-500 text-xs mt-1">{errors.sender_email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            {...register('sender_phone')}
            type="tel"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+95 9 xxx xxx xxx"
          />
          {errors.sender_phone && (
            <p className="text-red-500 text-xs mt-1">{errors.sender_phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea
            {...register('message')}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="I am interested in this property..."
          />
          {errors.message && (
            <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 disabled:opacity-50 font-medium"
        >
          {isSubmitting ? 'Sending...' : 'Send Enquiry'}
        </button>
      </form>
    </div>
  );
}
