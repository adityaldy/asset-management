/**
 * Database Seeder
 * Run: node backend/seeders/seed.js
 */

import { db, User, Category, Location, Asset } from "../models/index.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log("🔄 Starting database seeding...\n");

        // Connect to database
        await db.authenticate();
        console.log("✅ Database connection established");

        // Sync database (create tables if not exist)
        await db.sync({ alter: true });
        console.log("✅ Database synchronized\n");

        // ================== SEED CATEGORIES ==================
        console.log("📁 Seeding categories...");
        const categories = [
            { name: "Laptop", description: "Laptop computers and notebooks" },
            { name: "Desktop", description: "Desktop computers and workstations" },
            { name: "Monitor", description: "Display monitors and screens" },
            { name: "Printer", description: "Printers and multifunction devices" },
            { name: "Server", description: "Server hardware and rack equipment" },
            { name: "Network", description: "Network equipment (routers, switches, access points)" },
            { name: "Peripheral", description: "Keyboards, mice, webcams, headsets" },
            { name: "Mobile", description: "Smartphones and tablets" },
            { name: "Storage", description: "External drives, NAS, SAN" },
            { name: "Software License", description: "Software licenses and subscriptions" }
        ];

        for (const cat of categories) {
            await Category.findOrCreate({
                where: { name: cat.name },
                defaults: cat
            });
        }
        console.log(`   ✓ ${categories.length} categories seeded\n`);

        // ================== SEED LOCATIONS ==================
        console.log("📍 Seeding locations...");
        const locations = [
            { name: "IT Room", building: "HQ", floor: "1", room: "101", description: "Main IT equipment room" },
            { name: "Server Room", building: "HQ", floor: "B1", room: "B101", description: "Data center and servers" },
            { name: "Office A", building: "HQ", floor: "2", room: "201", description: "Main office area A" },
            { name: "Office B", building: "HQ", floor: "2", room: "202", description: "Main office area B" },
            { name: "Meeting Room 1", building: "HQ", floor: "3", room: "301", description: "Large meeting room" },
            { name: "Meeting Room 2", building: "HQ", floor: "3", room: "302", description: "Small meeting room" },
            { name: "Warehouse", building: "Storage", floor: "1", room: "W1", description: "Asset storage warehouse" },
            { name: "Reception", building: "HQ", floor: "G", room: "G01", description: "Front desk area" },
            { name: "Branch Office", building: "Branch", floor: "1", room: "101", description: "Branch office location" },
            { name: "Remote", building: "Remote", floor: "-", room: "-", description: "Work from home / Remote" }
        ];

        for (const loc of locations) {
            await Location.findOrCreate({
                where: { name: loc.name, building: loc.building },
                defaults: loc
            });
        }
        console.log(`   ✓ ${locations.length} locations seeded\n`);

        // ================== SEED USERS ==================
        console.log("👤 Seeding users...");
        const salt = await bcrypt.genSalt();

        const users = [
            {
                name: "System Administrator",
                email: "admin@company.com",
                password: await bcrypt.hash("Admin@123", salt),
                role: "admin",
                department: "IT",
                phone: "08123456789"
            },
            {
                name: "IT Staff",
                email: "staff@company.com",
                password: await bcrypt.hash("Staff@123", salt),
                role: "staff",
                department: "IT",
                phone: "08123456790"
            },
            {
                name: "John Doe",
                email: "john.doe@company.com",
                password: await bcrypt.hash("Employee@123", salt),
                role: "employee",
                department: "Engineering",
                phone: "08123456791"
            },
            {
                name: "Jane Smith",
                email: "jane.smith@company.com",
                password: await bcrypt.hash("Employee@123", salt),
                role: "employee",
                department: "Marketing",
                phone: "08123456792"
            },
            {
                name: "Bob Wilson",
                email: "bob.wilson@company.com",
                password: await bcrypt.hash("Employee@123", salt),
                role: "employee",
                department: "Finance",
                phone: "08123456793"
            },
            {
                name: "Alice Brown",
                email: "alice.brown@company.com",
                password: await bcrypt.hash("Employee@123", salt),
                role: "employee",
                department: "HR",
                phone: "08123456794"
            }
        ];

        for (const user of users) {
            await User.findOrCreate({
                where: { email: user.email },
                defaults: user
            });
        }
        console.log(`   ✓ ${users.length} users seeded\n`);

        // ================== SEED SAMPLE ASSETS ==================
        console.log("💻 Seeding sample assets...");
        
        // Get created categories and locations for reference
        const laptopCat = await Category.findOne({ where: { name: "Laptop" } });
        const monitorCat = await Category.findOne({ where: { name: "Monitor" } });
        const printerCat = await Category.findOne({ where: { name: "Printer" } });
        const itRoom = await Location.findOne({ where: { name: "IT Room" } });
        const warehouse = await Location.findOne({ where: { name: "Warehouse" } });

        const assets = [
            {
                asset_tag: "LAPTOP-001",
                name: "MacBook Pro 14\"",
                serial_number: "C02XL9QHJGH5",
                category_id: laptopCat?.id,
                location_id: warehouse?.id,
                status: "available",
                condition_status: "good",
                purchase_date: "2024-01-15",
                purchase_price: 25000000,
                warranty_expiry_date: "2027-01-15",
                specifications: JSON.stringify({
                    processor: "Apple M3 Pro",
                    ram: "18GB",
                    storage: "512GB SSD"
                }),
                notes: "Sample laptop asset"
            },
            {
                asset_tag: "LAPTOP-002",
                name: "ThinkPad X1 Carbon",
                serial_number: "PF3WXYZ1",
                category_id: laptopCat?.id,
                location_id: warehouse?.id,
                status: "available",
                condition_status: "good",
                purchase_date: "2024-02-20",
                purchase_price: 22000000,
                warranty_expiry_date: "2027-02-20",
                specifications: JSON.stringify({
                    processor: "Intel Core i7-1365U",
                    ram: "16GB",
                    storage: "512GB SSD"
                }),
                notes: "Sample laptop asset"
            },
            {
                asset_tag: "MON-001",
                name: "Dell UltraSharp U2722D",
                serial_number: "CN0ABCD1234",
                category_id: monitorCat?.id,
                location_id: itRoom?.id,
                status: "available",
                condition_status: "good",
                purchase_date: "2024-03-10",
                purchase_price: 8000000,
                warranty_expiry_date: "2027-03-10",
                specifications: JSON.stringify({
                    size: "27 inch",
                    resolution: "2560x1440",
                    panel: "IPS"
                }),
                notes: "Sample monitor asset"
            },
            {
                asset_tag: "PRN-001",
                name: "HP LaserJet Pro MFP",
                serial_number: "VNB3X12345",
                category_id: printerCat?.id,
                location_id: itRoom?.id,
                status: "available",
                condition_status: "good",
                purchase_date: "2024-04-05",
                purchase_price: 5500000,
                warranty_expiry_date: "2026-04-05",
                specifications: JSON.stringify({
                    type: "Multifunction",
                    color: "Color",
                    speed: "28 ppm"
                }),
                notes: "Sample printer asset"
            }
        ];

        for (const asset of assets) {
            if (asset.category_id && asset.location_id) {
                await Asset.findOrCreate({
                    where: { asset_tag: asset.asset_tag },
                    defaults: asset
                });
            }
        }
        console.log(`   ✓ ${assets.length} sample assets seeded\n`);

        // ================== SUMMARY ==================
        console.log("═".repeat(50));
        console.log("✅ Database seeding completed successfully!\n");
        console.log("📊 Summary:");
        console.log(`   • Categories: ${await Category.count()}`);
        console.log(`   • Locations: ${await Location.count()}`);
        console.log(`   • Users: ${await User.count()}`);
        console.log(`   • Assets: ${await Asset.count()}`);
        console.log("\n🔑 Default Login Credentials:");
        console.log("   Admin:    admin@company.com / Admin@123");
        console.log("   Staff:    staff@company.com / Staff@123");
        console.log("   Employee: john.doe@company.com / Employee@123");
        console.log("═".repeat(50));

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedDatabase();
