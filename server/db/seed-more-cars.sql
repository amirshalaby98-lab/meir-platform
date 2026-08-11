-- إضافة المزيد من الماركات والموديلات الشائعة في السعودية

-- ماركات إضافية
INSERT INTO car_brands (name_ar, name_en) VALUES
('مازدا', 'Mazda'),
('ميتسوبيشي', 'Mitsubishi'),
('سوزوكي', 'Suzuki'),
('سوبارو', 'Subaru'),
('إنفينيتي', 'Infiniti'),
('جيب', 'Jeep'),
('دودج', 'Dodge'),
('كاديلاك', 'Cadillac'),
('لينكولن', 'Lincoln'),
('فولفو', 'Volvo'),
('بي إم دبليو', 'BMW'),
('مرسيدس', 'Mercedes'),
('أودي', 'Audi'),
('فولكس فاجن', 'Volkswagen'),
('بورش', 'Porsche'),
('جاكوار', 'Jaguar'),
('لاند روفر', 'Land Rover'),
('بيجو', 'Peugeot'),
('رينو', 'Renault'),
('فيات', 'Fiat'),
('ألفا روميو', 'Alfa Romeo'),
('سيات', 'Seat'),
('سكودا', 'Skoda'),
('داتسون', 'Datsun'),
('إم جي', 'MG'),
('جيلي', 'Geely'),
('شيري', 'Chery'),
('بي واي دي', 'BYD'),
('جريت وول', 'Great Wall'),
('هافال', 'Haval');

-- الحصول على IDs للماركات الجديدة
-- مازدا (ID: 11)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(11, 'مازدا 3', 'Mazda 3'),
(11, 'مازدا 6', 'Mazda 6'),
(11, 'CX-5', 'CX-5'),
(11, 'CX-9', 'CX-9');

-- ميتسوبيشي (ID: 12)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(12, 'لانسر', 'Lancer'),
(12, 'باجيرو', 'Pajero'),
(12, 'أوتلاندر', 'Outlander'),
(12, 'ASX', 'ASX');

-- سوزوكي (ID: 13)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(13, 'سويفت', 'Swift'),
(13, 'فيتارا', 'Vitara'),
(13, 'جيمني', 'Jimny'),
(13, 'سياز', 'Ciaz');

-- سوبارو (ID: 14)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(14, 'إمبريزا', 'Impreza'),
(14, 'فورستر', 'Forester'),
(14, 'أوتباك', 'Outback'),
(14, 'XV', 'XV');

-- إنفينيتي (ID: 15)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(15, 'Q50', 'Q50'),
(15, 'Q60', 'Q60'),
(15, 'QX50', 'QX50'),
(15, 'QX80', 'QX80');

-- جيب (ID: 16)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(16, 'رانجلر', 'Wrangler'),
(16, 'جراند شيروكي', 'Grand Cherokee'),
(16, 'شيروكي', 'Cherokee'),
(16, 'كومباس', 'Compass');

-- دودج (ID: 17)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(17, 'تشارجر', 'Charger'),
(17, 'تشالنجر', 'Challenger'),
(17, 'دورانجو', 'Durango'),
(17, 'رام', 'Ram');

-- كاديلاك (ID: 18)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(18, 'إسكاليد', 'Escalade'),
(18, 'CTS', 'CTS'),
(18, 'XT5', 'XT5'),
(18, 'CT6', 'CT6');

-- لينكولن (ID: 19)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(19, 'نافيجيتور', 'Navigator'),
(19, 'كونتيننتال', 'Continental'),
(19, 'MKZ', 'MKZ'),
(19, 'أفياتور', 'Aviator');

-- فولفو (ID: 20)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(20, 'S60', 'S60'),
(20, 'S90', 'S90'),
(20, 'XC60', 'XC60'),
(20, 'XC90', 'XC90');

-- بي إم دبليو (ID: 21)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(21, 'الفئة الثالثة', '3 Series'),
(21, 'الفئة الخامسة', '5 Series'),
(21, 'الفئة السابعة', '7 Series'),
(21, 'X3', 'X3'),
(21, 'X5', 'X5'),
(21, 'X7', 'X7');

-- مرسيدس (ID: 22)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(22, 'C-Class', 'C-Class'),
(22, 'E-Class', 'E-Class'),
(22, 'S-Class', 'S-Class'),
(22, 'GLC', 'GLC'),
(22, 'GLE', 'GLE'),
(22, 'GLS', 'GLS');

-- أودي (ID: 23)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(23, 'A3', 'A3'),
(23, 'A4', 'A4'),
(23, 'A6', 'A6'),
(23, 'Q3', 'Q3'),
(23, 'Q5', 'Q5'),
(23, 'Q7', 'Q7');

-- فولكس فاجن (ID: 24)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(24, 'جيتا', 'Jetta'),
(24, 'باسات', 'Passat'),
(24, 'تيجوان', 'Tiguan'),
(24, 'توارق', 'Touareg');

-- بورش (ID: 25)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(25, '911', '911'),
(25, 'كايين', 'Cayenne'),
(25, 'ماكان', 'Macan'),
(25, 'باناميرا', 'Panamera');

-- جاكوار (ID: 26)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(26, 'XE', 'XE'),
(26, 'XF', 'XF'),
(26, 'F-PACE', 'F-PACE'),
(26, 'E-PACE', 'E-PACE');

-- لاند روفر (ID: 27)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(27, 'رنج روفر', 'Range Rover'),
(27, 'رنج روفر سبورت', 'Range Rover Sport'),
(27, 'ديسكفري', 'Discovery'),
(27, 'ديفندر', 'Defender');

-- بيجو (ID: 28)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(28, '301', '301'),
(28, '508', '508'),
(28, '2008', '2008'),
(28, '3008', '3008');

-- رينو (ID: 29)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(29, 'سانديرو', 'Sandero'),
(29, 'داستر', 'Duster'),
(29, 'كابتشر', 'Captur'),
(29, 'كوليوس', 'Koleos');

-- فيات (ID: 30)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(30, '500', '500'),
(30, 'تيبو', 'Tipo'),
(30, '500X', '500X'),
(30, 'دوبلو', 'Doblo');

-- جيلي (ID: 36)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(36, 'إمجراند', 'Emgrand'),
(36, 'كوول راي', 'Coolray'),
(36, 'أوكافانجو', 'Okavango'),
(36, 'أطلس', 'Atlas');

-- شيري (ID: 37)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(37, 'تيجو', 'Tiggo'),
(37, 'أريزو', 'Arrizo'),
(37, 'تيجو 7', 'Tiggo 7'),
(37, 'تيجو 8', 'Tiggo 8');

-- بي واي دي (ID: 38)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(38, 'F3', 'F3'),
(38, 'S6', 'S6'),
(38, 'تانج', 'Tang'),
(38, 'هان', 'Han');

-- جريت وول (ID: 39)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(39, 'وينجل', 'Wingle'),
(39, 'هافال H6', 'Haval H6'),
(39, 'بوير', 'Poer'),
(39, 'كانون', 'Cannon');

-- هافال (ID: 40)
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
(40, 'جوليون', 'Jolion'),
(40, 'H6', 'H6'),
(40, 'H9', 'H9'),
(40, 'داجو', 'Dargo');

-- إضافة أوقات عمل للموديلات الجديدة (عينة)
-- سنضيف أوقات عمل لبعض الموديلات الشائعة

-- مازدا 3 (model_id: 21) - بطارية
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(21, 1, 0.5);

-- مازدا 3 - سلف
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(21, 2, 2.0);

-- بي إم دبليو الفئة الثالثة (model_id: 81) - بطارية
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(81, 1, 0.75);

-- بي إم دبليو الفئة الثالثة - دينمو
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(81, 3, 2.5);

-- مرسيدس C-Class (model_id: 87) - بطارية
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(87, 1, 0.75);

-- مرسيدس C-Class - سلف
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(87, 2, 2.5);

-- لاند روفر رنج روفر (model_id: 103) - بطارية
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(103, 1, 1.0);

-- لاند روفر رنج روفر - دينمو
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(103, 3, 3.0);

-- جيلي إمجراند (model_id: 123) - بطارية
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(123, 1, 0.5);

-- جيلي إمجراند - سلف
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(123, 2, 1.5);

-- شيري تيجو (model_id: 127) - بطارية
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(127, 1, 0.5);

-- شيري تيجو - طرمبة بنزين
INSERT INTO labor_times (model_id, part_id, hours) VALUES
(127, 4, 2.0);
