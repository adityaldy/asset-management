import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { db } from "./models/index.js";
import { errorHandler, notFoundHandler } from "./middleware/ErrorHandler.js";

// Import Routes
import AuthRoute from "./routes/AuthRoute.js";
import CategoryRoute from "./routes/CategoryRoute.js";
import LocationRoute from "./routes/LocationRoute.js";
import UserRoute from "./routes/UserRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        // Use { alter: true } in development to auto-update schema
        // Use { force: true } only to drop and recreate all tables (DANGER!)
        await db.sync({ alter: true });
        console.log('✅ Database synchronized successfully.');

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
