const BaseRepository = require("../../core/base.repository");
const User = require("./user.model");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async findById(userId) {
    return this.model.findById(userId);
  }

  async updateById(userId, updateData) {
    return this.model.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
  }

  async softDelete(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
  }
}

module.exports = new UserRepository();