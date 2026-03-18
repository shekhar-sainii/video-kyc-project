const User = require("../user/user.model");
const RefreshToken = require("./refreshToken.model");
const VerificationToken = require("./verificationToken.model");

class AuthRepository {
  // ---------------- USER ----------------

  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  async createUser(data) {
    return await User.create(data);
  }

  async updateUser(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async addOAuthProvider(userId, providerData) {
    return await User.findByIdAndUpdate(
      userId,
      { $push: { providers: providerData } },
      { new: true }
    );
  }

  // ---------------- REFRESH TOKEN ----------------

  async saveRefreshToken(data) {
    return await RefreshToken.create(data);
  }

  async findRefreshToken(token) {
    return await RefreshToken.findOne({ token });
  }

  async deleteRefreshToken(token) {
    return await RefreshToken.deleteOne({ token });
  }

  async deleteAllUserTokens(userId) {
    return await RefreshToken.deleteMany({ user: userId });
  }

  // ---------------- VERIFICATION TOKEN ----------------

  async createVerificationToken(data) {
    return await VerificationToken.create(data);
  }

  async findVerificationToken(token) {
    return await VerificationToken.findOne({ token });
  }

  async deleteVerificationToken(token) {
    return await VerificationToken.deleteOne({ token });
  }

  async deleteVerificationByUser(userId, type) {
  return await VerificationToken.deleteMany({
    user: userId,
    type,
  });
}

}

module.exports = new AuthRepository();