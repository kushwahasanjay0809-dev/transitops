const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================
  // 1. ROLES
  // ============================================================
  console.log('📋 Seeding roles...');
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN', description: 'Full system access. Manages users, settings, and all modules.' },
    }),
    prisma.role.upsert({
      where: { name: 'MANAGER' },
      update: {},
      create: { name: 'MANAGER', description: 'Manages vehicles, drivers, maintenance, expenses. Cannot manage users.' },
    }),
    prisma.role.upsert({
      where: { name: 'DISPATCHER' },
      update: {},
      create: { name: 'DISPATCHER', description: 'Creates and dispatches trips, records fuel logs. Read-only for other modules.' },
    }),
    prisma.role.upsert({
      where: { name: 'VIEWER' },
      update: {},
      create: { name: 'VIEWER', description: 'Read-only access to dashboards and reports.' },
    }),
  ]);
  console.log(`   ✅ ${roles.length} roles seeded`);

  // ============================================================
  // 2. USERS
  // ============================================================
  console.log('👤 Seeding users...');
  const hashedPassword = await bcrypt.hash('Password@123', BCRYPT_ROUNDS);

  const usersData = [
    { roleId: roles[0].id, firstName: 'Rajesh',  lastName: 'Sharma',   email: 'rajesh.sharma@transitops.in',   phone: '+91-9876543210', isActive: true,  lastLoginAt: new Date('2026-07-12T08:30:00Z') },
    { roleId: roles[0].id, firstName: 'Priya',   lastName: 'Nair',     email: 'priya.nair@transitops.in',      phone: '+91-9876543211', isActive: true,  lastLoginAt: new Date('2026-07-11T14:22:00Z') },
    { roleId: roles[1].id, firstName: 'Amit',    lastName: 'Patel',    email: 'amit.patel@transitops.in',      phone: '+91-9876543212', isActive: true,  lastLoginAt: new Date('2026-07-12T09:15:00Z') },
    { roleId: roles[1].id, firstName: 'Sneha',   lastName: 'Kulkarni', email: 'sneha.kulkarni@transitops.in',  phone: '+91-9876543213', isActive: true,  lastLoginAt: new Date('2026-07-10T11:45:00Z') },
    { roleId: roles[1].id, firstName: 'Vikram',  lastName: 'Singh',    email: 'vikram.singh@transitops.in',    phone: '+91-9876543214', isActive: true,  lastLoginAt: new Date('2026-07-12T07:00:00Z') },
    { roleId: roles[2].id, firstName: 'Kavitha', lastName: 'Reddy',    email: 'kavitha.reddy@transitops.in',   phone: '+91-9876543215', isActive: true,  lastLoginAt: new Date('2026-07-12T09:00:00Z') },
    { roleId: roles[2].id, firstName: 'Arjun',   lastName: 'Mehta',    email: 'arjun.mehta@transitops.in',     phone: '+91-9876543216', isActive: true,  lastLoginAt: new Date('2026-07-11T16:30:00Z') },
    { roleId: roles[2].id, firstName: 'Deepa',   lastName: 'Iyer',     email: 'deepa.iyer@transitops.in',      phone: '+91-9876543217', isActive: true,  lastLoginAt: new Date('2026-07-12T10:00:00Z') },
    { roleId: roles[3].id, firstName: 'Rohit',   lastName: 'Gupta',    email: 'rohit.gupta@transitops.in',     phone: '+91-9876543218', isActive: true,  lastLoginAt: new Date('2026-07-09T13:00:00Z') },
    { roleId: roles[3].id, firstName: 'Meera',   lastName: 'Joshi',    email: 'meera.joshi@transitops.in',     phone: '+91-9876543219', isActive: false, lastLoginAt: new Date('2026-06-15T10:00:00Z') },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: { ...userData, password: hashedPassword },
    });
    users.push(user);
  }
  console.log(`   ✅ ${users.length} users seeded`);

  // ============================================================
  // 3. REGIONS
  // ============================================================
  console.log('🗺️  Seeding regions...');
  const regionsData = [
    { name: 'Mumbai Central',   code: 'MUM', state: 'Maharashtra',    country: 'India' },
    { name: 'Delhi NCR',        code: 'DEL', state: 'Delhi',          country: 'India' },
    { name: 'Bangalore Hub',    code: 'BLR', state: 'Karnataka',      country: 'India' },
    { name: 'Chennai Port',     code: 'CHN', state: 'Tamil Nadu',     country: 'India' },
    { name: 'Hyderabad Depot',  code: 'HYD', state: 'Telangana',      country: 'India' },
    { name: 'Pune Logistics',   code: 'PUN', state: 'Maharashtra',    country: 'India' },
    { name: 'Ahmedabad Zone',   code: 'AMD', state: 'Gujarat',        country: 'India' },
    { name: 'Kolkata Terminal', code: 'KOL', state: 'West Bengal',    country: 'India' },
    { name: 'Jaipur Depot',     code: 'JAI', state: 'Rajasthan',      country: 'India' },
    { name: 'Lucknow Hub',      code: 'LKO', state: 'Uttar Pradesh',  country: 'India' },
    { name: 'Kochi Warehouse',  code: 'KCH', state: 'Kerala',         country: 'India' },
    { name: 'Indore Center',    code: 'IDR', state: 'Madhya Pradesh', country: 'India' },
    { name: 'Nagpur Junction',  code: 'NGP', state: 'Maharashtra',    country: 'India' },
    { name: 'Vizag Port',       code: 'VZG', state: 'Andhra Pradesh', country: 'India' },
    { name: 'Surat Hub',        code: 'SUR', state: 'Gujarat',        country: 'India' },
  ];

  const regions = [];
  for (const regionData of regionsData) {
    const region = await prisma.region.upsert({
      where: { name: regionData.name },
      update: {},
      create: regionData,
    });
    regions.push(region);
  }
  console.log(`   ✅ ${regions.length} regions seeded`);

  // ============================================================
  // 4. VEHICLES
  // ============================================================
  console.log('🚛 Seeding vehicles...');
  const vehiclesData = [
    { registrationNumber: 'MH-01-AB-1234', make: 'Tata',          model: 'Prima 4928.S',       year: 2024, type: 'TRUCK',   capacityKg: 28000.00, fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 45230.50, insuranceExpiry: new Date('2027-03-15'), lastServiceDate: new Date('2026-06-20') },
    { registrationNumber: 'MH-01-CD-5678', make: 'Ashok Leyland', model: 'BOSS 1920HB',        year: 2023, type: 'TRUCK',   capacityKg: 19000.00, fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 62100.00, insuranceExpiry: new Date('2027-01-10'), lastServiceDate: new Date('2026-05-15') },
    { registrationNumber: 'DL-02-EF-9012', make: 'Mahindra',      model: 'Blazo X 46',         year: 2024, type: 'TRUCK',   capacityKg: 31000.00, fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 38750.25, insuranceExpiry: new Date('2027-06-30'), lastServiceDate: new Date('2026-07-01') },
    { registrationNumber: 'KA-03-GH-3456', make: 'Eicher',        model: 'Pro 6049',           year: 2023, type: 'TRUCK',   capacityKg: 25000.00, fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 54800.00, insuranceExpiry: new Date('2026-12-20'), lastServiceDate: new Date('2026-04-10') },
    { registrationNumber: 'TN-04-IJ-7890', make: 'BharatBenz',    model: '2828C',              year: 2024, type: 'TRUCK',   capacityKg: 28000.00, fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 29450.75, insuranceExpiry: new Date('2027-08-05'), lastServiceDate: new Date('2026-06-25') },
    { registrationNumber: 'MH-05-KL-1122', make: 'Tata',          model: 'Ace Gold Diesel',    year: 2025, type: 'VAN',     capacityKg: 750.00,   fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 12300.00, insuranceExpiry: new Date('2027-09-15'), lastServiceDate: new Date('2026-07-05') },
    { registrationNumber: 'DL-06-MN-3344', make: 'Mahindra',      model: 'Supro Profit Truck', year: 2024, type: 'VAN',     capacityKg: 1000.00,  fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 18650.50, insuranceExpiry: new Date('2027-02-28'), lastServiceDate: new Date('2026-05-20') },
    { registrationNumber: 'GJ-07-OP-5566', make: 'Maruti',        model: 'Super Carry',        year: 2025, type: 'VAN',     capacityKg: 740.00,   fuelType: 'CNG',    status: 'AVAILABLE', mileage: 8200.00,  insuranceExpiry: new Date('2027-11-10'), lastServiceDate: new Date('2026-07-08') },
    { registrationNumber: 'RJ-08-QR-7788', make: 'Tata',          model: 'Starbus Ultra',      year: 2023, type: 'BUS',     capacityKg: 5000.00,  fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 78900.00, insuranceExpiry: new Date('2026-11-30'), lastServiceDate: new Date('2026-03-15') },
    { registrationNumber: 'KA-09-ST-9900', make: 'Ashok Leyland', model: 'Viking',             year: 2024, type: 'BUS',     capacityKg: 7000.00,  fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 55200.00, insuranceExpiry: new Date('2027-04-20'), lastServiceDate: new Date('2026-06-10') },
    { registrationNumber: 'MH-10-UV-1133', make: 'Tata',          model: 'Prima 5530.S',       year: 2024, type: 'TRUCK',   capacityKg: 35000.00, fuelType: 'DIESEL', status: 'ON_TRIP',   mileage: 67400.00, insuranceExpiry: new Date('2027-05-12'), lastServiceDate: new Date('2026-06-01') },
    { registrationNumber: 'DL-11-WX-2244', make: 'Eicher',        model: 'Pro 6055',           year: 2023, type: 'TRUCK',   capacityKg: 31000.00, fuelType: 'DIESEL', status: 'ON_TRIP',   mileage: 71200.50, insuranceExpiry: new Date('2027-01-25'), lastServiceDate: new Date('2026-05-28') },
    { registrationNumber: 'TN-12-YZ-3355', make: 'BharatBenz',    model: '3528C',              year: 2024, type: 'TRUCK',   capacityKg: 35000.00, fuelType: 'DIESEL', status: 'ON_TRIP',   mileage: 42800.00, insuranceExpiry: new Date('2027-07-18'), lastServiceDate: new Date('2026-06-30') },
    { registrationNumber: 'GJ-13-AB-4466', make: 'Mahindra',      model: 'Blazo X 35',         year: 2025, type: 'TRUCK',   capacityKg: 25000.00, fuelType: 'DIESEL', status: 'ON_TRIP',   mileage: 15600.75, insuranceExpiry: new Date('2028-01-05'), lastServiceDate: new Date('2026-07-02') },
    { registrationNumber: 'KA-14-CD-5577', make: 'Tata',          model: 'Winger',             year: 2024, type: 'VAN',     capacityKg: 1500.00,  fuelType: 'DIESEL', status: 'ON_TRIP',   mileage: 22400.00, insuranceExpiry: new Date('2027-03-08'), lastServiceDate: new Date('2026-06-15') },
    { registrationNumber: 'MH-15-EF-6688', make: 'Ashok Leyland', model: 'U-3718',             year: 2022, type: 'TRUCK',   capacityKg: 18000.00, fuelType: 'DIESEL', status: 'IN_SHOP',   mileage: 89500.00, insuranceExpiry: new Date('2026-10-15'), lastServiceDate: new Date('2026-07-10') },
    { registrationNumber: 'UP-16-GH-7799', make: 'Tata',          model: 'LPT 4225',           year: 2023, type: 'TRUCK',   capacityKg: 22000.00, fuelType: 'DIESEL', status: 'IN_SHOP',   mileage: 95200.25, insuranceExpiry: new Date('2027-02-14'), lastServiceDate: new Date('2026-07-08') },
    { registrationNumber: 'DL-17-IJ-8800', make: 'Eicher',        model: 'Pro 3019',           year: 2022, type: 'TRUCK',   capacityKg: 16000.00, fuelType: 'DIESEL', status: 'IN_SHOP',   mileage: 102300.00, insuranceExpiry: new Date('2026-09-20'), lastServiceDate: new Date('2026-07-06') },
    { registrationNumber: 'MH-18-KL-9911', make: 'Tata',          model: 'LPT 2518',           year: 2018, type: 'TRUCK',   capacityKg: 15000.00, fuelType: 'DIESEL', status: 'RETIRED',   mileage: 215000.00, insuranceExpiry: new Date('2025-06-30'), lastServiceDate: new Date('2025-06-01') },
    { registrationNumber: 'KA-19-MN-0022', make: 'Ashok Leyland', model: 'Dost',               year: 2017, type: 'VAN',     capacityKg: 1250.00,  fuelType: 'DIESEL', status: 'RETIRED',   mileage: 178500.50, insuranceExpiry: new Date('2025-03-15'), lastServiceDate: new Date('2025-02-20') },
    { registrationNumber: 'TS-20-OP-1133', make: 'Tata',          model: 'Signa 4825.TK',      year: 2025, type: 'TRUCK',   capacityKg: 33000.00, fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 5200.00,  insuranceExpiry: new Date('2028-06-20'), lastServiceDate: new Date('2026-07-01') },
    { registrationNumber: 'AP-21-QR-2244', make: 'BharatBenz',    model: '1617R',              year: 2024, type: 'TRUCK',   capacityKg: 16000.00, fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 31400.00, insuranceExpiry: new Date('2027-09-10'), lastServiceDate: new Date('2026-06-18') },
    { registrationNumber: 'MH-22-ST-3355', make: 'Mahindra',      model: 'Bolero Pickup',      year: 2025, type: 'CAR',     capacityKg: 1500.00,  fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 7800.00,  insuranceExpiry: new Date('2028-02-28'), lastServiceDate: new Date('2026-07-05') },
    { registrationNumber: 'GJ-23-UV-4466', make: 'Tata',          model: 'Ultra T.16 S',       year: 2024, type: 'TRUCK',   capacityKg: 16000.00, fuelType: 'CNG',    status: 'AVAILABLE', mileage: 24500.00, insuranceExpiry: new Date('2027-04-15'), lastServiceDate: new Date('2026-06-22') },
    { registrationNumber: 'WB-24-WX-5577', make: 'Ashok Leyland', model: 'Oyster Wide',        year: 2023, type: 'BUS',     capacityKg: 6000.00,  fuelType: 'DIESEL', status: 'AVAILABLE', mileage: 61300.00, insuranceExpiry: new Date('2027-01-08'), lastServiceDate: new Date('2026-05-30') },
  ];

  const vehicles = [];
  for (const vehicleData of vehiclesData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { registrationNumber: vehicleData.registrationNumber },
      update: {},
      create: vehicleData,
    });
    vehicles.push(vehicle);
  }
  console.log(`   ✅ ${vehicles.length} vehicles seeded`);

  // ============================================================
  // 5. DRIVERS
  // ============================================================
  console.log('🧑‍✈️ Seeding drivers...');
  const driversData = [
    { firstName: 'Suresh',    lastName: 'Kumar',     email: 'suresh.kumar@driver.in',      phone: '+91-8001234501', licenseNumber: 'DL-2020-MH-000101', licenseExpiry: new Date('2028-05-15'), licenseType: 'C', status: 'AVAILABLE',  dateOfBirth: new Date('1985-03-12'), hireDate: new Date('2020-01-15'), address: '45, Andheri East, Mumbai, Maharashtra 400069',           emergencyContact: '+91-9001234501' },
    { firstName: 'Ramesh',    lastName: 'Yadav',     email: 'ramesh.yadav@driver.in',      phone: '+91-8001234502', licenseNumber: 'DL-2019-DL-000202', licenseExpiry: new Date('2027-11-20'), licenseType: 'D', status: 'AVAILABLE',  dateOfBirth: new Date('1982-07-22'), hireDate: new Date('2019-06-01'), address: '12, Dwarka Sector 7, New Delhi 110077',                  emergencyContact: '+91-9001234502' },
    { firstName: 'Mahesh',    lastName: 'Patil',     email: 'mahesh.patil@driver.in',      phone: '+91-8001234503', licenseNumber: 'DL-2021-KA-000303', licenseExpiry: new Date('2028-02-28'), licenseType: 'C', status: 'AVAILABLE',  dateOfBirth: new Date('1990-11-05'), hireDate: new Date('2021-03-20'), address: '78, Whitefield Main Road, Bangalore, Karnataka 560066', emergencyContact: '+91-9001234503' },
    { firstName: 'Ganesh',    lastName: 'Pillai',    email: 'ganesh.pillai@driver.in',     phone: '+91-8001234504', licenseNumber: 'DL-2020-TN-000404', licenseExpiry: new Date('2027-08-10'), licenseType: 'D', status: 'AVAILABLE',  dateOfBirth: new Date('1988-01-30'), hireDate: new Date('2020-09-10'), address: '33, T Nagar, Chennai, Tamil Nadu 600017',                emergencyContact: '+91-9001234504' },
    { firstName: 'Dinesh',    lastName: 'Choudhary', email: 'dinesh.choudhary@driver.in',  phone: '+91-8001234505', licenseNumber: 'DL-2022-TS-000505', licenseExpiry: new Date('2029-01-05'), licenseType: 'C', status: 'AVAILABLE',  dateOfBirth: new Date('1992-06-18'), hireDate: new Date('2022-02-01'), address: '91, Banjara Hills, Hyderabad, Telangana 500034',         emergencyContact: '+91-9001234505' },
    { firstName: 'Rajendra',  lastName: 'Deshmukh',  email: 'rajendra.deshmukh@driver.in', phone: '+91-8001234506', licenseNumber: 'DL-2021-MH-000606', licenseExpiry: new Date('2028-04-22'), licenseType: 'D', status: 'AVAILABLE',  dateOfBirth: new Date('1986-09-14'), hireDate: new Date('2021-07-15'), address: '56, Kothrud, Pune, Maharashtra 411038',                  emergencyContact: '+91-9001234506' },
    { firstName: 'Vijay',     lastName: 'Thakur',    email: 'vijay.thakur@driver.in',      phone: '+91-8001234507', licenseNumber: 'DL-2020-GJ-000707', licenseExpiry: new Date('2027-06-30'), licenseType: 'C', status: 'AVAILABLE',  dateOfBirth: new Date('1984-12-25'), hireDate: new Date('2020-04-08'), address: '14, Satellite Road, Ahmedabad, Gujarat 380015',          emergencyContact: '+91-9001234507' },
    { firstName: 'Sanjay',    lastName: 'Das',       email: 'sanjay.das@driver.in',        phone: '+91-8001234508', licenseNumber: 'DL-2019-WB-000808', licenseExpiry: new Date('2027-10-15'), licenseType: 'D', status: 'AVAILABLE',  dateOfBirth: new Date('1983-04-08'), hireDate: new Date('2019-11-25'), address: '67, Salt Lake, Kolkata, West Bengal 700091',             emergencyContact: '+91-9001234508' },
    { firstName: 'Prakash',   lastName: 'Meena',     email: 'prakash.meena@driver.in',     phone: '+91-8001234509', licenseNumber: 'DL-2022-RJ-000909', licenseExpiry: new Date('2029-03-18'), licenseType: 'C', status: 'AVAILABLE',  dateOfBirth: new Date('1991-08-20'), hireDate: new Date('2022-05-12'), address: '23, Malviya Nagar, Jaipur, Rajasthan 302017',            emergencyContact: '+91-9001234509' },
    { firstName: 'Anil',      lastName: 'Mishra',    email: 'anil.mishra@driver.in',       phone: '+91-8001234510', licenseNumber: 'DL-2021-UP-001010', licenseExpiry: new Date('2028-07-12'), licenseType: 'C', status: 'AVAILABLE',  dateOfBirth: new Date('1987-02-14'), hireDate: new Date('2021-01-03'), address: '89, Gomti Nagar, Lucknow, Uttar Pradesh 226010',         emergencyContact: '+91-9001234510' },
    { firstName: 'Kiran',     lastName: 'Jadhav',    email: 'kiran.jadhav@driver.in',      phone: '+91-8001234511', licenseNumber: 'DL-2020-MH-001111', licenseExpiry: new Date('2027-12-05'), licenseType: 'D', status: 'ON_TRIP',    dateOfBirth: new Date('1989-05-17'), hireDate: new Date('2020-08-20'), address: '34, Bandra West, Mumbai, Maharashtra 400050',            emergencyContact: '+91-9001234511' },
    { firstName: 'Deepak',    lastName: 'Verma',     email: 'deepak.verma@driver.in',      phone: '+91-8001234512', licenseNumber: 'DL-2021-DL-001212', licenseExpiry: new Date('2028-09-25'), licenseType: 'C', status: 'ON_TRIP',    dateOfBirth: new Date('1990-10-03'), hireDate: new Date('2021-04-10'), address: '78, Rohini Sector 15, New Delhi 110085',                 emergencyContact: '+91-9001234512' },
    { firstName: 'Manoj',     lastName: 'Rathore',   email: 'manoj.rathore@driver.in',     phone: '+91-8001234513', licenseNumber: 'DL-2019-TN-001313', licenseExpiry: new Date('2027-07-30'), licenseType: 'D', status: 'ON_TRIP',    dateOfBirth: new Date('1985-12-28'), hireDate: new Date('2019-09-05'), address: '45, Adyar, Chennai, Tamil Nadu 600020',                  emergencyContact: '+91-9001234513' },
    { firstName: 'Naresh',    lastName: 'Jat',       email: 'naresh.jat@driver.in',        phone: '+91-8001234514', licenseNumber: 'DL-2022-GJ-001414', licenseExpiry: new Date('2029-04-10'), licenseType: 'C', status: 'ON_TRIP',    dateOfBirth: new Date('1993-03-07'), hireDate: new Date('2022-06-18'), address: '12, Vastrapur, Ahmedabad, Gujarat 380015',               emergencyContact: '+91-9001234514' },
    { firstName: 'Bharat',    lastName: 'Negi',      email: 'bharat.negi@driver.in',       phone: '+91-8001234515', licenseNumber: 'DL-2020-KA-001515', licenseExpiry: new Date('2028-01-20'), licenseType: 'C', status: 'ON_TRIP',    dateOfBirth: new Date('1988-07-11'), hireDate: new Date('2020-12-01'), address: '90, JP Nagar, Bangalore, Karnataka 560078',             emergencyContact: '+91-9001234515' },
    { firstName: 'Santosh',   lastName: 'Ghosh',     email: 'santosh.ghosh@driver.in',     phone: '+91-8001234516', licenseNumber: 'DL-2021-WB-001616', licenseExpiry: new Date('2028-06-14'), licenseType: 'D', status: 'ON_LEAVE',   dateOfBirth: new Date('1986-11-22'), hireDate: new Date('2021-08-30'), address: '56, Howrah, Kolkata, West Bengal 711101',                emergencyContact: '+91-9001234516' },
    { firstName: 'Rakesh',    lastName: 'Soni',      email: 'rakesh.soni@driver.in',       phone: '+91-8001234517', licenseNumber: 'DL-2020-RJ-001717', licenseExpiry: new Date('2027-09-08'), licenseType: 'C', status: 'ON_LEAVE',   dateOfBirth: new Date('1984-04-16'), hireDate: new Date('2020-03-14'), address: '34, Vaishali Nagar, Jaipur, Rajasthan 302021',           emergencyContact: '+91-9001234517' },
    { firstName: 'Hari',      lastName: 'Prasad',    email: 'hari.prasad@driver.in',       phone: '+91-8001234518', licenseNumber: 'DL-2019-UP-001818', licenseExpiry: new Date('2027-04-25'), licenseType: 'C', status: 'SUSPENDED',  dateOfBirth: new Date('1981-09-30'), hireDate: new Date('2019-05-22'), address: '12, Hazratganj, Lucknow, Uttar Pradesh 226001',          emergencyContact: '+91-9001234518' },
    { firstName: 'Gopal',     lastName: 'Tiwari',    email: 'gopal.tiwari@driver.in',      phone: '+91-8001234519', licenseNumber: 'DL-2018-MP-001919', licenseExpiry: new Date('2026-01-15'), licenseType: 'C', status: 'AVAILABLE',  dateOfBirth: new Date('1980-06-05'), hireDate: new Date('2018-10-10'), address: '45, Vijay Nagar, Indore, Madhya Pradesh 452010',         emergencyContact: '+91-9001234519' },
    { firstName: 'Mohan',     lastName: 'Rao',       email: 'mohan.rao@driver.in',         phone: '+91-8001234520', licenseNumber: 'DL-2023-AP-002020', licenseExpiry: new Date('2030-02-28'), licenseType: 'D', status: 'AVAILABLE',  dateOfBirth: new Date('1994-01-12'), hireDate: new Date('2023-01-15'), address: '78, Madhurawada, Visakhapatnam, Andhra Pradesh 530048',  emergencyContact: '+91-9001234520' },
  ];

  const drivers = [];
  for (const driverData of driversData) {
    const driver = await prisma.driver.upsert({
      where: { licenseNumber: driverData.licenseNumber },
      update: {},
      create: driverData,
    });
    drivers.push(driver);
  }
  console.log(`   ✅ ${drivers.length} drivers seeded`);

  // ============================================================
  // 6. TRIPS (representative subset — 20 trips)
  // ============================================================
  console.log('🗺️  Seeding trips...');

  const tripsData = [
    // Active trips (DISPATCHED / IN_PROGRESS)
    { tripNumber: 'TRP-20260710-0001', vehicleId: vehicles[10].id, driverId: drivers[10].id, dispatchedById: users[5].id, originRegionId: regions[0].id, destinationRegionId: regions[1].id, status: 'DISPATCHED',   cargoDescription: 'Electronics — TVs and Laptops',       cargoWeightKg: 22000.00, distanceKm: 1400.00, scheduledDeparture: new Date('2026-07-10T06:00:00Z'), scheduledArrival: new Date('2026-07-12T18:00:00Z'), actualDeparture: new Date('2026-07-10T06:15:00Z'), notes: 'Priority shipment' },
    { tripNumber: 'TRP-20260710-0002', vehicleId: vehicles[11].id, driverId: drivers[11].id, dispatchedById: users[6].id, originRegionId: regions[1].id, destinationRegionId: regions[7].id, status: 'IN_PROGRESS',  cargoDescription: 'Automotive Parts — Engine Components', cargoWeightKg: 25000.00, distanceKm: 1500.00, scheduledDeparture: new Date('2026-07-10T08:00:00Z'), scheduledArrival: new Date('2026-07-12T20:00:00Z'), actualDeparture: new Date('2026-07-10T08:30:00Z'), notes: 'Fragile cargo' },
    { tripNumber: 'TRP-20260711-0001', vehicleId: vehicles[12].id, driverId: drivers[12].id, dispatchedById: users[5].id, originRegionId: regions[3].id, destinationRegionId: regions[2].id, status: 'DISPATCHED',   cargoDescription: 'Textile Bales — Cotton',               cargoWeightKg: 30000.00, distanceKm: 350.00,  scheduledDeparture: new Date('2026-07-11T05:00:00Z'), scheduledArrival: new Date('2026-07-11T14:00:00Z'), actualDeparture: new Date('2026-07-11T05:10:00Z') },
    { tripNumber: 'TRP-20260711-0002', vehicleId: vehicles[13].id, driverId: drivers[13].id, dispatchedById: users[7].id, originRegionId: regions[6].id, destinationRegionId: regions[0].id, status: 'IN_PROGRESS',  cargoDescription: 'Chemical Drums — Industrial Solvents', cargoWeightKg: 18000.00, distanceKm: 530.00,  scheduledDeparture: new Date('2026-07-11T07:00:00Z'), scheduledArrival: new Date('2026-07-11T18:00:00Z'), actualDeparture: new Date('2026-07-11T07:20:00Z'), notes: 'Hazardous material' },
    { tripNumber: 'TRP-20260712-0001', vehicleId: vehicles[14].id, driverId: drivers[14].id, dispatchedById: users[6].id, originRegionId: regions[2].id, destinationRegionId: regions[4].id, status: 'DISPATCHED',   cargoDescription: 'Medical Supplies — Vaccines',          cargoWeightKg: 800.00,   distanceKm: 570.00,  scheduledDeparture: new Date('2026-07-12T04:00:00Z'), scheduledArrival: new Date('2026-07-12T14:00:00Z'), actualDeparture: new Date('2026-07-12T04:05:00Z'), notes: 'Temperature-controlled' },

    // Scheduled trips
    { tripNumber: 'TRP-20260713-0001', vehicleId: vehicles[0].id, driverId: drivers[0].id, dispatchedById: users[5].id, originRegionId: regions[0].id, destinationRegionId: regions[5].id, status: 'SCHEDULED', cargoDescription: 'FMCG Goods — Packaged Food',        cargoWeightKg: 15000.00, distanceKm: 160.00,  scheduledDeparture: new Date('2026-07-13T06:00:00Z'), scheduledArrival: new Date('2026-07-13T10:00:00Z') },
    { tripNumber: 'TRP-20260713-0002', vehicleId: vehicles[1].id, driverId: drivers[1].id, dispatchedById: users[6].id, originRegionId: regions[1].id, destinationRegionId: regions[9].id, status: 'SCHEDULED', cargoDescription: 'Construction Material — Steel Rods',  cargoWeightKg: 18000.00, distanceKm: 500.00,  scheduledDeparture: new Date('2026-07-13T07:00:00Z'), scheduledArrival: new Date('2026-07-13T18:00:00Z') },
    { tripNumber: 'TRP-20260713-0003', vehicleId: vehicles[2].id, driverId: drivers[2].id, dispatchedById: users[7].id, originRegionId: regions[1].id, destinationRegionId: regions[8].id, status: 'SCHEDULED', cargoDescription: 'Furniture — Office Desks',            cargoWeightKg: 20000.00, distanceKm: 280.00,  scheduledDeparture: new Date('2026-07-13T05:30:00Z'), scheduledArrival: new Date('2026-07-13T12:00:00Z') },

    // Completed trips
    { tripNumber: 'TRP-20260601-0001', vehicleId: vehicles[0].id, driverId: drivers[0].id, dispatchedById: users[5].id, originRegionId: regions[0].id, destinationRegionId: regions[1].id, status: 'COMPLETED', cargoDescription: 'Pharma Products — Medicines',    cargoWeightKg: 12000.00, distanceKm: 1420.00, scheduledDeparture: new Date('2026-06-01T06:00:00Z'), scheduledArrival: new Date('2026-06-03T14:00:00Z'), actualDeparture: new Date('2026-06-01T06:30:00Z'), actualArrival: new Date('2026-06-03T13:45:00Z') },
    { tripNumber: 'TRP-20260602-0001', vehicleId: vehicles[1].id, driverId: drivers[1].id, dispatchedById: users[6].id, originRegionId: regions[1].id, destinationRegionId: regions[0].id, status: 'COMPLETED', cargoDescription: 'Garments — Ready-made Clothing', cargoWeightKg: 8000.00,  distanceKm: 1400.00, scheduledDeparture: new Date('2026-06-02T07:00:00Z'), scheduledArrival: new Date('2026-06-04T15:00:00Z'), actualDeparture: new Date('2026-06-02T07:15:00Z'), actualArrival: new Date('2026-06-04T14:30:00Z') },
    { tripNumber: 'TRP-20260603-0001', vehicleId: vehicles[2].id, driverId: drivers[2].id, dispatchedById: users[5].id, originRegionId: regions[2].id, destinationRegionId: regions[3].id, status: 'COMPLETED', cargoDescription: 'Agricultural Produce — Rice',    cargoWeightKg: 28000.00, distanceKm: 350.00,  scheduledDeparture: new Date('2026-06-03T05:00:00Z'), scheduledArrival: new Date('2026-06-03T12:00:00Z'), actualDeparture: new Date('2026-06-03T05:20:00Z'), actualArrival: new Date('2026-06-03T11:50:00Z') },
    { tripNumber: 'TRP-20260604-0001', vehicleId: vehicles[3].id, driverId: drivers[3].id, dispatchedById: users[7].id, originRegionId: regions[3].id, destinationRegionId: regions[4].id, status: 'COMPLETED', cargoDescription: 'Electronics — Mobile Phones',    cargoWeightKg: 5000.00,  distanceKm: 630.00,  scheduledDeparture: new Date('2026-06-04T06:00:00Z'), scheduledArrival: new Date('2026-06-04T18:00:00Z'), actualDeparture: new Date('2026-06-04T06:10:00Z'), actualArrival: new Date('2026-06-04T17:45:00Z'), notes: 'High-value cargo' },
    { tripNumber: 'TRP-20260605-0001', vehicleId: vehicles[4].id, driverId: drivers[4].id, dispatchedById: users[6].id, originRegionId: regions[4].id, destinationRegionId: regions[6].id, status: 'COMPLETED', cargoDescription: 'Hardware — Plumbing Fixtures',   cargoWeightKg: 15000.00, distanceKm: 750.00,  scheduledDeparture: new Date('2026-06-05T07:00:00Z'), scheduledArrival: new Date('2026-06-05T22:00:00Z'), actualDeparture: new Date('2026-06-05T07:30:00Z'), actualArrival: new Date('2026-06-05T21:30:00Z') },
    { tripNumber: 'TRP-20260611-0001', vehicleId: vehicles[0].id, driverId: drivers[0].id, dispatchedById: users[5].id, originRegionId: regions[0].id, destinationRegionId: regions[2].id, status: 'COMPLETED', cargoDescription: 'Plastic Granules',               cargoWeightKg: 26000.00, distanceKm: 980.00,  scheduledDeparture: new Date('2026-06-11T06:00:00Z'), scheduledArrival: new Date('2026-06-12T12:00:00Z'), actualDeparture: new Date('2026-06-11T06:10:00Z'), actualArrival: new Date('2026-06-12T11:45:00Z') },
    { tripNumber: 'TRP-20260612-0001', vehicleId: vehicles[1].id, driverId: drivers[1].id, dispatchedById: users[6].id, originRegionId: regions[1].id, destinationRegionId: regions[4].id, status: 'COMPLETED', cargoDescription: 'Paper Rolls — Printing Paper',   cargoWeightKg: 17000.00, distanceKm: 1450.00, scheduledDeparture: new Date('2026-06-12T07:00:00Z'), scheduledArrival: new Date('2026-06-14T15:00:00Z'), actualDeparture: new Date('2026-06-12T07:20:00Z'), actualArrival: new Date('2026-06-14T14:50:00Z') },
    { tripNumber: 'TRP-20260705-0001', vehicleId: vehicles[0].id, driverId: drivers[5].id, dispatchedById: users[5].id, originRegionId: regions[0].id, destinationRegionId: regions[4].id, status: 'COMPLETED', cargoDescription: 'Pharmaceutical Raw Materials',   cargoWeightKg: 14000.00, distanceKm: 710.00,  scheduledDeparture: new Date('2026-07-05T06:00:00Z'), scheduledArrival: new Date('2026-07-05T20:00:00Z'), actualDeparture: new Date('2026-07-05T06:15:00Z'), actualArrival: new Date('2026-07-05T19:45:00Z') },
    { tripNumber: 'TRP-20260706-0001', vehicleId: vehicles[1].id, driverId: drivers[6].id, dispatchedById: users[6].id, originRegionId: regions[6].id, destinationRegionId: regions[0].id, status: 'COMPLETED', cargoDescription: 'Aluminum Sheets',                cargoWeightKg: 17000.00, distanceKm: 530.00,  scheduledDeparture: new Date('2026-07-06T07:00:00Z'), scheduledArrival: new Date('2026-07-06T18:00:00Z'), actualDeparture: new Date('2026-07-06T07:10:00Z'), actualArrival: new Date('2026-07-06T17:40:00Z') },

    // Cancelled trips
    { tripNumber: 'TRP-20260701-0001', vehicleId: vehicles[0].id, driverId: drivers[0].id, dispatchedById: users[5].id, originRegionId: regions[0].id, destinationRegionId: regions[8].id, status: 'CANCELLED', cargoDescription: 'Cancelled — Cement Bags', cargoWeightKg: 27000.00, distanceKm: 1200.00, scheduledDeparture: new Date('2026-07-01T06:00:00Z'), scheduledArrival: new Date('2026-07-02T18:00:00Z'), notes: 'Cancelled: Vehicle reassigned due to maintenance' },
    { tripNumber: 'TRP-20260702-0001', vehicleId: vehicles[1].id, driverId: drivers[1].id, dispatchedById: users[6].id, originRegionId: regions[1].id, destinationRegionId: regions[11].id, status: 'CANCELLED', cargoDescription: 'Cancelled — Wooden Furniture', cargoWeightKg: 16000.00, distanceKm: 700.00, scheduledDeparture: new Date('2026-07-02T07:00:00Z'), scheduledArrival: new Date('2026-07-02T22:00:00Z'), notes: 'Cancelled: Client requested postponement' },
  ];

  const trips = [];
  for (const tripData of tripsData) {
    const trip = await prisma.trip.upsert({
      where: { tripNumber: tripData.tripNumber },
      update: {},
      create: tripData,
    });
    trips.push(trip);
  }
  console.log(`   ✅ ${trips.length} trips seeded`);

  // ============================================================
  // 7. MAINTENANCE LOGS
  // ============================================================
  console.log('🔧 Seeding maintenance logs...');
  const maintenanceData = [
    { vehicleId: vehicles[15].id, reportedById: users[2].id, type: 'CORRECTIVE',  description: 'Engine overhaul — cylinder head replacement and valve adjustment',       status: 'IN_PROGRESS', cost: 85000.00,  startDate: new Date('2026-07-10'), vendorName: 'Tata Authorized Service Center, Mumbai',  notes: 'Estimated 5 days' },
    { vehicleId: vehicles[16].id, reportedById: users[3].id, type: 'EMERGENCY',   description: 'Transmission failure — gearbox replacement required',                     status: 'OPEN',        cost: 120000.00, startDate: new Date('2026-07-08'), vendorName: 'Sharma Auto Works, Lucknow',              notes: 'Parts ordered' },
    { vehicleId: vehicles[17].id, reportedById: users[4].id, type: 'CORRECTIVE',  description: 'Brake system overhaul — disc pads, calipers, and brake lines',            status: 'IN_PROGRESS', cost: 45000.00,  startDate: new Date('2026-07-06'), vendorName: 'National Auto Repair, Delhi' },
    { vehicleId: vehicles[0].id,  reportedById: users[2].id, type: 'PREVENTIVE',  description: '50,000 km service — oil change, filter replacement, belt inspection',     status: 'COMPLETED',   cost: 12500.00,  startDate: new Date('2026-06-18'), endDate: new Date('2026-06-20'), vendorName: 'Tata Authorized Service Center, Mumbai' },
    { vehicleId: vehicles[1].id,  reportedById: users[3].id, type: 'PREVENTIVE',  description: '60,000 km service — full fluid change, brake inspection, tire rotation',  status: 'COMPLETED',   cost: 15800.00,  startDate: new Date('2026-05-13'), endDate: new Date('2026-05-15'), vendorName: 'Leyland Service Hub, Delhi' },
    { vehicleId: vehicles[2].id,  reportedById: users[2].id, type: 'CORRECTIVE',  description: 'Alternator replacement and battery servicing',                             status: 'COMPLETED',   cost: 8500.00,   startDate: new Date('2026-06-28'), endDate: new Date('2026-07-01'), vendorName: 'Mahindra Service Point, Delhi' },
    { vehicleId: vehicles[3].id,  reportedById: users[4].id, type: 'PREVENTIVE',  description: '50,000 km service — oil, filters, AC gas top-up',                         status: 'COMPLETED',   cost: 11200.00,  startDate: new Date('2026-04-08'), endDate: new Date('2026-04-10'), vendorName: 'Eicher Care Center, Bangalore' },
    { vehicleId: vehicles[4].id,  reportedById: users[2].id, type: 'CORRECTIVE',  description: 'Suspension repair — leaf spring replacement (rear axle)',                  status: 'COMPLETED',   cost: 22000.00,  startDate: new Date('2026-06-22'), endDate: new Date('2026-06-25'), vendorName: 'BharatBenz Workshop, Chennai' },
    { vehicleId: vehicles[10].id, reportedById: users[2].id, type: 'CORRECTIVE',  description: 'Fuel injector replacement — engine misfiring',                             status: 'COMPLETED',   cost: 35000.00,  startDate: new Date('2026-05-28'), endDate: new Date('2026-06-01'), vendorName: 'Tata Authorized Service Center, Mumbai' },
    { vehicleId: vehicles[11].id, reportedById: users[3].id, type: 'PREVENTIVE',  description: '70,000 km service — turbo inspection, oil change, all filters',            status: 'COMPLETED',   cost: 18500.00,  startDate: new Date('2026-05-25'), endDate: new Date('2026-05-28'), vendorName: 'Eicher Care Center, Delhi' },
  ];

  let maintenanceCount = 0;
  for (const mData of maintenanceData) {
    await prisma.maintenanceLog.create({ data: mData });
    maintenanceCount++;
  }
  console.log(`   ✅ ${maintenanceCount} maintenance logs seeded`);

  // ============================================================
  // 8. FUEL LOGS
  // ============================================================
  console.log('⛽ Seeding fuel logs...');
  const fuelLogsData = [
    { vehicleId: vehicles[0].id,  driverId: drivers[0].id,  recordedById: users[5].id, fuelDate: new Date('2026-06-01'), fuelType: 'DIESEL', quantity: 180.00, pricePerUnit: 89.50,  totalCost: 16110.00,  odometerReading: 43200.00, station: 'Indian Oil, Andheri, Mumbai' },
    { vehicleId: vehicles[1].id,  driverId: drivers[1].id,  recordedById: users[6].id, fuelDate: new Date('2026-06-02'), fuelType: 'DIESEL', quantity: 150.00, pricePerUnit: 89.50,  totalCost: 13425.00,  odometerReading: 60500.00, station: 'Bharat Petroleum, Karol Bagh, Delhi' },
    { vehicleId: vehicles[2].id,  driverId: drivers[2].id,  recordedById: users[5].id, fuelDate: new Date('2026-06-03'), fuelType: 'DIESEL', quantity: 120.00, pricePerUnit: 90.00,  totalCost: 10800.00,  odometerReading: 37800.00, station: 'HP Petrol Pump, Whitefield, Bangalore' },
    { vehicleId: vehicles[3].id,  driverId: drivers[3].id,  recordedById: users[7].id, fuelDate: new Date('2026-06-04'), fuelType: 'DIESEL', quantity: 140.00, pricePerUnit: 89.75,  totalCost: 12565.00,  odometerReading: 53900.00, station: 'Indian Oil, T Nagar, Chennai' },
    { vehicleId: vehicles[4].id,  driverId: drivers[4].id,  recordedById: users[6].id, fuelDate: new Date('2026-06-05'), fuelType: 'DIESEL', quantity: 160.00, pricePerUnit: 90.25,  totalCost: 14440.00,  odometerReading: 28600.00, station: 'Shell, Banjara Hills, Hyderabad' },
    { vehicleId: vehicles[7].id,  driverId: drivers[7].id,  recordedById: users[7].id, fuelDate: new Date('2026-06-08'), fuelType: 'CNG',    quantity: 25.00,  pricePerUnit: 85.00,  totalCost: 2125.00,   odometerReading: 7600.00,  station: 'Adani CNG, Vastrapur, Ahmedabad' },
    { vehicleId: vehicles[0].id,  driverId: drivers[0].id,  recordedById: users[5].id, fuelDate: new Date('2026-06-11'), fuelType: 'DIESEL', quantity: 175.00, pricePerUnit: 89.50,  totalCost: 15662.50,  odometerReading: 44100.00, station: 'Shell, Powai, Mumbai' },
    { vehicleId: vehicles[1].id,  driverId: drivers[1].id,  recordedById: users[6].id, fuelDate: new Date('2026-06-12'), fuelType: 'DIESEL', quantity: 165.00, pricePerUnit: 89.75,  totalCost: 14808.75,  odometerReading: 61200.00, station: 'Indian Oil, Connaught Place, Delhi' },
    { vehicleId: vehicles[0].id,  driverId: drivers[5].id,  recordedById: users[5].id, fuelDate: new Date('2026-07-01'), fuelType: 'DIESEL', quantity: 190.00, pricePerUnit: 91.00,  totalCost: 17290.00,  odometerReading: 45100.00, station: 'Indian Oil, Lower Parel, Mumbai' },
    { vehicleId: vehicles[1].id,  driverId: drivers[6].id,  recordedById: users[6].id, fuelDate: new Date('2026-07-02'), fuelType: 'DIESEL', quantity: 160.00, pricePerUnit: 91.25,  totalCost: 14600.00,  odometerReading: 62000.00, station: 'Bharat Petroleum, Noida, Delhi NCR' },
    { vehicleId: vehicles[10].id, driverId: drivers[10].id, recordedById: users[5].id, fuelDate: new Date('2026-07-10'), fuelType: 'DIESEL', quantity: 200.00, pricePerUnit: 91.00,  totalCost: 18200.00,  odometerReading: 67200.00, station: 'Indian Oil, Nashik Highway' },
    { vehicleId: vehicles[11].id, driverId: drivers[11].id, recordedById: users[6].id, fuelDate: new Date('2026-07-10'), fuelType: 'DIESEL', quantity: 190.00, pricePerUnit: 91.25,  totalCost: 17337.50,  odometerReading: 71000.00, station: 'Bharat Petroleum, Lucknow Highway' },
    { vehicleId: vehicles[0].id,  driverId: drivers[0].id,  recordedById: users[5].id, fuelDate: new Date('2026-05-15'), fuelType: 'DIESEL', quantity: 175.00, pricePerUnit: 88.50,  totalCost: 15487.50,  odometerReading: 42500.00, station: 'Indian Oil, Thane, Mumbai' },
    { vehicleId: vehicles[1].id,  driverId: drivers[1].id,  recordedById: users[6].id, fuelDate: new Date('2026-05-18'), fuelType: 'DIESEL', quantity: 160.00, pricePerUnit: 88.75,  totalCost: 14200.00,  odometerReading: 59800.00, station: 'Bharat Petroleum, Gurgaon, Delhi NCR' },
    { vehicleId: vehicles[2].id,  driverId: drivers[2].id,  recordedById: users[7].id, fuelDate: new Date('2026-05-20'), fuelType: 'DIESEL', quantity: 135.00, pricePerUnit: 89.00,  totalCost: 12015.00,  odometerReading: 37000.00, station: 'HP Petrol Pump, Electronic City, Bangalore' },
  ];

  let fuelCount = 0;
  for (const fuelData of fuelLogsData) {
    await prisma.fuelLog.create({ data: fuelData });
    fuelCount++;
  }
  console.log(`   ✅ ${fuelCount} fuel logs seeded`);

  // ============================================================
  // 9. EXPENSES
  // ============================================================
  console.log('💰 Seeding expenses...');
  const expensesData = [
    { vehicleId: vehicles[0].id,  tripId: trips[8].id,  recordedById: users[5].id, category: 'FUEL',         amount: 16110.00,  description: 'Fuel for MUM→DEL trip — 180L diesel',                expenseDate: new Date('2026-06-01') },
    { vehicleId: vehicles[1].id,  tripId: trips[9].id,  recordedById: users[6].id, category: 'FUEL',         amount: 13425.00,  description: 'Fuel for DEL→MUM trip — 150L diesel',                expenseDate: new Date('2026-06-02') },
    { vehicleId: vehicles[2].id,  tripId: trips[10].id, recordedById: users[5].id, category: 'FUEL',         amount: 10800.00,  description: 'Fuel for BLR→CHN trip — 120L diesel',                expenseDate: new Date('2026-06-03') },
    { vehicleId: vehicles[15].id, tripId: null,          recordedById: users[2].id, category: 'MAINTENANCE',  amount: 85000.00,  description: 'Engine overhaul — cylinder head replacement',         expenseDate: new Date('2026-07-10') },
    { vehicleId: vehicles[16].id, tripId: null,          recordedById: users[3].id, category: 'MAINTENANCE',  amount: 120000.00, description: 'Transmission failure — gearbox replacement',          expenseDate: new Date('2026-07-08') },
    { vehicleId: vehicles[0].id,  tripId: null,          recordedById: users[2].id, category: 'INSURANCE',    amount: 52000.00,  description: 'Annual comprehensive insurance renewal — Tata Prima', expenseDate: new Date('2026-03-15') },
    { vehicleId: vehicles[1].id,  tripId: null,          recordedById: users[2].id, category: 'INSURANCE',    amount: 48000.00,  description: 'Annual comprehensive insurance renewal — Leyland',    expenseDate: new Date('2026-01-10') },
    { vehicleId: vehicles[0].id,  tripId: trips[8].id,  recordedById: users[5].id, category: 'TOLLS',        amount: 2850.00,   description: 'MUM→DEL NH48 tolls (7 toll plazas)',                  expenseDate: new Date('2026-06-01') },
    { vehicleId: vehicles[1].id,  tripId: trips[9].id,  recordedById: users[6].id, category: 'TOLLS',        amount: 2650.00,   description: 'DEL→MUM NH48 tolls (7 toll plazas)',                  expenseDate: new Date('2026-06-02') },
    { vehicleId: vehicles[3].id,  tripId: null,          recordedById: users[7].id, category: 'FINES',        amount: 5000.00,   description: 'Overweight penalty — Ramanathapuram check post',      expenseDate: new Date('2026-06-14'), notes: 'Disputed — under review' },
    { vehicleId: null,            tripId: null,          recordedById: users[2].id, category: 'SALARY',       amount: 35000.00,  description: 'Driver salary — Suresh Kumar (June 2026)',            expenseDate: new Date('2026-06-30') },
    { vehicleId: null,            tripId: null,          recordedById: users[2].id, category: 'SALARY',       amount: 35000.00,  description: 'Driver salary — Ramesh Yadav (June 2026)',            expenseDate: new Date('2026-06-30') },
    { vehicleId: vehicles[0].id,  tripId: null,          recordedById: users[3].id, category: 'MISCELLANEOUS', amount: 8500.00,  description: 'GPS tracker replacement and installation',            expenseDate: new Date('2026-06-15') },
    { vehicleId: null,            tripId: null,          recordedById: users[3].id, category: 'MISCELLANEOUS', amount: 25000.00, description: 'Office rent — dispatch center (July 2026)',            expenseDate: new Date('2026-07-01') },
    { vehicleId: null,            tripId: null,          recordedById: users[4].id, category: 'MISCELLANEOUS', amount: 8000.00,  description: 'Software subscription — fleet management tools',      expenseDate: new Date('2026-07-01'), notes: 'Monthly subscription' },
  ];

  let expenseCount = 0;
  for (const expenseData of expensesData) {
    await prisma.expense.create({ data: expenseData });
    expenseCount++;
  }
  console.log(`   ✅ ${expenseCount} expenses seeded`);

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  🌱 Seed completed successfully!             ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Roles:            ${String(roles.length).padStart(3)}                      ║`);
  console.log(`║  Users:            ${String(users.length).padStart(3)}                      ║`);
  console.log(`║  Regions:          ${String(regions.length).padStart(3)}                      ║`);
  console.log(`║  Vehicles:         ${String(vehicles.length).padStart(3)}                      ║`);
  console.log(`║  Drivers:          ${String(drivers.length).padStart(3)}                      ║`);
  console.log(`║  Trips:            ${String(trips.length).padStart(3)}                      ║`);
  console.log(`║  Maintenance Logs: ${String(maintenanceCount).padStart(3)}                      ║`);
  console.log(`║  Fuel Logs:        ${String(fuelCount).padStart(3)}                      ║`);
  console.log(`║  Expenses:         ${String(expenseCount).padStart(3)}                      ║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('\n📧 Login: rajesh.sharma@transitops.in / Password@123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
