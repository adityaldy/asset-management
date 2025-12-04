# **Plan Implementasi: Sistem Manajemen Aset TI**

Dokumen ini berisi rencana implementasi detail berdasarkan "Perancangan Aplikasi Asset Management Lengkap.md". Setiap task memiliki checkbox untuk tracking progress.

---

## **📊 Progress Tracking**

### **Overall Progress**

| Komponen | Progress | Status |
|----------|----------|--------|
| **Backend** | 85/126 tasks | 🟡 In Progress |
| **Frontend** | 0/98 tasks | 🔴 Not Started |
| **Testing** | 0/17 tasks | 🔴 Not Started |
| **Documentation** | 0/10 tasks | 🔴 Not Started |
| **TOTAL** | **85/251 tasks** | **34%** |

### **Progress per Fase**

| Fase | Nama | Tasks | Done | Progress | Status |
|------|------|-------|------|----------|--------|
| 0 | Setup & Konfigurasi | 17 | 17 | ██████████ 100% | 🟢 |
| 1 | Backend - Models | 29 | 29 | ██████████ 100% | 🟢 |
| 2 | Backend - Auth | 17 | 17 | ██████████ 100% | 🟢 |
| 3 | Backend - Master Data | 22 | 22 | ██████████ 100% | 🟢 |
| 4 | Backend - Asset Mgmt | 18 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 5 | Backend - Transactions | 23 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 6 | Backend - Dashboard | 12 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 7 | Backend - Finalisasi | 18 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 8 | Frontend - Setup | 12 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 9 | Frontend - Layout | 14 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 10 | Frontend - Auth | 7 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 11 | Frontend - Dashboard | 11 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 12 | Frontend - Assets | 23 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 13 | Frontend - Transactions | 14 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 14 | Frontend - Master Data | 12 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 15 | Frontend - Reports | 10 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 16 | Frontend - Components | 11 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 17 | Testing | 17 | 0 | ░░░░░░░░░░ 0% | 🔴 |
| 18 | Documentation | 10 | 0 | ░░░░░░░░░░ 0% | 🔴 |

### **Status Legend**
- 🔴 Not Started (0%)
- 🟡 In Progress (1-99%)
- 🟢 Completed (100%)
- ⏸️ On Hold
- 🔵 Under Review

### **Current Sprint**
- **Active Fase**: Fase 3 (Completed) → Fase 4 (Next)
- **Current Task**: Master Data Management completed
- **Blockers**: None
- **Last Updated**: 2024-12-04

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
- [ ] Buat database MySQL `it_asset_management`
- [x] Konfigurasi koneksi database di `backend/config/Database.js`
- [ ] Test koneksi database

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
- [ ] Buat file `backend/controllers/AssetController.js`
- [ ] Implementasi fungsi:
  - [ ] `getAllAssets` - List dengan pagination, sorting, filtering
  - [ ] `getAssetById` - Detail aset dengan relasi (category, location, holder)
  - [ ] `getAssetHistory` - Riwayat transaksi aset
  - [ ] `createAsset` - Registrasi aset baru
  - [ ] `updateAsset` - Update data aset (bukan status)
  - [ ] `deleteAsset` - Soft delete / retire asset
  - [ ] `searchAssets` - Full-text search

### 4.2 Asset Validation
- [ ] Buat file `backend/middleware/AssetValidation.js`
- [ ] Implementasi validasi dengan Joi:
  - [ ] Validasi create asset request
  - [ ] Validasi update asset request
  - [ ] Validasi uniqueness serial_number
  - [ ] Validasi uniqueness asset_tag
  - [ ] Validasi foreign keys exist

### 4.3 Asset Routes
- [ ] Buat file `backend/routes/AssetRoute.js`
- [ ] Definisikan endpoints:
  - [ ] `GET /api/assets` - List with query params
  - [ ] `GET /api/assets/search` - Search endpoint
  - [ ] `GET /api/assets/:id` - Detail
  - [ ] `GET /api/assets/:id/history` - Transaction history
  - [ ] `POST /api/assets` - Create
  - [ ] `PUT /api/assets/:id` - Update
  - [ ] `DELETE /api/assets/:id` - Delete/Retire

### 4.4 Asset Query Features
- [ ] Implementasi pagination (page, limit)
- [ ] Implementasi sorting (sort_by, order)
- [ ] Implementasi filtering:
  - [ ] Filter by category
  - [ ] Filter by location
  - [ ] Filter by status
  - [ ] Filter by date range
- [ ] Implementasi search (name, serial_number, asset_tag)

---

## **Fase 5: Backend - Transaction Management (Check-in/Check-out)**

### 5.1 Transaction Controller
- [ ] Buat file `backend/controllers/TransactionController.js`
- [ ] Implementasi fungsi:
  - [ ] `checkoutAsset` - Proses peminjaman
  - [ ] `checkinAsset` - Proses pengembalian
  - [ ] `sendToRepair` - Kirim ke perbaikan
  - [ ] `completeRepair` - Selesai perbaikan
  - [ ] `reportLost` - Lapor hilang
  - [ ] `reportFound` - Lapor ditemukan
  - [ ] `disposeAsset` - Penghapusan aset
  - [ ] `getAllTransactions` - List transaksi
  - [ ] `getTransactionById` - Detail transaksi

### 5.2 State Machine Logic
- [ ] Implementasi validasi transisi status:
  - [ ] `available` -> `assigned` (checkout)
  - [ ] `available` -> `repair` (send to repair)
  - [ ] `available` -> `retired` (dispose)
  - [ ] `assigned` -> `available` (checkin good)
  - [ ] `assigned` -> `repair` (checkin damaged)
  - [ ] `assigned` -> `missing` (report lost)
  - [ ] `repair` -> `available` (repair completed)
  - [ ] `repair` -> `retired` (beyond repair)
  - [ ] `missing` -> `available` (found)
  - [ ] `missing` -> `retired` (write-off)
- [ ] Reject invalid transitions dengan error message

### 5.3 Database Transaction (Atomicity)
- [ ] Implementasi Sequelize transaction untuk checkout
- [ ] Implementasi Sequelize transaction untuk checkin
- [ ] Implementasi rollback on error
- [ ] Test atomicity (simulate failure)

### 5.4 Transaction Validation
- [ ] Buat file `backend/middleware/TransactionValidation.js`
- [ ] Validasi checkout request:
  - [ ] Asset UUID valid
  - [ ] User UUID valid
  - [ ] Asset status === 'available'
  - [ ] Transaction date valid
- [ ] Validasi checkin request:
  - [ ] Asset UUID valid
  - [ ] Asset status === 'assigned'
  - [ ] Condition status required
  - [ ] Transaction date valid

### 5.5 Transaction Routes
- [ ] Buat file `backend/routes/TransactionRoute.js`
- [ ] Definisikan endpoints:
  - [ ] `POST /api/transactions/checkout`
  - [ ] `POST /api/transactions/checkin`
  - [ ] `POST /api/transactions/repair`
  - [ ] `POST /api/transactions/complete-repair`
  - [ ] `POST /api/transactions/report-lost`
  - [ ] `POST /api/transactions/report-found`
  - [ ] `POST /api/transactions/dispose`
  - [ ] `GET /api/transactions`
  - [ ] `GET /api/transactions/:id`

---

## **Fase 6: Backend - Dashboard & Reporting**

### 6.1 Dashboard Controller
- [ ] Buat file `backend/controllers/DashboardController.js`
- [ ] Implementasi fungsi:
  - [ ] `getSummaryStats` - Total assets by status
  - [ ] `getAssetsByCategory` - Count per category
  - [ ] `getAssetsByLocation` - Count per location
  - [ ] `getRecentTransactions` - Latest 10 transactions
  - [ ] `getAssetsNearWarrantyExpiry` - (Future)

### 6.2 Report Controller
- [ ] Buat file `backend/controllers/ReportController.js`
- [ ] Implementasi fungsi:
  - [ ] `getAssetReport` - Exportable asset list
  - [ ] `getTransactionReport` - Exportable transaction history
  - [ ] `getAuditLog` - Full audit trail

### 6.3 Dashboard & Report Routes
- [ ] Buat file `backend/routes/DashboardRoute.js`
- [ ] Definisikan endpoints:
  - [ ] `GET /api/dashboard/summary`
  - [ ] `GET /api/dashboard/by-category`
  - [ ] `GET /api/dashboard/by-location`
  - [ ] `GET /api/dashboard/recent-transactions`
  - [ ] `GET /api/reports/assets`
  - [ ] `GET /api/reports/transactions`

---

## **Fase 7: Backend - Finalisasi**

### 7.1 Error Handling
- [ ] Buat global error handler middleware
- [ ] Standardisasi format error response
- [ ] Implementasi error codes (VAL_ERR_001, etc.)
- [ ] Log errors untuk debugging

### 7.2 Response Standardization
- [ ] Buat helper function untuk success response
- [ ] Buat helper function untuk error response
- [ ] Implementasi meta untuk pagination
- [ ] Konsisten dengan format JSON yang ditentukan

### 7.3 Security Hardening
- [ ] Implementasi helmet.js untuk HTTP headers
- [ ] Implementasi rate limiting
- [ ] Sanitize input untuk prevent SQL injection
- [ ] Validasi dan sanitize semua user input
- [ ] Setup CORS dengan whitelist origin

### 7.4 Main Entry Point
- [ ] Buat/update `backend/index.js`
- [ ] Register semua routes
- [ ] Setup middleware (cors, json parser, cookie parser)
- [ ] Database sync
- [ ] Server listen

### 7.5 Seeding Data
- [ ] Buat file `backend/seeders/seed.js`
- [ ] Seed default admin user
- [ ] Seed sample categories (Laptop, Monitor, Server, etc.)
- [ ] Seed sample locations (HQ, Warehouse A, etc.)
- [ ] Seed sample employees
- [ ] Seed sample assets (opsional)

---

## **Fase 8: Frontend - Setup & Struktur**

### 8.1 Project Structure
- [ ] Setup folder structure:
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
- [ ] Buat file `frontend/src/api/axios.js`
- [ ] Setup base URL dari environment
- [ ] Implementasi request interceptor (attach token)
- [ ] Implementasi response interceptor (refresh token)
- [ ] Handle 401 redirect to login

### 8.3 Auth Context
- [ ] Buat file `frontend/src/context/AuthContext.jsx`
- [ ] Implementasi state:
  - [ ] `user` - Current user data
  - [ ] `token` - Access token
  - [ ] `isAuthenticated` - Boolean
  - [ ] `isLoading` - Loading state
- [ ] Implementasi functions:
  - [ ] `login` - Call login API, set state
  - [ ] `logout` - Clear state, call logout API
  - [ ] `refreshToken` - Auto refresh logic

### 8.4 Protected Route Component
- [ ] Buat file `frontend/src/components/common/ProtectedRoute.jsx`
- [ ] Check authentication status
- [ ] Redirect to login if not authenticated
- [ ] Check role-based access

---

## **Fase 9: Frontend - Layout & Navigation**

### 9.1 Main Layout
- [ ] Buat file `frontend/src/components/layout/MainLayout.jsx`
- [ ] Implementasi responsive layout dengan sidebar

### 9.2 Sidebar Component
- [ ] Buat file `frontend/src/components/layout/Sidebar.jsx`
- [ ] Menu items:
  - [ ] Dashboard
  - [ ] Assets
  - [ ] Transactions (Check-in/out)
  - [ ] Categories (Master Data)
  - [ ] Locations (Master Data)
  - [ ] Users (Admin only)
  - [ ] Reports
- [ ] Active state indicator
- [ ] Collapsible on mobile

### 9.3 Navbar Component
- [ ] Buat file `frontend/src/components/layout/Navbar.jsx`
- [ ] User info display
- [ ] Logout button
- [ ] Mobile menu toggle

### 9.4 Routing Setup
- [ ] Buat file `frontend/src/App.jsx` dengan routes
- [ ] Setup routes:
  - [ ] `/login` - Public
  - [ ] `/` - Dashboard (Protected)
  - [ ] `/assets` - Asset List (Protected)
  - [ ] `/assets/add` - Add Asset (Protected)
  - [ ] `/assets/:id` - Asset Detail (Protected)
  - [ ] `/assets/:id/edit` - Edit Asset (Protected)
  - [ ] `/transactions` - Transaction List (Protected)
  - [ ] `/checkout` - Checkout Form (Protected)
  - [ ] `/checkin` - Checkin Form (Protected)
  - [ ] `/categories` - Category Management (Protected)
  - [ ] `/locations` - Location Management (Protected)
  - [ ] `/users` - User Management (Admin)
  - [ ] `/reports` - Reports (Protected)

---

## **Fase 10: Frontend - Authentication Pages**

### 10.1 Login Page
- [ ] Buat file `frontend/src/pages/Login.jsx`
- [ ] Form fields:
  - [ ] Email input with validation
  - [ ] Password input
  - [ ] Remember me checkbox (optional)
  - [ ] Submit button with loading state
- [ ] Error message display
- [ ] Redirect to dashboard on success

### 10.2 Login Form Validation
- [ ] Email format validation
- [ ] Required field validation
- [ ] Display validation errors inline

---

## **Fase 11: Frontend - Dashboard**

### 11.1 Dashboard Page
- [ ] Buat file `frontend/src/pages/Dashboard.jsx`
- [ ] Fetch summary data on mount

### 11.2 Summary Cards
- [ ] Buat file `frontend/src/components/dashboard/SummaryCard.jsx`
- [ ] Cards to display:
  - [ ] Total Assets
  - [ ] Available Assets
  - [ ] Assigned Assets
  - [ ] Assets in Repair
  - [ ] Retired Assets

### 11.3 Charts (Optional)
- [ ] Assets by Category (Bar/Pie chart)
- [ ] Assets by Location (Bar chart)
- [ ] Assets by Status (Donut chart)

### 11.4 Recent Transactions Table
- [ ] Buat file `frontend/src/components/dashboard/RecentTransactions.jsx`
- [ ] Display latest 10 transactions
- [ ] Columns: Date, Asset, Action, User, Admin

---

## **Fase 12: Frontend - Asset Management**

### 12.1 Asset List Page
- [ ] Buat file `frontend/src/pages/AssetList.jsx`
- [ ] Fetch assets with pagination
- [ ] Implementasi features:
  - [ ] Search bar (global search)
  - [ ] Filter dropdowns (Category, Location, Status)
  - [ ] Sortable columns
  - [ ] Pagination controls
  - [ ] Add Asset button

### 12.2 Asset Table Component
- [ ] Buat file `frontend/src/components/assets/AssetTable.jsx`
- [ ] Columns:
  - [ ] Asset Tag
  - [ ] Name
  - [ ] Category (badge)
  - [ ] Location
  - [ ] Status (colored badge)
  - [ ] Current Holder
  - [ ] Actions (View, Edit, Delete)
- [ ] Status badges dengan warna:
  - [ ] Available: Green
  - [ ] Assigned: Blue
  - [ ] In Repair: Yellow
  - [ ] Retired: Gray
  - [ ] Missing: Red

### 12.3 Add Asset Page
- [ ] Buat file `frontend/src/pages/AddAsset.jsx`
- [ ] Form fields:
  - [ ] Name (text)
  - [ ] Asset Tag (text, auto-generate option)
  - [ ] Serial Number (text)
  - [ ] Category (dropdown)
  - [ ] Location (dropdown)
  - [ ] Purchase Date (date picker)
  - [ ] Price (number)
  - [ ] Specifications (JSON editor / dynamic fields)
- [ ] Form validation
- [ ] Submit with loading state
- [ ] Success notification & redirect

### 12.4 Asset Detail Page
- [ ] Buat file `frontend/src/pages/AssetDetail.jsx`
- [ ] Display all asset info
- [ ] Tab: Details
- [ ] Tab: Transaction History
- [ ] Action buttons based on status:
  - [ ] Check-out (if available)
  - [ ] Check-in (if assigned)
  - [ ] Send to Repair
  - [ ] Dispose

### 12.5 Edit Asset Page
- [ ] Buat file `frontend/src/pages/EditAsset.jsx`
- [ ] Pre-fill form with existing data
- [ ] Same fields as Add Asset
- [ ] Update API call

### 12.6 Asset History Component
- [ ] Buat file `frontend/src/components/assets/AssetHistory.jsx`
- [ ] Timeline view of transactions
- [ ] Display: Date, Action, User, Admin, Notes

---

## **Fase 13: Frontend - Transaction Management**

### 13.1 Transaction List Page
- [ ] Buat file `frontend/src/pages/TransactionList.jsx`
- [ ] Fetch transactions with pagination
- [ ] Filter by action type
- [ ] Filter by date range
- [ ] Search by asset name/tag

### 13.2 Checkout Page
- [ ] Buat file `frontend/src/pages/Checkout.jsx`
- [ ] Form fields:
  - [ ] Asset selection (searchable dropdown, filter: available only)
  - [ ] Employee selection (searchable dropdown)
  - [ ] Transaction Date (date picker)
  - [ ] Notes (textarea)
- [ ] Display selected asset info
- [ ] Form validation
- [ ] Submit with confirmation modal

### 13.3 Checkin Page
- [ ] Buat file `frontend/src/pages/Checkin.jsx`
- [ ] Form fields:
  - [ ] Asset selection (searchable dropdown, filter: assigned only)
  - [ ] Display current holder (auto-filled)
  - [ ] Condition Status (radio: Good, Damaged, Lost)
  - [ ] Transaction Date (date picker)
  - [ ] Notes (textarea, required if Damaged/Lost)
- [ ] Form validation
- [ ] Submit with confirmation modal

### 13.4 Searchable Dropdown Component
- [ ] Buat file `frontend/src/components/forms/SearchableSelect.jsx`
- [ ] Async search capability
- [ ] Display selected item
- [ ] Clear selection option

---

## **Fase 14: Frontend - Master Data Management**

### 14.1 Category Management Page
- [ ] Buat file `frontend/src/pages/Categories.jsx`
- [ ] List all categories
- [ ] Add new category (modal/inline form)
- [ ] Edit category (modal)
- [ ] Delete category (confirmation modal)

### 14.2 Location Management Page
- [ ] Buat file `frontend/src/pages/Locations.jsx`
- [ ] List all locations
- [ ] Add new location (modal/inline form)
- [ ] Edit location (modal)
- [ ] Delete location (confirmation modal)

### 14.3 User Management Page (Admin Only)
- [ ] Buat file `frontend/src/pages/Users.jsx`
- [ ] List all users with role filter
- [ ] Add new user form
- [ ] Edit user (modal)
- [ ] Deactivate user
- [ ] Reset password (Admin only)

### 14.4 Reusable Modal Component
- [ ] Buat file `frontend/src/components/common/Modal.jsx`
- [ ] Configurable title, content, actions
- [ ] Close on overlay click (optional)
- [ ] Close on Escape key

### 14.5 Confirmation Dialog Component
- [ ] Buat file `frontend/src/components/common/ConfirmDialog.jsx`
- [ ] Confirm/Cancel buttons
- [ ] Customizable message
- [ ] Danger variant for destructive actions

---

## **Fase 15: Frontend - Reports**

### 15.1 Reports Page
- [ ] Buat file `frontend/src/pages/Reports.jsx`
- [ ] Report type selection:
  - [ ] Asset Inventory Report
  - [ ] Transaction History Report

### 15.2 Asset Report
- [ ] Filter options:
  - [ ] Category
  - [ ] Location
  - [ ] Status
  - [ ] Date range (purchase date)
- [ ] Display results in table
- [ ] Export to CSV button

### 15.3 Transaction Report
- [ ] Filter options:
  - [ ] Action type
  - [ ] Date range
  - [ ] User/Employee
- [ ] Display results in table
- [ ] Export to CSV button

### 15.4 Export Utility
- [ ] Buat file `frontend/src/utils/export.js`
- [ ] Implementasi CSV export function
- [ ] Handle special characters

---

## **Fase 16: Frontend - Common Components**

### 16.1 Loading Components
- [ ] Buat file `frontend/src/components/common/Spinner.jsx`
- [ ] Buat file `frontend/src/components/common/TableSkeleton.jsx`
- [ ] Buat file `frontend/src/components/common/PageLoader.jsx`

### 16.2 Empty State Component
- [ ] Buat file `frontend/src/components/common/EmptyState.jsx`
- [ ] Customizable icon, message, action

### 16.3 Error State Component
- [ ] Buat file `frontend/src/components/common/ErrorState.jsx`
- [ ] Display error message
- [ ] Retry button

### 16.4 Status Badge Component
- [ ] Buat file `frontend/src/components/common/StatusBadge.jsx`
- [ ] Color mapping for each status
- [ ] Consistent styling

### 16.5 Pagination Component
- [ ] Buat file `frontend/src/components/common/Pagination.jsx`
- [ ] Page numbers
- [ ] Previous/Next buttons
- [ ] Items per page selector
- [ ] Total items display

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
