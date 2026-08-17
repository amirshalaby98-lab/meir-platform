import { Button } from "@/components/ui/button";
import { Phone, Menu, X, Wrench, User, LogIn, LogOut, ClipboardList, Info, Cpu, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container flex items-center justify-between py-3">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <div className="w-12 h-12 bg-yellow-400 rounded-none flex items-center justify-center shadow-md" style={{border: '2px solid #000'}}>
            <span className="font-black text-black text-lg leading-none" style={{fontFamily: 'Arial Black, sans-serif', letterSpacing: '-1px'}}>Meir</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/about" className="flex items-center gap-1.5 text-gray-700 hover:text-yellow-500 transition-colors font-medium text-sm">
            <Info className="w-4 h-4" />
            {t("header.about")}
          </Link>
          <a href="#services" className="text-gray-700 hover:text-yellow-500 transition-colors font-medium text-sm">
            {t("header.services")}
          </a>
          <Link href="/service-request" className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 transition-colors font-bold text-sm">
            <Wrench className="w-4 h-4" />
            {t("header.requestService")}
          </Link>
          <Link href="/obd-scanner" className="flex items-center gap-1.5 text-gray-700 hover:text-yellow-500 transition-colors font-medium text-sm">
            <Cpu className="w-4 h-4" />
            {t("header.smartDiagnosis")}
          </Link>

          {/* طلباتي - يظهر فقط للمسجلين */}
          {user && (
            <Link href="/my-orders" className="flex items-center gap-1.5 text-gray-700 hover:text-yellow-500 transition-colors font-medium text-sm">
              <ClipboardList className="w-4 h-4" />
              {t("header.myOrders")}
            </Link>
          )}

          {/* لوحة الفني - يظهر فقط للفنيين والمديرين */}
          {user && (user.role === 'technician' || user.role === 'admin') && (
            <Link href="/technician-orders" className="flex items-center gap-1.5 text-gray-700 hover:text-yellow-500 transition-colors font-medium text-sm">
              <Wrench className="w-4 h-4" />
              {t("header.technicianPanel")}
            </Link>
          )}

          {/* لوحة الإدارة - يظهر فقط للمديرين */}
          {user && user.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors font-medium text-sm">
              <Shield className="w-4 h-4" />
              {t("header.adminPanel")}
            </Link>
          )}

          <LanguageSwitcher />

          {/* زر تسجيل الدخول / حسابي / تسجيل خروج */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/my-orders">
                    <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-bold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user.name?.split(" ")[0] || t("header.myAccount")}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("header.logout")}
                  </Button>
                </div>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    {t("header.login")}
                  </Button>
                </a>
              )}
            </>
          )}

          <a
            href="https://wa.me/966543257872?text=سلام%20مير،%20عندي%20عطل%20وموقعي%20هو:"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t("header.whatsapp")}
            </Button>
          </a>
        </nav>

        {/* Mobile: language switcher + menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-yellow-400 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="container py-4 space-y-3">
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-yellow-500 font-medium py-2">
              <Info className="w-4 h-4" />
              {t("header.about")}
            </Link>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-yellow-500 font-medium py-2">
              {t("header.services")}
            </a>
            <Link href="/service-request" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-bold py-2 text-lg">
              <Wrench className="w-5 h-5" />
              {t("header.requestService")}
            </Link>
            <Link href="/obd-scanner" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-yellow-500 font-medium py-2">
              <Cpu className="w-4 h-4" />
              {t("header.smartDiagnosis")}
            </Link>

            {/* طلباتي - يظهر فقط للمسجلين */}
            {user && (
              <Link href="/my-orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-yellow-500 font-medium py-2">
                <ClipboardList className="w-4 h-4" />
                {t("header.myOrders")}
              </Link>
            )}

            {/* لوحة الفني */}
            {user && (user.role === 'technician' || user.role === 'admin') && (
              <Link href="/technician-orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium py-2">
                <Wrench className="w-4 h-4" />
                {t("header.technicianPanel")}
              </Link>
            )}

            {/* لوحة الإدارة */}
            {user && user.role === 'admin' && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium py-2">
                <Shield className="w-4 h-4" />
                {t("header.adminPanel")}
              </Link>
            )}

            {/* زر تسجيل / دخول أو حسابي + خروج */}
            {!loading && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                {user ? (
                  <>
                    <Link href="/my-orders" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-bold flex items-center justify-center gap-2">
                        <User className="w-5 h-5" />
                        {user.name || t("header.myAccount")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="w-full border-red-300 text-red-600 hover:bg-red-50 font-bold flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      {t("header.signOut")}
                    </Button>
                  </>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-lg flex items-center justify-center gap-2">
                      <LogIn className="w-5 h-5" />
                      {t("header.login")}
                    </Button>
                  </a>
                )}
              </div>
            )}

            <a
              href="https://wa.me/966543257872?text=سلام%20مير،%20عندي%20عطل%20وموقعي%20هو:"
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-2"
            >
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                {t("header.whatsappContact")}
              </Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
