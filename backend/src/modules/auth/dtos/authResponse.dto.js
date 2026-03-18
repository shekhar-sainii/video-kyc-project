const UserResponseDTO = require("./userResponse.dto");

class AuthResponseDTO {
    constructor(user, accessToken, refreshToken) {
        this.user = new UserResponseDTO(user);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}

module.exports = AuthResponseDTO;