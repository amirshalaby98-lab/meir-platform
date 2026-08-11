import { useState } from "react";
import { X } from "lucide-react";

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663166202679/WEMMmNCeUUSJvvUyfwdWoi/hero-mechanic-cq8wTKjQkBo7xPgUBLbxgz.webp",
      alt: "ميكانيكي متنقل محترف يعمل على صيانة محرك السيارة في مكة",
      title: "الصيانة الاحترافية",
    },
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663166202679/WEMMmNCeUUSJvvUyfwdWoi/car-service-battery-UTHGZLsm6vbsgQYesp6wvS.webp",
      alt: "خدمة استبدال بطارية السيارة متنقلة في مكة وجدة",
      title: "خدمة البطارية",
    },
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663166202679/WEMMmNCeUUSJvvUyfwdWoi/car-service-electrical-JnSQg9bMiAaBY5gXV4AuAC.webp",
      alt: "فحص وتشخيص النظام الكهربائي للسيارة بأجهزة حديثة",
      title: "التشخيص الدقيق",
    },
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663166202679/WEMMmNCeUUSJvvUyfwdWoi/car-service-maintenance-RjPtLq32Sgmq8xBUPppgNo.webp",
      alt: "صيانة سيارات متنقلة شاملة عند البيت",
      title: "الصيانة الشاملة",
    },
    {
      src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663166202679/WEMMmNCeUUSJvvUyfwdWoi/roadside-emergency-7JSjEmv6LPKeozmqZ89xAp.webp",
      alt: "خدمة طوارئ سيارات على الطريق في مكة وجدة",
      title: "خدمة الطوارئ",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <h2 className="text-4xl font-bold text-center text-black mb-16">
          معرض الخدمات
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-64"
              onClick={() => setSelectedImage(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-lg font-bold">{image.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-yellow-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="صورة مكبرة لخدمات صيانة السيارات المتنقلة مير"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </section>
  );
}
