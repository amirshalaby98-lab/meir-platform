import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">عن Meir</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة متخصصة في خدمات صيانة السيارات المتنقلة في مكة وجدة. نوفر خدمات احترافية وسريعة بأسعار منافسة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="/" className="hover:text-yellow-400 transition-colors">الرئيسية</a></li>
              <li><a href="/how-it-works" className="hover:text-yellow-400 transition-colors">كيف يعمل</a></li>
              <li><a href="/courses" className="hover:text-yellow-400 transition-colors">الدورات</a></li>
              <li><a href="/vendor-registration" className="hover:text-yellow-400 transition-colors">انضم كبائع</a></li>
              <li><a href="/about" className="hover:text-yellow-400 transition-colors">من نحن</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">الخدمات</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">صيانة دورية</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">تشخيص أعطال</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">خدمة طوارئ</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">قطع غيار</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <a href="tel:+966543257872" className="hover:text-yellow-400 transition-colors">+966 54 325 7872</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <a href="mailto:info@meir.sa" className="hover:text-yellow-400 transition-colors">info@meir.sa</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span>مكة المكرمة - جدة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">تابعنا</h3>
          <div className="flex gap-4">
            <a href="#" className="bg-gray-800 hover:bg-yellow-400 p-2 rounded-full transition-colors">
              <Facebook className="w-5 h-5 text-white hover:text-black" />
            </a>
            <a href="#" className="bg-gray-800 hover:bg-yellow-400 p-2 rounded-full transition-colors">
              <Twitter className="w-5 h-5 text-white hover:text-black" />
            </a>
            <a href="#" className="bg-gray-800 hover:bg-yellow-400 p-2 rounded-full transition-colors">
              <Instagram className="w-5 h-5 text-white hover:text-black" />
            </a>
            <a href="#" className="bg-gray-800 hover:bg-yellow-400 p-2 rounded-full transition-colors">
              <Linkedin className="w-5 h-5 text-white hover:text-black" />
            </a>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-400 text-sm mb-4">
            <div>
              <a href="/terms-of-service" className="hover:text-yellow-400 transition-colors">الشروط والأحكام</a>
            </div>
            <div>
              <a href="/terms-of-service" className="hover:text-yellow-400 transition-colors">سياسة الخصوصية</a>
            </div>
            <div>
              <a href="/terms-of-service" className="hover:text-yellow-400 transition-colors">سياسة الاسترجاع</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-xs">
            <p>&copy; {currentYear} منصة Meir. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
