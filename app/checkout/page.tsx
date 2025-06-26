import Checkout from "@/components/screens/Checkout";
import { getRateByCurrency } from "@/lib/actions/conversion";

export default async function CheckoutPage() {
	try {
		const rate = await getRateByCurrency("dollar");

		console.log("Conversion rate:", rate);

		if (!rate) {
			throw new Error("Failed to fetch conversion rate");
		}

		return <Checkout conversionRate={rate} />;
	} catch (error) {
		console.error("Error loading checkout page:", error);
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-red-700 p-4">
				<div className="text-center max-w-md mx-auto">
					<div className="mb-6">
						<div className="text-6xl mb-4">💳</div>
						<h2 className="text-white text-2xl font-bold mb-3">
							¡Ups! Error en el checkout
						</h2>
						<p className="text-white/80 text-lg mb-6">
							No pudimos cargar la página de pago en este momento. 
							Esto puede ser temporal, intenta de nuevo.
						</p>
					</div>
					
					<button
						onClick={() => window.location.reload()}
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
}
