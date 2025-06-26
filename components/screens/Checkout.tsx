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
import { Upload, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/actions/uploadToCloudinary";
import { ConversionRate } from "@/lib/types/ConversionRate";

export default function Checkout({ conversionRate }: { conversionRate?: ConversionRate }) {
	const { items, total, clearCart } = useCart();
	const { toast } = useToast();
	const router = useRouter();

	// Calculate total in Bolívares
	const totalInBs = conversionRate?.monitors?.bcv?.price ? total * conversionRate.monitors.bcv.price : 0;

	const [customerInfo, setCustomerInfo] = useState({
		name: "",
		phone: "",
		address: "",
		notes: "",
	});

	const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (field: string, value: string) => {
		setCustomerInfo((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setPaymentScreenshot(file);
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

		setIsSubmitting(true);

		try {
			// In a real application, you would upload the image to your server first
			// and then send the WhatsApp message with the image URL

			// 1) Upload the image and get back its URL
			const receiptUrl = await uploadToCloudinary(paymentScreenshot);

			const whatsappMessage = `
      ${generateWhatsAppMessage()}

Comprobante de pago: ${receiptUrl}`;

			const phoneNumber = WHATSAPP_NUMBER // Replace with actual restaurant WhatsApp number
			const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
				whatsappMessage
			)}`;

			// Open WhatsApp
			window.open(whatsappUrl, "_blank");

			// Clear cart and redirect
			clearCart();

			toast({
				title: "¡Pedido Enviado!",
				description:
					"Tu pedido ha sido enviado por WhatsApp. ¡Te contactaremos pronto!",
			});

			router.push("/order-success");
		} catch (error) {
			toast({
				title: "Error",
				description:
					"Hubo un error al enviar tu pedido. Por favor intenta de nuevo.",
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

			<div className="grid lg:grid-cols-2 gap-8">
				{/* Customer Information */}
				<div className="space-y-6">
					<Card className="bg-stone-950 border-none ">
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
								<Textarea
									id="address"
									value={customerInfo.address}
									onChange={(e) => handleInputChange("address", e.target.value)}
									placeholder="Ingresa tu dirección completa de entrega"
									rows={3}
									className="bg-stone-700 border-none  text-white placeholder-stone-400"
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
					<Card className="bg-stone-950 border-none ">
						<CardHeader>
							<CardTitle className="text-white">Confirmación de Pago</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<p className="text-sm text-stone-300">
									Por favor realiza tu pago y sube una captura de pantalla como
									confirmación.
								</p>

								<div className="border-2 border-dashed border-none  rounded-lg p-6 text-center">
									<Upload className="h-12 w-12 text-stone-400 mx-auto mb-4" />
									<Label
										htmlFor="payment-screenshot"
										className="cursor-pointer"
									>
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

				{/* Order Summary */}
				<Card className="bg-stone-950 border-none ">
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
												Bs. {((item.price * item.quantity) * conversionRate.monitors.bcv.price).toFixed(2)}
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
									Precios calculados al BCV del día: Bs. {conversionRate.monitors.bcv.price.toFixed(2)} por USD
								</p>
							)}

							<Button
								onClick={handleSubmitOrder}
								disabled={isSubmitting}
								className="w-full bg-green-700 hover:bg-green-600 mt-6"
								size="lg"
							>
								<Phone className="h-4 w-4 mr-2" />
								{isSubmitting ? "Enviando..." : "Enviar Pedido por WhatsApp"}
							</Button>

							<p className="text-xs text-stone-400 text-center">
								Tu pedido será enviado a Burger Smoke por WhatsApp
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
