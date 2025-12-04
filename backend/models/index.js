import db from "../config/Database.js";
import Users from "./UserModel.js";
import Categories from "./CategoryModel.js";
import Locations from "./LocationModel.js";
import Assets from "./AssetModel.js";
import Transactions from "./TransactionModel.js";

// =====================================================
// RELASI ANTAR MODEL
// =====================================================

// 1. Category - Asset (One to Many)
// Satu kategori memiliki banyak aset
Categories.hasMany(Assets, {
    foreignKey: 'category_id',
    as: 'assets'
});
Assets.belongsTo(Categories, {
    foreignKey: 'category_id',
    as: 'category'
});

// 2. Location - Asset (One to Many)
// Satu lokasi memiliki banyak aset
Locations.hasMany(Assets, {
    foreignKey: 'location_id',
    as: 'assets'
});
Assets.belongsTo(Locations, {
    foreignKey: 'location_id',
    as: 'location'
});

// 3. User - Asset (One to Many) - Current Holder
// Satu user bisa memegang banyak aset
Users.hasMany(Assets, {
    foreignKey: 'current_holder_id',
    as: 'heldAssets'
});
Assets.belongsTo(Users, {
    foreignKey: 'current_holder_id',
    as: 'holder'
});

// 4. Asset - Transaction (One to Many)
// Satu aset memiliki banyak riwayat transaksi
Assets.hasMany(Transactions, {
    foreignKey: 'asset_id',
    as: 'transactions'
});
Transactions.belongsTo(Assets, {
    foreignKey: 'asset_id',
    as: 'asset'
});

// 5. User - Transaction (One to Many) - Employee
// Satu user (employee) terlibat dalam banyak transaksi
Users.hasMany(Transactions, {
    foreignKey: 'user_id',
    as: 'employeeTransactions'
});
Transactions.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'employee'
});

// 6. User - Transaction (One to Many) - Admin
// Satu admin memproses banyak transaksi
Users.hasMany(Transactions, {
    foreignKey: 'admin_id',
    as: 'adminTransactions'
});
Transactions.belongsTo(Users, {
    foreignKey: 'admin_id',
    as: 'admin'
});

// =====================================================
// EXPORT
// =====================================================

// Export with plural names (original)
export {
    db,
    Users,
    Categories,
    Locations,
    Assets,
    Transactions
};

// Export with singular names (aliases for convenience)
export {
    Users as User,
    Categories as Category,
    Locations as Location,
    Assets as Asset,
    Transactions as Transaction
};
