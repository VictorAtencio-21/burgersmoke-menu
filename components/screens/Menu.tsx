"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { MenuItem } from "@/contexts/cart-context";
import { DishModal } from "@/components/dish-modal";

export default function Menu({ menu }: { menu: MenuItem[] }) {
	const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>(menu);
	const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

	// categories list recalculated whenever menu changes
	const categories = [
		"Todos",
		...Array.from(new Set(menu.map((i) => i.category))),
	];

	// re-filter as user changes search / category
	useEffect(() => {
		let m = menu;
		if (selectedCategory !== "Todos") {
			m = m.filter((i) => i.category === selectedCategory);
		}
		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			m = m.filter(
				(i) =>
					i.name.toLowerCase().includes(term) ||
					i.description.toLowerCase().includes(term)
			);
		}
		setFilteredMenu(m);
	}, [menu, selectedCategory, searchTerm]);

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-stone-900 min-h-screen">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white mb-4">Nuestro Menú</h1>

				{/* Search + Category Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Buscar platos..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 bg-stone-950 border-none text-white placeholder-gray-400"
						/>
					</div>
					<div className="w-full sm:w-auto overflow-x-auto">
						<div className="flex gap-2 pb-2 min-w-max">
							{categories.map((cat) => (
								<Button
									key={cat}
									variant={selectedCategory === cat ? "default" : "outline"}
									size="sm"
									onClick={() => setSelectedCategory(cat)}
									className={
										selectedCategory === cat
											? "bg-red-700 hover:bg-red-600 text-white whitespace-nowrap"
											: "border-none text-gray-900 hover:bg-red-900/20 hover:text-white whitespace-nowrap"
									}
								>
									{cat}
								</Button>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Dishes Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredMenu.map((dish) => (
					<Card
						key={dish.id}
						className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer bg-stone-950 border-none flex flex-col"
						onClick={() => setSelectedDish(dish)}
					>
						{/* <div className="aspect-video bg-gray-700 relative">
							{dish.image && dish.image !== "" && (
								<img
									src={dish.image}
									alt={dish.name}
									className="w-full h-full object-cover"
								/>
							)}
							<Badge className="absolute top-2 right-2 bg-red-700 text-white">
								{dish.category}
							</Badge>
						</div> */}

						<CardHeader>
							<CardTitle className="flex justify-between items-start">
								<span className="text-lg text-white">{dish.name}</span>
								<span className="text-lg font-bold text-white">
									${Number(dish.price).toFixed(2)}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col justify-between flex-1">
							<div>
								<p className="text-gray-300 text-sm mb-4">{dish.description}</p>
								<div className="flex flex-wrap gap-1 mb-4">
									{dish.ingredients.slice(0, 3).map((ing, idx) => (
										<Badge
											key={idx}
											variant="secondary"
											className="text-xs bg-gray-700 text-gray-300 capitalize"
										>
											{ing}
										</Badge>
									))}
									{dish.ingredients.length > 3 && (
										<Badge
											variant="secondary"
											className="text-xs bg-gray-700 text-gray-300"
										>
											+{dish.ingredients.length - 3} más
										</Badge>
									)}
								</div>
							</div>
							<Button
								className="w-full bg-red-700 hover:bg-red-600 text-white"
								onClick={(e) => {
									e.stopPropagation();
									setSelectedDish(dish);
								}}
							>
								Personalizar y Agregar
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

                        {filteredMenu.length === 0 && (
                                <div className="min-h-[40vh] flex items-center justify-center bg-gradient-to-br from-stone-900 to-stone-700 rounded-lg p-6 my-8">
                                        <div className="text-center max-w-md mx-auto">
                                                <div className="text-6xl mb-4 animate-bounce">🔍</div>
                                                <h2 className="text-white text-2xl font-bold mb-3">
                                                        No encontramos platos
                                                </h2>
                                                <p className="text-white/80 text-lg mb-6">
                                                        Intenta otro término o revisa la categoría seleccionada.
                                                </p>
                                                <Button
                                                        onClick={() => {
                                                                setSearchTerm("");
                                                                setSelectedCategory("Todos");
                                                        }}
                                                        className="bg-white text-red-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all"
                                                >
                                                        Ver todo el menú
                                                </Button>
                                        </div>
                                </div>
                        )}

			{selectedDish && (
				<DishModal
					dish={selectedDish}
					isOpen={!!selectedDish}
					onClose={() => setSelectedDish(null)}
				/>
			)}
		</div>
	);
}
