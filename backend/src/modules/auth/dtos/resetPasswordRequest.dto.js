class ResetPasswordRequestDTO {
    constructor(data) {
        this.token = data.token;
        this.password = data.password;
    }
}

module.exports = ResetPasswordRequestDTO;