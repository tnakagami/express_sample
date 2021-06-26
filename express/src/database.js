const logger = require('./logger');
const {Sequelize, DataTypes} = require('sequelize');
const env = process.env;

// connect to database
const sequelize  = new Sequelize(env.MYSQL_DATABASE, env.MYSQL_USER, env.MYSQL_PASSWORD, {
    host: 'database', // set service name in docker-compose.yml
    dialect: 'mysql',
    timezone: env.TZ,
});
// define models
const models = {
    UserProfile: sequelize.define(
        'UserProfile',
        {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            birthday: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            timestamps: true,
            freezeTableName: true, // fixed table name
        }
    ),
    ToDoList: sequelize.define(
        'ToDoList',
        {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
            },

        }, {
            timestamps: true,
            freezeTableName: true, // fixed table name
        }
    ),
};

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
            const _target = await this.get(pk);
            let ret = undefined;

            if (_target !== null) {
                ret = await this.Model.update(data, options);
            }

            return ret;
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
            const _data = await this.get(id);
            let ret = undefined;

            if (_data !== null) {
                ret = await Model.destroy(_data);
            }

            return ret;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = {
    sequelize: sequelize,
    models: models,
    ORMapper: ORMapper,
};
