import { useCart } from "@/contexts/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getRateByCurrency } from "@/lib/actions/conversion"
import Cart from "@/components/screens/Cart"

export default async function CartPage() {
  const rate = await getRateByCurrency("dollar")

  console.log("Conversion rate:", rate)

  return <Cart conversionRate={rate} />
}
