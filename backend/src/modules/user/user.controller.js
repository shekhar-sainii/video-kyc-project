const userService = require("./user.service");
const ApiResponse = require("../../core/apiResponse");

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
        const data = await userService.getAllUsers();
        return ApiResponse.success(res, "Users fetched successfully", data);
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
