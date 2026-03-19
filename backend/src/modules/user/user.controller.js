const userService = require("./user.service");
const ApiResponse = require("../../core/apiResponse");
const {StatusCodes} = require("http-status-codes")

class UserController {

    async getProfile(req, res, next) {
        try {
            const userId = req.user.id; // from auth middleware
            const data = await userService.getProfile(userId);

            return ApiResponse.success(res, "Profile fetched successfully", data);
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await userService.updateProfile(userId, {
                ...req.body,
                profileImage: req.file ? req.file.path : undefined,
            });

            return ApiResponse.success(res, "Profile updated successfully", data);
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            await userService.changePassword(userId, currentPassword, newPassword);

            return ApiResponse.success(res, "Password changed successfully");
        } catch (error) {
            next(error);
        }
    }

    async deleteAccount(req, res, next) {
        try {
            const userId = req.user.id;

            await userService.deleteAccount(userId);

            return ApiResponse.success(res, "Account deleted successfully");
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const page = Math.max(Number(req.query.page) || 1, 1);
            const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 1000);
            const data = await userService.getAllUsers({ page, limit });
            return ApiResponse.success(res, "Users fetched successfully", data);
        } catch (error) {
            next(error);
        }
    }

    async getSecurityLogs(req, res, next) {
        try {
            const page = Math.max(Number(req.query.page) || 1, 1);
            const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
            const search = typeof req.query.search === "string" ? req.query.search : "";
            const data = await userService.getAdminSecurityLogs({ page, limit, search });
            return ApiResponse.success(res, "Security logs fetched successfully", data);
        } catch (error) {
            next(error);
        }
    }

    async deactivateUser(req, res, next) {
        try {
            const { id } = req.params;
            const data = await userService.deactivateUser(id);

            return ApiResponse.success(res, "User deactivated successfully", data);
        } catch (error) {
            next(error);
        }
    }

    async activateUser(req, res, next) {
        try {
            const { id } = req.params;
            const data = await userService.activateUser(id);

            return ApiResponse.success(res, "User activated successfully", data);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
