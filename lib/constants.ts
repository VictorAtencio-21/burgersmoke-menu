export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER || "";

// Leaflet does not require an API key, but you can configure a custom
// tile provider by setting this URL via environment variable if desired.
export const LEAFLET_TILE_URL =
  process.env.NEXT_PUBLIC_LEAFLET_TILE_URL ||
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
