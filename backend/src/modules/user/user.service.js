const bcrypt = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");
const UserRepository = require("./user.repository");
const UserResponseDTO = require("./dtos/userResponse.dto");
const { uploadImage } = require("../../services/cloudinary.service");
const {StatusCodes} = require("http-status-codes")

class UserService {
    async getSecurityLogs({ page = 1, limit = 10, search = "" } = {}) {
        const logsDir = path.resolve(process.cwd(), "logs");
        const combinedLogPath = path.join(logsDir, "combined.log");

        let content = "";

        try {
            content = await fs.readFile(combinedLogPath, "utf8");
        } catch (error) {
            if (error.code === "ENOENT") {
                return {
                    metrics: {
                        totalEvents: 0,
                        securityAlerts: 0,
                        lastSync: "No logs yet",
                        nodeStatus: "Healthy",
                    },
                    pagination: {
                        page,
                        limit,
                        total: 0,
                    },
                    logs: [],
                };
            }

            throw error;
        }

        const rows = content
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line, index) => {
                try {
                    const parsed = JSON.parse(line);
                    const level = (parsed.level || "info").toLowerCase();
                    const message = parsed.message || "System event";
                    const timestamp = parsed.timestamp || new Date().toISOString();
                    const method = parsed.method || "-";
                    const requestPath = parsed.path || parsed.meta?.req?.url || "-";

                    return {
                        id: `LOG-${index + 1}`,
                        action: message.toUpperCase().replace(/\s+/g, "_"),
                        user: parsed.userId || parsed.user || "SYSTEM",
                        target: requestPath,
                        timestamp,
                        ip: parsed.ip || parsed.meta?.req?.ip || "Server",
                        status:
                            level === "error"
                                ? "Critical"
                                : level === "warn"
                                    ? "Warning"
                                    : "Info",
                        method,
                        rawMessage: message,
                    };
                } catch {
                    return {
                        id: `LOG-${index + 1}`,
                        action: "RAW_LOG",
                        user: "SYSTEM",
                        target: "-",
                        timestamp: new Date().toISOString(),
                        ip: "Server",
                        status: "Info",
                        method: "-",
                        rawMessage: line,
                    };
                }
            })
            .reverse();

        const securityAlerts = rows.filter((row) => row.status === "Critical" || row.status === "Warning").length;
        const normalizedSearch = search.trim().toLowerCase();
        const filteredRows = normalizedSearch
            ? rows.filter((row) =>
                row.action.toLowerCase().includes(normalizedSearch) ||
                row.ip.toLowerCase().includes(normalizedSearch) ||
                row.user.toLowerCase().includes(normalizedSearch) ||
                row.target.toLowerCase().includes(normalizedSearch) ||
                row.rawMessage.toLowerCase().includes(normalizedSearch)
            )
            : rows;
        const total = filteredRows.length;
        const startIndex = (page - 1) * limit;
        const paginatedRows = filteredRows.slice(startIndex, startIndex + limit);

        return {
            metrics: {
                totalEvents: rows.length,
                securityAlerts,
                lastSync: rows[0]?.timestamp
                    ? new Date(rows[0].timestamp).toLocaleString()
                    : "No logs yet",
                nodeStatus: "Healthy",
            },
            pagination: {
                page,
                limit,
                total,
            },
            logs: paginatedRows,
        };
    }

    async getProfile(userId) {
        const user = await UserRepository.findById(userId);

        if (!user || !user.isActive) {
            const error = new Error("User not found");
            error.statusCode = StatusCodes.NOT_FOUND;
            throw error;
        }

        return new UserResponseDTO(user);
    }

    async updateProfile(userId, data) {
        const updatePayload = {
            name: data.name,
            phone: data.phone || "",
            address: data.address || "",
        };

        if (typeof data.profileImage === "string") {
            updatePayload.profileImage = await uploadImage(data.profileImage);
        }

        const updatedUser = await UserRepository.updateById(userId, updatePayload);

        if (!updatedUser) {
            const error = new Error("User not found");
            error.statusCode = StatusCodes.NOT_FOUND;
            throw error;
        }

        return new UserResponseDTO(updatedUser);
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await UserRepository.findById(userId);

        if (!user || !user.password) {
            const error = new Error("User not found");
            error.statusCode = StatusCodes.NOT_FOUND;
            throw error;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            const error = new Error("Current password is incorrect");
            error.statusCode = StatusCodes.BAD_REQUEST;
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
            error.statusCode = StatusCodes.NOT_FOUND;
            throw error;
        }

        return true;
    }

async getAllUsers({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [users, totalUsers] = await Promise.all([
        UserRepository.model
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        UserRepository.model.countDocuments(),
    ]);

    return {
        users: users.map((user) => new UserResponseDTO(user)),
        pagination: {
            currentPage: page,
            limit,
            totalUsers,
            totalPages: Math.max(1, Math.ceil(totalUsers / limit)),
        },
    };
}

async getAdminSecurityLogs() {
    return await this.getSecurityLogs.apply(this, arguments);
}

async deactivateUser(userId) {
    const user = await UserRepository.updateById(userId, {
        isActive: false,
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = StatusCodes.NOT_FOUND;
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
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    return new UserResponseDTO(user);
}
}

module.exports = new UserService();
