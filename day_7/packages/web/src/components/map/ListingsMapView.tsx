import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Property } from '@property-portal/shared';

// Fix Leaflet default icon
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Yangon fallback
const YANGON: [number, number] = [16.8661, 96.1951];

interface ListingsMapViewProps {
  properties: Property[];
}

export default function ListingsMapView({ properties }: ListingsMapViewProps) {
  const pinned = properties.filter((p) => p.latitude != null && p.longitude != null);
  const center: [number, number] =
    pinned.length > 0 ? [pinned[0].latitude!, pinned[0].longitude!] : YANGON;

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '350px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pinned.map((p) => (
        <Marker key={p.id} position={[p.latitude!, p.longitude!]}>
          <Popup>
            <Link to={`/properties/${p.id}`} className="font-medium text-blue-700">
              {p.title}
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
