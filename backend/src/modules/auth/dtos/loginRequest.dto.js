class LoginRequestDTO {
    constructor(data) {
        this.email = data.email?.toLowerCase().trim();
        this.password = data.password;
    }
}

module.exports = LoginRequestDTO;