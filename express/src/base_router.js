const moment = require('moment');
const logger = require('./logger');
const sequelize = require('./database').sequelize;

// define CURD method
class ORMapper {
    constructor(Model) {
        this.Model = Model;
    }
    async find(options) {
        try {
            return this.Model.findAll(options);
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
                await this.Model.update(data, options);
                result = await this.get(pk);
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
            const target = await this.get(id);
            let result = undefined;

            if (target !== null) {
                result = await this.Model.destroy({where: {id: id}});
            }

            return result;
        }
        catch (err) {
            throw err;
        }
    }
}

// define BaseRouter
class BaseRouter {
    constructor(router, Model, name) {
        this.name = name || 'BaseRouter';
        this.find_option = {order: [['id', 'ASC']]};
        this.orm = new ORMapper(Model);
        this.init(router);
    }
    init(router) {
        // bind class method
        this.logging = this.logging.bind(this);
        this.formatter = this.formatter.bind(this);
        this.convert2json = this.convert2json.bind(this);
        this.callback_get = this.callback_get.bind(this);
        this.callback_find = this.callback_find.bind(this);
        this.callback_post = this.callback_post.bind(this);
        this.callback_put = this.callback_put.bind(this);
        this.callback_delete = this.callback_delete.bind(this);
        // handle router
        this.handle_routers(router);
    }
    logging(method, route_type, msg) {
        logger[method](`${route_type}(${this.name}) ${msg}`);
    }
    formatter(key, value) {
        let result = value;

        if ((key === 'updatedAt') || (key === 'createdAt')) {
            result = moment(new Date(value)).format('YYYY/MM/DD HH:mm:ss');
        }

        return result;
    }
    convert2json(data) {
        const indent = '    ';

        return JSON.stringify(data, this.formatter, indent);
    }
    handle_routers(router) {
        router.use((req, res, next) => {
            const indent = '    ';
            res.app.set('json replacer', this.formatter);
            res.app.set('json spaces', indent);
            next();
        });
        router.get('/:id', this.callback_get);
        router.get('/', this.callback_find);
        router.post('/', this.callback_post);
        router.put('/:id', this.callback_put);
        router.delete('/:id', this.callback_delete);
    }
    // define GET method
    callback_get(req, res) {
        const route_type = 'GET';
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await this.orm.get(id);

                if (target !== null) {
                    this.logging('info', route_type, this.convert2json(target.toJSON()));
                    result = Promise.resolve(res.status(200).json(target.toJSON()));
                }
                else {
                    this.logging('info', route_type, 'Not Found');
                    result = Promise.resolve(res.sendStatus(404));
                }
            }
            catch (err) {
                const msg = err.message;
                this.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        }).catch((err) => err);
    }
    callback_find(req, res) {
        const route_type = 'FIND';
        const query = req.query;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const options = Object.assign({where: query}, this.find_option);
                const targets = await this.orm.find(options);
                this.logging('info', route_type, this.convert2json(targets));
                result = Promise.resolve(res.status(200).json(targets));
            }
            catch (err) {
                const msg = err.message;
                this.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        }).catch((err) => err);
    }
    // define POST method
    callback_post(req, res) {
        const route_type = 'POST';
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await this.orm.create(data);
                this.logging('info', route_type, this.convert2json(target.toJSON()));
                result = Promise.resolve(res.status(201).json(target.toJSON()));
            }
            catch (err) {
                const msg = err.message;
                this.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        }).catch((err) => err);
    }
    // define PUT method
    callback_put(req, res) {
        const route_type = 'PUT';
        const id = req.params.id;
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await this.orm.update(id, data, {where: {id: id}});

                if (target !== undefined) {
                    this.logging('info', route_type, this.convert2json(target.toJSON()));
                    result = Promise.resolve(res.status(201).json(target.toJSON()));
                }
                else {
                    this.logging('info', route_type, 'Not Found');
                    result = Promise.resolve(res.sendStatus(400));
                }
            }
            catch (err) {
                const msg = err.message;
                this.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        }).catch((err) => err);
    }
    // define DELETE method
    callback_delete(req, res) {
        const route_type = 'DELETE';
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                await this.orm.delete(id);
                this.logging('info', route_type, 'No Content');
                result = Promise.resolve(res.sendStatus(204));
            }
            catch (err) {
                const msg = err.message;
                this.logging('error', route_type, msg);
                result = Promise.reject(res.status(500).json({'error': msg}));
            }

            return result;
        }).catch((err) => err);
    }
}

module.exports = BaseRouter;
