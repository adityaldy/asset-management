import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse, ErrorCodes } from "../utils/responseHelper.js";

/**
 * Register new user (Admin only)
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    const { name, email, password, role, department } = req.body;

    try {
        // Validasi input
        if (!name || !email) {
            return errorResponse(
                res,
                'Nama dan email wajib diisi',
                400,
                ErrorCodes.MISSING_FIELD
            );
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return errorResponse(
                res,
                'Email sudah terdaftar',
                400,
                ErrorCodes.DUPLICATE_ENTRY
            );
        }

        // Hash password jika ada (untuk admin/staff)
        let hashedPassword = null;
        if (password) {
            if (password.length < 6) {
                return errorResponse(
                    res,
                    'Password minimal 6 karakter',
                    400,
                    ErrorCodes.VALIDATION_ERROR
                );
            }
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Validasi role
        const validRoles = ['admin', 'staff', 'employee'];
        const userRole = role && validRoles.includes(role) ? role : 'employee';

        // Buat user baru
        const newUser = await Users.create({
            name,
            email,
            password: hashedPassword,
            role: userRole,
            department: department || null
        });

        return successResponse(
            res,
            {
                uuid: newUser.uuid,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                department: newUser.department
            },
            'User berhasil didaftarkan',
            201
        );
    } catch (error) {
        console.error('Register error:', error);
        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            500,
            ErrorCodes.INTERNAL_ERROR
        );
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validasi input
        if (!email || !password) {
            return errorResponse(
                res,
                'Email dan password wajib diisi',
                400,
                ErrorCodes.MISSING_FIELD
            );
        }

        // Cari user berdasarkan email
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return errorResponse(
                res,
                'Email atau password salah',
                401,
                ErrorCodes.INVALID_CREDENTIALS
            );
        }

        // Cek apakah user memiliki password (bukan employee tanpa akses)
        if (!user.password) {
            return errorResponse(
                res,
                'Akun ini tidak memiliki akses login',
                401,
                ErrorCodes.INVALID_CREDENTIALS
            );
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return errorResponse(
                res,
                'Email atau password salah',
                401,
                ErrorCodes.INVALID_CREDENTIALS
            );
        }

        // Generate tokens
        const accessToken = jwt.sign(
            {
                userId: user.id,
                uuid: user.uuid,
                email: user.email,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
        );

        const refreshToken = jwt.sign(
            {
                userId: user.id,
                uuid: user.uuid
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
        );

        // Simpan refresh token ke database
        await Users.update(
            { refreshToken },
            { where: { id: user.id } }
        );

        // Set refresh token di HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return successResponse(
            res,
            {
                user: {
                    uuid: user.uuid,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department
                },
                accessToken
            },
            'Login berhasil'
        );
    } catch (error) {
        console.error('Login error:', error);
        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            500,
            ErrorCodes.INTERNAL_ERROR
        );
    }
};

/**
 * Refresh access token
 * GET /api/auth/token
 */
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return errorResponse(
                res,
                'Refresh token tidak ditemukan',
                401,
                ErrorCodes.REFRESH_TOKEN_INVALID
            );
        }

        // Cari user dengan refresh token ini
        const user = await Users.findOne({ where: { refreshToken } });
        if (!user) {
            return errorResponse(
                res,
                'Refresh token tidak valid',
                403,
                ErrorCodes.REFRESH_TOKEN_INVALID
            );
        }

        // Verifikasi refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return errorResponse(
                    res,
                    'Refresh token tidak valid atau sudah kadaluarsa',
                    403,
                    ErrorCodes.REFRESH_TOKEN_INVALID
                );
            }

            // Generate access token baru
            const newAccessToken = jwt.sign(
                {
                    userId: user.id,
                    uuid: user.uuid,
                    email: user.email,
                    role: user.role
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
            );

            return successResponse(
                res,
                { accessToken: newAccessToken },
                'Token berhasil diperbarui'
            );
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            500,
            ErrorCodes.INTERNAL_ERROR
        );
    }
};

/**
 * Logout user
 * DELETE /api/auth/logout
 */
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return successResponse(res, null, 'Logout berhasil');
        }

        // Cari user dengan refresh token ini
        const user = await Users.findOne({ where: { refreshToken } });
        if (user) {
            // Hapus refresh token dari database
            await Users.update(
                { refreshToken: null },
                { where: { id: user.id } }
            );
        }

        // Hapus cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return successResponse(res, null, 'Logout berhasil');
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            500,
            ErrorCodes.INTERNAL_ERROR
        );
    }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        const user = await Users.findOne({
            where: { id: req.userId },
            attributes: ['uuid', 'name', 'email', 'role', 'department', 'created_at']
        });

        if (!user) {
            return errorResponse(
                res,
                'User tidak ditemukan',
                404,
                ErrorCodes.NOT_FOUND
            );
        }

        return successResponse(
            res,
            user,
            'Data user berhasil diambil'
        );
    } catch (error) {
        console.error('Get me error:', error);
        return errorResponse(
            res,
            'Terjadi kesalahan pada server',
            500,
            ErrorCodes.INTERNAL_ERROR
        );
    }
};
