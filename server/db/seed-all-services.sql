-- إضافة جميع الخدمات والقطع المفقودة مع أوقات العمل

-- إضافة القطع/الخدمات الجديدة
INSERT INTO service_parts (name_ar, name_en, description) VALUES
('تشخيص ECU', 'ECU Diagnostics', 'فحص كمبيوتر السيارة وقراءة الأعطال'),
('أعطال الطريق', 'Roadside Assistance', 'مساعدة فورية في حالات الأعطال الطارئة'),
('تغيير زيت المحرك', 'Engine Oil Change', 'تغيير زيت المحرك وفلتر الزيت'),
('فلتر هواء', 'Air Filter', 'تغيير فلتر الهواء'),
('فلتر بنزين', 'Fuel Filter', 'تغيير فلتر البنزين'),
('بواجي (شمعات الاحتراق)', 'Spark Plugs', 'تغيير بواجي المحرك'),
('سير المكينة', 'Engine Belt', 'تغيير سير المكينة'),
('سير التايمن', 'Timing Belt', 'تغيير سير التايمن'),
('بريكات أمامية', 'Front Brake Pads', 'تغيير بريكات أمامية'),
('بريكات خلفية', 'Rear Brake Pads', 'تغيير بريكات خلفية'),
('ديسكات أمامية', 'Front Brake Discs', 'تغيير ديسكات أمامية'),
('ديسكات خلفية', 'Rear Brake Discs', 'تغيير ديسكات خلفية'),
('تكييف (فريون)', 'AC Freon Refill', 'تعبئة فريون التكييف'),
('كمبروسر تكييف', 'AC Compressor', 'تغيير كمبروسر التكييف'),
('ردياتير', 'Radiator', 'تغيير الردياتير'),
('ثرموستات', 'Thermostat', 'تغيير الثرموستات'),
('طرمبة ماء', 'Water Pump', 'تغيير طرمبة الماء'),
('بخاخات', 'Fuel Injectors', 'تنظيف أو تغيير البخاخات'),
('حساس أكسجين', 'Oxygen Sensor', 'تغيير حساس الأكسجين'),
('كويلات', 'Ignition Coils', 'تغيير كويلات الإشعال'),
('دبة التلوث', 'Catalytic Converter', 'تغيير دبة التلوث'),
('شكمان', 'Exhaust System', 'إصلاح أو تغيير الشكمان'),
('معاونات أمامية', 'Front Shock Absorbers', 'تغيير معاونات أمامية'),
('معاونات خلفية', 'Rear Shock Absorbers', 'تغيير معاونات خلفية'),
('مساعدات', 'Struts', 'تغيير المساعدات'),
('طرمبة باور', 'Power Steering Pump', 'تغيير طرمبة الباور'),
('علبة دركسون', 'Steering Rack', 'تغيير علبة الدركسون'),
('كراسي مكينة', 'Engine Mounts', 'تغيير كراسي المكينة'),
('كراسي جير', 'Transmission Mounts', 'تغيير كراسي الجير'),
('فحمات دينمو', 'Alternator Brushes', 'تغيير فحمات الدينمو');

-- إضافة أوقات عمل للخدمات الجديدة (أمثلة لموديلات شائعة)
-- سنضيف أوقات عمل لتويوتا كامري (model_id: 1) كمثال

-- تشخيص ECU (part_id: 5)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 5, '0.5', 'فحص سريع بجهاز التشخيص'),
(2, 5, '0.5', 'فحص سريع بجهاز التشخيص'),
(3, 5, '0.5', 'فحص سريع بجهاز التشخيص');

-- أعطال الطريق (part_id: 6)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 6, '1.0', 'حسب نوع العطل'),
(2, 6, '1.0', 'حسب نوع العطل'),
(3, 6, '1.0', 'حسب نوع العطل');

-- تغيير زيت المحرك (part_id: 7)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 7, '0.5', 'تغيير زيت وفلتر'),
(2, 7, '0.5', 'تغيير زيت وفلتر'),
(3, 7, '0.5', 'تغيير زيت وفلتر'),
(4, 7, '0.5', 'تغيير زيت وفلتر'),
(5, 7, '0.5', 'تغيير زيت وفلتر');

-- فلتر هواء (part_id: 8)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 8, '0.25', 'تغيير سريع'),
(2, 8, '0.25', 'تغيير سريع'),
(3, 8, '0.25', 'تغيير سريع');

-- فلتر بنزين (part_id: 9)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 9, '1.0', 'تحت السيارة'),
(2, 9, '1.0', 'تحت السيارة'),
(3, 9, '1.5', 'داخل التانكي');

-- بواجي (part_id: 10)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 10, '1.0', '4 سلندر'),
(2, 10, '1.5', '6 سلندر'),
(3, 10, '1.0', '4 سلندر');

-- سير المكينة (part_id: 11)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 11, '0.75', 'سير واحد'),
(2, 11, '1.0', 'عدة سيور'),
(3, 11, '0.75', 'سير واحد');

-- سير التايمن (part_id: 12)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 12, '4.0', 'عمل كبير'),
(2, 12, '5.0', 'عمل كبير جداً'),
(3, 12, '4.0', 'عمل كبير');

-- بريكات أمامية (part_id: 13)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 13, '1.0', 'فك وتركيب'),
(2, 13, '1.0', 'فك وتركيب'),
(3, 13, '1.0', 'فك وتركيب');

-- بريكات خلفية (part_id: 14)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 14, '1.0', 'فك وتركيب'),
(2, 14, '1.0', 'فك وتركيب'),
(3, 14, '1.0', 'فك وتركيب');

-- ديسكات أمامية (part_id: 15)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 15, '1.5', 'فك وتركيب'),
(2, 15, '1.5', 'فك وتركيب'),
(3, 15, '1.5', 'فك وتركيب');

-- ديسكات خلفية (part_id: 16)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 16, '1.5', 'فك وتركيب'),
(2, 16, '1.5', 'فك وتركيب'),
(3, 16, '1.5', 'فك وتركيب');

-- تكييف فريون (part_id: 17)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 17, '0.75', 'تعبئة فريون'),
(2, 17, '0.75', 'تعبئة فريون'),
(3, 17, '0.75', 'تعبئة فريون');

-- كمبروسر تكييف (part_id: 18)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 18, '3.0', 'فك وتركيب وتعبئة'),
(2, 18, '3.5', 'فك وتركيب وتعبئة'),
(3, 18, '3.0', 'فك وتركيب وتعبئة');

-- ردياتير (part_id: 19)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 19, '2.0', 'فك وتركيب'),
(2, 19, '2.5', 'فك وتركيب'),
(3, 19, '2.0', 'فك وتركيب');

-- ثرموستات (part_id: 20)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 20, '1.0', 'فك وتركيب'),
(2, 20, '1.5', 'فك وتركيب'),
(3, 20, '1.0', 'فك وتركيب');

-- طرمبة ماء (part_id: 21)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 21, '2.0', 'فك وتركيب'),
(2, 21, '2.5', 'فك وتركيب'),
(3, 21, '2.0', 'فك وتركيب');

-- بخاخات (part_id: 22)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 22, '2.0', 'فك وتنظيف أو تغيير'),
(2, 22, '2.5', 'فك وتنظيف أو تغيير'),
(3, 22, '2.0', 'فك وتنظيف أو تغيير');

-- حساس أكسجين (part_id: 23)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 23, '0.75', 'فك وتركيب'),
(2, 23, '1.0', 'فك وتركيب'),
(3, 23, '0.75', 'فك وتركيب');

-- كويلات (part_id: 24)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 24, '1.0', 'تغيير كويلات'),
(2, 24, '1.5', 'تغيير كويلات'),
(3, 24, '1.0', 'تغيير كويلات');

-- دبة التلوث (part_id: 25)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 25, '2.0', 'فك وتركيب'),
(2, 25, '2.5', 'فك وتركيب'),
(3, 25, '2.0', 'فك وتركيب');

-- شكمان (part_id: 26)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 26, '1.5', 'إصلاح أو تغيير'),
(2, 26, '2.0', 'إصلاح أو تغيير'),
(3, 26, '1.5', 'إصلاح أو تغيير');

-- معاونات أمامية (part_id: 27)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 27, '2.0', 'فك وتركيب'),
(2, 27, '2.5', 'فك وتركيب'),
(3, 27, '2.0', 'فك وتركيب');

-- معاونات خلفية (part_id: 28)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 28, '1.5', 'فك وتركيب'),
(2, 28, '2.0', 'فك وتركيب'),
(3, 28, '1.5', 'فك وتركيب');

-- مساعدات (part_id: 29)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 29, '2.0', 'فك وتركيب'),
(2, 29, '2.5', 'فك وتركيب'),
(3, 29, '2.0', 'فك وتركيب');

-- طرمبة باور (part_id: 30)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 30, '2.5', 'فك وتركيب'),
(2, 30, '3.0', 'فك وتركيب'),
(3, 30, '2.5', 'فك وتركيب');

-- علبة دركسون (part_id: 31)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 31, '3.0', 'فك وتركيب'),
(2, 31, '3.5', 'فك وتركيب'),
(3, 31, '3.0', 'فك وتركيب');

-- كراسي مكينة (part_id: 32)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 32, '2.0', 'تغيير كراسي المكينة'),
(2, 32, '2.5', 'تغيير كراسي المكينة'),
(3, 32, '2.0', 'تغيير كراسي المكينة');

-- كراسي جير (part_id: 33)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 33, '1.5', 'تغيير كراسي الجير'),
(2, 33, '2.0', 'تغيير كراسي الجير'),
(3, 33, '1.5', 'تغيير كراسي الجير');

-- فحمات دينمو (part_id: 34)
INSERT INTO labor_times (model_id, part_id, hours, notes) VALUES
(1, 34, '1.5', 'فك وتركيب فحمات'),
(2, 34, '2.0', 'فك وتركيب فحمات'),
(3, 34, '1.5', 'فك وتركيب فحمات');
