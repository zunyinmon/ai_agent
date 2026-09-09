import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Enquiry, Property } from '@property-portal/shared';
import apiClient from '../../lib/apiClient';
import Layout from '../../components/layout/Layout';
import { ArrowLeft } from 'lucide-react';

export default function AgentEnquiriesPage() {
  const { id } = useParams<{ id: string }>();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get<{ data: Enquiry[]; total: number }>(`/api/properties/${id}/enquiries`),
      apiClient.get<Property>(`/api/properties/${id}`),
    ])
      .then(([enqRes, propRes]) => {
        setEnquiries(enqRes.data.data ?? []);
        setProperty(propRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/agent/dashboard"
          className="inline-flex items-center gap-1 text-blue-700 hover:underline text-sm mb-4"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Enquiries</h1>
        {property && (
          <p className="text-gray-500 text-sm mb-6">For: {property.title}</p>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading...</div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center text-gray-500">No enquiries yet.</div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white border border-gray-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{enq.sender_name}</p>
                    <p className="text-sm text-blue-700">{enq.sender_email}</p>
                    {enq.sender_phone && (
                      <p className="text-sm text-gray-500">{enq.sender_phone}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(enq.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-3 text-gray-700 text-sm leading-relaxed">{enq.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
