class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id, populate = "") {
    return await this.model.findById(id).populate(populate);
  }

  async findOne(filter, populate = "") {
    return await this.model.findOne(filter).populate(populate);
  }

  async findAll(filter = {}, populate = "", options = {}) {
    return await this.model.find(filter, null, options).populate(populate);
  }

  async updateById(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}

module.exports = BaseRepository;