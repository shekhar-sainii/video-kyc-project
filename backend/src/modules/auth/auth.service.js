const bcrypt = require("bcryptjs");
const { MAX_LOGIN_ATTEMPTS, LOCK_TIME } = require("../../utils/constants");
const AuthResponseDTO = require("./dtos/authResponse.dto");

const authRepository = require("./auth.repository");

const { generateAccessToken } = require("../../utils/jwt");
const { generateRandomToken, hashToken } = require("../../utils/token");
const UserResponseDTO = require("./dtos/userResponse.dto");
const {StatusCodes} = require("http-status-codes")

class AuthService {

    async resendVerification(email) {
        const user = await authRepository.findUserByEmail(email);

        if (!user) return true;
        if (user.isEmailVerified) return true;

        const token = await this.createEmailVerification(user._id);
        return token;
    }

    async verifyEmail(token) {
        const hashedToken = hashToken(token);

        const record = await authRepository.findVerificationToken(hashedToken);
        if (!record) {
            const error = new Error("Invalid or expired token");
            error.statusCode = StatusCodes.BAD_REQUEST;
            throw error;
        }

        await authRepository.updateUser(record.user, {
            isEmailVerified: true,
        });

        await authRepository.deleteVerificationToken(hashedToken);

        return true;
    }

    async createEmailVerification(userId) {
        const token = generateRandomToken(32);
        const hashedToken = hashToken(token);

        await authRepository.deleteVerificationByUser(userId, "emailVerification");

        await authRepository.createVerificationToken({
            user: userId,
            token: hashedToken,
            type: "emailVerification",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        });

        return token;
    }

    async saveRefreshToken(userId, refreshToken) {
        const hashed = hashToken(refreshToken);

        await authRepository.saveRefreshToken({
            user: userId,
            token: hashed,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
    }

    async register(data) {
        const existingUser = await authRepository.findUserByEmail(data.email);
        if (existingUser) {
            const error = new Error("Email already registered");
            error.statusCode = StatusCodes.BAD_REQUEST;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await authRepository.createUser({
            ...data,
            password: hashedPassword,
        });

        const verificationToken =
            await this.createEmailVerification(user._id);

        // return { user, verificationToken };
        return {
            user: new UserResponseDTO(user),
            verificationToken
        };
    }

    async login(email, password) {
        const user = await authRepository.findUserByEmail(email);

        if (!user || !user.password) {
            const error = new Error("Invalid credentials");
            error.statusCode = StatusCodes.UNAUTHORIZED;
            throw error;
        }

        if (user.lockUntil && user.lockUntil > Date.now()) {
            const error = new Error("Account is temporarily locked. Try again later.");
            error.statusCode = StatusCodes.LOCKED
            throw error;
        }

        if (!user.isEmailVerified) {
            const error = new Error("Please verify your email first");
            error.statusCode = StatusCodes.FORBIDDEN;
            error.code = "EMAIL_NOT_VERIFIED";
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            user.failedLoginAttempts += 1;

            if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                user.lockUntil = new Date(Date.now() + LOCK_TIME);
                user.failedLoginAttempts = 0;
            }

            await user.save();

            const error = new Error("Invalid credentials");
            error.statusCode = StatusCodes.UNAUTHORIZED;
            throw error;
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lastLoginAt = new Date();
        await user.save();

        const accessToken = generateAccessToken({
            id: user._id,
            role: user.role,
        });

        const refreshToken = generateRandomToken();

        await this.saveRefreshToken(user._id, refreshToken);

        // return { user, accessToken, refreshToken };
        return new AuthResponseDTO(user, accessToken, refreshToken);
    }

    async refreshAccessToken(token) {
        const hashed = hashToken(token);

        const stored = await authRepository.findRefreshToken(hashed);
        if (!stored) {
            const error = new Error("Invalid refresh token");
            error.statusCode = StatusCodes.UNAUTHORIZED;
            throw error;
        }

        const user = await authRepository.findUserById(stored.user);

        return {
            accessToken: generateAccessToken({
                id: user._id,
                role: user.role,
            }),
        };
    }

    async logout(token) {
        const hashed = hashToken(token);
        await authRepository.deleteRefreshToken(hashed);
    }

    async handleGoogleOAuth(profile) {
        const email = profile.emails[0].value;
        const providerId = profile.id;

        let user = await authRepository.findUserByEmail(email);

        if (user) {
            const alreadyLinked = user.providers.find(
                (p) => p.provider === "google"
            );

            if (!alreadyLinked) {
                user = await authRepository.addOAuthProvider(user._id, {
                    provider: "google",
                    providerId,
                });
            }
        } else {
            user = await authRepository.createUser({
                name: profile.displayName,
                email,
                providers: [{ provider: "google", providerId }],
                isEmailVerified: true,
            });
        }

        user.lastLoginAt = new Date();
        await user.save();

        return user;
    }

    async forgotPassword(email) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) return true;

        const rawToken = generateRandomToken(32);
        const hashedToken = hashToken(rawToken);

        await authRepository.deleteVerificationByUser(user._id, "passwordReset");

        await authRepository.createVerificationToken({
            user: user._id,
            token: hashedToken,
            type: "passwordReset",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });

        return rawToken;
    }

    async resetPassword(token, newPassword) {
        const hashedToken = hashToken(token);

        const record = await authRepository.findVerificationToken(hashedToken);

        if (
            !record ||
            record.type !== "passwordReset" ||
            record.expiresAt < new Date()
        ) {
            const error = new Error("Invalid or expired token");
            error.statusCode = StatusCodes.BAD_REQUEST;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await authRepository.updateUser(record.user, {
            password: hashedPassword,
            failedLoginAttempts: 0,
            lockUntil: null,
        });

        await authRepository.deleteVerificationToken(hashedToken);

        return true;
    }

    generateAccessToken(payload) {
        return generateAccessToken(payload); 
    }

    generateRandomToken(length = 32) {
        return generateRandomToken(length);
    }
}

module.exports = new AuthService();