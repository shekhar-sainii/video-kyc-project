class UserResponseDTO {
    constructor(user) {
        this.id = user._id;
        this.name = user.name;
        this.email = user.email;
        this.role = user.role;
        this.isEmailVerified = user.isEmailVerified;
        this.subscription = user.subscription;
        this.lastLoginAt = user.lastLoginAt;
        this.createdAt = user.createdAt;
    }
}

module.exports = UserResponseDTO;