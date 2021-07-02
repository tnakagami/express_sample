const moment = require('moment');
const logger = require('./logger');
const sequelize = require('./database').sequelize;
const {Op} = require('sequelize');

// define CURD method
class ORMapper {
    constructor(Model) {
        this.Model = Model;
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
    async delete(data) {
        try {
            const is_number = (value) => ((typeof value === 'number') && isFinite(value));
            let result = undefined;

            if (is_number(data)) {
                const id = data;
                const target = await this.get(id);

                if (target !== null) {
                    result = await this.Model.destroy({where: {id: id}});
                }
            }
            else {
                result = await this.Model.destroy({where: data});
            }

            return result;
        }
        catch (err) {
            throw err;
        }
    }
}

// define CustomError
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
// define CustomResult
class CustomResult {
    constructor(message, statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }
}

// define BaseRouter
class BaseRouter {
    constructor(router, Model, name) {
        this.name = name || 'BaseRouter';
        this.findOption = {order: [['id', 'ASC']]};
        this.orm = new ORMapper(Model);
        // bind methods
        this.bindMethods();
        // handle router
        this.handleRouters(router);
    }
    bindMethods() {
        this.formatter = this.formatter.bind(this);
        this.getItem = this.getItem.bind(this);
        this.getItems = this.getItems.bind(this);
        this.createItem = this.createItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.deleteItems = this.deleteItems.bind(this);
    }
    formatter(key, value) {
        let result = value;

        if ((key === 'updatedAt') || (key === 'createdAt')) {
            result = moment(new Date(value)).format('YYYY/MM/DD HH:mm:ss');
        }

        return result;
    }
    handleRouters(router) {
        // preprocess
        router.use((req, res, next) => {
            const indent = '    ';
            res.app.set('json replacer', this.formatter);
            res.app.set('json spaces', indent);
            next();
        });
        router.get('/:id', this.getItem);
        router.get('/', this.getItems);
        router.post('/', this.createItem);
        router.put('/:id', this.updateItem);
        router.delete('/:id', this.deleteItem);
        router.delete('/', this.deleteItems);
        // postprocess
        router.use((req, res) => {
            const logging = (routeType, msg) => logger.info(`${routeType}(${this.name}) ${msg}`);
            const routeType = res.locals.routeType;
            const result = res.locals.result;

            if (typeof result.message === 'string') {
                logging(routeType, result.message);
                res.sendStatus(result.statusCode);
            }
            else {
                const indent = '    ';
                logging(routeType, JSON.stringify(result.message, this.formatter, indent));
                res.status(result.statusCode).json(result.message);
            }
        });
        // error handler
        router.use((err, req, res, next) => {
            logger.error(`status code: ${err.statusCode}, message: ${err.message}`);
            res.status(err.statusCode || 500).json({error: err.message});
        });
    }
    // define "get" method
    getItem(req, res, next) {
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await this.orm.get(id);

                if (target !== null) {
                    result = Promise.resolve(new CustomResult(target.toJSON(), 200));
                }
                else {
                    result = Promise.resolve(new CustomResult('Not Found', 404));
                }
            }
            catch (err) {
                result = Promise.reject(new CustomError(err.message, 500));
            }

            return result;
        }).then((result) => {
            res.locals.routeType = 'Get Item';
            res.locals.result = result;
            next();
        }).catch((err) => next(err));
    }
    getItems(req, res, next) {
        const query = req.query;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const options = Object.assign({where: query}, this.findOption);
                const targets = await this.orm.find(options);
                result = Promise.resolve(new CustomResult(targets, 200));
            }
            catch (err) {
                result = Promise.reject(new CustomError(err.message, 500));
            }

            return result;
        }).then((result) => {
            res.locals.routeType = 'Get Items';
            res.locals.result = result;
            next();
        }).catch((err) => next(err));
    }
    // define "create" method
    createItem(req, res, next) {
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await this.orm.create(data);
                result = Promise.resolve(new CustomResult(target.toJSON(), 201));
            }
            catch (err) {
                result = Promise.reject(new CustomError(err.message, 500));
            }

            return result;
        }).then((result) => {
            res.locals.routeType = 'Create Item';
            res.locals.result = result;
            next();
        }).catch((err) => next(err));
    }
    // define "update" method
    updateItem(req, res, next) {
        const id = req.params.id;
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await this.orm.update(id, data, {where: {id: id}});

                if (target !== undefined) {
                    result = Promise.resolve(new CustomResult(target.toJSON(), 201));
                }
                else {
                    result = Promise.resolve(new CustomResult('Not Found', 404));
                }
            }
            catch (err) {
                result = Promise.reject(new CustomError(err.message, 500));
            }

            return result;
        }).then((result) => {
            res.locals.routeType = 'Update Item';
            res.locals.result = result;
            next();
        }).catch((err) => next(err));
    }
    // define "delete" method
    deleteItem(req, res, next) {
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                await this.orm.delete(parseInt(id));
                result = Promise.resolve(new CustomResult('No Content', 204));
            }
            catch (err) {
                result = Promise.reject(new CustomError(err.message, 500));
            }

            return result;
        }).then((result) => {
            res.locals.routeType = 'Delete Item';
            res.locals.result = result;
            next();
        }).catch((err) => next(err));
    }
    deleteItems(req, res, next) {
        const query = Object.fromEntries(Object.entries(req.query).map(([key, value]) => [key, {[Op.like]: `%${value}%`}]));

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                await this.orm.delete(query);
                result = Promise.resolve(new CustomResult('No Content', 204));
            }
            catch (err) {
                result = Promise.reject(new CustomError(err.message, 500));
            }

            return result;
        }).then((result) => {
            res.locals.routeType = 'Delete Items';
            res.locals.result = result;
            next();
        }).catch((err) => next(err));
    }
}

module.exports = BaseRouter;
