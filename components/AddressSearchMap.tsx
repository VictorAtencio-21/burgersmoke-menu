"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { LEAFLET_TILE_URL } from "@/lib/constants";
import { Search, MapPin, Loader2, AlertCircle, Navigation } from "lucide-react";

interface AddressSearchMapProps {
	onSelect: (address: string) => void;
	initialAddress?: string;
}

interface SearchResult {
	lat: string;
	lon: string;
	display_name: string;
	type: string;
	importance: number;
}

export default function AddressSearchMap({
	onSelect,
	initialAddress,
}: AddressSearchMapProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const markerRef = useRef<any>(null);
	const searchTimeoutRef = useRef<NodeJS.Timeout>(
		null as unknown as NodeJS.Timeout // Initialize with a non-null value
	);

	const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedAddress, setSelectedAddress] = useState<string>("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

	// Get user's current location
	const getUserLocation = useCallback(async () => {
		if (!navigator.geolocation) {
			setError("La geolocalización no está disponible en tu navegador.");
			return;
		}

		setIsGettingLocation(true);
		setError(null);

		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 60000, // Cache for 1 minute
				});
			});

			const { latitude, longitude } = position.coords;
			const location = { lat: latitude, lng: longitude };
			
			setUserLocation(location);
			focusLocation(latitude, longitude);
			await reverseGeocode(latitude, longitude);
			
		} catch (err: any) {
			console.error("Geolocation error:", err);
			let errorMessage = "Error al obtener tu ubicación.";
			
			if (err.code === 1) {
				errorMessage = "Acceso denegado. Permite el acceso a tu ubicación para una mejor experiencia.";
			} else if (err.code === 2) {
				errorMessage = "No se pudo determinar tu ubicación. Verifica tu conexión.";
			} else if (err.code === 3) {
				errorMessage = "Tiempo de espera agotado. Intenta de nuevo.";
			}
			
			setError(errorMessage);
		} finally {
			setIsGettingLocation(false);
		}
	}, []);

	// Debounced search function
	const debouncedSearch = useCallback((query: string) => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		if (!query.trim()) {
			setSuggestions([]);
			setIsSearching(false);
			setError(null);
			return;
		}

		setIsSearching(true);
		setError(null);

		searchTimeoutRef.current = setTimeout(async () => {
			try {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&limit=8&q=${encodeURIComponent(
						query
					)}&countrycodes=ve&addressdetails=1`
				);

				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}

				const results = await res.json();
				setSuggestions(results || []);
				setShowSuggestions(true);
			} catch (err) {
				console.error("Address search error", err);
				setError("Error al buscar direcciones. Intenta de nuevo.");
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		}, 300); // 300ms delay
	}, []);

	// Focus location on map
	const focusLocation = useCallback((lat: number, lon: number) => {
		if (!mapInstanceRef.current || !mapRef.current) return;

		try {
			mapInstanceRef.current.setView([lat, lon], 16);
			if (markerRef.current) {
				markerRef.current.setLatLng([lat, lon]);
			} else {
				const L = (window as any).L;
				markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
			}
		} catch (err) {
			console.error("Error focusing location:", err);
		}
	}, []);

	// Reverse geocoding
	const reverseGeocode = useCallback(
		async (lat: number, lon: number) => {
			try {
				setIsLoading(true);
				const res = await fetch(
					`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
				);

				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}

				const data = await res.json();
				if (data && data.display_name) {
					const address = data.display_name;
					setSelectedAddress(address);
					onSelect(address);
					if (inputRef.current) {
						inputRef.current.value = address;
					}
				}
			} catch (err) {
				console.error("Reverse geocoding error", err);
				setError("Error al obtener la dirección. Intenta de nuevo.");
			} finally {
				setIsLoading(false);
			}
		},
		[onSelect]
	);

	// Handle suggestion selection
	const handleSuggestionSelect = useCallback(
		(suggestion: SearchResult) => {
			const lat = parseFloat(suggestion.lat);
			const lon = parseFloat(suggestion.lon);

			focusLocation(lat, lon);
			setSelectedAddress(suggestion.display_name);
			onSelect(suggestion.display_name);
			setSuggestions([]);
			setShowSuggestions(false);
			setError(null);

			if (inputRef.current) {
				inputRef.current.value = suggestion.display_name;
			}
		},
		[focusLocation, onSelect]
	);

	// Handle manual search
	const handleManualSearch = useCallback(
		async (query: string) => {
			if (!query.trim()) return;

			try {
				setIsLoading(true);
				setError(null);

				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
						query
					)}&countrycodes=ve`
				);

				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}

				const results = await res.json();
				if (results && results[0]) {
					const { lat, lon, display_name } = results[0];
					focusLocation(parseFloat(lat), parseFloat(lon));
					setSelectedAddress(display_name);
					onSelect(display_name);
					setSuggestions([]);
					setShowSuggestions(false);
				} else {
					setError(
						"No se encontraron direcciones. Intenta con términos más específicos."
					);
				}
			} catch (err) {
				console.error("Manual search error", err);
				setError("Error al buscar la dirección. Intenta de nuevo.");
			} finally {
				setIsLoading(false);
			}
		},
		[focusLocation, onSelect]
	);

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
			try {
				await loadLeaflet();
				const L = (window as any).L;

				if (mapRef.current) {
					// Initialize map centered on Venezuela
					mapInstanceRef.current = L.map(mapRef.current).setView(
						[6.42375, -66.58973],
						6
					);

					L.tileLayer(LEAFLET_TILE_URL, {
						attribution: "© OpenStreetMap contributors",
					}).addTo(mapInstanceRef.current);

					// Add click handler for reverse geocoding
					mapInstanceRef.current.on("click", (e: any) => {
						const { lat, lng } = e.latlng;
						focusLocation(lat, lng);
						reverseGeocode(lat, lng);
					});
				}

				// Set initial address if provided
				if (initialAddress && inputRef.current) {
					inputRef.current.value = initialAddress;
					setSelectedAddress(initialAddress);
					handleManualSearch(initialAddress);
				}
			} catch (err) {
				console.error("Map initialization error:", err);
				setError("Error al cargar el mapa. Recarga la página.");
			}
		};

		init();

		// Cleanup
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
			}
		};
	}, [initialAddress, focusLocation, reverseGeocode, handleManualSearch]);

	// Handle input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSelectedAddress(value);
		debouncedSearch(value);
	};

	// Handle key press
	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const value = e.currentTarget.value;
			if (value.trim()) {
				handleManualSearch(value);
				setShowSuggestions(false);
			}
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
			inputRef.current?.blur();
		}
	};

	// Handle input focus
	const handleInputFocus = () => {
		if (suggestions.length > 0) {
			setShowSuggestions(true);
		}
	};

	// Handle input blur
	const handleInputBlur = () => {
		// Delay hiding suggestions to allow for clicks
		setTimeout(() => setShowSuggestions(false), 200);
	};

	return (
		<div className="space-y-3">
			{/* Search Input with Location Button */}
			<div className="relative">
				<div className="relative flex gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
						<input
							ref={inputRef}
							type="text"
							placeholder="Buscar dirección en Venezuela..."
							value={selectedAddress}
							onChange={handleInputChange}
							onKeyDown={handleKeyPress}
							onFocus={handleInputFocus}
							onBlur={handleInputBlur}
							className="w-full rounded-md border border-stone-600 bg-stone-700 text-white placeholder-stone-400 pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
						/>
						{(isSearching || isLoading) && (
							<Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400 animate-spin" />
						)}
					</div>
					
					{/* Location Button */}
					<button
						onClick={getUserLocation}
						disabled={isGettingLocation}
						className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-stone-600 disabled:cursor-not-allowed rounded-md border border-stone-600 transition-colors duration-200 flex items-center gap-2 text-white"
						title="Usar mi ubicación actual"
					>
						{isGettingLocation ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Navigation className="h-4 w-4" />
						)}
						<span className="hidden sm:inline">Mi ubicación</span>
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
						<AlertCircle className="h-4 w-4" />
						<span>{error}</span>
					</div>
				)}

				{/* Search Suggestions */}
				{showSuggestions && suggestions.length > 0 && (
					<div className="absolute z-10 w-full mt-1 bg-stone-800 border border-stone-600 rounded-md shadow-lg max-h-60 overflow-auto">
						<ul className="py-1">
							{suggestions.map((suggestion, idx) => (
								<li
									key={`${suggestion.lat}-${suggestion.lon}-${idx}`}
									className="px-4 py-3 hover:bg-stone-700 cursor-pointer transition-colors duration-150"
									onClick={() => handleSuggestionSelect(suggestion)}
								>
									<div className="flex items-start gap-3">
										<MapPin className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
										<div className="flex-1 min-w-0">
											<div className="text-white text-sm font-medium truncate">
												{suggestion.display_name.split(",")[0]}
											</div>
											<div className="text-stone-400 text-xs truncate">
												{suggestion.display_name
													.split(",")
													.slice(1)
													.join(",")
													.trim()}
											</div>
											<div className="text-stone-500 text-xs mt-1">
												Tipo: {suggestion.type} • Relevancia:{" "}
												{Math.round(suggestion.importance * 100)}%
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* No Results Message */}
				{showSuggestions &&
					!isSearching &&
					suggestions.length === 0 &&
					selectedAddress.trim() &&
					!error && (
						<div className="absolute z-10 w-full mt-1 bg-stone-800 border border-stone-600 rounded-md shadow-lg">
							<div className="px-4 py-3 text-stone-400 text-sm">
								No se encontraron direcciones. Intenta con términos más
								específicos.
							</div>
						</div>
					)}
			</div>

			{/* Map */}
			<div className="relative">
				<div 
					ref={mapRef} 
					className="w-full h-64 rounded-md bg-stone-700 border border-stone-600"
				/>
				{isLoading && (
					<div className="absolute inset-0 bg-stone-900 bg-opacity-50 flex items-center justify-center rounded-md">
						<div className="flex items-center gap-2 text-white">
							<Loader2 className="h-5 w-5 animate-spin" />
							<span className="text-sm">Obteniendo dirección...</span>
						</div>
					</div>
				)}
				<div className="absolute bottom-2 left-2 bg-stone-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
					Haz clic en el mapa para seleccionar una ubicación
				</div>
				{userLocation && (
					<div className="absolute top-2 right-2 bg-green-600 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
						📍 Ubicación actual detectada
					</div>
				)}
			</div>

			{/* Selected Address Display */}
			{selectedAddress && (
				<div className="bg-stone-800 rounded-md p-3 border border-stone-600">
					<div className="flex items-start gap-2">
						<MapPin className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							<div className="text-white text-sm font-medium">
								Dirección seleccionada:
							</div>
							<div className="text-stone-300 text-sm mt-1">
								{selectedAddress}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
