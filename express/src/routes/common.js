const express = require('express');
const {logger, CustomError, CustomResult} = require('./utils.js');
const {Op} = require('sequelize');
const sequelize = require('./database.js').sequelize;

const preprocess = (formatter) => {
    const router = express.Router();

    router.use((req, res, next) => {
        const indent = '    ';
        res.app.set('json replacer', formatter);
        res.app.set('json spaces', indent);
        next();
    });

    return router;
};

const restApi = (router, orm) => {
    // define "GET" method
    router.get('/:id', (req, res, next) => {
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await orm.get(id);

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
    });
    router.get('/', (req, res, next) => {
        const query = req.query;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const options = {order: [['id', 'ASC']], where: query};
                const targets = await orm.find(options);
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
    });
    // define "POST" method
    router.post('/', (req, res, next) => {
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await orm.create(data);
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
    });
    // define "PUT" method
    router.put('/:id', (req, res, next) => {
        const id = req.params.id;
        const data = req.body;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                const target = await orm.update(id, data, {where: {id: id}});

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
    });
    // define "DELETE" method
    router.delete('/:id', (req, res, next) => {
        const id = req.params.id;

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                await orm.delete(parseInt(id));
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
    });
    router.delete('/', (req, res, next) => {
        const query = Object.fromEntries(Object.entries(req.query).map(([key, value]) => [key, {[Op.like]: `%${value}%`}]));

        sequelize.transaction(async (transaction) => {
            let result;

            try {
                await orm.delete(query);
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
    });

    return router;
};

const postprocess = (router, routerName, formatter) => {
    router.use((req, res, next) => {
        const logging = (routeType, msg) => logger.info(`${routeType}(${routerName}) ${msg}`);
        const routeType = res.locals.routeType;
        const result = res.locals.result;

        try {
            if (typeof result.message === 'string') {
                logging(routeType, result.message);
                res.sendStatus(result.statusCode);
            }
            else {
                const indent = '    ';
                logging(routeType, JSON.stringify(result.message, formatter, indent));
                res.status(result.statusCode).json(result.message);
            }
        }
        catch (err) {
            const result = new CustomError(err.stack, 500);
            next(result);
        }
    });
    // error handler
    router.use((err, req, res, next) => {
        logger.error(`status code: ${err.statusCode}, message: ${err.message}`);
        res.status(err.statusCode || 500).json({error: err.message});
    });

    return router;
};

module.exports = {
    preprocess: preprocess,
    restApi: restApi,
    postprocess, postprocess,
};
