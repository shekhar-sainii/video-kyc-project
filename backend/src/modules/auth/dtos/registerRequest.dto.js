class RegisterRequestDTO {
    constructor(data) {
        this.name = data.name?.trim();
        this.email = data.email?.toLowerCase().trim();
        this.password = data.password;
    }
}

module.exports = RegisterRequestDTO;