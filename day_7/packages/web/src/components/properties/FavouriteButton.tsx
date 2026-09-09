import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';

interface FavouriteButtonProps {
  propertyId: number;
  initialFav?: boolean;
  onToggle?: (id: number, isFav: boolean) => void;
}

export default function FavouriteButton({
  propertyId,
  initialFav = false,
  onToggle,
}: FavouriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFav, setIsFav] = useState(initialFav);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    const next = !isFav;
    setIsFav(next); // optimistic
    setLoading(true);
    try {
      if (next) {
        await apiClient.post(`/api/favourites/${propertyId}`);
        toast.success('Added to saved listings');
      } else {
        await apiClient.delete(`/api/favourites/${propertyId}`);
        toast.success('Removed from saved listings');
      }
      onToggle?.(propertyId, next);
    } catch {
      setIsFav(!next); // revert on error
      toast.error('Failed to update saved listings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
      aria-label={isFav ? 'Remove from saved' : 'Save listing'}
    >
      <Heart
        size={20}
        className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}
      />
    </button>
  );
}
