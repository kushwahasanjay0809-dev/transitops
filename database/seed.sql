-- ============================================================
-- TransitOps — Realistic Seed Data
-- Version: 1.0.0
-- Created: 2026-07-12
-- ============================================================
-- All passwords are: Password@123
-- bcrypt hash (12 rounds): $2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi
-- ============================================================

USE transit_ops;

-- Disable FK checks for seeding
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (reverse dependency order)
TRUNCATE TABLE expenses;
TRUNCATE TABLE fuel_logs;
TRUNCATE TABLE maintenance_logs;
TRUNCATE TABLE trips;
TRUNCATE TABLE drivers;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE regions;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. ROLES (4 rows)
-- ============================================================

INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN',       'Full system access. Manages users, settings, and all modules.'),
(2, 'MANAGER',     'Manages vehicles, drivers, maintenance, expenses. Cannot manage users.'),
(3, 'DISPATCHER',  'Creates and dispatches trips, records fuel logs. Read-only for other modules.'),
(4, 'VIEWER',      'Read-only access to dashboards and reports.');

-- ============================================================
-- 2. USERS (10 rows)
-- ============================================================
-- Password for all users: Password@123

INSERT INTO users (id, role_id, first_name, last_name, email, password, phone, is_active, last_login_at) VALUES
(1,  1, 'Rajesh',    'Sharma',     'rajesh.sharma@transitops.in',    '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543210', TRUE,  '2026-07-12 08:30:00'),
(2,  1, 'Priya',     'Nair',       'priya.nair@transitops.in',       '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543211', TRUE,  '2026-07-11 14:22:00'),
(3,  2, 'Amit',      'Patel',      'amit.patel@transitops.in',       '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543212', TRUE,  '2026-07-12 09:15:00'),
(4,  2, 'Sneha',     'Kulkarni',   'sneha.kulkarni@transitops.in',   '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543213', TRUE,  '2026-07-10 11:45:00'),
(5,  2, 'Vikram',    'Singh',      'vikram.singh@transitops.in',     '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543214', TRUE,  '2026-07-12 07:00:00'),
(6,  3, 'Kavitha',   'Reddy',      'kavitha.reddy@transitops.in',    '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543215', TRUE,  '2026-07-12 09:00:00'),
(7,  3, 'Arjun',     'Mehta',      'arjun.mehta@transitops.in',      '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543216', TRUE,  '2026-07-11 16:30:00'),
(8,  3, 'Deepa',     'Iyer',       'deepa.iyer@transitops.in',       '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543217', TRUE,  '2026-07-12 10:00:00'),
(9,  4, 'Rohit',     'Gupta',      'rohit.gupta@transitops.in',      '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543218', TRUE,  '2026-07-09 13:00:00'),
(10, 4, 'Meera',     'Joshi',      'meera.joshi@transitops.in',      '$2b$12$LJ3m4ys3GZfHlBYBypVBauoYCGsJKqEK1Y0dYZxGJ0fWnEcaP6hSi', '+91-9876543219', FALSE, '2026-06-15 10:00:00');

-- ============================================================
-- 3. REGIONS (15 rows)
-- ============================================================

INSERT INTO regions (id, name, code, state, country, is_active) VALUES
(1,  'Mumbai Central',     'MUM',  'Maharashtra',    'India', TRUE),
(2,  'Delhi NCR',          'DEL',  'Delhi',          'India', TRUE),
(3,  'Bangalore Hub',      'BLR',  'Karnataka',      'India', TRUE),
(4,  'Chennai Port',       'CHN',  'Tamil Nadu',     'India', TRUE),
(5,  'Hyderabad Depot',    'HYD',  'Telangana',      'India', TRUE),
(6,  'Pune Logistics',     'PUN',  'Maharashtra',    'India', TRUE),
(7,  'Ahmedabad Zone',     'AMD',  'Gujarat',        'India', TRUE),
(8,  'Kolkata Terminal',   'KOL',  'West Bengal',    'India', TRUE),
(9,  'Jaipur Depot',       'JAI',  'Rajasthan',      'India', TRUE),
(10, 'Lucknow Hub',        'LKO',  'Uttar Pradesh',  'India', TRUE),
(11, 'Kochi Warehouse',    'KCH',  'Kerala',         'India', TRUE),
(12, 'Indore Center',      'IDR',  'Madhya Pradesh', 'India', TRUE),
(13, 'Nagpur Junction',    'NGP',  'Maharashtra',    'India', TRUE),
(14, 'Vizag Port',         'VZG',  'Andhra Pradesh', 'India', TRUE),
(15, 'Surat Hub',          'SUR',  'Gujarat',        'India', TRUE);

-- ============================================================
-- 4. VEHICLES (25 rows)
-- ============================================================

INSERT INTO vehicles (id, registration_number, make, model, year, type, capacity_kg, fuel_type, status, mileage, insurance_expiry, last_service_date) VALUES
-- Available vehicles
(1,  'MH-01-AB-1234', 'Tata',     'Prima 4928.S',     2024, 'TRUCK',   28000.00, 'DIESEL',   'AVAILABLE', 45230.50, '2027-03-15', '2026-06-20'),
(2,  'MH-01-CD-5678', 'Ashok Leyland', 'BOSS 1920HB', 2023, 'TRUCK',   19000.00, 'DIESEL',   'AVAILABLE', 62100.00, '2027-01-10', '2026-05-15'),
(3,  'DL-02-EF-9012', 'Mahindra', 'Blazo X 46',       2024, 'TRUCK',   31000.00, 'DIESEL',   'AVAILABLE', 38750.25, '2027-06-30', '2026-07-01'),
(4,  'KA-03-GH-3456', 'Eicher',   'Pro 6049',         2023, 'TRUCK',   25000.00, 'DIESEL',   'AVAILABLE', 54800.00, '2026-12-20', '2026-04-10'),
(5,  'TN-04-IJ-7890', 'BharatBenz', '2828C',          2024, 'TRUCK',   28000.00, 'DIESEL',   'AVAILABLE', 29450.75, '2027-08-05', '2026-06-25'),
(6,  'MH-05-KL-1122', 'Tata',     'Ace Gold Diesel',  2025, 'VAN',     750.00,   'DIESEL',   'AVAILABLE', 12300.00, '2027-09-15', '2026-07-05'),
(7,  'DL-06-MN-3344', 'Mahindra', 'Supro Profit Truck', 2024, 'VAN',   1000.00,  'DIESEL',   'AVAILABLE', 18650.50, '2027-02-28', '2026-05-20'),
(8,  'GJ-07-OP-5566', 'Maruti',   'Super Carry',      2025, 'VAN',     740.00,   'CNG',      'AVAILABLE', 8200.00,  '2027-11-10', '2026-07-08'),
(9,  'RJ-08-QR-7788', 'Tata',     'Starbus Ultra',    2023, 'BUS',     5000.00,  'DIESEL',   'AVAILABLE', 78900.00, '2026-11-30', '2026-03-15'),
(10, 'KA-09-ST-9900', 'Ashok Leyland', 'Viking',      2024, 'BUS',     7000.00,  'DIESEL',   'AVAILABLE', 55200.00, '2027-04-20', '2026-06-10'),

-- On Trip vehicles
(11, 'MH-10-UV-1133', 'Tata',     'Prima 5530.S',     2024, 'TRUCK',   35000.00, 'DIESEL',   'ON_TRIP',   67400.00, '2027-05-12', '2026-06-01'),
(12, 'DL-11-WX-2244', 'Eicher',   'Pro 6055',         2023, 'TRUCK',   31000.00, 'DIESEL',   'ON_TRIP',   71200.50, '2027-01-25', '2026-05-28'),
(13, 'TN-12-YZ-3355', 'BharatBenz', '3528C',          2024, 'TRUCK',   35000.00, 'DIESEL',   'ON_TRIP',   42800.00, '2027-07-18', '2026-06-30'),
(14, 'GJ-13-AB-4466', 'Mahindra', 'Blazo X 35',       2025, 'TRUCK',   25000.00, 'DIESEL',   'ON_TRIP',   15600.75, '2028-01-05', '2026-07-02'),
(15, 'KA-14-CD-5577', 'Tata',     'Winger',           2024, 'VAN',     1500.00,  'DIESEL',   'ON_TRIP',   22400.00, '2027-03-08', '2026-06-15'),

-- In Shop vehicles
(16, 'MH-15-EF-6688', 'Ashok Leyland', 'U-3718',      2022, 'TRUCK',   18000.00, 'DIESEL',   'IN_SHOP',   89500.00, '2026-10-15', '2026-07-10'),
(17, 'UP-16-GH-7799', 'Tata',     'LPT 4225',         2023, 'TRUCK',   22000.00, 'DIESEL',   'IN_SHOP',   95200.25, '2027-02-14', '2026-07-08'),
(18, 'DL-17-IJ-8800', 'Eicher',   'Pro 3019',         2022, 'TRUCK',   16000.00, 'DIESEL',   'IN_SHOP',   102300.00,'2026-09-20', '2026-07-06'),

-- Retired vehicles
(19, 'MH-18-KL-9911', 'Tata',     'LPT 2518',         2018, 'TRUCK',   15000.00, 'DIESEL',   'RETIRED',   215000.00,'2025-06-30', '2025-06-01'),
(20, 'KA-19-MN-0022', 'Ashok Leyland', 'Dost',        2017, 'VAN',     1250.00,  'DIESEL',   'RETIRED',   178500.50,'2025-03-15', '2025-02-20'),

-- More available vehicles
(21, 'TS-20-OP-1133', 'Tata',     'Signa 4825.TK',    2025, 'TRUCK',   33000.00, 'DIESEL',   'AVAILABLE', 5200.00,  '2028-06-20', '2026-07-01'),
(22, 'AP-21-QR-2244', 'BharatBenz', '1617R',           2024, 'TRUCK',   16000.00, 'DIESEL',   'AVAILABLE', 31400.00, '2027-09-10', '2026-06-18'),
(23, 'MH-22-ST-3355', 'Mahindra', 'Bolero Pickup',     2025, 'CAR',     1500.00,  'DIESEL',   'AVAILABLE', 7800.00,  '2028-02-28', '2026-07-05'),
(24, 'GJ-23-UV-4466', 'Tata',     'Ultra T.16 S',      2024, 'TRUCK',   16000.00, 'CNG',      'AVAILABLE', 24500.00, '2027-04-15', '2026-06-22'),
(25, 'WB-24-WX-5577', 'Ashok Leyland', 'Oyster Wide',  2023, 'BUS',     6000.00,  'DIESEL',   'AVAILABLE', 61300.00, '2027-01-08', '2026-05-30');

-- ============================================================
-- 5. DRIVERS (20 rows)
-- ============================================================

INSERT INTO drivers (id, first_name, last_name, email, phone, license_number, license_expiry, license_type, status, date_of_birth, hire_date, address, emergency_contact) VALUES
-- Available drivers
(1,  'Suresh',    'Kumar',       'suresh.kumar@driver.in',       '+91-8001234501', 'DL-2020-MH-000101', '2028-05-15', 'C', 'AVAILABLE',  '1985-03-12', '2020-01-15', '45, Andheri East, Mumbai, Maharashtra 400069',              '+91-9001234501'),
(2,  'Ramesh',    'Yadav',       'ramesh.yadav@driver.in',       '+91-8001234502', 'DL-2019-DL-000202', '2027-11-20', 'D', 'AVAILABLE',  '1982-07-22', '2019-06-01', '12, Dwarka Sector 7, New Delhi 110077',                     '+91-9001234502'),
(3,  'Mahesh',    'Patil',       'mahesh.patil@driver.in',       '+91-8001234503', 'DL-2021-KA-000303', '2028-02-28', 'C', 'AVAILABLE',  '1990-11-05', '2021-03-20', '78, Whitefield Main Road, Bangalore, Karnataka 560066',    '+91-9001234503'),
(4,  'Ganesh',    'Pillai',      'ganesh.pillai@driver.in',      '+91-8001234504', 'DL-2020-TN-000404', '2027-08-10', 'D', 'AVAILABLE',  '1988-01-30', '2020-09-10', '33, T Nagar, Chennai, Tamil Nadu 600017',                   '+91-9001234504'),
(5,  'Dinesh',    'Choudhary',   'dinesh.choudhary@driver.in',   '+91-8001234505', 'DL-2022-TS-000505', '2029-01-05', 'C', 'AVAILABLE',  '1992-06-18', '2022-02-01', '91, Banjara Hills, Hyderabad, Telangana 500034',            '+91-9001234505'),
(6,  'Rajendra',  'Deshmukh',    'rajendra.deshmukh@driver.in',  '+91-8001234506', 'DL-2021-MH-000606', '2028-04-22', 'D', 'AVAILABLE',  '1986-09-14', '2021-07-15', '56, Kothrud, Pune, Maharashtra 411038',                     '+91-9001234506'),
(7,  'Vijay',     'Thakur',      'vijay.thakur@driver.in',       '+91-8001234507', 'DL-2020-GJ-000707', '2027-06-30', 'C', 'AVAILABLE',  '1984-12-25', '2020-04-08', '14, Satellite Road, Ahmedabad, Gujarat 380015',             '+91-9001234507'),
(8,  'Sanjay',    'Das',         'sanjay.das@driver.in',         '+91-8001234508', 'DL-2019-WB-000808', '2027-10-15', 'D', 'AVAILABLE',  '1983-04-08', '2019-11-25', '67, Salt Lake, Kolkata, West Bengal 700091',                '+91-9001234508'),
(9,  'Prakash',   'Meena',       'prakash.meena@driver.in',      '+91-8001234509', 'DL-2022-RJ-000909', '2029-03-18', 'C', 'AVAILABLE',  '1991-08-20', '2022-05-12', '23, Malviya Nagar, Jaipur, Rajasthan 302017',               '+91-9001234509'),
(10, 'Anil',      'Mishra',      'anil.mishra@driver.in',        '+91-8001234510', 'DL-2021-UP-001010', '2028-07-12', 'C', 'AVAILABLE',  '1987-02-14', '2021-01-03', '89, Gomti Nagar, Lucknow, Uttar Pradesh 226010',            '+91-9001234510'),

-- On Trip drivers (matched to ON_TRIP vehicles in trips table)
(11, 'Kiran',     'Jadhav',      'kiran.jadhav@driver.in',       '+91-8001234511', 'DL-2020-MH-001111', '2027-12-05', 'D', 'ON_TRIP',    '1989-05-17', '2020-08-20', '34, Bandra West, Mumbai, Maharashtra 400050',               '+91-9001234511'),
(12, 'Deepak',    'Verma',       'deepak.verma@driver.in',       '+91-8001234512', 'DL-2021-DL-001212', '2028-09-25', 'C', 'ON_TRIP',    '1990-10-03', '2021-04-10', '78, Rohini Sector 15, New Delhi 110085',                    '+91-9001234512'),
(13, 'Manoj',     'Rathore',     'manoj.rathore@driver.in',      '+91-8001234513', 'DL-2019-TN-001313', '2027-07-30', 'D', 'ON_TRIP',    '1985-12-28', '2019-09-05', '45, Adyar, Chennai, Tamil Nadu 600020',                     '+91-9001234513'),
(14, 'Naresh',    'Jat',         'naresh.jat@driver.in',         '+91-8001234514', 'DL-2022-GJ-001414', '2029-04-10', 'C', 'ON_TRIP',    '1993-03-07', '2022-06-18', '12, Vastrapur, Ahmedabad, Gujarat 380015',                  '+91-9001234514'),
(15, 'Bharat',    'Negi',        'bharat.negi@driver.in',        '+91-8001234515', 'DL-2020-KA-001515', '2028-01-20', 'C', 'ON_TRIP',    '1988-07-11', '2020-12-01', '90, JP Nagar, Bangalore, Karnataka 560078',                '+91-9001234515'),

-- On Leave drivers
(16, 'Santosh',   'Ghosh',       'santosh.ghosh@driver.in',      '+91-8001234516', 'DL-2021-WB-001616', '2028-06-14', 'D', 'ON_LEAVE',   '1986-11-22', '2021-08-30', '56, Howrah, Kolkata, West Bengal 711101',                   '+91-9001234516'),
(17, 'Rakesh',    'Soni',        'rakesh.soni@driver.in',        '+91-8001234517', 'DL-2020-RJ-001717', '2027-09-08', 'C', 'ON_LEAVE',   '1984-04-16', '2020-03-14', '34, Vaishali Nagar, Jaipur, Rajasthan 302021',              '+91-9001234517'),

-- Suspended driver
(18, 'Hari',      'Prasad',      'hari.prasad@driver.in',        '+91-8001234518', 'DL-2019-UP-001818', '2027-04-25', 'C', 'SUSPENDED',  '1981-09-30', '2019-05-22', '12, Hazratganj, Lucknow, Uttar Pradesh 226001',             '+91-9001234518'),

-- Expired license driver (available but license expired — for testing business rule)
(19, 'Gopal',     'Tiwari',      'gopal.tiwari@driver.in',       '+91-8001234519', 'DL-2018-MP-001919', '2026-01-15', 'C', 'AVAILABLE',  '1980-06-05', '2018-10-10', '45, Vijay Nagar, Indore, Madhya Pradesh 452010',            '+91-9001234519'),

-- Another available driver
(20, 'Mohan',     'Rao',         'mohan.rao@driver.in',          '+91-8001234520', 'DL-2023-AP-002020', '2030-02-28', 'D', 'AVAILABLE',  '1994-01-12', '2023-01-15', '78, Madhurawada, Visakhapatnam, Andhra Pradesh 530048',     '+91-9001234520');

-- ============================================================
-- 6. TRIPS (50 rows)
-- ============================================================

-- Active trips (DISPATCHED / IN_PROGRESS) — linked to ON_TRIP vehicles & drivers
INSERT INTO trips (id, trip_number, vehicle_id, driver_id, dispatched_by_id, origin_region_id, destination_region_id, status, cargo_description, cargo_weight_kg, distance_km, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes) VALUES
(1,  'TRP-20260710-0001', 11, 11, 6, 1,  2,  'DISPATCHED',   'Electronics — TVs and Laptops',        22000.00, 1400.00, '2026-07-10 06:00:00', '2026-07-12 18:00:00', '2026-07-10 06:15:00', NULL, 'Priority shipment'),
(2,  'TRP-20260710-0002', 12, 12, 7, 2,  8,  'IN_PROGRESS',  'Automotive Parts — Engine Components',  25000.00, 1500.00, '2026-07-10 08:00:00', '2026-07-12 20:00:00', '2026-07-10 08:30:00', NULL, 'Fragile cargo, handle with care'),
(3,  'TRP-20260711-0001', 13, 13, 6, 4,  3,  'DISPATCHED',   'Textile Bales — Cotton',               30000.00, 350.00,  '2026-07-11 05:00:00', '2026-07-11 14:00:00', '2026-07-11 05:10:00', NULL, NULL),
(4,  'TRP-20260711-0002', 14, 14, 8, 7,  1,  'IN_PROGRESS',  'Chemical Drums — Industrial Solvents', 18000.00, 530.00,  '2026-07-11 07:00:00', '2026-07-11 18:00:00', '2026-07-11 07:20:00', NULL, 'Hazardous material — route B approved'),
(5,  'TRP-20260712-0001', 15, 15, 7, 3,  5,  'DISPATCHED',   'Medical Supplies — Vaccines',          800.00,   570.00,  '2026-07-12 04:00:00', '2026-07-12 14:00:00', '2026-07-12 04:05:00', NULL, 'Temperature-controlled, urgent delivery');

-- Scheduled trips (not yet dispatched)
INSERT INTO trips (id, trip_number, vehicle_id, driver_id, dispatched_by_id, origin_region_id, destination_region_id, status, cargo_description, cargo_weight_kg, distance_km, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes) VALUES
(6,  'TRP-20260713-0001', 1,  1,  6, 1,  6,  'SCHEDULED', 'FMCG Goods — Packaged Food',              15000.00, 160.00,  '2026-07-13 06:00:00', '2026-07-13 10:00:00', NULL, NULL, NULL),
(7,  'TRP-20260713-0002', 2,  2,  7, 2,  10, 'SCHEDULED', 'Construction Material — Steel Rods',       18000.00, 500.00,  '2026-07-13 07:00:00', '2026-07-13 18:00:00', NULL, NULL, NULL),
(8,  'TRP-20260713-0003', 3,  3,  8, 2,  9,  'SCHEDULED', 'Furniture — Office Desks',                 20000.00, 280.00,  '2026-07-13 05:30:00', '2026-07-13 12:00:00', NULL, NULL, NULL),
(9,  'TRP-20260714-0001', 4,  4,  6, 4,  11, 'SCHEDULED', 'Spices — Export Grade Turmeric',           10000.00, 700.00,  '2026-07-14 06:00:00', '2026-07-14 20:00:00', NULL, NULL, 'Export shipment — customs docs required'),
(10, 'TRP-20260714-0002', 5,  5,  7, 5,  3,  'SCHEDULED', 'IT Equipment — Servers',                   8000.00,  570.00,  '2026-07-14 08:00:00', '2026-07-14 18:00:00', NULL, NULL, NULL);

-- Completed trips (historical data)
INSERT INTO trips (id, trip_number, vehicle_id, driver_id, dispatched_by_id, origin_region_id, destination_region_id, status, cargo_description, cargo_weight_kg, distance_km, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes) VALUES
(11, 'TRP-20260601-0001', 1,  1,  6, 1,  2,  'COMPLETED', 'Pharma Products — Medicines',             12000.00, 1420.00, '2026-06-01 06:00:00', '2026-06-03 14:00:00', '2026-06-01 06:30:00', '2026-06-03 13:45:00', NULL),
(12, 'TRP-20260602-0001', 2,  2,  7, 2,  1,  'COMPLETED', 'Garments — Ready-made Clothing',           8000.00,  1400.00, '2026-06-02 07:00:00', '2026-06-04 15:00:00', '2026-06-02 07:15:00', '2026-06-04 14:30:00', NULL),
(13, 'TRP-20260603-0001', 3,  3,  6, 3,  4,  'COMPLETED', 'Agricultural Produce — Rice',              28000.00, 350.00,  '2026-06-03 05:00:00', '2026-06-03 12:00:00', '2026-06-03 05:20:00', '2026-06-03 11:50:00', NULL),
(14, 'TRP-20260604-0001', 4,  4,  8, 4,  5,  'COMPLETED', 'Electronics — Mobile Phones',              5000.00,  630.00,  '2026-06-04 06:00:00', '2026-06-04 18:00:00', '2026-06-04 06:10:00', '2026-06-04 17:45:00', 'High-value cargo'),
(15, 'TRP-20260605-0001', 5,  5,  7, 5,  7,  'COMPLETED', 'Hardware — Plumbing Fixtures',             15000.00, 750.00,  '2026-06-05 07:00:00', '2026-06-05 22:00:00', '2026-06-05 07:30:00', '2026-06-05 21:30:00', NULL),
(16, 'TRP-20260606-0001', 6,  6,  6, 6,  1,  'COMPLETED', 'Dairy Products — Milk and Cheese',         500.00,   160.00,  '2026-06-06 04:00:00', '2026-06-06 08:00:00', '2026-06-06 04:15:00', '2026-06-06 07:45:00', 'Refrigerated transport'),
(17, 'TRP-20260607-0001', 7,  7,  7, 7,  15, 'COMPLETED', 'Cement Bags',                             950.00,   650.00,  '2026-06-07 06:00:00', '2026-06-07 19:00:00', '2026-06-07 06:20:00', '2026-06-07 18:40:00', NULL),
(18, 'TRP-20260608-0001', 8,  8,  8, 8,  3,  'COMPLETED', 'Dry Fruits — Cashews and Almonds',         600.00,   1800.00, '2026-06-08 05:00:00', '2026-06-10 14:00:00', '2026-06-08 05:10:00', '2026-06-10 13:30:00', NULL),
(19, 'TRP-20260609-0001', 9,  9,  6, 9,  2,  'COMPLETED', 'Passenger Transport — Corporate Shuttle',  NULL,     420.00,  '2026-06-09 06:00:00', '2026-06-09 14:00:00', '2026-06-09 06:00:00', '2026-06-09 13:50:00', '45 passengers'),
(20, 'TRP-20260610-0001', 10, 10, 7, 10, 1,  'COMPLETED', 'Passenger Transport — Tour Group',         NULL,     1350.00, '2026-06-10 05:00:00', '2026-06-11 20:00:00', '2026-06-10 05:15:00', '2026-06-11 19:30:00', '32 passengers'),
(21, 'TRP-20260611-0001', 1,  1,  6, 1,  3,  'COMPLETED', 'Plastic Granules',                        26000.00, 980.00,  '2026-06-11 06:00:00', '2026-06-12 12:00:00', '2026-06-11 06:10:00', '2026-06-12 11:45:00', NULL),
(22, 'TRP-20260612-0001', 2,  2,  7, 2,  5,  'COMPLETED', 'Paper Rolls — Printing Paper',            17000.00, 1450.00, '2026-06-12 07:00:00', '2026-06-14 15:00:00', '2026-06-12 07:20:00', '2026-06-14 14:50:00', NULL),
(23, 'TRP-20260613-0001', 3,  3,  8, 3,  1,  'COMPLETED', 'Beverages — Soft Drinks',                 24000.00, 990.00,  '2026-06-13 05:00:00', '2026-06-14 10:00:00', '2026-06-13 05:30:00', '2026-06-14 09:45:00', NULL),
(24, 'TRP-20260614-0001', 4,  4,  6, 4,  8,  'COMPLETED', 'Ceramic Tiles',                           23000.00, 580.00,  '2026-06-14 06:00:00', '2026-06-14 18:00:00', '2026-06-14 06:15:00', '2026-06-14 17:30:00', NULL),
(25, 'TRP-20260615-0001', 5,  5,  7, 5,  2,  'COMPLETED', 'Packaged Water Bottles',                  14000.00, 650.00,  '2026-06-15 07:00:00', '2026-06-15 20:00:00', '2026-06-15 07:10:00', '2026-06-15 19:45:00', NULL),
(26, 'TRP-20260616-0001', 21, 6,  6, 5,  4,  'COMPLETED', 'Engine Oil Drums',                        20000.00, 630.00,  '2026-06-16 05:00:00', '2026-06-16 16:00:00', '2026-06-16 05:20:00', '2026-06-16 15:40:00', NULL),
(27, 'TRP-20260617-0001', 22, 7,  7, 7,  2,  'COMPLETED', 'Electrical Cables',                       12000.00, 950.00,  '2026-06-17 06:00:00', '2026-06-18 10:00:00', '2026-06-17 06:30:00', '2026-06-18 09:50:00', NULL),
(28, 'TRP-20260618-0001', 24, 8,  8, 8,  1,  'COMPLETED', 'Glass Sheets — Tempered',                 10000.00, 1800.00, '2026-06-18 04:00:00', '2026-06-20 16:00:00', '2026-06-18 04:10:00', '2026-06-20 15:30:00', 'Fragile — special handling'),
(29, 'TRP-20260619-0001', 25, 9,  6, 9,  8,  'COMPLETED', 'Passenger Transport — School Trip',        NULL,     280.00,  '2026-06-19 07:00:00', '2026-06-19 12:00:00', '2026-06-19 07:05:00', '2026-06-19 11:50:00', '38 students'),
(30, 'TRP-20260620-0001', 1,  10, 7, 10, 6,  'COMPLETED', 'Sugar Bags',                              27000.00, 820.00,  '2026-06-20 06:00:00', '2026-06-21 10:00:00', '2026-06-20 06:20:00', '2026-06-21 09:40:00', NULL),
(31, 'TRP-20260621-0001', 2,  1,  6, 1,  7,  'COMPLETED', 'Petroleum Products — Lubricants',          18000.00, 750.00,  '2026-06-21 05:00:00', '2026-06-21 20:00:00', '2026-06-21 05:15:00', '2026-06-21 19:30:00', 'Flammable goods'),
(32, 'TRP-20260622-0001', 3,  2,  7, 2,  4,  'COMPLETED', 'Stationery — Notebooks and Pens',          8000.00, 1400.00, '2026-06-22 07:00:00', '2026-06-24 12:00:00', '2026-06-22 07:10:00', '2026-06-24 11:45:00', NULL),
(33, 'TRP-20260623-0001', 4,  3,  8, 3,  5,  'COMPLETED', 'Frozen Seafood',                          15000.00, 630.00,  '2026-06-23 04:00:00', '2026-06-23 16:00:00', '2026-06-23 04:20:00', '2026-06-23 15:50:00', 'Cold chain — -18°C'),
(34, 'TRP-20260624-0001', 5,  4,  6, 4,  1,  'COMPLETED', 'Toys — Plastic and Wooden',                7000.00, 350.00,  '2026-06-24 06:00:00', '2026-06-24 12:00:00', '2026-06-24 06:10:00', '2026-06-24 11:40:00', NULL),
(35, 'TRP-20260625-0001', 6,  5,  7, 6,  13, 'COMPLETED', 'Fresh Vegetables',                         700.00,  210.00,  '2026-06-25 03:00:00', '2026-06-25 07:00:00', '2026-06-25 03:05:00', '2026-06-25 06:50:00', 'Perishable — early delivery'),
(36, 'TRP-20260626-0001', 7,  6,  6, 7,  9,  'COMPLETED', 'Marble Slabs',                             900.00,  500.00,  '2026-06-26 06:00:00', '2026-06-26 16:00:00', '2026-06-26 06:30:00', '2026-06-26 15:45:00', NULL),
(37, 'TRP-20260627-0001', 8,  7,  8, 15, 1,  'COMPLETED', 'Courier Packages — E-commerce',            600.00,  800.00,  '2026-06-27 05:00:00', '2026-06-27 20:00:00', '2026-06-27 05:10:00', '2026-06-27 19:30:00', 'Multiple drop-offs'),
(38, 'TRP-20260628-0001', 21, 8,  6, 5,  14, 'COMPLETED', 'Fertilizer Bags',                         30000.00, 450.00,  '2026-06-28 06:00:00', '2026-06-28 14:00:00', '2026-06-28 06:20:00', '2026-06-28 13:40:00', NULL),
(39, 'TRP-20260629-0001', 22, 9,  7, 14, 4,  'COMPLETED', 'Iron Ore Samples',                        14000.00, 350.00,  '2026-06-29 07:00:00', '2026-06-29 14:00:00', '2026-06-29 07:15:00', '2026-06-29 13:50:00', NULL),
(40, 'TRP-20260630-0001', 24, 10, 8, 12, 7,  'COMPLETED', 'Soybean Oil Containers',                  12000.00, 400.00,  '2026-06-30 06:00:00', '2026-06-30 14:00:00', '2026-06-30 06:10:00', '2026-06-30 13:40:00', NULL);

-- Cancelled trips
INSERT INTO trips (id, trip_number, vehicle_id, driver_id, dispatched_by_id, origin_region_id, destination_region_id, status, cargo_description, cargo_weight_kg, distance_km, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes) VALUES
(41, 'TRP-20260701-0001', 1,  1,  6, 1,  9,  'CANCELLED', 'Cancelled — Cement Bags',                  27000.00, 1200.00, '2026-07-01 06:00:00', '2026-07-02 18:00:00', NULL, NULL, 'Cancelled: Vehicle reassigned due to maintenance'),
(42, 'TRP-20260702-0001', 2,  2,  7, 2,  12, 'CANCELLED', 'Cancelled — Wooden Furniture',              16000.00, 700.00,  '2026-07-02 07:00:00', '2026-07-02 22:00:00', NULL, NULL, 'Cancelled: Client requested postponement'),
(43, 'TRP-20260703-0001', 3,  3,  8, 3,  7,  'CANCELLED', 'Cancelled — Textile Yarn',                  22000.00, 750.00,  '2026-07-03 05:00:00', '2026-07-03 20:00:00', NULL, NULL, 'Cancelled: Route blocked due to flooding'),
(44, 'TRP-20260703-0002', 5,  5,  6, 5,  1,  'CANCELLED', 'Cancelled — Rubber Sheets',                 12000.00, 570.00,  '2026-07-03 08:00:00', '2026-07-03 18:00:00', NULL, NULL, 'Cancelled: Driver called in sick'),
(45, 'TRP-20260704-0001', 4,  4,  7, 4,  2,  'CANCELLED', 'Cancelled — Paint Drums',                   20000.00, 630.00,  '2026-07-04 06:00:00', '2026-07-04 18:00:00', '2026-07-04 06:30:00', NULL, 'Cancelled: Mechanical failure after dispatch');

-- More completed trips for better analytics
INSERT INTO trips (id, trip_number, vehicle_id, driver_id, dispatched_by_id, origin_region_id, destination_region_id, status, cargo_description, cargo_weight_kg, distance_km, scheduled_departure, scheduled_arrival, actual_departure, actual_arrival, notes) VALUES
(46, 'TRP-20260705-0001', 1,  6,  6, 1,  5,  'COMPLETED', 'Pharmaceutical Raw Materials',             14000.00, 710.00,  '2026-07-05 06:00:00', '2026-07-05 20:00:00', '2026-07-05 06:15:00', '2026-07-05 19:45:00', NULL),
(47, 'TRP-20260706-0001', 2,  7,  7, 7,  1,  'COMPLETED', 'Aluminum Sheets',                         17000.00, 530.00,  '2026-07-06 07:00:00', '2026-07-06 18:00:00', '2026-07-06 07:10:00', '2026-07-06 17:40:00', NULL),
(48, 'TRP-20260707-0001', 3,  8,  8, 8,  2,  'COMPLETED', 'Cotton Bales',                            25000.00, 1500.00, '2026-07-07 05:00:00', '2026-07-08 18:00:00', '2026-07-07 05:20:00', '2026-07-08 17:30:00', NULL),
(49, 'TRP-20260708-0001', 4,  9,  6, 9,  4,  'COMPLETED', 'Poultry Feed Bags',                       20000.00, 400.00,  '2026-07-08 06:00:00', '2026-07-08 14:00:00', '2026-07-08 06:10:00', '2026-07-08 13:50:00', NULL),
(50, 'TRP-20260709-0001', 5,  10, 7, 10, 3,  'COMPLETED', 'Ceramic Cookware',                        12000.00, 1200.00, '2026-07-09 07:00:00', '2026-07-10 14:00:00', '2026-07-09 07:15:00', '2026-07-10 13:45:00', NULL);

-- ============================================================
-- 7. MAINTENANCE LOGS (30 rows)
-- ============================================================

INSERT INTO maintenance_logs (id, vehicle_id, reported_by_id, type, description, status, cost, start_date, end_date, vendor_name, notes) VALUES
-- Active maintenance (IN_SHOP vehicles)
(1,  16, 3, 'CORRECTIVE',  'Engine overhaul — cylinder head replacement and valve adjustment',                   'IN_PROGRESS', 85000.00,  '2026-07-10', NULL,          'Tata Authorized Service Center, Mumbai',   'Estimated 5 days'),
(2,  17, 4, 'EMERGENCY',   'Transmission failure — gearbox replacement required',                               'OPEN',        120000.00, '2026-07-08', NULL,          'Sharma Auto Works, Lucknow',               'Parts ordered, awaiting delivery'),
(3,  18, 5, 'CORRECTIVE',  'Brake system overhaul — disc pads, calipers, and brake lines',                      'IN_PROGRESS', 45000.00,  '2026-07-06', NULL,          'National Auto Repair, Delhi',               NULL),

-- Completed maintenance (historical)
(4,  1,  3, 'PREVENTIVE',  '50,000 km service — oil change, filter replacement, belt inspection',               'COMPLETED',   12500.00,  '2026-06-18', '2026-06-20', 'Tata Authorized Service Center, Mumbai',   NULL),
(5,  2,  4, 'PREVENTIVE',  '60,000 km service — full fluid change, brake inspection, tire rotation',            'COMPLETED',   15800.00,  '2026-05-13', '2026-05-15', 'Leyland Service Hub, Delhi',                NULL),
(6,  3,  3, 'CORRECTIVE',  'Alternator replacement and battery servicing',                                       'COMPLETED',   8500.00,   '2026-06-28', '2026-07-01', 'Mahindra Service Point, Delhi',             NULL),
(7,  4,  5, 'PREVENTIVE',  '50,000 km service — oil, filters, AC gas top-up',                                   'COMPLETED',   11200.00,  '2026-04-08', '2026-04-10', 'Eicher Care Center, Bangalore',             NULL),
(8,  5,  3, 'CORRECTIVE',  'Suspension repair — leaf spring replacement (rear axle)',                            'COMPLETED',   22000.00,  '2026-06-22', '2026-06-25', 'BharatBenz Workshop, Chennai',              NULL),
(9,  6,  4, 'PREVENTIVE',  '10,000 km service — oil change, spark plugs, air filter',                           'COMPLETED',   4500.00,   '2026-07-03', '2026-07-05', 'Tata Motors Service, Mumbai',               NULL),
(10, 7,  5, 'CORRECTIVE',  'Power steering pump replacement',                                                    'COMPLETED',   18000.00,  '2026-05-18', '2026-05-20', 'Mahindra Service Point, Delhi',             NULL),
(11, 8,  3, 'PREVENTIVE',  'CNG kit servicing and inspection',                                                   'COMPLETED',   6500.00,   '2026-07-06', '2026-07-08', 'Green Gas Motors, Ahmedabad',               NULL),
(12, 9,  4, 'CORRECTIVE',  'AC compressor replacement and gas refill',                                           'COMPLETED',   28000.00,  '2026-03-12', '2026-03-15', 'Cool Air Solutions, Jaipur',                NULL),
(13, 10, 5, 'PREVENTIVE',  '50,000 km service — complete brake overhaul and fluid change',                       'COMPLETED',   16500.00,  '2026-06-08', '2026-06-10', 'Leyland Service Hub, Bangalore',            NULL),
(14, 11, 3, 'CORRECTIVE',  'Fuel injector replacement — engine misfiring',                                       'COMPLETED',   35000.00,  '2026-05-28', '2026-06-01', 'Tata Authorized Service Center, Mumbai',   NULL),
(15, 12, 4, 'PREVENTIVE',  '70,000 km service — turbo inspection, oil change, all filters',                      'COMPLETED',   18500.00,  '2026-05-25', '2026-05-28', 'Eicher Care Center, Delhi',                 NULL),
(16, 13, 5, 'EMERGENCY',   'Radiator leak repair — highway breakdown',                                           'COMPLETED',   12000.00,  '2026-06-25', '2026-06-30', 'Highway Auto Rescue, Chennai',              'Towed 50 km to workshop'),
(17, 14, 3, 'PREVENTIVE',  '15,000 km service — standard maintenance',                                           'COMPLETED',   9800.00,   '2026-06-30', '2026-07-02', 'Mahindra Service Point, Ahmedabad',         NULL),
(18, 21, 4, 'PREVENTIVE',  '5,000 km break-in service',                                                          'COMPLETED',   5500.00,   '2026-06-28', '2026-07-01', 'Tata Motors Service, Hyderabad',            NULL),
(19, 22, 5, 'CORRECTIVE',  'Exhaust system repair — muffler replacement',                                        'COMPLETED',   7500.00,   '2026-06-15', '2026-06-18', 'BharatBenz Workshop, Vizag',                NULL),
(20, 24, 3, 'PREVENTIVE',  'CNG system inspection and tuning',                                                   'COMPLETED',   8000.00,   '2026-06-20', '2026-06-22', 'Green Gas Motors, Ahmedabad',               NULL),
(21, 25, 4, 'CORRECTIVE',  'Door mechanism repair and window motor replacement',                                  'COMPLETED',   14000.00,  '2026-05-28', '2026-05-30', 'Leyland Service Hub, Kolkata',               NULL),

-- Cancelled maintenance
(22, 1,  5, 'PREVENTIVE',  'Cancelled — Tire replacement (wrong size ordered)',                                   'CANCELLED',   0.00,      '2026-06-10', '2026-06-10', 'QuickFit Tires, Mumbai',                    'Rescheduled after correct tires arrive'),
(23, 9,  3, 'CORRECTIVE',  'Cancelled — Windshield replacement (insurance dispute)',                              'CANCELLED',   0.00,      '2026-04-05', '2026-04-05', 'SafeGlass Auto, Jaipur',                    'Insurance claim under review'),

-- More completed maintenance for analytics
(24, 1,  3, 'CORRECTIVE',  'Clutch plate replacement',                                                            'COMPLETED',   25000.00,  '2026-04-15', '2026-04-18', 'Tata Authorized Service Center, Mumbai',   NULL),
(25, 2,  4, 'CORRECTIVE',  'Wheel bearing replacement — front axle',                                              'COMPLETED',   8500.00,   '2026-03-20', '2026-03-22', 'Leyland Service Hub, Delhi',                NULL),
(26, 3,  5, 'PREVENTIVE',  '30,000 km service',                                                                   'COMPLETED',   10200.00,  '2026-04-25', '2026-04-27', 'Mahindra Service Point, Delhi',             NULL),
(27, 5,  3, 'PREVENTIVE',  '25,000 km service',                                                                   'COMPLETED',   9800.00,   '2026-03-10', '2026-03-12', 'BharatBenz Workshop, Chennai',              NULL),
(28, 11, 4, 'PREVENTIVE',  '60,000 km service — comprehensive',                                                   'COMPLETED',   19500.00,  '2026-04-01', '2026-04-04', 'Tata Authorized Service Center, Mumbai',   NULL),
(29, 21, 5, 'CORRECTIVE',  'Battery replacement',                                                                 'COMPLETED',   12000.00,  '2026-05-15', '2026-05-16', 'Battery World, Hyderabad',                  NULL),
(30, 15, 3, 'PREVENTIVE',  '20,000 km service',                                                                   'COMPLETED',   7200.00,   '2026-06-12', '2026-06-15', 'Tata Motors Service, Bangalore',            NULL);

-- ============================================================
-- 8. FUEL LOGS (60 rows)
-- ============================================================

INSERT INTO fuel_logs (id, vehicle_id, driver_id, recorded_by_id, fuel_date, fuel_type, quantity, price_per_unit, total_cost, odometer_reading, station, notes) VALUES
-- June 2026 fuel logs
(1,  1,  1,  6, '2026-06-01', 'DIESEL', 180.00, 89.50,  16110.00, 43200.00, 'Indian Oil, Andheri, Mumbai',              NULL),
(2,  2,  2,  7, '2026-06-02', 'DIESEL', 150.00, 89.50,  13425.00, 60500.00, 'Bharat Petroleum, Karol Bagh, Delhi',      NULL),
(3,  3,  3,  6, '2026-06-03', 'DIESEL', 120.00, 90.00,  10800.00, 37800.00, 'HP Petrol Pump, Whitefield, Bangalore',    NULL),
(4,  4,  4,  8, '2026-06-04', 'DIESEL', 140.00, 89.75,  12565.00, 53900.00, 'Indian Oil, T Nagar, Chennai',             NULL),
(5,  5,  5,  7, '2026-06-05', 'DIESEL', 160.00, 90.25,  14440.00, 28600.00, 'Shell, Banjara Hills, Hyderabad',          NULL),
(6,  6,  6,  6, '2026-06-06', 'DIESEL', 35.00,  89.50,  3132.50,  11800.00, 'Indian Oil, Kothrud, Pune',                NULL),
(7,  7,  7,  7, '2026-06-07', 'DIESEL', 40.00,  89.75,  3590.00,  18000.00, 'Bharat Petroleum, SG Highway, Ahmedabad', NULL),
(8,  8,  8,  8, '2026-06-08', 'CNG',    25.00,  85.00,  2125.00,  7600.00,  'Adani CNG, Vastrapur, Ahmedabad',          NULL),
(9,  9,  9,  6, '2026-06-09', 'DIESEL', 200.00, 89.50,  17900.00, 77800.00, 'HP Petrol Pump, MI Road, Jaipur',          NULL),
(10, 10, 10, 7, '2026-06-10', 'DIESEL', 180.00, 90.00,  16200.00, 54200.00, 'Indian Oil, MG Road, Bangalore',           NULL),
(11, 1,  1,  6, '2026-06-11', 'DIESEL', 175.00, 89.50,  15662.50, 44100.00, 'Shell, Powai, Mumbai',                      NULL),
(12, 2,  2,  7, '2026-06-12', 'DIESEL', 165.00, 89.75,  14808.75, 61200.00, 'Indian Oil, Connaught Place, Delhi',        NULL),
(13, 3,  3,  8, '2026-06-13', 'DIESEL', 140.00, 90.00,  12600.00, 38300.00, 'Bharat Petroleum, Koramangala, Bangalore', NULL),
(14, 4,  4,  6, '2026-06-14', 'DIESEL', 130.00, 89.50,  11635.00, 54300.00, 'HP Petrol Pump, Anna Nagar, Chennai',      NULL),
(15, 5,  5,  7, '2026-06-15', 'DIESEL', 155.00, 90.25,  13988.75, 29100.00, 'Indian Oil, Madhapur, Hyderabad',           NULL),
(16, 21, 6,  6, '2026-06-16', 'DIESEL', 160.00, 89.50,  14320.00, 4500.00,  'Shell, HITEC City, Hyderabad',              NULL),
(17, 22, 7,  7, '2026-06-17', 'DIESEL', 100.00, 89.75,  8975.00,  30800.00, 'Bharat Petroleum, SG Highway, Ahmedabad', NULL),
(18, 24, 8,  8, '2026-06-18', 'CNG',    35.00,  85.00,  2975.00,  24000.00, 'Gujarat Gas, Satellite, Ahmedabad',         NULL),
(19, 25, 9,  6, '2026-06-19', 'DIESEL', 170.00, 90.00,  15300.00, 60500.00, 'Indian Oil, Park Street, Kolkata',          NULL),
(20, 1,  10, 7, '2026-06-20', 'DIESEL', 185.00, 89.50,  16557.50, 44800.00, 'HP Petrol Pump, Vashi, Mumbai',             NULL),

-- More June fuel logs
(21, 2,  1,  6, '2026-06-21', 'DIESEL', 170.00, 89.75,  15257.50, 61900.00, 'Indian Oil, Dwarka, Delhi',                 NULL),
(22, 3,  2,  7, '2026-06-22', 'DIESEL', 155.00, 90.00,  13950.00, 38900.00, 'Shell, MG Road, Bangalore',                 NULL),
(23, 4,  3,  8, '2026-06-23', 'DIESEL', 125.00, 89.50,  11187.50, 54800.00, 'Bharat Petroleum, Egmore, Chennai',         NULL),
(24, 5,  4,  6, '2026-06-24', 'DIESEL', 110.00, 90.25,  9927.50,  29400.00, 'Indian Oil, Secunderabad, Hyderabad',       NULL),
(25, 6,  5,  7, '2026-06-25', 'DIESEL', 30.00,  89.50,  2685.00,  12000.00, 'HP Petrol Pump, Hadapsar, Pune',            NULL),
(26, 7,  6,  6, '2026-06-26', 'DIESEL', 38.00,  89.75,  3410.50,  18300.00, 'Indian Oil, CG Road, Ahmedabad',            NULL),
(27, 8,  7,  8, '2026-06-27', 'CNG',    28.00,  85.00,  2380.00,  7900.00,  'Adani CNG, Paldi, Ahmedabad',               NULL),
(28, 21, 8,  6, '2026-06-28', 'DIESEL', 170.00, 89.50,  15215.00, 4900.00,  'Shell, Kukatpally, Hyderabad',              NULL),
(29, 22, 9,  7, '2026-06-29', 'DIESEL', 95.00,  89.75,  8526.25,  31100.00, 'Bharat Petroleum, RK Beach, Vizag',         NULL),
(30, 24, 10, 8, '2026-06-30', 'CNG',    30.00,  85.00,  2550.00,  24300.00, 'Gujarat Gas, Navrangpura, Ahmedabad',       NULL),

-- July 2026 fuel logs
(31, 1,  6,  6, '2026-07-01', 'DIESEL', 190.00, 91.00,  17290.00, 45100.00, 'Indian Oil, Lower Parel, Mumbai',           'Price increase effective July'),
(32, 2,  7,  7, '2026-07-02', 'DIESEL', 160.00, 91.25,  14600.00, 62000.00, 'Bharat Petroleum, Noida, Delhi NCR',        NULL),
(33, 3,  8,  8, '2026-07-03', 'DIESEL', 145.00, 91.50,  13267.50, 39500.00, 'HP Petrol Pump, HSR Layout, Bangalore',     NULL),
(34, 5,  5,  6, '2026-07-03', 'DIESEL', 150.00, 91.75,  13762.50, 29800.00, 'Shell, Gachibowli, Hyderabad',              NULL),
(35, 4,  4,  7, '2026-07-04', 'DIESEL', 135.00, 91.00,  12285.00, 55200.00, 'Indian Oil, Velachery, Chennai',             NULL),
(36, 1,  1,  6, '2026-07-05', 'DIESEL', 180.00, 91.00,  16380.00, 45500.00, 'Shell, BKC, Mumbai',                        NULL),
(37, 2,  7,  7, '2026-07-06', 'DIESEL', 155.00, 91.25,  14143.75, 62400.00, 'Indian Oil, Saket, Delhi',                  NULL),
(38, 3,  8,  8, '2026-07-07', 'DIESEL', 170.00, 91.50,  15555.00, 40000.00, 'Bharat Petroleum, Indiranagar, Bangalore',  NULL),
(39, 4,  9,  6, '2026-07-08', 'DIESEL', 130.00, 91.00,  11830.00, 55600.00, 'HP Petrol Pump, Tambaram, Chennai',         NULL),
(40, 5,  10, 7, '2026-07-09', 'DIESEL', 165.00, 91.75,  15138.75, 30200.00, 'Shell, KPHB, Hyderabad',                    NULL),

-- Active trip fuel stops
(41, 11, 11, 6, '2026-07-10', 'DIESEL', 200.00, 91.00,  18200.00, 67200.00, 'Indian Oil, Nashik Highway, Maharashtra',   'En route MUM→DEL'),
(42, 12, 12, 7, '2026-07-10', 'DIESEL', 190.00, 91.25,  17337.50, 71000.00, 'Bharat Petroleum, Lucknow Highway',         'En route DEL→KOL'),
(43, 13, 13, 6, '2026-07-11', 'DIESEL', 100.00, 91.50,  9150.00,  42500.00, 'HP Petrol Pump, Vellore, Tamil Nadu',       'En route CHN→BLR'),
(44, 14, 14, 8, '2026-07-11', 'DIESEL', 150.00, 91.00,  13650.00, 15400.00, 'Shell, Vadodara, Gujarat',                  'En route AMD→MUM'),
(45, 15, 15, 7, '2026-07-12', 'DIESEL', 60.00,  91.75,  5505.00,  22200.00, 'Indian Oil, Chitradurga, Karnataka',        'En route BLR→HYD'),

-- Historical fuel logs (older months)
(46, 1,  1,  6, '2026-05-15', 'DIESEL', 175.00, 88.50,  15487.50, 42500.00, 'Indian Oil, Thane, Mumbai',                  NULL),
(47, 2,  2,  7, '2026-05-18', 'DIESEL', 160.00, 88.75,  14200.00, 59800.00, 'Bharat Petroleum, Gurgaon, Delhi NCR',      NULL),
(48, 3,  3,  8, '2026-05-20', 'DIESEL', 135.00, 89.00,  12015.00, 37000.00, 'HP Petrol Pump, Electronic City, Bangalore', NULL),
(49, 4,  4,  6, '2026-05-22', 'DIESEL', 145.00, 88.50,  12832.50, 53200.00, 'Indian Oil, Mylapore, Chennai',              NULL),
(50, 5,  5,  7, '2026-05-25', 'DIESEL', 140.00, 89.00,  12460.00, 27800.00, 'Shell, Jubilee Hills, Hyderabad',            NULL),
(51, 9,  9,  6, '2026-05-10', 'DIESEL', 195.00, 88.50,  17257.50, 77000.00, 'Indian Oil, Ajmer Road, Jaipur',             NULL),
(52, 10, 10, 7, '2026-05-12', 'DIESEL', 175.00, 88.75,  15531.25, 53500.00, 'HP Petrol Pump, Malleshwaram, Bangalore',   NULL),
(53, 11, 11, 8, '2026-05-28', 'DIESEL', 210.00, 88.50,  18585.00, 66800.00, 'Indian Oil, Panvel, Mumbai',                 NULL),
(54, 12, 12, 6, '2026-05-30', 'DIESEL', 185.00, 88.75,  16418.75, 70500.00, 'Bharat Petroleum, Faridabad, Delhi NCR',    NULL),
(55, 21, 6,  7, '2026-05-15', 'DIESEL', 100.00, 88.50,  8850.00,  3800.00,  'Shell, HITEC City, Hyderabad',               NULL),
(56, 22, 7,  8, '2026-05-18', 'DIESEL', 90.00,  88.75,  7987.50,  30200.00, 'Indian Oil, Vizag Steel Plant, Vizag',      NULL),
(57, 24, 8,  6, '2026-05-20', 'CNG',    32.00,  84.00,  2688.00,  23500.00, 'Gujarat Gas, Ashram Road, Ahmedabad',        NULL),
(58, 25, 9,  7, '2026-05-22', 'DIESEL', 165.00, 88.50,  14602.50, 60000.00, 'Bharat Petroleum, Howrah, Kolkata',          NULL),
(59, 6,  5,  8, '2026-05-25', 'DIESEL', 32.00,  88.50,  2832.00,  11500.00, 'HP Petrol Pump, Hinjewadi, Pune',            NULL),
(60, 7,  6,  6, '2026-05-28', 'DIESEL', 36.00,  88.75,  3195.00,  17700.00, 'Indian Oil, Prahlad Nagar, Ahmedabad',      NULL);

-- ============================================================
-- 9. EXPENSES (40 rows)
-- ============================================================

INSERT INTO expenses (id, vehicle_id, trip_id, recorded_by_id, category, amount, description, expense_date, receipt_url, notes) VALUES
-- Fuel expenses (linked to trips)
(1,  1,  11, 6, 'FUEL',         16110.00, 'Fuel for MUM→DEL trip — 180L diesel',                    '2026-06-01', NULL, NULL),
(2,  2,  12, 7, 'FUEL',         13425.00, 'Fuel for DEL→MUM trip — 150L diesel',                    '2026-06-02', NULL, NULL),
(3,  3,  13, 6, 'FUEL',         10800.00, 'Fuel for BLR→CHN trip — 120L diesel',                    '2026-06-03', NULL, NULL),
(4,  4,  14, 8, 'FUEL',         12565.00, 'Fuel for CHN→HYD trip — 140L diesel',                    '2026-06-04', NULL, NULL),
(5,  5,  15, 7, 'FUEL',         14440.00, 'Fuel for HYD→AMD trip — 160L diesel',                    '2026-06-05', NULL, NULL),

-- Maintenance expenses
(6,  16, NULL, 3, 'MAINTENANCE', 85000.00, 'Engine overhaul — cylinder head replacement',             '2026-07-10', NULL, 'Ongoing'),
(7,  17, NULL, 4, 'MAINTENANCE', 120000.00,'Transmission failure — gearbox replacement',              '2026-07-08', NULL, 'Parts on order'),
(8,  18, NULL, 5, 'MAINTENANCE', 45000.00, 'Brake system overhaul',                                   '2026-07-06', NULL, NULL),
(9,  1,  NULL, 3, 'MAINTENANCE', 12500.00, '50,000 km scheduled service',                             '2026-06-20', NULL, NULL),
(10, 2,  NULL, 4, 'MAINTENANCE', 15800.00, '60,000 km scheduled service',                             '2026-05-15', NULL, NULL),

-- Insurance expenses
(11, 1,  NULL, 3, 'INSURANCE',   52000.00, 'Annual comprehensive insurance renewal — Tata Prima',     '2026-03-15', NULL, 'Policy: TI-2026-MH-001234'),
(12, 2,  NULL, 3, 'INSURANCE',   48000.00, 'Annual comprehensive insurance renewal — Leyland BOSS',   '2026-01-10', NULL, 'Policy: TI-2026-DL-005678'),
(13, 3,  NULL, 3, 'INSURANCE',   55000.00, 'Annual comprehensive insurance renewal — Mahindra Blazo', '2026-06-30', NULL, 'Policy: TI-2026-DL-009012'),
(14, 11, NULL, 3, 'INSURANCE',   58000.00, 'Annual comprehensive insurance renewal — Tata Prima 55',  '2026-05-12', NULL, 'Policy: TI-2026-MH-001133'),
(15, 21, NULL, 3, 'INSURANCE',   60000.00, 'Annual comprehensive insurance renewal — Tata Signa',     '2026-06-20', NULL, 'Policy: TI-2026-TS-001133'),

-- Toll expenses (linked to trips)
(16, 1,  11, 6, 'TOLLS',         2850.00, 'MUM→DEL NH48 tolls (7 toll plazas)',                      '2026-06-01', NULL, NULL),
(17, 2,  12, 7, 'TOLLS',         2650.00, 'DEL→MUM NH48 tolls (7 toll plazas)',                      '2026-06-02', NULL, NULL),
(18, 3,  13, 6, 'TOLLS',         450.00,  'BLR→CHN NH44 tolls (3 toll plazas)',                      '2026-06-03', NULL, NULL),
(19, 4,  14, 8, 'TOLLS',         1200.00, 'CHN→HYD NH65 tolls (5 toll plazas)',                      '2026-06-04', NULL, NULL),
(20, 5,  15, 7, 'TOLLS',         1500.00, 'HYD→AMD tolls (6 toll plazas)',                           '2026-06-05', NULL, NULL),
(21, 11, 1,  6, 'TOLLS',         2850.00, 'MUM→DEL NH48 tolls — active trip',                       '2026-07-10', NULL, NULL),
(22, 12, 2,  7, 'TOLLS',         3200.00, 'DEL→KOL NH19 tolls — active trip',                       '2026-07-10', NULL, NULL),

-- Fines
(23, 4,  NULL, 8, 'FINES',       5000.00, 'Overweight penalty — Ramanathapuram check post',          '2026-06-14', NULL, 'Disputed — under review'),
(24, 9,  NULL, 6, 'FINES',       2000.00, 'Late night driving violation — NH48',                     '2026-06-09', NULL, NULL),
(25, 12, NULL, 7, 'FINES',       3500.00, 'Speed limit violation — Agra Expressway',                 '2026-07-10', NULL, NULL),

-- Salary expenses (not linked to vehicles)
(26, NULL, NULL, 3, 'SALARY',    35000.00, 'Driver salary — Suresh Kumar (June 2026)',                 '2026-06-30', NULL, NULL),
(27, NULL, NULL, 3, 'SALARY',    35000.00, 'Driver salary — Ramesh Yadav (June 2026)',                 '2026-06-30', NULL, NULL),
(28, NULL, NULL, 3, 'SALARY',    38000.00, 'Driver salary — Kiran Jadhav (June 2026)',                 '2026-06-30', NULL, NULL),
(29, NULL, NULL, 3, 'SALARY',    38000.00, 'Driver salary — Deepak Verma (June 2026)',                 '2026-06-30', NULL, NULL),
(30, NULL, NULL, 3, 'SALARY',    32000.00, 'Driver salary — Prakash Meena (June 2026)',                '2026-06-30', NULL, NULL),

-- Miscellaneous expenses
(31, 1,  NULL, 4, 'MISCELLANEOUS', 8500.00,  'GPS tracker replacement and installation',               '2026-06-15', NULL, NULL),
(32, 3,  NULL, 5, 'MISCELLANEOUS', 12000.00, 'Dashcam installation — front and rear',                  '2026-06-20', NULL, NULL),
(33, 11, NULL, 3, 'MISCELLANEOUS', 3500.00,  'Tarpaulin replacement for cargo cover',                  '2026-07-09', NULL, NULL),
(34, NULL,NULL, 4, 'MISCELLANEOUS', 25000.00, 'Office rent — dispatch center (July 2026)',              '2026-07-01', NULL, NULL),
(35, NULL,NULL, 5, 'MISCELLANEOUS', 8000.00,  'Software subscription — fleet management tools',         '2026-07-01', NULL, 'Monthly subscription'),

-- More fuel expenses for July trips
(36, 11, 1,  6, 'FUEL',         18200.00, 'Fuel for active MUM→DEL trip — 200L diesel',              '2026-07-10', NULL, NULL),
(37, 12, 2,  7, 'FUEL',         17337.50, 'Fuel for active DEL→KOL trip — 190L diesel',              '2026-07-10', NULL, NULL),
(38, 13, 3,  6, 'FUEL',         9150.00,  'Fuel for active CHN→BLR trip — 100L diesel',              '2026-07-11', NULL, NULL),
(39, 14, 4,  8, 'FUEL',         13650.00, 'Fuel for active AMD→MUM trip — 150L diesel',              '2026-07-11', NULL, NULL),
(40, 15, 5,  7, 'FUEL',         5505.00,  'Fuel for active BLR→HYD trip — 60L diesel',               '2026-07-12', NULL, NULL);

-- ============================================================
-- RESET AUTO_INCREMENT VALUES
-- ============================================================

ALTER TABLE roles AUTO_INCREMENT = 5;
ALTER TABLE users AUTO_INCREMENT = 11;
ALTER TABLE regions AUTO_INCREMENT = 16;
ALTER TABLE vehicles AUTO_INCREMENT = 26;
ALTER TABLE drivers AUTO_INCREMENT = 21;
ALTER TABLE trips AUTO_INCREMENT = 51;
ALTER TABLE maintenance_logs AUTO_INCREMENT = 31;
ALTER TABLE fuel_logs AUTO_INCREMENT = 61;
ALTER TABLE expenses AUTO_INCREMENT = 41;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

SELECT 'roles' AS `table`, COUNT(*) AS total FROM roles
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'regions', COUNT(*) FROM regions
UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL SELECT 'trips', COUNT(*) FROM trips
UNION ALL SELECT 'maintenance_logs', COUNT(*) FROM maintenance_logs
UNION ALL SELECT 'fuel_logs', COUNT(*) FROM fuel_logs
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses;
