import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '@property-portal/shared';
import apiClient from '../../lib/apiClient';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { formatMMK } from '../../lib/formatMMK';
import { PlusCircle, Pencil, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AgentDashboardPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiryCounts, setEnquiryCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiClient
      .get<{ data: Property[]; total: number }>('/api/properties', {
        params: { agent_id: user.id, limit: 100 },
      })
      .then(async (r) => {
        const props = r.data.data ?? [];
        setProperties(props);
        // Fetch enquiry counts per property
        const counts: Record<number, number> = {};
        await Promise.all(
          props.map((p) =>
            apiClient
              .get<{ data: unknown[]; total: number }>(`/api/properties/${p.id}/enquiries`)
              .then((er) => { counts[p.id] = er.data.total ?? (er.data.data?.length ?? 0); })
              .catch(() => { counts[p.id] = 0; }),
          ),
        );
        setEnquiryCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await apiClient.delete(`/api/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <Link
            to="/agent/listings/new"
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium"
          >
            <PlusCircle size={16} />
            New Listing
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="mb-4">You have no listings yet.</p>
            <Link to="/agent/listings/new" className="text-blue-700 hover:underline">
              Create your first listing →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Enquiries</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 text-blue-700">{formatMMK(p.price_mmk)}</td>
                    <td className="px-4 py-3 capitalize">{p.listing_type}</td>
                    <td className="px-4 py-3 capitalize">{p.status}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/agent/listings/${p.id}/enquiries`}
                        className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                      >
                        <MessageSquare size={14} />
                        {enquiryCounts[p.id] ?? 0}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/agent/listings/${p.id}/edit`}
                          className="text-gray-600 hover:text-blue-700"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
