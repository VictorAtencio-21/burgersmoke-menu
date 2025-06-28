"use client";
import { useEffect, useRef, useState } from "react";
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
  const [suggestions, setSuggestions] = useState<any[]>([]);

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

    const focusLocation = (lat: number, lon: number) => {
      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([lat, lon], 16);
        L.tileLayer(LEAFLET_TILE_URL, {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);
      } else {
        mapInstanceRef.current.setView([lat, lon], 16);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
      }
    };

    const searchAddress = async (query: string) => {
      if (!query) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
        );
        const results = await res.json();
        setSuggestions(results || []);
        if (results && results[0]) {
          const { lat, lon, display_name } = results[0];
          onSelect(display_name);
          focusLocation(parseFloat(lat), parseFloat(lon));
        }
      } catch (err) {
        console.error("Address search error", err);
      }
    };

    const reverseGeocode = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        if (data && data.display_name) {
          onSelect(data.display_name);
        }
      } catch (err) {
        console.error("Reverse geocoding error", err);
      }
    };

    const init = async () => {
      await loadLeaflet();
      L = (window as any).L;
      if (mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([10, -64], 5);
        L.tileLayer(LEAFLET_TILE_URL, {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);
        mapInstanceRef.current.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          focusLocation(lat, lng);
          reverseGeocode(lat, lng);
        });
      }
      if (initialAddress) {
        inputRef.current!.value = initialAddress;
        searchAddress(initialAddress);
      }
    };

    init();

    const inputEl = inputRef.current;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchAddress(inputEl!.value);
        setSuggestions([]);
      }
    };
    const handleInput = (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      fetchSuggestions(val);
    };
    const fetchSuggestions = async (query: string) => {
      if (!query) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
        );
        const results = await res.json();
        setSuggestions(results || []);
      } catch (err) {
        console.error("Suggestion search error", err);
      }
    };
    inputEl?.addEventListener("keydown", handleKey);
    inputEl?.addEventListener("input", handleInput);

    return () => {
      inputEl?.removeEventListener("keydown", handleKey);
      inputEl?.removeEventListener("input", handleInput);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
      setSuggestions([]);
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
      {suggestions.length > 0 && (
        <ul className="bg-stone-700 border border-stone-600 rounded-md max-h-40 overflow-auto text-white text-sm">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="px-2 py-1 hover:bg-stone-600 cursor-pointer"
              onClick={() => {
                focusLocation(parseFloat(s.lat), parseFloat(s.lon));
                onSelect(s.display_name);
                setSuggestions([]);
                if (inputRef.current) inputRef.current.value = s.display_name;
              }}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
      <div ref={mapRef} className="w-full h-60 rounded-md bg-stone-700" />
    </div>
  );
}
