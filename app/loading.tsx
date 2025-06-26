export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-900 to-stone-700 p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6">
          <div className="text-6xl mb-4 animate-bounce">🏠</div>
          <h2 className="text-white text-2xl font-bold mb-3">
            Cargando Burger Smoke...
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Estamos preparando la mejor experiencia para ti.
          </p>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        <p className="text-white/60 text-sm mt-6">Gracias por tu paciencia</p>
      </div>
    </div>
  );
}
