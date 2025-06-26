import Checkout from "@/components/screens/Checkout";
import { getRateByCurrency } from "@/lib/actions/conversion";

export default async function CheckoutPage() {
	try {
		const rate = await getRateByCurrency("dollar");

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
					
					<p className="text-white/60 text-sm mt-4">
						Si el problema persiste, contacta a nuestro equipo
					</p>
				</div>
			</div>
		);
	}
}
