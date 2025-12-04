import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { db } from "./models/index.js";
import { errorHandler, notFoundHandler } from "./middleware/ErrorHandler.js";

// Import Routes
import AuthRoute from "./routes/AuthRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import LocationRoute from "./routes/LocationRoute.js";
import UserRoute from "./routes/UserRoute.js";
import AssetRoute from "./routes/AssetRoute.js";
import TransactionRoute from "./routes/TransactionRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";
import ReportRoute from "./routes/ReportRoute.js";
import ChatRoute from "./routes/ChatRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS must be first to handle preflight requests
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests, please try again later."
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: {
        success: false,
        message: "Too many login attempts, please try again later."
    }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', AuthRoute);
app.use('/api/categories', CategoryRoute);
app.use('/api/locations', LocationRoute);
app.use('/api/users', UserRoute);
app.use('/api/assets', AssetRoute);
app.use('/api/transactions', TransactionRoute);
app.use('/api/dashboard', DashboardRoute);
app.use('/api/reports', ReportRoute);
app.use('/api/chat', ChatRoute);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Database connection and sync
const startServer = async () => {
    try {
        // Test database connection
        await db.authenticate();
        console.log('✅ Database connection established successfully.');

        // Sync all models (create tables if not exist)
        // Options:
        // - No options: Only create tables if they don't exist (recommended for production)
        // - { alter: true }: Auto-update schema (development only, slow)
        // - { force: true }: Drop and recreate all tables (DANGER - loses data!)
        // Skip sync if tables already exist - just validate connection
        if (process.env.NODE_ENV === 'development') {
            await db.sync();
            console.log('✅ Database synchronized successfully.');
        } else {
            console.log('✅ Database ready (sync skipped in production).');
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 API URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        process.exit(1);
    }
};

startServer();

export default app;
