"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, X } from "lucide-react";
import { type MenuItem, useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";

interface DishModalProps {
	dish: MenuItem;
	isOpen: boolean;
	onClose: () => void;
}

export function DishModal({ dish, isOpen, onClose }: DishModalProps) {
	const [quantity, setQuantity] = useState(1);
	const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
	const [specialInstructions, setSpecialInstructions] = useState("");
	const { addItem } = useCart();
	const { toast } = useToast();

	const handleIngredientToggle = (ingredient: string) => {
		setExcludedIngredients((prev) =>
			prev.includes(ingredient)
				? prev.filter((i) => i !== ingredient)
				: [...prev, ingredient]
		);
	};

	const handleAddToCart = () => {
		addItem({
			...dish,
			quantity,
			excludedIngredients,
			specialInstructions,
		});

		toast({
			title: "Agregado al Carrito",
			description: `${dish.name} se ha agregado al carrito.`,
		});

		onClose();
		setQuantity(1);
		setExcludedIngredients([]);
		setSpecialInstructions("");
	};

	const totalPrice = dish.price * quantity;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-stone-800 border-none text-white p-0 custom-scrollbar">
				{/* Mobile Header with Close Button */}
				<div className="sticky top-0 bg-stone-800 border-b border-none  p-4 flex items-center justify-between z-[100]">
					<DialogTitle className="text-lg font-bold pr-4">
						{dish.name}
					</DialogTitle>
				</div>

				<div className="p-4 space-y-6">
					{/* Dish Image and Info */}
					<div className="space-y-3">
						{/* <div className="aspect-video bg-stone-200 rounded-lg overflow-hidden">
              <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="w-full h-full object-cover" />
            </div> */}
						<div>
							<p className="text-stone-400 text-sm mb-3">{dish.description}</p>
							<div className="flex items-center justify-between">
								<Badge className="bg-red-700 text-white text-xs">
									{dish.category}
								</Badge>
								<span className="text-xl font-bold text-white">
									${dish.price.toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					{/* Quantity Selector - Mobile Optimized */}
					<div className="bg-stone-700 rounded-lg p-4">
						<Label className="text-sm font-semibold mb-3 block">
							Cantidad:
						</Label>
						<div className="flex items-center justify-center space-x-4">
							<Button
								variant="outline"
								size="lg"
								onClick={() => setQuantity(Math.max(1, quantity - 1))}
								disabled={quantity <= 1}
								className="h-12 w-12 rounded-full border-none "
							>
								<Minus className="h-5 w-5 text-gray-900" />
							</Button>
							<span className="text-2xl font-bold w-12 text-center">
								{quantity}
							</span>
							<Button
								variant="outline"
								size="lg"
								onClick={() => setQuantity(quantity + 1)}
								className="h-12 w-12 rounded-full border-none "
							>
								<Plus className="h-5 w-5 text-gray-900" />
							</Button>
						</div>
					</div>

					{/* Ingredients Customization - Mobile Optimized */}
					<div>
						<h3 className="text-sm font-semibold mb-3">
							Personalizar Ingredientes
						</h3>
						<p className="text-xs text-stone-400 mb-4">
							Toca para excluir ingredientes que no desees
						</p>
						<div className="space-y-3">
							{dish.ingredients.map((ingredient) => (
								<div
									key={ingredient}
									className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
										excludedIngredients.includes(ingredient)
											? "bg-red-900/20 border-red-700/50"
											: "bg-stone-700 border-stone-600"
									}`}
								>
									<Checkbox
										id={ingredient}
										checked={!excludedIngredients.includes(ingredient)}
										onCheckedChange={() => handleIngredientToggle(ingredient)}
										className="h-5 w-5"
									/>
									<Label
										htmlFor={ingredient}
										className={`text-sm flex-1 cursor-pointer capitalize ${
											excludedIngredients.includes(ingredient)
												? "line-through text-stone-400"
												: "text-stone-200"
										}`}
									>
										{ingredient}
									</Label>
								</div>
							))}
						</div>
					</div>

					{/* Special Instructions - Mobile Optimized */}
					<div>
						<Label
							htmlFor="instructions"
							className="text-sm font-semibold mb-2 block"
						>
							Instrucciones Especiales
						</Label>
						<Textarea
							id="instructions"
							placeholder="Alguna petición especial o modificación..."
							value={specialInstructions}
							onChange={(e) => setSpecialInstructions(e.target.value)}
							className="bg-stone-700 border-none  text-white placeholder-stone-400 min-h-[80px]"
							rows={3}
						/>
					</div>
				</div>

				{/* Sticky Footer with Add to Cart */}
				<div className="sticky bottom-0 bg-stone-800 border-t border-none  p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="text-sm text-stone-400">Total:</span>
						<span className="text-xl font-bold text-white">
							${totalPrice.toFixed(2)}
						</span>
					</div>
					<Button
						onClick={handleAddToCart}
						className="w-full bg-red-700 hover:bg-red-600 h-12 text-base font-semibold"
						size="lg"
					>
						Agregar al Carrito
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
