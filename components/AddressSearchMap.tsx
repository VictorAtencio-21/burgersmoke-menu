"use client";
import { useEffect, useRef } from "react";
import { LEAFLET_TILE_URL } from "@/lib/constants";

interface AddressSearchMapProps {
  onSelect: (address: string) => void;
  initialAddress?: string;
}

export default function AddressSearchMap({ onSelect, initialAddress }: AddressSearchMapProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLeaflet = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).L) return resolve();
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    let L: any;

    const searchAddress = async (query: string) => {
      if (!query) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const results = await res.json();
        if (results && results[0]) {
          const { lat, lon, display_name } = results[0];
          onSelect(display_name);
          if (!mapInstanceRef.current && mapRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([lat, lon], 16);
            L.tileLayer(LEAFLET_TILE_URL, {
              attribution: "© OpenStreetMap contributors",
            }).addTo(mapInstanceRef.current);
          } else {
            mapInstanceRef.current.setView([lat, lon], 16);
          }
          if (markerRef.current) {
            markerRef.current.remove();
          }
          markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
        }
      } catch (err) {
        console.error("Address search error", err);
      }
    };

    const init = async () => {
      await loadLeaflet();
      L = (window as any).L;
      if (initialAddress) {
        inputRef.current!.value = initialAddress;
        searchAddress(initialAddress);
      } else if (mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([10, -64], 5);
        L.tileLayer(LEAFLET_TILE_URL, {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);
      }
    };

    init();

    const inputEl = inputRef.current;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchAddress(inputEl!.value);
      }
    };
    inputEl?.addEventListener("keydown", handleKey);

    return () => {
      inputEl?.removeEventListener("keydown", handleKey);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [initialAddress, onSelect]);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar dirección"
        className="w-full rounded-md border border-stone-600 bg-stone-700 text-white placeholder-stone-400 px-2 py-2"
      />
      <div ref={mapRef} className="w-full h-60 rounded-md bg-stone-700" />
    </div>
  );
}
