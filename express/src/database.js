const logger = require('./logger');
const {Sequelize, DataTypes} = require('sequelize');
const env = process.env;

let is_initalized = false;

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
        return await this.Model.findAll(options);
    }
    async get(id) {
        return await this.Model.findByPk(id);
    }
    async update(pk, data, options) {
        let ret = undefined;
        const _target = await this.get(pk);

        if (_target !== null) {
            ret = await this.Model.update(data, options);
        }

        return ret;
    }
    async create(data) {
        return await this.Model.create(data);
    }
    async delete(id) {
        const _data = await this.get(id);
        let ret = undefined;

        if (_data !== null) {
            ret = await Model.destroy(_data);
        }

        return ret;
    }
}

(async () => {
    if (!is_initalized) {
        await sequelize.sync();
        is_initalized = true;
    }
})();

module.exports = {
    sequelize: sequelize,
    models: models,
    ORMapper: ORMapper,
};
