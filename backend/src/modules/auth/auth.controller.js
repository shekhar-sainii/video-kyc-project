const authService = require("./auth.service");
const ApiResponse = require("../../core/apiResponse");
const sendEmail = require("../../utils/sendEmail");
const verifyTemplate = require("../../templates/emails/verifyEmail.template");
const resetTemplate = require("../../templates/emails/resetPassword.template");
const { FRONTEND_URL } = require("../../config/env");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {StatusCodes} = require("http-status-codes")

class AuthController {
    async resendVerification(req, res, next) {
        try {
            const { email } = req.body;

            const token = await authService.resendVerification(email);

            if (token) {
                const verificationLink = `${FRONTEND_URL || "https://january-unredeeming-margarete.ngrok-free.dev"}/verify-email?token=${token}`;

                await sendEmail({
                    to: email,
                    subject: "Verify Your Email",
                    html: verifyTemplate(verificationLink),
                });
            }

            return ApiResponse.success(
                res,
                "If account exists, verification email sent."
            );
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const { user, verificationToken } = await authService.register(req.body);

            const verificationLink = `${FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;

            await sendEmail({
                to: user.email,
                subject: "Verify Your Email",
                html: verifyTemplate(verificationLink),
            });

            return ApiResponse.success(
                res,
                "Registered successfully. Please verify your email.",
                user,
                StatusCodes.CREATED
            );
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;

            await authService.verifyEmail(token);

            // return res.redirect(
            //     `${process.env.FRONTEND_URL}/email-verified?status=success`
            // );

            return ApiResponse.success(
                res,
                "Email verified successfully"
            );
        } catch (error) {
            // return res.redirect(
            //     `${process.env.FRONTEND_URL}/email-verified?status=failed`
            // );
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const data = await authService.login(email, password);
            return ApiResponse.success(res, "Login successful", data);
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const data = await authService.refreshAccessToken(refreshToken);
            return ApiResponse.success(res, "Token refreshed", data);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await authService.logout(refreshToken);
            return ApiResponse.success(res, "Logged out successfully");
        } catch (error) {
            next(error);
        }
    }

async googleCallback(req, res, next) {
    try {
        const { token } = req.query; 

        if (!token) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const profile = {
            id: payload.sub,
            displayName: payload.name,
            emails: [{ value: payload.email }]
        };

        const user = await authService.handleGoogleOAuth(profile);

        const accessToken = authService.generateAccessToken({
            id: user._id,
            role: user.role,
        });
        
        const refreshToken = authService.generateRandomToken(64); 

        await authService.saveRefreshToken(user._id, refreshToken);

        return ApiResponse.success(res, "Google login successful", {
            user,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        next(error);
    }
}
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            const token = await authService.forgotPassword(email);

            // if (token) {
            //     console.log(
            //         `Reset link: http://localhost:5000/reset-password?token=${token}`
            //     );
            // }

            if (token) {
                const resetLink = `http://localhost:5173/reset-password?token=${token}`;

                await sendEmail({
                    to: email,
                    subject: "Reset Your Password",
                    html: resetTemplate(resetLink),
                });
            }

            return ApiResponse.success(
                res,
                "If the email exists, a reset link has been sent."
            );
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;

            await authService.resetPassword(token, password);

            return ApiResponse.success(
                res,
                "Password reset successfully"
            );
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
