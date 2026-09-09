import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '@property-portal/shared';
import apiClient from '../../lib/apiClient';
import Layout from '../../components/layout/Layout';
import { formatMMK } from '../../lib/formatMMK';
import { Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

export default function AdminListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get<{ data: Property[]; total: number }>('/api/properties', {
        params: { page, limit: PAGE_SIZE },
      })
      .then((r) => {
        setProperties(r.data.data ?? []);
        setTotal(r.data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await apiClient.delete(`/api/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Listings</h1>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Price</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Agent ID</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{p.id}</td>
                      <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title}</td>
                      <td className="px-4 py-3 text-blue-700">{formatMMK(p.price_mmk)}</td>
                      <td className="px-4 py-3 capitalize">{p.listing_type}</td>
                      <td className="px-4 py-3 capitalize">{p.status}</td>
                      <td className="px-4 py-3 text-gray-500">{p.agent_id}</td>
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
