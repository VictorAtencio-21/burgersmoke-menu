export interface ConversionRate {
	datetime: {
		date: string;
		time: string;
	};
	monitors: {
		bcv: {
			change: number;
			color: string;
			image: string;
			last_update: string;
			percent: number;
			price: number;
			price_old: number;
			symbol: string;
			title: string;
		};
	};
}
