"use client";
import type React from "react";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
	Upload,
	Phone,
	CreditCard,
	QrCode,
	Banknote,
	Mail,
	Smartphone,
	Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/actions/uploadToCloudinary";
import { ConversionRate } from "@/lib/types/ConversionRate";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import AddressSearchMap from "@/components/AddressSearchMap";

export default function Checkout({
	conversionRate,
}: {
	conversionRate?: ConversionRate;
}) {
	const { items, total, clearCart } = useCart();
	const { toast } = useToast();
	const router = useRouter();

	// Calculate total in Bolívares
	const totalInBs = conversionRate?.monitors?.bcv?.price
		? total * conversionRate.monitors.bcv.price
		: 0;

	const [customerInfo, setCustomerInfo] = useState({
		name: "",
		phone: "",
		address: "",
		notes: "",
	});

	const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [whatsappUrl, setWhatsappUrl] = useState<string>("");
	const [showManualLink, setShowManualLink] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setCustomerInfo((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setPaymentScreenshot(file);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: "Enlace Copiado",
				description: "El enlace de WhatsApp ha sido copiado al portapapeles.",
			});
		} catch (error) {
			toast({
				title: "Error al Copiar",
				description: "No se pudo copiar el enlace automáticamente.",
				variant: "destructive",
			});
		}
	};

	const copyPaymentInfo = async (text: string, type: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: "Información Copiada",
				description: `${type} ha sido copiado al portapapeles.`,
			});
		} catch (error) {
			toast({
				title: "Error al Copiar",
				description: "No se pudo copiar la información automáticamente.",
				variant: "destructive",
			});
		}
	};

	const generateWhatsAppMessage = () => {
		const orderDetails = items
			.map((item) => {
				const excludedText =
					item.excludedIngredients.length > 0
						? ` (Sin: ${item.excludedIngredients.join(", ")})`
						: "";
				const instructionsText = item.specialInstructions
					? ` - Instrucciones: ${item.specialInstructions}`
					: "";

				return `• ${item.quantity}x ${
					item.name
				}${excludedText}${instructionsText} - $${(
					item.price * item.quantity
				).toFixed(2)}`;
			})
			.join("\n");

		const bcvRate = conversionRate?.monitors?.bcv?.price;
		const totalInBs = bcvRate ? total * bcvRate : 0;

		return `*NUEVO PEDIDO*

*Cliente:* ${customerInfo.name}
*Teléfono:* ${customerInfo.phone}
*Dirección:* ${customerInfo.address}

*PEDIDO:*
${orderDetails}

*RESUMEN:*
Subtotal: $${total.toFixed(2)}${bcvRate ? ` / Bs. ${totalInBs.toFixed(2)}` : ""}
*Total: $${total.toFixed(2)}${bcvRate ? ` / Bs. ${totalInBs.toFixed(2)}` : ""}*

${bcvRate ? `*Tasa BCV:* Bs. ${bcvRate.toFixed(2)} por USD` : ""}

${customerInfo.notes ? `*Notas adicionales:* ${customerInfo.notes}` : ""}
`;
	};

	const handleSubmitOrder = async () => {
		if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
			toast({
				title: "Información Faltante",
				description: "Por favor completa todos los campos requeridos.",
				variant: "destructive",
			});
			return;
		}

		if (!paymentScreenshot) {
			toast({
				title: "Comprobante de Pago Requerido",
				description: "Por favor sube una captura de pantalla de tu pago.",
				variant: "destructive",
			});
			return;
		}

		// Check if WhatsApp number is configured
		if (!WHATSAPP_NUMBER) {
			toast({
				title: "Error de Configuración",
				description:
					"El número de WhatsApp no está configurado. Contacta al administrador.",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// 1) Upload the image and get back its URL
			const receiptUrl = await uploadToCloudinary(paymentScreenshot);

			// 2) Generate WhatsApp message
			const whatsappMessage = generateWhatsAppMessage();
			const fullMessage = `${whatsappMessage}\n\nComprobante de pago: ${receiptUrl}`;

			// 3) Check message length (WhatsApp has ~2000 character limit for URL)
			const encodedMessage = encodeURIComponent(fullMessage);
			if (encodedMessage.length > 1800) {
				// Leave some buffer
				toast({
					title: "Mensaje Demasiado Largo",
					description:
						"El pedido es muy extenso. Considera dividirlo en pedidos más pequeños.",
					variant: "destructive",
				});
				return;
			}

			// 4) Validate phone number format
			const cleanPhoneNumber = WHATSAPP_NUMBER.replace(/\D/g, ""); // Remove non-digits
			if (cleanPhoneNumber.length < 10) {
				toast({
					title: "Número de WhatsApp Inválido",
					description: "El número de WhatsApp configurado no es válido.",
					variant: "destructive",
				});
				return;
			}

			// 5) Create WhatsApp URL
			const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

			// 6) Open WhatsApp
			const newWindow = window.open(whatsappUrl, "_blank");

			if (!newWindow) {
				setWhatsappUrl(whatsappUrl);
				setShowManualLink(true);
				toast({
					title: "WhatsApp No Se Abrió Automáticamente",
					description: "Usa el enlace manual de abajo para enviar tu pedido.",
					variant: "destructive",
				});
				return;
			}

			// 7) Clear cart and redirect
			clearCart();

			toast({
				title: "¡Pedido Enviado!",
				description:
					"Tu pedido ha sido enviado por WhatsApp. ¡Te contactaremos pronto!",
			});

			router.push("/order-success");
		} catch (error) {
			console.error("Error sending order:", error);

			let errorMessage =
				"Hubo un error al enviar tu pedido. Por favor intenta de nuevo.";

			if (error instanceof Error) {
				if (error.message.includes("Upload failed")) {
					errorMessage =
						"Error al subir la imagen. Verifica tu conexión a internet.";
				} else if (error.message.includes("fetch")) {
					errorMessage = "Error de conexión. Verifica tu internet.";
				}
			}

			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (items.length === 0) {
		router.push("/cart");
		return null;
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-stone-900 min-h-screen">
			<h1 className="text-3xl font-bold text-white mb-8">Pago</h1>

			<div className="space-y-6 lg:space-y-8">
				{/* Order Summary - Always visible at top */}
				<Card className="bg-stone-950 border-none">
					<CardHeader>
						<CardTitle className="text-white">Resumen del Pedido</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{items.map((item, index) => (
								<div
									key={`${item.id}-${index}`}
									className="flex justify-between items-start"
								>
									<div className="flex-1">
										<h4 className="font-medium text-white">{item.name}</h4>
										<p className="text-sm text-stone-400">
											Cant: {item.quantity}
										</p>
										{item.excludedIngredients.length > 0 && (
											<p className="text-xs text-white">
												Excluidos: {item.excludedIngredients.join(", ")}
											</p>
										)}
									</div>
									<div className="text-right">
										<span className="font-medium text-white">
											${(item.price * item.quantity).toFixed(2)}
										</span>
										{conversionRate?.monitors?.bcv?.price && (
											<p className="text-sm text-stone-400">
												Bs.{" "}
												{(
													item.price *
													item.quantity *
													conversionRate.monitors.bcv.price
												).toFixed(2)}
											</p>
										)}
									</div>
								</div>
							))}

							<Separator className="border-none " />

							<div className="space-y-2 text-white">
								<div className="flex justify-between">
									<span>Subtotal</span>
									<div className="text-right">
										<span>${total.toFixed(2)}</span>
										{conversionRate?.monitors?.bcv?.price && (
											<p className="text-sm text-stone-400">
												Bs. {totalInBs.toFixed(2)}
											</p>
										)}
									</div>
								</div>
								<Separator className="border-none " />
								<div className="flex justify-between text-lg font-bold">
									<span>Total</span>
									<div className="text-right">
										<span className="text-white">${total.toFixed(2)}</span>
										{conversionRate?.monitors?.bcv?.price && (
											<p className="text-sm text-stone-400 font-normal">
												Bs. {totalInBs.toFixed(2)}
											</p>
										)}
									</div>
								</div>
							</div>

							{conversionRate?.monitors?.bcv?.price && (
								<p className="text-xs text-stone-400 mt-2 text-center">
									Precios calculados al BCV del día: Bs.{" "}
									{conversionRate.monitors.bcv.price.toFixed(2)} por USD
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Main Content Grid - Payment Methods and Customer Info */}
				<div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
					{/* Left Column - Payment Methods */}
					<div className="space-y-6">
						<Card className="bg-stone-950 border-none">
							<CardHeader>
								<CardTitle className="text-white">
									Métodos de Pago Disponibles
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Pago Móvil */}
									<div className="border border-stone-700 rounded-lg p-4">
										<div className="flex items-center gap-3 mb-3">
											<Smartphone className="h-5 w-5 text-green-500" />
											<h4 className="font-semibold text-white">Pago Móvil</h4>
										</div>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-stone-400">Titular:</span>
												<span className="text-white">
													MARIA INES MARQUEZ SANSONE
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-stone-400">Documento:</span>
												<span className="text-white">V15560424</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-stone-400">Teléfono:</span>
												<div className="flex items-center gap-2">
													<span className="text-white">+58 414 6373862</span>
													<Button
														onClick={() =>
															copyPaymentInfo("+58 414 6373862", "Teléfono")
														}
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 text-stone-400 hover:text-white"
													>
														<Copy className="h-3 w-3" />
													</Button>
												</div>
											</div>
										</div>
									</div>

									{/* Transferencia */}
									<div className="border border-stone-700 rounded-lg p-4">
										<div className="flex items-center gap-3 mb-3">
											<Banknote className="h-5 w-5 text-blue-500" />
											<h4 className="font-semibold text-white">
												Transferencia
											</h4>
										</div>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-stone-400">Titular:</span>
												<span className="text-white">
													MARIA INES MARQUEZ SANSONE
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-stone-400">Documento:</span>
												<span className="text-white">V15560424</span>
											</div>
											<div className="flex justify-between">
												<span className="text-stone-400">Banco:</span>
												<span className="text-white">Bancamiga</span>
											</div>
											<div className="flex justify-between">
												<span className="text-stone-400">Tipo de cuenta:</span>
												<span className="text-white">
													Cuenta Corriente Amiga
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-stone-400">Número:</span>
												<div className="flex items-center gap-2">
													<span className="text-white font-mono">
														01720110711109453801
													</span>
													<Button
														onClick={() =>
															copyPaymentInfo(
																"01720110711109453801",
																"Número de cuenta"
															)
														}
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 text-stone-400 hover:text-white"
													>
														<Copy className="h-3 w-3" />
													</Button>
												</div>
											</div>
										</div>
									</div>

									{/* Binance */}
									<div className="border border-stone-700 rounded-lg p-4">
										<div className="flex items-center gap-3 mb-3">
											<QrCode className="h-5 w-5 text-yellow-500" />
											<h4 className="font-semibold text-white">Binance</h4>
										</div>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between items-center">
												<span className="text-stone-400">ID:</span>
												<div className="flex items-center gap-2">
													<span className="text-white">775998050</span>
													<Button
														onClick={() =>
															copyPaymentInfo("775998050", "ID de Binance")
														}
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 text-stone-400 hover:text-white"
													>
														<Copy className="h-3 w-3" />
													</Button>
												</div>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-stone-400">Email:</span>
												<div className="flex items-center gap-2">
													<span className="text-white">Mims81@gmail.com</span>
													<Button
														onClick={() =>
															copyPaymentInfo("Mims81@gmail.com", "Email")
														}
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 text-stone-400 hover:text-white"
													>
														<Copy className="h-3 w-3" />
													</Button>
												</div>
											</div>
										</div>
									</div>

									<div className="bg-stone-800 rounded-lg p-3 mt-4">
										<p className="text-xs text-stone-300 text-center">
											💡 <strong>Consejo:</strong> Después de realizar el pago,
											toma una captura de pantalla del comprobante y súbela
											donde se le solicita. Esto ayudará a confirmar tu pedido
											más rápido.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-stone-950 border-none">
							<CardHeader>
								<CardTitle className="text-white">Nuestra dirección</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<iframe
										src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d304.14812751061334!2d-71.61309633999593!3d10.680753238250476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8999f64652e995%3A0x51e57ea5f97d3196!2sBurgersmokemcbo!5e0!3m2!1ses-419!2snl!4v1751208723721!5m2!1ses-419!2snl"
										width="100%"
										height="350"
										style={{ border: 0 }}
										allowFullScreen={true}
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
									></iframe>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Customer Information and Payment Upload */}
					<div className="space-y-6">
						{/* Customer Information */}
						<Card className="bg-stone-950 border-none">
							<CardHeader>
								<CardTitle className="text-white">
									Información del Cliente
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="name" className="text-stone-300">
										Nombre Completo *
									</Label>
									<Input
										id="name"
										value={customerInfo.name}
										onChange={(e) => handleInputChange("name", e.target.value)}
										placeholder="Ingresa tu nombre completo"
										className="bg-stone-700 border-none  text-white placeholder-stone-400"
									/>
								</div>

								<div>
									<Label htmlFor="phone" className="text-stone-300">
										Número de Teléfono *
									</Label>
									<Input
										id="phone"
										value={customerInfo.phone}
										onChange={(e) => handleInputChange("phone", e.target.value)}
										placeholder="Ingresa tu número de teléfono"
										className="bg-stone-700 border-none  text-white placeholder-stone-400"
									/>
								</div>

								<div>
									<Label htmlFor="address" className="text-stone-300">
										Dirección de Entrega *
									</Label>
									<AddressSearchMap
										initialAddress={customerInfo.address}
										onSelect={(addr) => handleInputChange("address", addr)}
									/>
								</div>

								<div>
									<Label htmlFor="notes" className="text-stone-300">
										Notas Adicionales
									</Label>
									<Textarea
										id="notes"
										value={customerInfo.notes}
										onChange={(e) => handleInputChange("notes", e.target.value)}
										placeholder="Cualquier instrucción especial o nota"
										rows={2}
										className="bg-stone-700 border-none  text-white placeholder-stone-400"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Payment Upload */}
						<Card className="bg-stone-950 border-none">
							<CardHeader>
								<CardTitle className="text-white">
									Confirmación de Pago
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<p className="text-sm text-stone-300">
										Por favor realiza tu pago y sube una captura de pantalla
										como confirmación.
									</p>

									<div className="border-2 border-dashed border-none  rounded-lg p-6 text-center">
										<Label
											htmlFor="payment-screenshot"
											className="cursor-pointer flex flex-col items-center"
										>
											<Upload className="h-12 w-12 text-stone-400 mx-auto mb-4" />
											<span className="text-sm font-medium text-white hover:text-red-300">
												Subir captura de pantalla del pago
											</span>
											<Input
												id="payment-screenshot"
												type="file"
												accept="image/*"
												onChange={handleFileUpload}
												className="hidden"
											/>
										</Label>
										{paymentScreenshot && (
											<p className="text-sm text-green-600 mt-2">
												✓ {paymentScreenshot.name}
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Submit Order - Sticky at bottom on mobile, normal flow on desktop */}
				<div className="lg:hidden">
					<Card className="bg-stone-950 border-none">
						<CardContent className="pt-6">
							<Button
								onClick={handleSubmitOrder}
								disabled={isSubmitting}
								className="w-full bg-green-700 hover:bg-green-600"
								size="lg"
							>
								<Phone className="h-4 w-4 mr-2" />
								{isSubmitting ? "Enviando..." : "Enviar Pedido por WhatsApp"}
							</Button>

							{showManualLink && whatsappUrl && (
								<div className="mt-4 p-4 bg-stone-800 rounded-lg border border-stone-600">
									<p className="text-sm text-stone-300 mb-3">
										WhatsApp no se abrió automáticamente. Copia y pega este
										enlace:
									</p>
									<div className="flex gap-2">
										<Input
											value={whatsappUrl}
											readOnly
											className="bg-stone-700 border-none text-white text-sm"
										/>
										<Button
											onClick={() => copyToClipboard(whatsappUrl)}
											variant="outline"
											size="sm"
											className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
										>
											Copiar
										</Button>
									</div>
									<p className="text-xs text-stone-400 mt-2">
										Pega este enlace en tu navegador para abrir WhatsApp
									</p>
								</div>
							)}

							<p className="text-xs text-stone-400 text-center mt-4">
								Tu pedido será enviado a Burger Smoke por WhatsApp
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Desktop Submit Button - Fixed position */}
				<div className="hidden lg:block">
					<Card className="bg-stone-950 border-none sticky bottom-6">
						<CardContent className="pt-6">
							<Button
								onClick={handleSubmitOrder}
								disabled={isSubmitting}
								className="w-full bg-green-700 hover:bg-green-600"
								size="lg"
							>
								<Phone className="h-4 w-4 mr-2" />
								{isSubmitting ? "Enviando..." : "Enviar Pedido por WhatsApp"}
							</Button>

							{showManualLink && whatsappUrl && (
								<div className="mt-4 p-4 bg-stone-800 rounded-lg border border-stone-600">
									<p className="text-sm text-stone-300 mb-3">
										WhatsApp no se abrió automáticamente. Copia y pega este
										enlace:
									</p>
									<div className="flex gap-2">
										<Input
											value={whatsappUrl}
											readOnly
											className="bg-stone-700 border-none text-white text-sm"
										/>
										<Button
											onClick={() => copyToClipboard(whatsappUrl)}
											variant="outline"
											size="sm"
											className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
										>
											Copiar
										</Button>
									</div>
									<p className="text-xs text-stone-400 mt-2">
										Pega este enlace en tu navegador para abrir WhatsApp
									</p>
								</div>
							)}

							<p className="text-xs text-stone-400 text-center mt-4">
								Tu pedido será enviado a Burger Smoke por WhatsApp
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
