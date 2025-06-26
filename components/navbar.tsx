"use client"

import Link from "next/link"
import { ShoppingCart, MenuIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

export function Navbar() {
  const { items } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="bg-stone-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-900 to-red-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">BS</span>
            </div>
            <span className="font-bold text-xl text-white">Burger Smoke</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/menu" className="text-gray-300 hover:text-white font-medium transition-colors">
              Menú
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white font-medium transition-colors">
              Contacto
            </Link>
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button
                variant="outline"
                size="sm"
                className="relative border-none  text-gray-900 hover:bg-red-900/20 hover:text-white"
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-700"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button variant="outline" size="sm" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-red-900/20">
            <div className="flex flex-col space-y-2">
              <Link
                href="/menu"
                className="text-gray-300 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Menú
              </Link>
              <Link
                href="/contact"
                className="text-gray-300 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contacto
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
