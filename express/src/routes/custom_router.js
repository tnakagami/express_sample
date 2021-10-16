const express = require('express');
const {logger, CustomError, CustomResult} = require('./utils.js');
const {Op} = require('sequelize');
const sequelize = require('./database.js').sequelize;

class CustomRouter {
    constructor(routerName, orm, formatter) {
        this.router = express.Router();
        this.routerName = routerName;
        this.orm = orm;
        this.formatter = formatter;
        // bind
        this.preprocess  = this.preprocess.bind(this);
        this.restApi     = this.restApi.bind(this);
        this.postprocess = this.postprocess.bind(this);
        this.getItem     = this.getItem.bind(this);
        this.getItems    = this.getItems.bind(this);
        this.createItem  = this.createItem.bind(this);
        this.updateItem  = this.updateItem.bind(this);
        this.deleteItem  = this.deleteItem.bind(this);
        this.deleteItems = this.deleteItems.bind(this);
    }

    preprocess() {
        this.router.use((req, res, next) => {
            const indent = '    ';
            res.app.set('json replacer', this.formatter);
            res.app.set('json spaces', indent);
            next();
        });
    }

    restApi() {
        this.router.get('/:id', this.getItem);
        this.router.get('/', this.getItems);
        this.router.post('/', this.createItem);
        this.router.put('/:id', this.updateItem);
        this.router.delete('/:id', this.deleteItem);
        this.router.delete('/', this.deleteItems);
    }

    postprocess() {
        this.router.use((req, res, next) => {
            const logging = (routeType, msg) => logger.info(`${routeType}(${this.routerName}) ${msg}`);
            const routeType = res.locals.routeType;
            const result = res.locals.result;

            try {
                if (typeof result.message === 'string') {
                    logging(routeType, result.message);
                    res.sendStatus(result.statusCode);
                }
                else {
                    const indent = '    ';
                    logging(routeType, JSON.stringify(result.message, this.formatter, indent));
                    res.status(result.statusCode).json(result.message);
                }
            }
            catch (err) {
                const result = new CustomError(err.stack, 500);
                next(result);
            }
        });
        // error handler
        this.router.use((err, req, res, next) => {
            logger.error(`status code: ${err.statusCode}, message: ${err.message}`);
            res.status(err.statusCode || 500).json({error: err.message});
        });
    }

    // define "GET" method
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
                const options = {order: [['id', 'ASC']], where: query};
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
    // define "POST" method
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
    // define "PUT" method
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
    // define "DELETE" method
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

module.exports = CustomRouter;
