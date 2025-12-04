import db from '../config/Database.js';
import User from '../models/UserModel.js';
import Category from '../models/CategoryModel.js';
import Location from '../models/LocationModel.js';
import Asset from '../models/AssetModel.js';
import bcrypt from 'bcrypt';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Create sample staff user
    const existingStaff = await User.findOne({ where: { email: 'staff@company.com' } });
    if (!existingStaff) {
      const hashedPassword = await bcrypt.hash('staff123', 10);
      await User.create({
        name: 'Staff IT',
        email: 'staff@company.com',
        password: hashedPassword,
        role: 'staff',
        department: 'IT Department'
      });
      console.log('✅ Staff user created (staff@company.com / staff123)');
    } else {
      console.log('⏭️  Staff user already exists');
    }

    // Create sample employees
    const employees = [
      { name: 'John Doe', email: 'john@company.com', department: 'Marketing' },
      { name: 'Jane Smith', email: 'jane@company.com', department: 'Finance' },
      { name: 'Bob Wilson', email: 'bob@company.com', department: 'Engineering' },
      { name: 'Alice Brown', email: 'alice@company.com', department: 'HR' }
    ];

    for (const emp of employees) {
      const existing = await User.findOne({ where: { email: emp.email } });
      if (!existing) {
        await User.create({
          name: emp.name,
          email: emp.email,
          password: await bcrypt.hash('password123', 10),
          role: 'employee',
          department: emp.department
        });
        console.log(`✅ Employee created: ${emp.name}`);
      }
    }

    // Create categories
    const categories = [
      { name: 'Laptop', description: 'Laptop dan notebook untuk karyawan' },
      { name: 'Desktop', description: 'Komputer desktop dan workstation' },
      { name: 'Monitor', description: 'Monitor dan display' },
      { name: 'Printer', description: 'Printer, scanner, dan mesin fotokopi' },
      { name: 'Networking', description: 'Router, switch, access point, kabel' },
      { name: 'Peripheral', description: 'Mouse, keyboard, webcam, headset' },
      { name: 'Server', description: 'Server fisik dan komponen' },
      { name: 'Storage', description: 'HDD, SSD, NAS, external storage' }
    ];

    const createdCategories = {};
    for (const cat of categories) {
      let existing = await Category.findOne({ where: { name: cat.name } });
      if (!existing) {
        existing = await Category.create(cat);
        console.log(`✅ Category created: ${cat.name}`);
      }
      createdCategories[cat.name] = existing;
    }

    // Create locations
    const locations = [
      { name: 'Kantor Pusat', address: 'Jl. Sudirman No. 1, Jakarta Selatan 12190' },
      { name: 'Gudang IT', address: 'Jl. Industri No. 5, Jakarta Timur 13450' },
      { name: 'Ruang Server', address: 'Lantai 2 Gedung A, Kantor Pusat' },
      { name: 'Cabang Bandung', address: 'Jl. Asia Afrika No. 10, Bandung 40111' },
      { name: 'Cabang Surabaya', address: 'Jl. Pemuda No. 15, Surabaya 60271' }
    ];

    const createdLocations = {};
    for (const loc of locations) {
      let existing = await Location.findOne({ where: { name: loc.name } });
      if (!existing) {
        existing = await Location.create(loc);
        console.log(`✅ Location created: ${loc.name}`);
      }
      createdLocations[loc.name] = existing;
    }

    // Create sample assets
    const assets = [
      {
        name: 'MacBook Pro 14" M3 Pro',
        asset_tag: 'AST-LPT-001',
        serial_number: 'C02XL1YZJGH5',
        category_id: createdCategories['Laptop'].id,
        location_id: createdLocations['Kantor Pusat'].id,
        status: 'available',
        purchase_date: '2024-01-15',
        price: 35000000,
        specifications: { processor: 'M3 Pro', ram: '18GB', storage: '512GB SSD' },
        notes: 'Laptop baru untuk developer senior'
      },
      {
        name: 'Dell XPS 15 9530',
        asset_tag: 'AST-LPT-002',
        serial_number: 'DXPS15-2024-001',
        category_id: createdCategories['Laptop'].id,
        location_id: createdLocations['Kantor Pusat'].id,
        status: 'available',
        purchase_date: '2024-02-20',
        price: 28000000,
        specifications: { processor: 'Intel i7-13700H', ram: '32GB', storage: '1TB SSD' },
        notes: 'Laptop Windows untuk design team'
      },
      {
        name: 'ThinkPad X1 Carbon Gen 11',
        asset_tag: 'AST-LPT-003',
        serial_number: 'TP-X1C-2024-001',
        category_id: createdCategories['Laptop'].id,
        location_id: createdLocations['Cabang Bandung'].id,
        status: 'assigned',
        purchase_date: '2024-03-10',
        price: 25000000,
        specifications: { processor: 'Intel i5-1345U', ram: '16GB', storage: '512GB SSD' }
      },
      {
        name: 'Dell OptiPlex 7010',
        asset_tag: 'AST-DSK-001',
        serial_number: 'DOPT-2024-001',
        category_id: createdCategories['Desktop'].id,
        location_id: createdLocations['Kantor Pusat'].id,
        status: 'available',
        purchase_date: '2024-01-05',
        price: 15000000,
        specifications: { processor: 'Intel i5-13500', ram: '16GB', storage: '256GB SSD' }
      },
      {
        name: 'LG UltraFine 27" 4K',
        asset_tag: 'AST-MON-001',
        serial_number: 'LG27-UF-2024-001',
        category_id: createdCategories['Monitor'].id,
        location_id: createdLocations['Kantor Pusat'].id,
        status: 'available',
        purchase_date: '2024-02-01',
        price: 8500000,
        specifications: { size: '27 inch', resolution: '4K UHD', panel: 'IPS' }
      },
      {
        name: 'Dell UltraSharp U2723QE',
        asset_tag: 'AST-MON-002',
        serial_number: 'DU27-2024-001',
        category_id: createdCategories['Monitor'].id,
        location_id: createdLocations['Gudang IT'].id,
        status: 'available',
        purchase_date: '2024-03-15',
        price: 12000000,
        specifications: { size: '27 inch', resolution: '4K UHD', panel: 'IPS Black' }
      },
      {
        name: 'HP LaserJet Pro M404dn',
        asset_tag: 'AST-PRT-001',
        serial_number: 'HP-LJ-2024-001',
        category_id: createdCategories['Printer'].id,
        location_id: createdLocations['Kantor Pusat'].id,
        status: 'available',
        purchase_date: '2023-11-20',
        price: 5500000,
        specifications: { type: 'Laser', color: 'Monochrome', speed: '40 ppm' }
      },
      {
        name: 'Ubiquiti UniFi AP AC Pro',
        asset_tag: 'AST-NET-001',
        serial_number: 'UB-UAP-2024-001',
        category_id: createdCategories['Networking'].id,
        location_id: createdLocations['Ruang Server'].id,
        status: 'available',
        purchase_date: '2024-01-25',
        price: 2500000,
        specifications: { type: 'Access Point', standard: 'WiFi 5', coverage: '120m2' }
      },
      {
        name: 'Cisco Catalyst 2960-X',
        asset_tag: 'AST-NET-002',
        serial_number: 'CSC-2960X-2024-001',
        category_id: createdCategories['Networking'].id,
        location_id: createdLocations['Ruang Server'].id,
        status: 'available',
        purchase_date: '2023-08-15',
        price: 18000000,
        specifications: { type: 'Switch', ports: '24x 1GbE', management: 'Managed' }
      },
      {
        name: 'Logitech MX Master 3S',
        asset_tag: 'AST-PER-001',
        serial_number: 'LG-MXM3S-2024-001',
        category_id: createdCategories['Peripheral'].id,
        location_id: createdLocations['Gudang IT'].id,
        status: 'available',
        purchase_date: '2024-04-01',
        price: 1500000,
        specifications: { type: 'Mouse', connectivity: 'Bluetooth/USB', dpi: '8000' }
      },
      {
        name: 'Dell PowerEdge R750',
        asset_tag: 'AST-SRV-001',
        serial_number: 'DPE-R750-2024-001',
        category_id: createdCategories['Server'].id,
        location_id: createdLocations['Ruang Server'].id,
        status: 'available',
        purchase_date: '2023-06-01',
        price: 150000000,
        specifications: { processor: '2x Xeon Gold 6338', ram: '256GB', storage: '4x 1.92TB SSD' },
        notes: 'Server utama untuk production'
      },
      {
        name: 'Synology DS920+',
        asset_tag: 'AST-STR-001',
        serial_number: 'SYN-DS920-2024-001',
        category_id: createdCategories['Storage'].id,
        location_id: createdLocations['Ruang Server'].id,
        status: 'available',
        purchase_date: '2024-02-10',
        price: 12000000,
        specifications: { bays: '4', processor: 'Intel Celeron J4125', ram: '4GB' },
        notes: 'NAS untuk backup dan file sharing'
      }
    ];

    for (const asset of assets) {
      const existing = await Asset.findOne({ where: { asset_tag: asset.asset_tag } });
      if (!existing) {
        await Asset.create(asset);
        console.log(`✅ Asset created: ${asset.name}`);
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@company.com / admin123');
    console.log('   Staff: staff@company.com / staff123');
    console.log('   Employee: john@company.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seedData();
