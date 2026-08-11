import { MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

export default function CoverageMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // تحميل Leaflet CSS
    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkEl);

    // تحميل Leaflet JS
    const scriptEl = document.createElement("script");
    scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    scriptEl.onload = () => {
      if (!mapRef.current) return;
      const L = (window as any).L;
      
      // إنشاء الخريطة - مركز بين مكة وجدة
      const map = L.map(mapRef.current, {
        center: [21.52, 39.95],
        zoom: 10,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false,
      });

      // إضافة طبقة الخريطة
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // أيقونة مخصصة
      const redIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:#dc2626;width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <div style="width:10px;height:10px;background:white;border-radius:50%;"></div>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      // إضافة علامات
      L.marker([21.4225, 39.8262], { icon: redIcon })
        .addTo(map)
        .bindPopup("<b>مكة المكرمة</b><br>نغطي جميع أحياء مكة");

      L.marker([21.5433, 39.1728], { icon: redIcon })
        .addTo(map)
        .bindPopup("<b>جدة</b><br>نغطي جميع أحياء جدة");

      // دائرة التغطية حول مكة
      L.circle([21.4225, 39.8262], {
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.08,
        radius: 25000,
        weight: 2,
        dashArray: "10,5",
      }).addTo(map);

      // دائرة التغطية حول جدة
      L.circle([21.5433, 39.1728], {
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.08,
        radius: 20000,
        weight: 2,
        dashArray: "10,5",
      }).addTo(map);

      mapInstanceRef.current = map;

      // إعادة حساب حجم الخريطة بعد التحميل
      setTimeout(() => map.invalidateSize(), 100);
    };
    document.head.appendChild(scriptEl);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">مناطق التغطية</h2>
          <p className="text-gray-600">نغطي مكة المكرمة وجدة والمناطق المحيطة بها</p>
        </div>

        {/* خريطة حقيقية تفاعلية */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <div
              ref={mapRef}
              className="w-full h-[350px] sm:h-[400px] md:h-[450px]"
              style={{ zIndex: 1 }}
              role="img"
              aria-label="خريطة مناطق تغطية خدمة صيانة السيارات المتنقلة في مكة المكرمة وجدة"
            />
            
            {/* زر فتح في Google Maps */}
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=21.4225,39.8262&travelmode=driving"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-lg transition z-[1000]"
            >
              <MapPin className="w-4 h-4 text-red-500" />
              فتح في Google Maps
            </a>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            لا تجد منطقتك؟ تواصل معنا وسنبذل قصارى جهدنا للوصول إليك
          </p>
          <a
            href="https://wa.me/966543257872?text=مرحباً، هل تغطون منطقتي؟"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-green-600 font-semibold hover:text-green-700 transition"
          >
            تواصل عبر واتساب →
          </a>
        </div>
      </div>
    </section>
  );
}
