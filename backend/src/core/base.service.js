class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async create(data) {
    return await this.repository.create(data);
  }

  async getById(id, populate = "") {
    const record = await this.repository.findById(id, populate);

    if (!record) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    return record;
  }

  async getOne(filter, populate = "") {
    const record = await this.repository.findOne(filter, populate);

    if (!record) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    return record;
  }

  async getAll(filter = {}, populate = "", options = {}) {
    return await this.repository.findAll(filter, populate, options);
  }

  async update(id, data) {
    const updated = await this.repository.updateById(id, data);

    if (!updated) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  async delete(id) {
    const deleted = await this.repository.deleteById(id);

    if (!deleted) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    return deleted;
  }
}

module.exports = BaseService;