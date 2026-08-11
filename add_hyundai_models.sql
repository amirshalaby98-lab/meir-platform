-- إضافة موديلات هيونداي المفقودة
INSERT INTO car_models (brand_id, name_ar, name_en) VALUES
((SELECT id FROM car_brands WHERE name_en = 'Hyundai'), 'اكسنت', 'Accent'),
((SELECT id FROM car_brands WHERE name_en = 'Hyundai'), 'i45', 'i45'),
((SELECT id FROM car_brands WHERE name_en = 'Hyundai'), 'i10', 'i10'),
((SELECT id FROM car_brands WHERE name_en = 'Hyundai'), 'ازيرا', 'Azera');
