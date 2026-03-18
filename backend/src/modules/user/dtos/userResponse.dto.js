class UserResponseDTO {
    constructor(user) {
        this.id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.phone = user.phone || "";
        this.address = user.address || "";
        this.profileImage = user.profileImage || "";
        this.role = user.role;
        this.isActive = user.isActive;
        this.isEmailVerified = user.isEmailVerified;
        this.subscription = user.subscription;
        this.lastLoginAt = user.lastLoginAt;
        this.createdAt = user.createdAt;
    }
}

module.exports = UserResponseDTO;
