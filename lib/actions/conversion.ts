"use server";

const CONVERSION_URL = process.env.NEXT_PUBLIC_CONVERSION_URL!;

export const getRateByCurrency = async (currency = "dollar") => {
	try {
		const response = await fetch(`${CONVERSION_URL}/${currency}?format_date=default&rounded_price=true`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch current change");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching current change:", error);
		throw new Error("Failed to fetch current change");
	}
};
