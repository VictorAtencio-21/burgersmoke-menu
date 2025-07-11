"use client";
import { useEffect, useRef, useState } from "react";
import { LEAFLET_TILE_URL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocateFixed, Loader2 } from "lucide-react";

interface AddressSearchMapProps {
	onSelect: (address: string) => void;
	initialAddress?: string;
}

export default function AddressSearchMap({
	onSelect,
	initialAddress,
}: AddressSearchMapProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const markerRef = useRef<any>(null);
	const LRef = useRef<any>(null);
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [isLocating, setIsLocating] = useState(false);

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

	const reverseGeocode = async (lat: number, lon: number) => {
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
			);
			const data = await res.json();
			if (data && data.display_name) {
				onSelect(data.display_name);
				if (inputRef.current) inputRef.current.value = data.display_name;
			}
		} catch (err) {
			console.error("Reverse geocoding error", err);
		}
	};

	const searchAddress = async (query: string) => {
		if (!query) return;
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
					query
				)}`
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

	const fetchSuggestions = async (query: string) => {
		if (!query) {
			setSuggestions([]);
			return;
		}
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
					query
				)}`
			);
			const results = await res.json();
			setSuggestions(results || []);
		} catch (err) {
			console.error("Suggestion search error", err);
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

		const init = async () => {
			await loadLeaflet();
			LRef.current = (window as any).L;
			if (mapRef.current) {
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
			}
			if (initialAddress) {
				if (inputRef.current) inputRef.current.value = initialAddress;
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
			<div className="flex items-center gap-2">
				<Input
					ref={inputRef}
					type="text"
					placeholder="Buscar dirección"
					className="bg-stone-700 border-stone-600 text-white placeholder-stone-400"
				/>
				<Button
					type="button"
					variant="secondary"
					size="icon"
					onClick={locateMe}
					className="bg-stone-700 border border-stone-600 hover:bg-stone-600"
				>
					{isLocating ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<LocateFixed className="h-4 w-4" />
					)}
				</Button>
			</div>
			{suggestions.length > 0 && (
				<ul className="relative z-[1001] bg-stone-700 border border-stone-600 rounded-md max-h-40 overflow-auto text-white text-sm">
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
