-- إضافة المزيد من الماركات والموديلات الشائعة في السعودية

-- ماركات إضافية
INSERT INTO car_brands (name, nameAr) VALUES
('Mazda', 'مازدا'),
('Mitsubishi', 'ميتسوبيشي'),
('Suzuki', 'سوزوكي'),
('Subaru', 'سوبارو'),
('Infiniti', 'إنفينيتي'),
('Jeep', 'جيب'),
('Dodge', 'دودج'),
('Cadillac', 'كاديلاك'),
('Lincoln', 'لينكولن'),
('Volvo', 'فولفو'),
('BMW', 'بي إم دبليو'),
('Mercedes', 'مرسيدس'),
('Audi', 'أودي'),
('Volkswagen', 'فولكس فاجن'),
('Porsche', 'بورش'),
('Jaguar', 'جاكوار'),
('Land Rover', 'لاند روفر'),
('Peugeot', 'بيجو'),
('Renault', 'رينو'),
('Fiat', 'فيات'),
('Alfa Romeo', 'ألفا روميو'),
('Seat', 'سيات'),
('Skoda', 'سكودا'),
('Datsun', 'داتسون'),
('MG', 'إم جي'),
('Geely', 'جيلي'),
('Chery', 'شيري'),
('BYD', 'بي واي دي'),
('Great Wall', 'جريت وول'),
('Haval', 'هافال');

-- الحصول على IDs للماركات الجديدة
-- مازدا (ID: 11)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(11, 'Mazda 3', 'مازدا 3'),
(11, 'Mazda 6', 'مازدا 6'),
(11, 'CX-5', 'CX-5'),
(11, 'CX-9', 'CX-9');

-- ميتسوبيشي (ID: 12)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(12, 'Lancer', 'لانسر'),
(12, 'Pajero', 'باجيرو'),
(12, 'Outlander', 'أوتلاندر'),
(12, 'ASX', 'ASX');

-- سوزوكي (ID: 13)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(13, 'Swift', 'سويفت'),
(13, 'Vitara', 'فيتارا'),
(13, 'Jimny', 'جيمني'),
(13, 'Ciaz', 'سياز');

-- سوبارو (ID: 14)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(14, 'Impreza', 'إمبريزا'),
(14, 'Forester', 'فورستر'),
(14, 'Outback', 'أوتباك'),
(14, 'XV', 'XV');

-- إنفينيتي (ID: 15)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(15, 'Q50', 'Q50'),
(15, 'Q60', 'Q60'),
(15, 'QX50', 'QX50'),
(15, 'QX80', 'QX80');

-- جيب (ID: 16)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(16, 'Wrangler', 'رانجلر'),
(16, 'Grand Cherokee', 'جراند شيروكي'),
(16, 'Cherokee', 'شيروكي'),
(16, 'Compass', 'كومباس');

-- دودج (ID: 17)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(17, 'Charger', 'تشارجر'),
(17, 'Challenger', 'تشالنجر'),
(17, 'Durango', 'دورانجو'),
(17, 'Ram', 'رام');

-- كاديلاك (ID: 18)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(18, 'Escalade', 'إسكاليد'),
(18, 'CTS', 'CTS'),
(18, 'XT5', 'XT5'),
(18, 'CT6', 'CT6');

-- لينكولن (ID: 19)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(19, 'Navigator', 'نافيجيتور'),
(19, 'Continental', 'كونتيننتال'),
(19, 'MKZ', 'MKZ'),
(19, 'Aviator', 'أفياتور');

-- فولفو (ID: 20)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(20, 'S60', 'S60'),
(20, 'S90', 'S90'),
(20, 'XC60', 'XC60'),
(20, 'XC90', 'XC90');

-- بي إم دبليو (ID: 21)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(21, '3 Series', 'الفئة الثالثة'),
(21, '5 Series', 'الفئة الخامسة'),
(21, '7 Series', 'الفئة السابعة'),
(21, 'X3', 'X3'),
(21, 'X5', 'X5'),
(21, 'X7', 'X7');

-- مرسيدس (ID: 22)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(22, 'C-Class', 'C-Class'),
(22, 'E-Class', 'E-Class'),
(22, 'S-Class', 'S-Class'),
(22, 'GLC', 'GLC'),
(22, 'GLE', 'GLE'),
(22, 'GLS', 'GLS');

-- أودي (ID: 23)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(23, 'A3', 'A3'),
(23, 'A4', 'A4'),
(23, 'A6', 'A6'),
(23, 'Q3', 'Q3'),
(23, 'Q5', 'Q5'),
(23, 'Q7', 'Q7');

-- فولكس فاجن (ID: 24)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(24, 'Jetta', 'جيتا'),
(24, 'Passat', 'باسات'),
(24, 'Tiguan', 'تيجوان'),
(24, 'Touareg', 'توارق');

-- بورش (ID: 25)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(25, '911', '911'),
(25, 'Cayenne', 'كايين'),
(25, 'Macan', 'ماكان'),
(25, 'Panamera', 'باناميرا');

-- جاكوار (ID: 26)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(26, 'XE', 'XE'),
(26, 'XF', 'XF'),
(26, 'F-PACE', 'F-PACE'),
(26, 'E-PACE', 'E-PACE');

-- لاند روفر (ID: 27)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(27, 'Range Rover', 'رنج روفر'),
(27, 'Range Rover Sport', 'رنج روفر سبورت'),
(27, 'Discovery', 'ديسكفري'),
(27, 'Defender', 'ديفندر');

-- بيجو (ID: 28)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(28, '301', '301'),
(28, '508', '508'),
(28, '2008', '2008'),
(28, '3008', '3008');

-- رينو (ID: 29)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(29, 'Sandero', 'سانديرو'),
(29, 'Duster', 'داستر'),
(29, 'Captur', 'كابتشر'),
(29, 'Koleos', 'كوليوس');

-- فيات (ID: 30)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(30, '500', '500'),
(30, 'Tipo', 'تيبو'),
(30, '500X', '500X'),
(30, 'Doblo', 'دوبلو');

-- جيلي (ID: 36)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(36, 'Emgrand', 'إمجراند'),
(36, 'Coolray', 'كوول راي'),
(36, 'Okavango', 'أوكافانجو'),
(36, 'Atlas', 'أطلس');

-- شيري (ID: 37)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(37, 'Tiggo', 'تيجو'),
(37, 'Arrizo', 'أريزو'),
(37, 'Tiggo 7', 'تيجو 7'),
(37, 'Tiggo 8', 'تيجو 8');

-- بي واي دي (ID: 38)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(38, 'F3', 'F3'),
(38, 'S6', 'S6'),
(38, 'Tang', 'تانج'),
(38, 'Han', 'هان');

-- جريت وول (ID: 39)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(39, 'Wingle', 'وينجل'),
(39, 'Haval H6', 'هافال H6'),
(39, 'Poer', 'بوير'),
(39, 'Cannon', 'كانون');

-- هافال (ID: 40)
INSERT INTO car_models (brandId, name, nameAr) VALUES
(40, 'Jolion', 'جوليون'),
(40, 'H6', 'H6'),
(40, 'H9', 'H9'),
(40, 'Dargo', 'داجو');

-- إضافة أوقات عمل للموديلات الجديدة (عينة)
-- سنضيف أوقات عمل لبعض الموديلات الشائعة

-- مازدا 3 (model_id: 21) - بطارية
INSERT INTO labor_times (modelId, partId, hours) VALUES
(21, 1, 0.5);

-- مازدا 3 - سلف
INSERT INTO labor_times (modelId, partId, hours) VALUES
(21, 2, 2.0);

-- بي إم دبليو الفئة الثالثة (model_id: 81) - بطارية
INSERT INTO labor_times (modelId, partId, hours) VALUES
(81, 1, 0.75);

-- بي إم دبليو الفئة الثالثة - دينمو
INSERT INTO labor_times (modelId, partId, hours) VALUES
(81, 3, 2.5);

-- مرسيدس C-Class (model_id: 87) - بطارية
INSERT INTO labor_times (modelId, partId, hours) VALUES
(87, 1, 0.75);

-- مرسيدس C-Class - سلف
INSERT INTO labor_times (modelId, partId, hours) VALUES
(87, 2, 2.5);

-- لاند روفر رنج روفر (model_id: 103) - بطارية
INSERT INTO labor_times (modelId, partId, hours) VALUES
(103, 1, 1.0);

-- لاند روفر رنج روفر - دينمو
INSERT INTO labor_times (modelId, partId, hours) VALUES
(103, 3, 3.0);

-- جيلي إمجراند (model_id: 123) - بطارية
INSERT INTO labor_times (modelId, partId, hours) VALUES
(123, 1, 0.5);

-- جيلي إمجراند - سلف
INSERT INTO labor_times (modelId, partId, hours) VALUES
(123, 2, 1.5);

-- شيري تيجو (model_id: 127) - بطارية
INSERT INTO labor_times (modelId, partId, hours) VALUES
(127, 1, 0.5);

-- شيري تيجو - طرمبة بنزين
INSERT INTO labor_times (modelId, partId, hours) VALUES
(127, 4, 2.0);
