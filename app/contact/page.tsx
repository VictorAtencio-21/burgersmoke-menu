import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Instagram, MessageCircle } from "lucide-react";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export default function ContactPage() {
	const whatsappNumber = WHATSAPP_NUMBER; // Venezuelan format for WhatsApp
	const whatsappMessage =
		"¡Hola! Quisiera saber màs sobre el menu de Burger Smoke.";

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-stone-900 min-h-screen">
			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-white mb-4">Contáctanos</h1>
				<p className="text-xl text-stone-300">
					Estamos aquí para servirte las mejores hamburgers ahumadas de
					Maracaibo
				</p>
			</div>

			<div className="grid lg:grid-cols-2 gap-8">
				{/* Contact Information */}
				<div className="space-y-6">
					{/* Location */}
					<Card className="bg-stone-800 border-none ">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-white">
								<MapPin className="h-6 w-6 text-white" />
								Ubicación
							</CardTitle>
						</CardHeader>
						<CardContent>
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d304.14812751061334!2d-71.61309633999593!3d10.680753238250476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8999f64652e995%3A0x51e57ea5f97d3196!2sBurgersmokemcbo!5e0!3m2!1ses-419!2snl!4v1751208723721!5m2!1ses-419!2snl"
								width="100%"
								height="350"
								style={{ border: 0, borderRadius: "0.5rem" }}
								allowFullScreen={true}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							></iframe>
						</CardContent>
					</Card>

					{/* Phone & WhatsApp */}
					<Card className="bg-stone-800 border-none ">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-white">
								<Phone className="h-6 w-6 text-white" />
								Teléfono y WhatsApp
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-4">
							<div>
								<p className="text-stone-300 text-lg font-semibold">
									0424-6596009
								</p>
								<p className="text-stone-400 text-sm">
									Llamadas y mensajes de texto
								</p>
							</div>
							<Link
								href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
									whatsappMessage
								)}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button className="bg-green-600 hover:bg-green-700 text-white w-full">
									<MessageCircle className="h-4 w-4 mr-2" />
									Escribir por WhatsApp
								</Button>
							</Link>
						</CardContent>
					</Card>

					{/* Social Media */}
					<Card className="bg-stone-800 border-none ">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-white">
								<Instagram className="h-6 w-6 text-white" />
								Redes Sociales
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Link
								href="https://instagram.com/burgersmokemcbo"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors"
							>
								<Instagram className="h-5 w-5" />
								<span className="text-lg">@burgersmokemcbo</span>
							</Link>
							<p className="text-stone-400 text-sm mt-2">
								Síguenos para ver nuestras últimas creaciones y promociones
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Business Hours */}
				<div className="space-y-6">
					<Card className="bg-stone-800 border-none ">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-white">
								<Clock className="h-6 w-6 text-white" />
								Horarios de Atención
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Text Version of Hours */}
							<div className="space-y-4">
								<div className="border-l-4 border-red-600 pl-4">
									<h3 className="text-white font-semibold text-lg">
										Lunes a Viernes
									</h3>
									<p className="text-stone-300 text-xl">6:00 PM - 11:00 PM</p>
								</div>
								<div className="border-l-4 border-red-600 pl-4">
									<h3 className="text-white font-semibold text-lg">
										Sábados y Domingos
									</h3>
									<p className="text-stone-300 text-xl">12:00 PM - 11:00 PM</p>
								</div>
							</div>

							<div className="bg-stone-700 rounded-lg p-4">
								<p className="text-stone-300 text-sm">
									<strong className="text-white">Nota:</strong> Los pedidos se
									toman hasta 30 minutos antes del cierre. Para pedidos grandes,
									recomendamos contactarnos con anticipación.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card className="bg-stone-800 border-none ">
						<CardHeader>
							<CardTitle className="text-white">Acciones Rápidas</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Link href="/menu" className="block">
								<Button className="w-full bg-red-700 hover:bg-red-600 text-white">
									Ver Nuestro Menú
								</Button>
							</Link>
							<Link
								href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
									"¡Hola! Quiero hacer un pedido."
								)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="block"
							>
								<Button
									variant="outline"
									className="w-full border-none  text-stone-300 hover:bg-red-900/20 hover:text-white text-gray-900"
								>
									Hacer Pedido por WhatsApp
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Additional Information */}
			<div className="mt-12">
				<Card className="bg-stone-800 border-none ">
					<CardHeader>
						<CardTitle className="text-white text-center">
							Sobre Burger Smoke
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center space-y-4">
						<p className="text-stone-300 text-lg">
							En Burger Smoke nos especializamos en hamburguesas con los mejores
							ingredientes. Cada hamburger es preparada al momento con carne
							premium y nuestro toque especial.
						</p>
						<p className="text-stone-400">
							Ubicados en Maracaibo, Venezuela, ofrecemos servicio de delivery
							para que puedas disfrutar de nuestras deliciosas hamburguesas en
							la comodidad de tu hogar.
						</p>
						<div className="flex justify-center gap-4 mt-6">
							<Link href="/menu">
								<Button className="bg-red-700 hover:bg-red-600">
									Explorar Menú
								</Button>
							</Link>
							<Link
								href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
									whatsappMessage
								)}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Button
									variant="outline"
									className="border-none  text-stone-300 hover:bg-red-900/20 hover:text-white text-gray-900"
								>
									Contactar Ahora
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
