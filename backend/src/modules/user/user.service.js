const bcrypt = require("bcryptjs");
const UserRepository = require("./user.repository");
const UserResponseDTO = require("./dtos/userResponse.dto");

class UserService {

    async getProfile(userId) {
        const user = await UserRepository.findById(userId);

        if (!user || !user.isActive) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return new UserResponseDTO(user);
    }

    async updateProfile(userId, data) {
        const updatedUser = await UserRepository.updateById(userId, {
            name: data.name,
        });

        if (!updatedUser) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return new UserResponseDTO(updatedUser);
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await UserRepository.findById(userId);

        if (!user || !user.password) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            const error = new Error("Current password is incorrect");
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await UserRepository.updateById(userId, {
            password: hashedPassword,
        });

        return true;
    }

    async deleteAccount(userId) {
        const user = await UserRepository.softDelete(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return true;
    }

    async getAllUsers() {
    const users = await UserRepository.model.find();

    return users.map(user => new UserResponseDTO(user));
}

async deactivateUser(userId) {
    const user = await UserRepository.updateById(userId, {
        isActive: false,
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return new UserResponseDTO(user);
}

async activateUser(userId) {
    const user = await UserRepository.updateById(userId, {
        isActive: true,
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return new UserResponseDTO(user);
}
}

module.exports = new UserService();