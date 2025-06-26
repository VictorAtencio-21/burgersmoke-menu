"use client"

import { useCart } from "@/contexts/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ConversionRate } from "@/lib/types/ConversionRate"

export default function Cart({ conversionRate }: { conversionRate?: ConversionRate  }) {
  const { items, updateQuantity, removeItem, total } = useCart()
  const router = useRouter()

  // Calculate total in Bolívares
  const totalInBs = conversionRate?.monitors?.bcv?.price ? total * conversionRate.monitors.bcv.price : 0

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-stone-900 min-h-screen">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h1>
        <p className="text-gray-400 mb-8">¡Agrega algunas deliciosas opciones para comenzar!</p>
        <Link href="/menu">
          <Button className="bg-red-700 hover:bg-red-600">Explorar Menú</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-stone-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Tu Carrito</h1>

      <div className="space-y-4 mb-8">
        {items.map((item, index) => (
          <Card key={`${item.id}-${index}`} className="bg-stone-950 border-none ">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* <div className="w-full sm:w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                </div> */}

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:text-gray-900 bg-stone-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-gray-300 text-sm">{item.description}</p>

                  {item.excludedIngredients.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-600">Excluidos:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.excludedIngredients.map((ingredient, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            Sin {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.specialInstructions && (
                    <div>
                      <p className="text-sm font-medium text-blue-600">Instrucciones Especiales:</p>
                      <p className="text-sm text-gray-600">{item.specialInstructions}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold w-8 text-center text-white">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                      {conversionRate?.monitors?.bcv?.price && (
                        <p className="text-sm text-gray-400">
                          Bs. {((item.price * item.quantity) * conversionRate.monitors.bcv.price).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <Card className="bg-stone-950 border-none ">
        <CardHeader>
          <CardTitle className="text-white">Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-white">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <div className="text-right">
                <span>${total.toFixed(2)}</span>
                {conversionRate?.monitors?.bcv?.price && (
                  <p className="text-sm text-gray-400">
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
                  <p className="text-sm text-gray-400 font-normal">
                    Bs. {totalInBs.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {conversionRate?.monitors?.bcv?.price && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Precios calculados al BCV del día: Bs. {conversionRate.monitors.bcv.price.toFixed(2)} por USD
            </p>
          )}

          <div className="flex gap-4 mt-6">
            <Link href="/menu" className="flex-1">
              <Button variant="outline" className="w-full border-none text-gray-900 hover:bg-red-900/20 hover:text-white">
                Seguir Comprando
              </Button>
            </Link>
            <Button className="flex-1 bg-green-700 hover:bg-green-900" onClick={() => router.push("/checkout")}>
              Proceder al Pago
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
