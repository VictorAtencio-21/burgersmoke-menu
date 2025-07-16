import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/contexts/cart-context";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Burger Smoke - Hamburguesas y Pizzas Premium",
	description:
		"Disfruta de las mejores hamburguesas y pizzas premium en Burger Smoke. Sabores únicos y calidad excepcional.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} custom-scrollbar`}>
                                <CartProvider>
                                        <Navbar />
                                        <main className="min-h-screen bg-stone-900">{children}</main>
                                        <Footer />
                                        <Toaster />
                                </CartProvider>
				<Analytics />
			</body>
		</html>
	);
}
