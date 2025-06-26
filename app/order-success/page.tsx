import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Phone, Clock } from "lucide-react"

export default function OrderSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center bg-stone-900 min-h-screen">
      <Card className="bg-stone-950 border-none ">
        <CardContent className="p-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />

          <h1 className="text-3xl font-bold text-white mb-4">¡Pedido Enviado Exitosamente!</h1>

          <p className="text-gray-300 mb-8">
            Tu pedido ha sido enviado a Burger Smoke por WhatsApp. Deberías recibir una llamada de confirmación pronto.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Phone className="h-4 w-4" />
              <span>Te llamaremos para confirmar</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Tiempo estimado de entrega: 30-45 min</span>
            </div>
          </div>

          <div className="space-y-4">
            <Link href="/menu">
              <Button className="bg-red-700 hover:bg-red-600 mr-4">Ordenar de Nuevo</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-none  text-gray-300 hover:bg-red-900/20">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
