-- إضافة موديلات هيونداي المفقودة
INSERT INTO car_models (brandId, name, nameAr) VALUES
((SELECT id FROM car_brands WHERE name = 'Hyundai'), 'Accent', 'اكسنت'),
((SELECT id FROM car_brands WHERE name = 'Hyundai'), 'i45', 'i45'),
((SELECT id FROM car_brands WHERE name = 'Hyundai'), 'i10', 'i10'),
((SELECT id FROM car_brands WHERE name = 'Hyundai'), 'Azera', 'ازيرا');
