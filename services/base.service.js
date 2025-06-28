const { ApiError } = require('../utils/errorHandler');

class BaseService {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            return await this.model.create(data);
        } catch (error) {
            throw new ApiError(400, error.message);
        }
    }

    async findById(id, options = {}) {
        const record = await this.model.findByPk(id, options);
        if (!record) {
            throw new ApiError(404, `${this.model.name} not found`);
        }
        return record;
    }

    async findAll(options = {}) {
        return await this.model.findAll(options);
    }

    async update(id, data) {
        const record = await this.findById(id);
        return await record.update(data);
    }

    async delete(id) {
        const record = await this.findById(id);
        await record.destroy();
        return { message: `${this.model.name} deleted successfully` };
    }

    async count(options = {}) {
        return await this.model.count(options);
    }

    async findOne(options = {}) {
        const record = await this.model.findOne(options);
        if (!record) {
            throw new ApiError(404, `${this.model.name} not found`);
        }
        return record;
    }
}

module.exports = BaseService;
