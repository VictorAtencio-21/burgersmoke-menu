"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    reset();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 to-stone-700 p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <div className="text-6xl mb-4">📞</div>
          <h2 className="text-white text-2xl font-bold mb-3">¡Ups! Algo salió mal</h2>
          <p className="text-white/80 text-lg mb-6">
            No pudimos cargar nuestra información de contacto.
            Intenta nuevamente más tarde.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="bg-white text-red-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          🔄 Intentar de nuevo
        </button>

        <p className="text-white/60 text-sm mt-4">
          Si el problema persiste, contacta a nuestro equipo
        </p>
      </div>
    </div>
  );
}
