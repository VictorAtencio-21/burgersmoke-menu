import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, Clock, Star } from "lucide-react";

export default function HomePage() {
	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="bg-gradient-to-r from-stone-900 via-red-900 to-stone-900 text-white py-20 relative overflow-hidden">
				<div className="absolute inset-0 bg-stone-900/20"></div>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
					<h1 className="text-4xl md:text-6xl font-bold mb-6">
						Hecho con calidad y sabor
					</h1>
					<p className="text-xl md:text-2xl mb-8 opacity-90">
						Experimenta las mejores hamburguesas y pizzas, entregadas frescas a
						tu puerta o listo para llevar.
					</p>
					<Link href="/menu">
						<Button
							size="lg"
							className="bg-red-700 hover:bg-red-600 text-white text-lg px-8 py-3 shadow-lg"
						>
							Ver Menú
						</Button>
					</Link>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-16 bg-stone-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h2 className="text-3xl font-bold text-center mb-12 text-white">
						¿Por qué elegir Burger Smoke?
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<Card className="bg-gray-700 border-none ">
							<CardContent className="p-6 text-center">
								<ChefHat className="h-12 w-12 text-white mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2 text-white">
									Ingredientes Premium
								</h3>
								<p className="text-gray-300">
									Carne de res premium seleccionada a mano e ingredientes
									frescos, a la perfección
								</p>
							</CardContent>
						</Card>
						<Card className="bg-gray-700 border-none ">
							<CardContent className="p-6 text-center">
								<Clock className="h-12 w-12 text-white mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2 text-white">
									Entrega Rápida
								</h3>
								<p className="text-gray-300">
									Entrega rápida y confiable para llevar tus hamburguesas
									ahumadas calientes y frescas
								</p>
							</CardContent>
						</Card>
						<Card className="bg-gray-700 border-none ">
							<CardContent className="p-6 text-center">
								<Star className="h-12 w-12 text-white mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2 text-white">
									Perfección Asegurada
								</h3>
								<p className="text-gray-300">
									Cada plato es preparado con amor y atención al detalle,
									garantizando una experiencia deliciosa
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-stone-900">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold mb-4 text-white">
						¿Listo para probar nuestras especialidades?
					</h2>
					<p className="text-xl text-gray-300 mb-8">
						Explora nuestro menú y construye tu pedido perfecto
					</p>
					<Link href="/menu">
						<Button
							size="lg"
							className="bg-red-700 hover:bg-red-600 text-lg px-8 py-3"
						>
							Comenzar a Ordenar
						</Button>
					</Link>
				</div>
			</section>
		</div>
	);
}
