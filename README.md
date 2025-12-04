# IT Asset Management System

Sistem Manajemen Aset TI (IT Asset Management System) - Aplikasi full-stack untuk mengelola aset teknologi informasi perusahaan.

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **Sequelize** - ORM untuk MySQL
- **MySQL** - Database
- **JWT** - Authentication

### Frontend
- **React** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP Client

## 📦 Features

- ✅ User Management dengan Role-Based Access Control (RBAC)
- ✅ Master Data Management (Categories, Locations)
- ✅ Asset Inventory Management
- ✅ Check-in / Check-out Asset Transactions
- ✅ Asset History & Audit Trail
- ✅ Dashboard & Reporting

## 🛠️ Installation

### Prerequisites
- Node.js v18+
- MySQL 8.0+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi database Anda
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
it-asset-management/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth & validation
│   ├── models/          # Sequelize models
│   ├── routes/          # API endpoints
│   └── index.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios configuration
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── hooks/       # Custom hooks
│   └── index.html
└── docs/                # Documentation
```

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/assets | Get all assets |
| POST | /api/assets | Create new asset |
| POST | /api/transactions/checkout | Checkout asset |
| POST | /api/transactions/checkin | Checkin asset |

## 📄 License

MIT License
