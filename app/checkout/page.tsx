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
			<div className="flex items-center justify-center h-screen">
				<p className="text-red-500">
					Error loading checkout page. Please try again later.
				</p>
			</div>
		);
	}
}
