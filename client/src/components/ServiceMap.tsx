import { useRef } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { MapView } from "@/components/Map";

export default function ServiceMap() {
  const mapRef = useRef<google.maps.Map | null>(null);

  const serviceAreas = [
    {
      id: 1,
      city: "مكة المكرمة",
      description: "خدمة شاملة في جميع أنحاء مكة",
      phone: "0543257872",
      hours: "24/7",
      coordinates: { lat: 21.4225, lng: 39.8262 },
      coverage: "المناطق الرئيسية والسكنية",
    },
    {
      id: 2,
      city: "جدة",
      description: "خدمة سريعة وموثوقة في جدة",
      phone: "0543257872",
      hours: "24/7",
      coordinates: { lat: 21.5433, lng: 39.1728 },
      coverage: "المناطق الرئيسية والسكنية",
    },
  ];

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Add markers for each service area
    serviceAreas.forEach((area) => {
      // Create marker
      new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: area.coordinates,
        title: area.city,
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="direction: rtl; text-align: right; padding: 10px; font-family: Arial, sans-serif;">
            <h3 style="font-size: 18px; font-weight: bold; margin: 0 0 8px 0; color: #000;">${area.city}</h3>
            <p style="margin: 4px 0; color: #666;">${area.description}</p>
            <p style="margin: 4px 0; color: #666;"><strong>📞 الهاتف:</strong> ${area.phone}</p>
            <p style="margin: 4px 0; color: #666;"><strong>🕐 ساعات العمل:</strong> ${area.hours}</p>
            <a href="https://wa.me/${area.phone.replace(/\D/g, "")}?text=السلام%20عليكم%20أريد%20خدمة%20صيانة%20في%20${area.city}" 
               target="_blank" 
               rel="noopener noreferrer"
               style="display: inline-block; margin-top: 8px; padding: 8px 16px; background: #facc15; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold;">
              اطلب الخدمة الآن
            </a>
          </div>
        `,
      });

      // Add click listener to marker
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: area.coordinates,
        title: area.city,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    // Fit map to show all markers
    const bounds = new window.google.maps.LatLngBounds();
    serviceAreas.forEach((area) => {
      bounds.extend(area.coordinates);
    });
    map.fitBounds(bounds);
    
    // Adjust zoom to not be too close
    const listener = window.google.maps.event.addListener(map, "idle", () => {
      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom > 10) {
        map.setZoom(10);
      }
      window.google.maps.event.removeListener(listener);
    });
  };

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-black mb-4">
          مناطق الخدمة
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          نقدم خدمات الصيانة المتنقلة في مكة وجدة. تواصل معنا الآن لطلب الخدمة
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Service Areas Cards */}
          {serviceAreas.map((area) => (
            <div
              key={area.id}
              className="bg-gradient-to-br from-yellow-50 to-gray-50 border-2 border-yellow-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black">{area.city}</h3>
                  <p className="text-gray-600">{area.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Coverage */}
                <div className="flex gap-3">
                  <span className="text-yellow-600 font-bold">📍</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      مناطق التغطية
                    </p>
                    <p className="text-gray-600">{area.coverage}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      الهاتف
                    </p>
                    <a
                      href={`tel:${area.phone}`}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold"
                    >
                      {area.phone}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      ساعات العمل
                    </p>
                    <p className="text-gray-600">{area.hours}</p>
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href={`https://wa.me/${area.phone.replace(/\D/g, "")}?text=السلام%20عليكم%20ورحمة%20الله%20وبركاته%20أريد%20خدمة%20صيانة%20في%20${area.city}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg text-center transition-colors"
                >
                  اطلب الخدمة الآن
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Google Map */}
        <div className="rounded-lg overflow-hidden shadow-lg">
          <MapView
            initialCenter={{ lat: 21.4829, lng: 39.4994 }} // Center between Makkah and Jeddah
            initialZoom={9}
            onMapReady={handleMapReady}
            className="h-96 w-full"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-black mb-4">💡 معلومة مهمة</h3>
          <p className="text-gray-700 leading-relaxed">
            نحن نعمل على مدار 24 ساعة يومياً لخدمتك. إذا كنت خارج المناطق المذكورة، 
            تواصل معنا عبر الواتساب وسنحاول مساعدتك قدر الإمكان. نقدم خدمات الطوارئ 
            والصيانة الدورية بأسعار تنافسية وبدون رسوم إضافية. اضغط على العلامات في الخريطة 
            لمزيد من المعلومات والتواصل المباشر.
          </p>
        </div>
      </div>
    </section>
  );
}
