const express = require('express');
const logger = require('./logger');
const sequelize = require('./database').sequelize;

// define CURD method
class ORMapper {
    constructor(target) {
        this.Model = target;
    }

    async find(options) {
        try {
            return await this.Model.findAll(options);
        }
        catch (err) {
            throw err;
        }
    }
    async get(id) {
        try {
            return await this.Model.findByPk(id);
        }
        catch (err) {
            throw err;
        }
    }
    async update(pk, data, options) {
        try {
            const target = await this.get(pk);
            let result = undefined;

            if (target !== null) {
                result = await this.Model.update(data, options);
            }

            return result;
        }
        catch (err) {
            throw err;
        }
    }
    async create(data) {
        try {
            return await this.Model.create(data);
        }
        catch (err) {
            throw err;
        }
    }
    async delete(id) {
        try {
            const data = await this.get(id);
            let result = undefined;

            if (data !== null) {
                result = await Model.destroy(_data);
            }

            return result;
        }
        catch (err) {
            throw err;
        }
    }
}

class BaseRouter {
    constructor(Model, name) {
        BaseRouter.find_options = {order: [['id', 'ASC']]};
        BaseRouter.orm = new ORMapper(Model);
        this.name = name || 'BaseRouter';
        this.router = express.Router();
        this.init();
    }
    // initialization
    init() {
        this.router.get('/:id', this.callback_get);
        this.router.get('/', this.callback_find);
        this.router.post('/', this.callback_post);
        this.router.put('/:id', this.callback_put);
        this.router.delete('/:id', this.callback_delete);
    }
    // logging
    static logging(method, route_type, msg) {
        logger[method](`${route_type}(${this.name}) ${msg}`);
    };
    // define GET method
    callback_get(req, res) {
        const route_type = 'GET';
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await BaseRouter.orm.get(id);

                if (target !== null) {
                    BaseRouter.logging('info', route_type, JSON.stringify(target.toJSON()));
                    result = Promise.resolve(res.status(200).json(target));
                }
                else {
                    BaseRouter.logging('info', route_type, 'Not Found');
                    result = Promise.resolve(res.sendStatus(404));
                }
            }
            catch (err) {
                const msg = err.message;
                BaseRouter.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        });
    }
    callback_find(req, res) {
        const route_type = 'FIND';

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const targets = await BaseRouter.orm.find(BaseRouter.find_options);
                for (const target of targets) {
                    BaseRouter.logging('info', route_type, JSON.stringify(target.toJSON()));
                }
                result = Promise.resolve(res.status(200).json(targets));
            }
            catch (err) {
                const msg = err.message;
                BaseRouter.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        });
    }
    // define POST method
    callback_post(req, res) {
        const route_type = 'POST';
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await BaseRouter.orm.create(data);
                BaseRouter.logging('info', route_type, JSON.stringify(target.toJSON()));
                result = Promise.resolve(res.status(201).json(target));
            }
            catch (err) {
                const msg = err.message;
                BaseRouter.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        });
    }
    // define PUT method
    callback_put(req, res) {
        const route_type = 'PUT';
        const id = req.params.id;
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await BaseRouter.orm.update(id, data, {where: {id: id}});

                if (target !== undefined) {
                    BaseRouter.logging('info', route_type, JSON.stringify(target.toJSON()));
                    result = Promise.resolve(res.status(201).json(target));
                }
                else {
                    BaseRouter.logging('info', route_type, 'Not Found');
                    result = Promise.resolve(res.sendStatus(400));
                }
            }
            catch (err) {
                const msg = err.message;
                BaseRouter.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        });
    }
    // define DELETE method
    callback_delete(req, res) {
        const route_type = 'DELETE';
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                await orm.delete(id);
                BaseRouter.logging('info', route_type, 'No Content');
                result = Promise.resolve(res.sendStatus(204));
            }
            catch (err) {
                const msg = err.message;
                BaseRouter.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        });
    }
}

module.exports = BaseRouter;
