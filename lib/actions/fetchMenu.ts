"use server";
import Papa from "papaparse";
import { MenuItem } from "@/contexts/cart-context";

export async function fetchMenu(): Promise<MenuItem[]> {
  const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_CSV_URL!;
  const res = await fetch(SHEET_URL);
  if (!res.ok) throw new Error("Failed to fetch menu data");
  const csv = await res.text();

  // Parse into generic row objects
  const { data } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return data.map(row => {
    // Pull out your known fields; everything else goes into `rest`
    const {
      id      = "",
      name    = "",
      description = "",
      category = "Other",
      price   = "0",
      image   = "",
      ingredients = "",
      ...rest
    } = row;

    // Build an ingredients array from the "ingredients" column +
    // any other non-empty columns in the sheet
    const allIngredients = [
      ingredients,
      ...Object.values(rest),
    ]
      .filter(cell => cell && cell.trim() !== "")
      .map(cell => cell.trim());

    return {
      id,
      name,
      description,
      category,
      price: parseFloat(price),
      image: image || "/placeholder.svg?height=200&width=300",
      ingredients: allIngredients,
    } as MenuItem;
  });
}
