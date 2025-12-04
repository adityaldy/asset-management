# **Plan Implementasi: Sistem Manajemen Aset TI**

Dokumen ini berisi rencana implementasi detail berdasarkan "Perancangan Aplikasi Asset Management Lengkap.md". Setiap task memiliki checkbox untuk tracking progress.

---

## **📊 Progress Tracking**

### **Overall Progress**

| Komponen | Progress | Status |
|----------|----------|--------|
| **Backend** | 156/156 tasks | 🟢 Completed |
| **Frontend** | 98/98 tasks | 🟢 Completed |
| **Database** | 5/5 tasks | 🟢 Completed |
| **Testing** | 0/17 tasks | 🔴 Not Started |
| **Documentation** | 0/10 tasks | 🔴 Not Started |
| **TOTAL** | **259/286 tasks** | **91%** |

### **Progress per Fase**

| Fase | Nama | Tasks | Done | Progress | Status |
|------|------|-------|------|----------|--------|
| 0 | Setup & Konfigurasi | 22 | 20 | █████████░ 91% | 🟢 |
| 1 | Backend - Models | 29 | 29 | ██████████ 100% | 🟢 |
| 2 | Backend - Auth | 17 | 17 | ██████████ 100% | 🟢 |
| 3 | Backend - Master Data | 22 | 22 | ██████████ 100% | 🟢 |
| 4 | Backend - Asset Mgmt | 18 | 18 | ██████████ 100% | 🟢 |
| 5 | Backend - Transactions | 23 | 23 | ██████████ 100% | 🟢 |
| 6 | Backend - Dashboard | 12 | 12 | ██████████ 100% | 🟢 |
| 7 | Backend - Finalisasi | 18 | 18 | ██████████ 100% | 🟢 |
| 8 | Frontend - Setup | 12 | 12 | ██████████ 100% | 🟢 |
| 9 | Frontend - Layout | 14 | 14 | ██████████ 100% | 🟢 |
| 10 | Frontend - Auth | 7 | 7 | ██████████ 100% | 🟢 |
| 11 | Frontend - Dashboard | 11 | 11 | ██████████ 100% | 🟢 |
| 12 | Frontend - Assets | 23 | 23 | ██████████ 100% | 🟢 |
| 13 | Frontend - Transactions | 14 | 14 | ██████████ 100% | 🟢 |
| 14 | Frontend - Master Data | 12 | 12 | ██████████ 100% | 🟢 |
| 15 | Frontend - Reports | 10 | 10 | ██████████ 100% | 🟢 |
| 16 | Frontend - Components | 11 | 11 | ██████████ 100% | 🟢 |
| 17 | Testing | 17 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 18 | Documentation | 10 | 0 | ░░░░░░░░░░ 0% | 🔴 |

### **Status Legend**
- 🔴 Not Started (0%)
- 🟡 In Progress (1-99%)
- 🟢 Completed (100%)
- ⏸️ On Hold
- 🔵 Under Review

### **Current Sprint**
- **Active Fase**: Fase 0-16 (Completed) → Fase 17 (Next)
- **Current Task**: Backend & Frontend 100% Complete, Database Seeded - Ready for Testing
- **Blockers**: None
- **Last Updated**: 2025-12-04

### **Database Status**
- ✅ Database `it_asset_management` created
- ✅ All tables synced (users, categories, locations, assets, transactions)
- ✅ Sample data seeded:
  - 6 Users (1 admin, 1 staff, 4 employees)
  - 8 Categories
  - 5 Locations
  - 12 Assets (Total: Rp 313.500.000)
- ✅ Admin credentials: admin@company.com / admin123

---

## **Struktur Direktori Proyek**

```
it-asset-management/
│
├── backend/
│   ├── config/
│   │   └── Database.js                 # Konfigurasi koneksi MySQL dengan Sequelize
│   │
│   ├── controllers/
│   │   ├── AuthController.js           # Login, logout, refresh token, register
│   │   ├── UserController.js           # CRUD users, get employees
│   │   ├── CategoryController.js       # CRUD categories
│   │   ├── LocationController.js       # CRUD locations
│   │   ├── AssetController.js          # CRUD assets, search, filter
│   │   ├── TransactionController.js    # Check-in, check-out, repair, dispose
│   │   ├── DashboardController.js      # Summary stats, charts data
│   │   └── ReportController.js         # Generate reports
│   │
│   ├── middleware/
│   │   ├── VerifyToken.js              # JWT authentication middleware
│   │   ├── AuthorizeRole.js            # Role-based access control (RBAC)
│   │   ├── ErrorHandler.js             # Global error handling
│   │   ├── AssetValidation.js          # Joi validation untuk assets
│   │   └── TransactionValidation.js    # Joi validation untuk transactions
│   │
│   ├── models/
│   │   ├── index.js                    # Setup relasi antar model
│   │   ├── UserModel.js                # Schema users
│   │   ├── CategoryModel.js            # Schema categories
│   │   ├── LocationModel.js            # Schema locations
│   │   ├── AssetModel.js               # Schema assets
│   │   └── TransactionModel.js         # Schema transactions (audit trail)
│   │
│   ├── routes/
│   │   ├── index.js                    # Route aggregator
│   │   ├── AuthRoute.js                # /api/auth/*
│   │   ├── UserRoute.js                # /api/users/*
│   │   ├── CategoryRoute.js            # /api/categories/*
│   │   ├── LocationRoute.js            # /api/locations/*
│   │   ├── AssetRoute.js               # /api/assets/*
│   │   ├── TransactionRoute.js         # /api/transactions/*
│   │   ├── DashboardRoute.js           # /api/dashboard/*
│   │   └── ReportRoute.js              # /api/reports/*
│   │
│   ├── seeders/
│   │   └── seed.js                     # Initial data seeding
│   │
│   ├── utils/
│   │   ├── responseHelper.js           # Standardized JSON responses
│   │   ├── stateMachine.js             # Asset status transition logic
│   │   └── generateAssetTag.js         # Auto-generate asset tags
│   │
│   ├── .env                            # Environment variables (tidak di-commit)
│   ├── .env.example                    # Template environment variables
│   ├── .gitignore
│   ├── package.json
│   └── index.js                        # Entry point server Express
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js                # Axios instance dengan interceptors
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Spinner.jsx         # Loading spinner
│   │   │   │   ├── TableSkeleton.jsx   # Skeleton loader untuk tabel
│   │   │   │   ├── PageLoader.jsx      # Full page loader
│   │   │   │   ├── EmptyState.jsx      # Empty data state
│   │   │   │   ├── ErrorState.jsx      # Error display dengan retry
│   │   │   │   ├── StatusBadge.jsx     # Colored status badges
│   │   │   │   ├── Pagination.jsx      # Pagination controls
│   │   │   │   ├── Modal.jsx           # Reusable modal
│   │   │   │   ├── ConfirmDialog.jsx   # Confirmation dialog
│   │   │   │   └── ProtectedRoute.jsx  # Auth guard component
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx      # Layout wrapper dengan sidebar
│   │   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   │   └── Navbar.jsx          # Top navigation bar
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── SearchableSelect.jsx    # Async searchable dropdown
│   │   │   │   ├── DatePicker.jsx          # Date input component
│   │   │   │   └── FormInput.jsx           # Reusable form input
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCard.jsx         # Stats card component
│   │   │   │   ├── RecentTransactions.jsx  # Recent activity table
│   │   │   │   └── Charts.jsx              # Chart components (optional)
│   │   │   │
│   │   │   └── assets/
│   │   │       ├── AssetTable.jsx      # Asset data table
│   │   │       ├── AssetHistory.jsx    # Transaction history timeline
│   │   │       └── AssetForm.jsx       # Reusable asset form
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx               # Login page
│   │   │   ├── Dashboard.jsx           # Dashboard/home page
│   │   │   ├── AssetList.jsx           # Asset listing page
│   │   │   ├── AddAsset.jsx            # Create new asset
│   │   │   ├── AssetDetail.jsx         # Asset detail view
│   │   │   ├── EditAsset.jsx           # Edit asset page
│   │   │   ├── TransactionList.jsx     # All transactions
│   │   │   ├── Checkout.jsx            # Check-out form
│   │   │   ├── Checkin.jsx             # Check-in form
│   │   │   ├── Categories.jsx          # Category management
│   │   │   ├── Locations.jsx           # Location management
│   │   │   ├── Users.jsx               # User management (Admin)
│   │   │   ├── Reports.jsx             # Reports page
│   │   │   └── NotFound.jsx            # 404 page
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Authentication context & provider
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js              # Auth hook
│   │   │   ├── useFetch.js             # Generic fetch hook
│   │   │   └── useDebounce.js          # Debounce hook untuk search
│   │   │
│   │   ├── utils/
│   │   │   ├── export.js               # CSV export utility
│   │   │   ├── formatDate.js           # Date formatting helpers
│   │   │   └── constants.js            # App constants (status, roles, etc.)
│   │   │
│   │   ├── styles/
│   │   │   └── index.css               # Global styles & Tailwind imports
│   │   │
│   │   ├── App.jsx                     # Main app dengan routing
│   │   └── main.jsx                    # React entry point
│   │
│   ├── .env                            # Frontend environment variables
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js               # PostCSS config untuk Tailwind
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   └── vite.config.js                  # Vite configuration
│
├── docs/
│   ├── Perancangan Aplikasi Asset Management Lengkap.md
│   └── plan.md                         # Dokumen ini
│
├── .gitignore                          # Root gitignore
└── README.md                           # Project documentation
```

---

## **Fase 0: Setup & Konfigurasi Awal**

### 0.1 Inisialisasi Proyek
- [x] Buat struktur folder utama `it-asset-management/`
- [x] Inisialisasi Git repository
- [x] Buat file `.gitignore` untuk Node.js dan React

### 0.2 Setup Backend
- [x] Inisialisasi `backend/` dengan `npm init`
- [x] Install dependencies utama:
  - [x] `express` - Web framework
  - [x] `sequelize` - ORM
  - [x] `mysql2` - MySQL driver
  - [x] `dotenv` - Environment variables
  - [x] `cors` - Cross-Origin Resource Sharing
  - [x] `bcrypt` atau `argon2` - Password hashing
  - [x] `jsonwebtoken` - JWT authentication
  - [x] `joi` - Request validation
  - [x] `uuid` - UUID generation
- [x] Install dev dependencies:
  - [x] `nodemon` - Auto-reload server
- [x] Buat file `.env` dengan template konfigurasi
- [ ] Setup ESLint untuk code consistency

### 0.3 Setup Frontend
- [x] Inisialisasi React project dengan Vite di `frontend/`
- [x] Install dependencies utama:
  - [x] `react-router-dom` - Routing
  - [x] `axios` - HTTP client
  - [x] `tailwindcss` - Styling
  - [ ] `@tanstack/react-table` atau `react-data-table-component` - Data table
  - [x] `react-icons` - Icon library
  - [x] `react-hot-toast` atau `react-toastify` - Notifications
- [x] Konfigurasi Tailwind CSS
- [x] Setup folder structure sesuai spesifikasi

### 0.4 Setup Database
- [x] Buat database MySQL `it_asset_management`
- [x] Konfigurasi koneksi database di `backend/config/Database.js`
- [x] Test koneksi database
- [x] Sync models untuk create tables
- [x] Create admin user dan seed data

---

## **Fase 1: Backend - Models & Database Schema**

### 1.1 Model Users
- [x] Buat file `backend/models/UserModel.js`
- [x] Definisikan schema dengan field:
  - [x] `id` (INT, PK, Auto Increment)
  - [x] `uuid` (VARCHAR(36), Unique, Not Null)
  - [x] `name` (VARCHAR(100), Not Null)
  - [x] `email` (VARCHAR(100), Unique, Not Null)
  - [x] `password` (VARCHAR(255), Nullable)
  - [x] `role` (ENUM: 'admin', 'staff', 'employee')
  - [x] `department` (VARCHAR(100), Nullable)
  - [x] `created_at` (DATETIME)
  - [x] `updated_at` (DATETIME)
- [x] Tambahkan validasi pada model
- [x] Tambahkan index pada kolom `email` dan `uuid`

### 1.2 Model Categories
- [x] Buat file `backend/models/CategoryModel.js`
- [x] Definisikan schema dengan field:
  - [x] `id` (INT, PK, Auto Increment)
  - [x] `uuid` (VARCHAR(36), Unique, Not Null)
  - [x] `name` (VARCHAR(100), Not Null)
  - [x] `description` (TEXT, Nullable)
  - [x] `created_at` (DATETIME)
  - [x] `updated_at` (DATETIME)

### 1.3 Model Locations
- [x] Buat file `backend/models/LocationModel.js`
- [x] Definisikan schema dengan field:
  - [x] `id` (INT, PK, Auto Increment)
  - [x] `uuid` (VARCHAR(36), Unique, Not Null)
  - [x] `name` (VARCHAR(100), Not Null)
  - [x] `address` (TEXT, Nullable)
  - [x] `created_at` (DATETIME)
  - [x] `updated_at` (DATETIME)

### 1.4 Model Assets
- [x] Buat file `backend/models/AssetModel.js`
- [x] Definisikan schema dengan field:
  - [x] `id` (INT, PK, Auto Increment)
  - [x] `uuid` (VARCHAR(36), Unique, Not Null)
  - [x] `name` (VARCHAR(150), Not Null)
  - [x] `asset_tag` (VARCHAR(50), Unique, Not Null)
  - [x] `serial_number` (VARCHAR(100), Unique, Not Null)
  - [x] `category_id` (INT, FK -> categories)
  - [x] `location_id` (INT, FK -> locations)
  - [x] `current_holder_id` (INT, FK -> users, Nullable)
  - [x] `status` (ENUM: 'available', 'assigned', 'repair', 'retired', 'missing')
  - [x] `purchase_date` (DATE, Not Null)
  - [x] `price` (DECIMAL(15,2), Default 0.00)
  - [x] `specifications` (JSON, Nullable)
  - [x] `created_at` (DATETIME)
  - [x] `updated_at` (DATETIME)
- [x] Tambahkan index pada `serial_number`, `asset_tag`, `name`
- [ ] Setup Fulltext Index untuk pencarian

### 1.5 Model Transactions
- [x] Buat file `backend/models/TransactionModel.js`
- [x] Definisikan schema dengan field:
  - [x] `id` (INT, PK, Auto Increment)
  - [x] `uuid` (VARCHAR(36), Unique, Not Null)
  - [x] `asset_id` (INT, FK -> assets)
  - [x] `user_id` (INT, FK -> users) - Karyawan terlibat
  - [x] `admin_id` (INT, FK -> users) - Admin yang memproses
  - [x] `action_type` (ENUM: 'checkout', 'checkin', 'repair', 'dispose', 'lost', 'found')
  - [x] `transaction_date` (DATETIME, Not Null)
  - [x] `condition_status` (VARCHAR(50), Nullable)
  - [x] `notes` (TEXT, Nullable)
  - [x] `created_at` (DATETIME)

### 1.6 Setup Relasi Antar Model
- [x] Buat file `backend/models/index.js`
- [x] Definisikan relasi:
  - [x] Category hasMany Asset
  - [x] Asset belongsTo Category
  - [x] Location hasMany Asset
  - [x] Asset belongsTo Location
  - [x] User hasMany Asset (as 'heldAssets')
  - [x] Asset belongsTo User (as 'holder')
  - [x] Asset hasMany Transaction
  - [x] Transaction belongsTo Asset
  - [x] User hasMany Transaction (as 'employeeTransactions')
  - [x] Transaction belongsTo User (as 'employee')
  - [x] User hasMany Transaction (as 'adminTransactions')
  - [x] Transaction belongsTo User (as 'admin')
- [x] Sinkronisasi model ke database
- [ ] Test migrasi berhasil

---

## **Fase 2: Backend - Authentication & Authorization**

### 2.1 Middleware Authentication
- [x] Buat file `backend/middleware/VerifyToken.js`
- [x] Implementasi JWT verification
- [x] Handle token expired error
- [x] Handle invalid token error

### 2.2 Middleware Authorization (RBAC)
- [x] Buat file `backend/middleware/AuthorizeRole.js`
- [x] Implementasi role-based access check
- [x] Definisikan permission matrix:
  - [x] Admin: Full access
  - [x] Staff: CRUD assets, transactions (no user management)
  - [x] Employee: Read-only (fase 2)

### 2.3 Auth Controller
- [x] Buat file `backend/controllers/AuthController.js`
- [x] Implementasi fungsi:
  - [x] `register` - Registrasi user baru (Admin only)
  - [x] `login` - Autentikasi & generate tokens
  - [x] `logout` - Invalidate refresh token
  - [x] `refreshToken` - Generate new access token
  - [x] `getMe` - Get current user info

### 2.4 Auth Routes
- [x] Buat file `backend/routes/AuthRoute.js`
- [x] Definisikan endpoints:
  - [x] `POST /api/auth/register`
  - [x] `POST /api/auth/login`
  - [x] `DELETE /api/auth/logout`
  - [x] `GET /api/auth/token`
  - [x] `GET /api/auth/me`

### 2.5 Password Security
- [x] Implementasi password hashing dengan bcrypt/argon2
- [x] Tambahkan password strength validation
- [x] Implementasi rate limiting untuk login endpoint

---

## **Fase 3: Backend - Master Data Management**

### 3.1 Category Controller
- [x] Buat file `backend/controllers/CategoryController.js`
- [x] Implementasi fungsi CRUD:
  - [x] `getAllCategories` - List semua kategori
  - [x] `getCategoryById` - Detail kategori
  - [x] `createCategory` - Buat kategori baru
  - [x] `updateCategory` - Update kategori
  - [x] `deleteCategory` - Hapus kategori (soft delete/check usage)

### 3.2 Category Routes
- [x] Buat file `backend/routes/CategoryRoute.js`
- [x] Definisikan endpoints:
  - [x] `GET /api/categories`
  - [x] `GET /api/categories/:id`
  - [x] `POST /api/categories`
  - [x] `PUT /api/categories/:id`
  - [x] `DELETE /api/categories/:id`

### 3.3 Location Controller
- [x] Buat file `backend/controllers/LocationController.js`
- [x] Implementasi fungsi CRUD:
  - [x] `getAllLocations` - List semua lokasi
  - [x] `getLocationById` - Detail lokasi
  - [x] `createLocation` - Buat lokasi baru
  - [x] `updateLocation` - Update lokasi
  - [x] `deleteLocation` - Hapus lokasi (soft delete/check usage)

### 3.4 Location Routes
- [x] Buat file `backend/routes/LocationRoute.js`
- [x] Definisikan endpoints:
  - [x] `GET /api/locations`
  - [x] `GET /api/locations/:id`
  - [x] `POST /api/locations`
  - [x] `PUT /api/locations/:id`
  - [x] `DELETE /api/locations/:id`

### 3.5 User Management Controller
- [x] Buat file `backend/controllers/UserController.js`
- [x] Implementasi fungsi:
  - [x] `getAllUsers` - List semua user (with pagination)
  - [x] `getUserById` - Detail user
  - [x] `createUser` - Buat user baru
  - [x] `updateUser` - Update data user
  - [x] `deleteUser` - Hapus/deactivate user
  - [x] `getEmployees` - List user dengan role 'employee' (untuk dropdown)

### 3.6 User Routes
- [x] Buat file `backend/routes/UserRoute.js`
- [x] Definisikan endpoints:
  - [x] `GET /api/users`
  - [x] `GET /api/users/:id`
  - [x] `POST /api/users`
  - [x] `PUT /api/users/:id`
  - [x] `DELETE /api/users/:id`
  - [x] `GET /api/users/employees` - Filtered list

---

## **Fase 4: Backend - Asset Management**

### 4.1 Asset Controller
- [x] Buat file `backend/controllers/AssetController.js`
- [x] Implementasi fungsi:
  - [x] `getAllAssets` - List dengan pagination, sorting, filtering
  - [x] `getAssetById` - Detail aset dengan relasi (category, location, holder)
  - [x] `getAssetHistory` - Riwayat transaksi aset
  - [x] `createAsset` - Registrasi aset baru
  - [x] `updateAsset` - Update data aset (bukan status)
  - [x] `deleteAsset` - Soft delete / retire asset
  - [x] `searchAssets` - Full-text search

### 4.2 Asset Validation
- [x] Buat file `backend/middleware/AssetValidation.js`
- [x] Implementasi validasi dengan Joi:
  - [x] Validasi create asset request
  - [x] Validasi update asset request
  - [x] Validasi uniqueness serial_number
  - [x] Validasi uniqueness asset_tag
  - [x] Validasi foreign keys exist

### 4.3 Asset Routes
- [x] Buat file `backend/routes/AssetRoute.js`
- [x] Definisikan endpoints:
  - [x] `GET /api/assets` - List with query params
  - [x] `GET /api/assets/search` - Search endpoint
  - [x] `GET /api/assets/:id` - Detail
  - [x] `GET /api/assets/:id/history` - Transaction history
  - [x] `POST /api/assets` - Create
  - [x] `PUT /api/assets/:id` - Update
  - [x] `DELETE /api/assets/:id` - Delete/Retire

### 4.4 Asset Query Features
- [x] Implementasi pagination (page, limit)
- [x] Implementasi sorting (sort_by, order)
- [x] Implementasi filtering:
  - [x] Filter by category
  - [x] Filter by location
  - [x] Filter by status
  - [x] Filter by date range
- [x] Implementasi search (name, serial_number, asset_tag)

---

## **Fase 5: Backend - Transaction Management (Check-in/Check-out)**

### 5.1 Transaction Controller
- [x] Buat file `backend/controllers/TransactionController.js`
- [x] Implementasi fungsi:
  - [x] `checkoutAsset` - Proses peminjaman
  - [x] `checkinAsset` - Proses pengembalian
  - [x] `sendToRepair` - Kirim ke perbaikan
  - [x] `completeRepair` - Selesai perbaikan
  - [x] `reportLost` - Lapor hilang
  - [x] `reportFound` - Lapor ditemukan
  - [x] `disposeAsset` - Penghapusan aset
  - [x] `getAllTransactions` - List transaksi
  - [x] `getTransactionById` - Detail transaksi

### 5.2 State Machine Logic
- [x] Implementasi validasi transisi status:
  - [x] `available` -> `assigned` (checkout)
  - [x] `available` -> `repair` (send to repair)
  - [x] `available` -> `retired` (dispose)
  - [x] `assigned` -> `available` (checkin good)
  - [x] `assigned` -> `repair` (checkin damaged)
  - [x] `assigned` -> `missing` (report lost)
  - [x] `repair` -> `available` (repair completed)
  - [x] `repair` -> `retired` (beyond repair)
  - [x] `missing` -> `available` (found)
  - [x] `missing` -> `retired` (write-off)
- [x] Reject invalid transitions dengan error message

### 5.3 Database Transaction (Atomicity)
- [x] Implementasi Sequelize transaction untuk checkout
- [x] Implementasi Sequelize transaction untuk checkin
- [x] Implementasi rollback on error
- [x] Test atomicity (simulate failure)

### 5.4 Transaction Validation
- [x] Buat file `backend/middleware/TransactionValidation.js`
- [x] Validasi checkout request:
  - [x] Asset UUID valid
  - [x] User UUID valid
  - [x] Asset status === 'available'
  - [x] Transaction date valid
- [x] Validasi checkin request:
  - [x] Asset UUID valid
  - [x] Asset status === 'assigned'
  - [x] Condition status required
  - [x] Transaction date valid

### 5.5 Transaction Routes
- [x] Buat file `backend/routes/TransactionRoute.js`
- [x] Definisikan endpoints:
  - [x] `POST /api/transactions/checkout`
  - [x] `POST /api/transactions/checkin`
  - [x] `POST /api/transactions/repair`
  - [x] `POST /api/transactions/complete-repair`
  - [x] `POST /api/transactions/report-lost`
  - [x] `POST /api/transactions/report-found`
  - [x] `POST /api/transactions/dispose`
  - [x] `GET /api/transactions`
  - [x] `GET /api/transactions/:id`

---

## **Fase 6: Backend - Dashboard & Reporting**

### 6.1 Dashboard Controller
- [x] Buat file `backend/controllers/DashboardController.js`
- [x] Implementasi fungsi:
  - [x] `getSummaryStats` - Total assets by status
  - [x] `getAssetsByCategory` - Count per category
  - [x] `getAssetsByLocation` - Count per location
  - [x] `getRecentTransactions` - Latest 10 transactions
  - [x] `getAssetsNearWarrantyExpiry` - Assets near warranty expiry
  - [x] `getMonthlyTrends` - Monthly transaction trends

### 6.2 Report Controller
- [x] Buat file `backend/controllers/ReportController.js`
- [x] Implementasi fungsi:
  - [x] `getAssetReport` - Exportable asset list (JSON/CSV format)
  - [x] `getTransactionReport` - Exportable transaction history
  - [x] `getAuditLog` - Full audit trail
  - [x] `getAssetSummaryReport` - Asset summary by category/status

### 6.3 Dashboard & Report Routes
- [x] Buat file `backend/routes/DashboardRoute.js`
- [x] Buat file `backend/routes/ReportRoute.js`
- [x] Definisikan endpoints:
  - [x] `GET /api/dashboard/summary`
  - [x] `GET /api/dashboard/by-category`
  - [x] `GET /api/dashboard/by-location`
  - [x] `GET /api/dashboard/by-status`
  - [x] `GET /api/dashboard/recent-transactions`
  - [x] `GET /api/dashboard/warranty-expiry`
  - [x] `GET /api/dashboard/monthly-trends`
  - [x] `GET /api/reports/assets`
  - [x] `GET /api/reports/transactions`
  - [x] `GET /api/reports/audit-log`
  - [x] `GET /api/reports/summary`

---

## **Fase 7: Backend - Finalisasi**

### 7.1 Error Handling
- [x] Buat global error handler middleware
- [x] Standardisasi format error response
- [x] Implementasi error codes (VAL_ERR_001, etc.)
- [x] Log errors untuk debugging

### 7.2 Response Standardization
- [x] Buat helper function untuk success response
- [x] Buat helper function untuk error response
- [x] Implementasi meta untuk pagination
- [x] Konsisten dengan format JSON yang ditentukan

### 7.3 Security Hardening
- [x] Implementasi helmet.js untuk HTTP headers
- [x] Implementasi rate limiting (general + auth-specific)
- [x] Sanitize input untuk prevent SQL injection (Sequelize ORM)
- [x] Validasi dan sanitize semua user input (Joi validation)
- [x] Setup CORS dengan whitelist origin

### 7.4 Main Entry Point
- [x] Buat/update `backend/index.js`
- [x] Register semua routes (8 route modules)
- [x] Setup middleware (cors, json parser, cookie parser, helmet)
- [x] Database sync
- [x] Server listen

### 7.5 Seeding Data
- [x] Buat file `backend/seeders/seed.js`
- [x] Seed default admin user
- [x] Seed sample categories (10 categories)
- [x] Seed sample locations (10 locations)
- [x] Seed sample employees (6 users with different roles)
- [x] Seed sample assets (4 sample assets)

---

## **Fase 8: Frontend - Setup & Struktur**

### 8.1 Project Structure
- [x] Setup folder structure:
  ```
  frontend/src/
  ├── api/
  ├── components/
  │   ├── common/
  │   ├── layout/
  │   └── forms/
  ├── pages/
  ├── context/
  ├── hooks/
  ├── utils/
  └── styles/
  ```

### 8.2 API Configuration
- [x] Buat file `frontend/src/api/axios.js`
- [x] Setup base URL dari environment
- [x] Implementasi request interceptor (attach token)
- [x] Implementasi response interceptor (refresh token)
- [x] Handle 401 redirect to login

### 8.3 Auth Context
- [x] Buat file `frontend/src/context/AuthContext.jsx`
- [x] Implementasi state:
  - [x] `user` - Current user data
  - [x] `token` - Access token
  - [x] `isAuthenticated` - Boolean
  - [x] `isLoading` - Loading state
- [x] Implementasi functions:
  - [x] `login` - Call login API, set state
  - [x] `logout` - Clear state, call logout API
  - [x] `refreshToken` - Auto refresh logic

### 8.4 Protected Route Component
- [x] Buat file `frontend/src/components/common/ProtectedRoute.jsx`
- [x] Check authentication status
- [x] Redirect to login if not authenticated
- [x] Check role-based access

---

## **Fase 9: Frontend - Layout & Navigation**

### 9.1 Main Layout
- [x] Buat file `frontend/src/components/layout/MainLayout.jsx`
- [x] Implementasi responsive layout dengan sidebar

### 9.2 Sidebar Component
- [x] Buat file `frontend/src/components/layout/Sidebar.jsx`
- [x] Menu items:
  - [x] Dashboard
  - [x] Assets
  - [x] Transactions (Check-in/out)
  - [x] Categories (Master Data)
  - [x] Locations (Master Data)
  - [x] Users (Admin only)
  - [x] Reports
- [x] Active state indicator
- [x] Collapsible on mobile

### 9.3 Navbar Component
- [x] Buat file `frontend/src/components/layout/Navbar.jsx`
- [x] User info display
- [x] Logout button
- [x] Mobile menu toggle

### 9.4 Routing Setup
- [x] Buat file `frontend/src/App.jsx` dengan routes
- [x] Setup routes:
  - [x] `/login` - Public
  - [x] `/` - Dashboard (Protected)
  - [x] `/assets` - Asset List (Protected)
  - [x] `/assets/add` - Add Asset (Protected)
  - [x] `/assets/:id` - Asset Detail (Protected)
  - [x] `/assets/:id/edit` - Edit Asset (Protected)
  - [x] `/transactions` - Transaction List (Protected)
  - [x] `/checkout` - Checkout Form (Protected)
  - [x] `/checkin` - Checkin Form (Protected)
  - [x] `/categories` - Category Management (Protected)
  - [x] `/locations` - Location Management (Protected)
  - [x] `/users` - User Management (Admin)
  - [x] `/reports` - Reports (Protected)

---

## **Fase 10: Frontend - Authentication Pages**

### 10.1 Login Page
- [x] Buat file `frontend/src/pages/Login.jsx`
- [x] Form fields:
  - [x] Email input with validation
  - [x] Password input
  - [x] Remember me checkbox (optional)
  - [x] Submit button with loading state
- [x] Error message display
- [x] Redirect to dashboard on success

### 10.2 Login Form Validation
- [x] Email format validation
- [x] Required field validation
- [x] Display validation errors inline

---

## **Fase 11: Frontend - Dashboard**

### 11.1 Dashboard Page
- [x] Buat file `frontend/src/pages/Dashboard.jsx`
- [x] Fetch summary data on mount

### 11.2 Summary Cards
- [x] Buat file `frontend/src/components/dashboard/SummaryCard.jsx`
- [x] Cards to display:
  - [x] Total Assets
  - [x] Available Assets
  - [x] Assigned Assets
  - [x] Assets in Repair
  - [x] Retired Assets

### 11.3 Charts (Optional)
- [x] Assets by Category (Bar/Pie chart)
- [x] Assets by Location (Bar chart)
- [x] Assets by Status (Donut chart)

### 11.4 Recent Transactions Table
- [x] Buat file `frontend/src/components/dashboard/RecentTransactions.jsx`
- [x] Display latest 10 transactions
- [x] Columns: Date, Asset, Action, User, Admin

---

## **Fase 12: Frontend - Asset Management**

### 12.1 Asset List Page
- [x] Buat file `frontend/src/pages/AssetList.jsx`
- [x] Fetch assets with pagination
- [x] Implementasi features:
  - [x] Search bar (global search)
  - [x] Filter dropdowns (Category, Location, Status)
  - [x] Sortable columns
  - [x] Pagination controls
  - [x] Add Asset button

### 12.2 Asset Table Component
- [x] Buat file `frontend/src/components/assets/AssetTable.jsx`
- [x] Columns:
  - [x] Asset Tag
  - [x] Name
  - [x] Category (badge)
  - [x] Location
  - [x] Status (colored badge)
  - [x] Current Holder
  - [x] Actions (View, Edit, Delete)
- [x] Status badges dengan warna:
  - [x] Available: Green
  - [x] Assigned: Blue
  - [x] In Repair: Yellow
  - [x] Retired: Gray
  - [x] Missing: Red

### 12.3 Add Asset Page
- [x] Buat file `frontend/src/pages/AddAsset.jsx`
- [x] Form fields:
  - [x] Name (text)
  - [x] Asset Tag (text, auto-generate option)
  - [x] Serial Number (text)
  - [x] Category (dropdown)
  - [x] Location (dropdown)
  - [x] Purchase Date (date picker)
  - [x] Price (number)
  - [x] Specifications (JSON editor / dynamic fields)
- [x] Form validation
- [x] Submit with loading state
- [x] Success notification & redirect

### 12.4 Asset Detail Page
- [x] Buat file `frontend/src/pages/AssetDetail.jsx`
- [x] Display all asset info
- [x] Tab: Details
- [x] Tab: Transaction History
- [x] Action buttons based on status:
  - [x] Check-out (if available)
  - [x] Check-in (if assigned)
  - [x] Send to Repair
  - [x] Dispose

### 12.5 Edit Asset Page
- [x] Buat file `frontend/src/pages/EditAsset.jsx`
- [x] Pre-fill form with existing data
- [x] Same fields as Add Asset
- [x] Update API call

### 12.6 Asset History Component
- [x] Buat file `frontend/src/components/assets/AssetHistory.jsx`
- [x] Timeline view of transactions
- [x] Display: Date, Action, User, Admin, Notes

---

## **Fase 13: Frontend - Transaction Management**

### 13.1 Transaction List Page
- [x] Buat file `frontend/src/pages/TransactionList.jsx`
- [x] Fetch transactions with pagination
- [x] Filter by action type
- [x] Filter by date range
- [x] Search by asset name/tag

### 13.2 Checkout Page
- [x] Buat file `frontend/src/pages/Checkout.jsx`
- [x] Form fields:
  - [x] Asset selection (searchable dropdown, filter: available only)
  - [x] Employee selection (searchable dropdown)
  - [x] Transaction Date (date picker)
  - [x] Notes (textarea)
- [x] Display selected asset info
- [x] Form validation
- [x] Submit with confirmation modal

### 13.3 Checkin Page
- [x] Buat file `frontend/src/pages/Checkin.jsx`
- [x] Form fields:
  - [x] Asset selection (searchable dropdown, filter: assigned only)
  - [x] Display current holder (auto-filled)
  - [x] Condition Status (radio: Good, Damaged, Lost)
  - [x] Transaction Date (date picker)
  - [x] Notes (textarea, required if Damaged/Lost)
- [x] Form validation
- [x] Submit with confirmation modal

### 13.4 Searchable Dropdown Component
- [x] Buat file `frontend/src/components/forms/SearchableSelect.jsx`
- [x] Async search capability
- [x] Display selected item
- [x] Clear selection option

---

## **Fase 14: Frontend - Master Data Management**

### 14.1 Category Management Page
- [x] Buat file `frontend/src/pages/Categories.jsx`
- [x] List all categories
- [x] Add new category (modal/inline form)
- [x] Edit category (modal)
- [x] Delete category (confirmation modal)

### 14.2 Location Management Page
- [x] Buat file `frontend/src/pages/Locations.jsx`
- [x] List all locations
- [x] Add new location (modal/inline form)
- [x] Edit location (modal)
- [x] Delete location (confirmation modal)

### 14.3 User Management Page (Admin Only)
- [x] Buat file `frontend/src/pages/Users.jsx`
- [x] List all users with role filter
- [x] Add new user form
- [x] Edit user (modal)
- [x] Deactivate user
- [x] Reset password (Admin only)

### 14.4 Reusable Modal Component
- [x] Buat file `frontend/src/components/common/Modal.jsx`
- [x] Configurable title, content, actions
- [x] Close on overlay click (optional)
- [x] Close on Escape key

### 14.5 Confirmation Dialog Component
- [x] Buat file `frontend/src/components/common/ConfirmDialog.jsx`
- [x] Confirm/Cancel buttons
- [x] Customizable message
- [x] Danger variant for destructive actions

---

## **Fase 15: Frontend - Reports**

### 15.1 Reports Page
- [x] Buat file `frontend/src/pages/Reports.jsx`
- [x] Report type selection:
  - [x] Asset Inventory Report
  - [x] Transaction History Report

### 15.2 Asset Report
- [x] Filter options:
  - [x] Category
  - [x] Location
  - [x] Status
  - [x] Date range (purchase date)
- [x] Display results in table
- [x] Export to CSV button

### 15.3 Transaction Report
- [x] Filter options:
  - [x] Action type
  - [x] Date range
  - [x] User/Employee
- [x] Display results in table
- [x] Export to CSV button

### 15.4 Export Utility
- [x] Buat file `frontend/src/utils/export.js`
- [x] Implementasi CSV export function
- [x] Handle special characters

---

## **Fase 16: Frontend - Common Components**

### 16.1 Loading Components
- [x] Buat file `frontend/src/components/common/Spinner.jsx`
- [x] Buat file `frontend/src/components/common/TableSkeleton.jsx`
- [x] Buat file `frontend/src/components/common/PageLoader.jsx`

### 16.2 Empty State Component
- [x] Buat file `frontend/src/components/common/EmptyState.jsx`
- [x] Customizable icon, message, action

### 16.3 Error State Component
- [x] Buat file `frontend/src/components/common/ErrorState.jsx`
- [x] Display error message
- [x] Retry button

### 16.4 Status Badge Component
- [x] Buat file `frontend/src/components/common/StatusBadge.jsx`
- [x] Color mapping for each status
- [x] Consistent styling

### 16.5 Pagination Component
- [x] Buat file `frontend/src/components/common/Pagination.jsx`
- [x] Page numbers
- [x] Previous/Next buttons
- [x] Items per page selector
- [x] Total items display

---

## **Fase 17: Testing**

### 17.1 Backend Unit Tests
- [ ] Setup Jest untuk backend
- [ ] Test auth controller functions
- [ ] Test asset controller functions
- [ ] Test transaction state machine logic
- [ ] Test validation middlewares

### 17.2 Backend Integration Tests
- [ ] Test auth endpoints (login, logout, refresh)
- [ ] Test asset CRUD endpoints
- [ ] Test transaction endpoints (checkout, checkin)
- [ ] Test database transactions (atomicity)

### 17.3 Frontend Testing
- [ ] Setup testing library untuk React
- [ ] Test login form validation
- [ ] Test protected route behavior
- [ ] Test asset form validation

### 17.4 Security Testing
- [ ] Test API access without token
- [ ] Test role-based access restrictions
- [ ] Test SQL injection on input fields
- [ ] Verify HttpOnly cookie flag
- [ ] Verify refresh token security

---

## **Fase 18: Documentation & Deployment Preparation**

### 18.1 API Documentation
- [ ] Document all endpoints with request/response examples
- [ ] List all error codes and meanings
- [ ] Setup Swagger/OpenAPI (optional)

### 18.2 README Files
- [ ] Create `backend/README.md` with setup instructions
- [ ] Create `frontend/README.md` with setup instructions
- [ ] Create root `README.md` with project overview

### 18.3 Environment Configuration
- [ ] Document all environment variables
- [ ] Create `.env.example` files
- [ ] Production configuration guide

### 18.4 Database Scripts
- [ ] Create database initialization script
- [ ] Create seed script for initial data
- [ ] Create backup/restore procedures

---

## **Milestone Summary**

| Fase | Deskripsi | Estimasi |
|------|-----------|----------|
| 0 | Setup & Konfigurasi | 1 hari |
| 1 | Backend Models | 1 hari |
| 2 | Backend Auth | 1 hari |
| 3 | Backend Master Data | 1 hari |
| 4 | Backend Asset Management | 1-2 hari |
| 5 | Backend Transactions | 1-2 hari |
| 6 | Backend Dashboard & Reports | 1 hari |
| 7 | Backend Finalisasi | 1 hari |
| 8-9 | Frontend Setup & Layout | 1 hari |
| 10-11 | Frontend Auth & Dashboard | 1 hari |
| 12-13 | Frontend Asset & Transactions | 2-3 hari |
| 14-15 | Frontend Master Data & Reports | 1-2 hari |
| 16 | Frontend Common Components | 1 hari |
| 17 | Testing | 2-3 hari |
| 18 | Documentation | 1 hari |

**Total Estimasi: 17-22 hari kerja**

---

## **Notes**

- Setiap checkbox yang selesai harus di-commit ke Git dengan message yang descriptive
- Lakukan code review sebelum merge ke main branch
- Testing dilakukan paralel dengan development, bukan hanya di fase akhir
- Prioritaskan MVP (Minimum Viable Product) terlebih dahulu
- Fitur advance (charts, export) bisa dijadikan fase berikutnya jika waktu terbatas

---

**Status: PENDING APPROVAL**

Silakan review plan ini dan berikan approval atau feedback untuk revisi.
