const express = require('express');
const logger = require('./logger');
const database = require('./database');
const sequelize = database.sequelize;
const ORMapper = database.ORMapper;
const router = express.Router();

const orm = new ORMapper(database.models.UserProfile);

// define GET method
router.get('/:id', (req, res) => {
    const id = req.params.id;

    sequelize.transaction(async (transaction) => {
        let ret;

        try {
            const user_profile = await orm.get(id);

            if (user_profile !== null) {
                ret = Promise.resolve(res.status(200).json(user_profile));
            }
            else {
                ret = Promise.resolve(res.sendStatus(404));
            }
        }
        catch (err) {
            ret = Promise.reject(res.status(500).json({'error': err.message}));
        }

        return ret;
    });
});
router.get('/', (req, res) => {
    sequelize.transaction(async (transaction) => {
        let ret;

        try {
            const user_profiles = await orm.find({order: [['id', 'ASC']]});
            ret = Promise.resolve(res.status(200).json(user_profiles));
        }
        catch (err) {
            ret = Promise.reject(res.status(500).json({'error': err.message}));
        }

        return ret;
    });
});
// defile POST method
router.post('/', (req, res) => {
    const data = req.body;

    sequelize.transaction(async (transaction) => {
        let ret;

        try {
            const user_profile = await orm.create(data);
            ret = Promise.resolve(res.status(201).json(user_profile));
        }
        catch (err) {
            ret = Promise.reject(res.status(500).json({'error': err.message}));
        }

        return ret;
    });
});
// defile PUT method
router.post('/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;

    sequelize.transaction(async (transaction) => {
        let ret;

        try {
            const user_profile = await orm.update(id, data, {where: {id: id}});

            if (user_profile !== undefined) {
                ret = Promise.resolve(res.status(201).json(user_profile));
            }
            else {
                ret = Promise.resolve(res.sendStatus(400));
            }
        }
        catch (err) {
            ret = Promise.reject(res.status(500).json({'error': err.message}));
        }

        return ret;
    });
});
// defile DELETE method
router.delete('/:id', (req, res) => {
    const id = req.params.id;

    sequelize.transaction(async (transaction) => {
        let ret;

        try {
            await orm.delete(id);
            ret = Promise.resolve(res.sendStatus(204));
        }
        catch (err) {
            ret = Promise.reject(res.status(500).json({'error': err.message}));
        }

        return ret;
    });
});

module.exports = router;