const express = require('express');
const logger = require('./logger');
const database = require('./database');
const sequelize = database.sequelize;
const ORMapper = database.ORMapper;
const router = express.Router();

const orm = new ORMapper(database.models.ToDoList);

const logging = (method, route_type, msg) => {
    logger[method](`${route_type}(ToDoList) ${msg}`);
};

// define GET method
router.get('/:id', (req, res) => {
    const route_type = 'GET';
    const id = req.params.id;

    sequelize.transaction(async (transaction) => {
        let result;

        try {
            const target = await orm.get(id);

            if (target !== null) {
                logging('info', route_type, JSON.stringify(target.toJSON()));
                result = Promise.resolve(res.status(200).json(target));
            }
            else {
                logging('info', route_type, 'Not Found');
                result = Promise.resolve(res.sendStatus(404));
            }
        }
        catch (err) {
            const msg = err.message;
            logging('error', route_type, msg);
            result = Promise.reject(res.status(500).json({'error': msg}));
        }

        return result;
    }).catch((err) => err);
});
router.get('/', (req, res) => {
    const route_type = 'FIND';
    const query = req.query;

    sequelize.transaction(async (transaction) => {
        let result;

        try {
            const targets = await orm.find({order: [['id', 'ASC']], where: query});
            for (const target of targets) {
                logging('info', route_type, JSON.stringify(target.toJSON()));
            }
            result = Promise.resolve(res.status(200).json(targets));
        }
        catch (err) {
            const msg = err.message;
            logging('error', route_type, msg);
            result = Promise.reject(res.status(500).json({'error': msg}));
        }

        return result;
    }).catch((err) => err);
});
// define POST method
router.post('/', (req, res) => {
    const route_type = 'POST';
    const data = req.body;

    sequelize.transaction(async (transaction) => {
        let result;

        try {
            const target = await orm.create(data);
            logging('info', route_type, JSON.stringify(target.toJSON()));
            result = Promise.resolve(res.status(201).json(target));
        }
        catch (err) {
            const msg = err.message;
            logging('error', route_type, msg);
            result = Promise.reject(res.status(500).json({'error': msg}));
        }

        return result;
    }).catch((err) => err);
});
// define PUT method
router.put('/:id', (req, res) => {
    const route_type = 'PUT';
    const id = req.params.id;
    const data = req.body;

    sequelize.transaction(async (transaction) => {
        let result;

        try {
            const target = await orm.update(id, data, {where: {id: id}});

            if (target !== undefined) {
                logging('info', route_type, JSON.stringify(target.toJSON()));
                result = Promise.resolve(res.status(201).json(target));
            }
            else {
                logging('info', route_type, 'Not Found');
                result = Promise.resolve(res.sendStatus(400));
            }
        }
        catch (err) {
            const msg = err.message;
            logging('error', route_type, msg);
            result = Promise.reject(res.status(500).json({'error': msg}));
        }

        return result;
    }).catch((err) => err);
});
// define DELETE method
router.delete('/:id', (req, res) => {
    const route_type = 'DELETE';
    const id = req.params.id;

    sequelize.transaction(async (transaction) => {
        let result;

        try {
            await orm.delete(id);
            logging('info', route_type, 'No Content');
            result = Promise.resolve(res.sendStatus(204));
        }
        catch (err) {
            const msg = err.message;
            logging('error', route_type, msg);
            result = Promise.reject(res.status(500).json({'error': msg}));
        }

        return result;
    }).catch((err) => err);
});
module.exports = router;
