import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "كيف يعمل", href: "/how-it-works" },
    { label: "احسب التكلفة", href: "/price-calculator" },
    { label: "الدورات", href: "/courses" },
    { label: "اطلب خدمة", href: "/book-technician" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl text-black hover:text-yellow-600 transition-colors">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-bold">
                M
              </div>
              <span>Meir</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a className="text-gray-700 hover:text-yellow-600 font-medium transition-colors">
                  {link.label}
                </a>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://wa.me/966543257872" target="_blank" rel="noopener noreferrer">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                تواصل واتساب
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-black" />
            ) : (
              <Menu className="w-6 h-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col gap-2 p-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className="block px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <a
                href="https://wa.me/966543257872"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold">
                  تواصل واتساب
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
