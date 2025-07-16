"use client";
import { useEffect, useRef, useState } from "react";
import { LEAFLET_TILE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { LocateFixed, Loader2, ExternalLink } from "lucide-react";

interface AddressSearchMapProps {
  onSelect: (
    address: string,
    lat: number,
    lon: number,
    googleMapsLink: string
  ) => void;
}

export default function AddressSearchMap({ onSelect }: AddressSearchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const [isLocating, setIsLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
    address: string;
  } | null>(null);

  const focusLocation = (lat: number, lon: number) => {
    const L = LRef.current;
    if (!L) return;
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lon], 16);
      L.tileLayer(LEAFLET_TILE_URL, {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current!.setView([lat, lon], 16);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else if (mapInstanceRef.current) {
      markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
    }
  };

  const generateGoogleMapsLink = (lat: number, lon: number) => {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        const googleMapsLink = generateGoogleMapsLink(lat, lon);
        setCurrentLocation({ lat, lon, address: data.display_name });
        onSelect(data.display_name, lat, lon, googleMapsLink);
      }
    } catch (err) {
      console.error("Reverse geocoding error", err);
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        focusLocation(latitude, longitude);
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error", err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (typeof window === "undefined" || mapInitializedRef.current) return;

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

    const init = async () => {
      await loadLeaflet();
      LRef.current = (window as any).L;
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = LRef.current
          .map(mapRef.current)
          .setView([10, -64], 5);
        LRef.current
          .tileLayer(LEAFLET_TILE_URL, {
            attribution: "© OpenStreetMap contributors",
          })
          .addTo(mapInstanceRef.current);
        mapInstanceRef.current.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          focusLocation(lat, lng);
          reverseGeocode(lat, lng);
        });
        mapInitializedRef.current = true;
      }
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={locateMe}
          className="bg-stone-700 border border-stone-600 hover:bg-stone-600 text-white w-full"
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Localizando...
            </>
          ) : (
            <>
              <LocateFixed className="h-4 w-4 mr-2" />
              Obtener mi ubicación
            </>
          )}
        </Button>
        {currentLocation && (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              window.open(
                generateGoogleMapsLink(
                  currentLocation.lat,
                  currentLocation.lon
                ),
                "_blank"
              )
            }
            className="bg-stone-700 border border-stone-600 hover:bg-stone-600 text-white w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver en Google Maps
          </Button>
        )}
      </div>
      {currentLocation && (
        <div className="p-3 bg-stone-800 rounded-md border border-stone-600">
          <p className="text-sm text-stone-300 mb-1">Ubicación seleccionada:</p>
          <p className="text-white text-sm">{currentLocation.address}</p>
          <p className="text-stone-400 text-xs mt-1">
            Lat: {currentLocation.lat.toFixed(6)}, Lon:{" "}
            {currentLocation.lon.toFixed(6)}
          </p>
        </div>
      )}

      {currentLocation && (
        <div className="p-3 bg-stone-800 rounded-md border border-stone-600">
          <p className="text-sm text-stone-300 mb-1">
            Puedes ajustar el marcador haciendo{" "}
            <b>click o tocando el punto exacto</b> en el mapa para ubicar el pin
            en el lugar exacto de entrega. Si necesitas especificar detalles
            adicionales, agrégalos en el campo "Notas Adicionales".
          </p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-60 rounded-md bg-stone-700" />
    </div>
  );
}
