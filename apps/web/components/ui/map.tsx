"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing marker icons due to Next.js image bundling
const icon = L.icon({
  iconUrl: "/images/leaflet/marker-icon.png",
  iconRetinaUrl: "/images/leaflet/marker-icon-2x.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// A component to automatically re-center the map when coords change
const MapRecenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Component to fit bounds if multiple markers exist
const MapBounds = ({ markers }: { markers: { lat: number; lng: number }[] }) => {
  const map = useMap();
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [markers, map]);
  return null;
};

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
};

export type MapProps = {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
};

export default function Map({
  center = [20.5937, 78.9629], // Default to India
  zoom = 5,
  markers = [],
  className = "h-[400px] w-full rounded-md z-0",
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`bg-muted flex items-center justify-center text-muted-foreground ${className}`}
      >
        Loading map...
      </div>
    );
  }

  const effectiveCenter =
    markers.length === 1 ? ([markers[0].lat, markers[0].lng] as [number, number]) : center;

  return (
    <div className={className}>
      <MapContainer
        center={effectiveCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={icon}>
            {(marker.title || marker.description) && (
              <Popup>
                {marker.title && <div className="font-semibold">{marker.title}</div>}
                {marker.description && <div className="text-sm">{marker.description}</div>}
              </Popup>
            )}
          </Marker>
        ))}

        <MapRecenter center={effectiveCenter} />
        {markers.length > 1 && <MapBounds markers={markers} />}
      </MapContainer>
    </div>
  );
}
