const logger = require('./logger');
const {Sequelize, DataTypes} = require('sequelize');
const env = process.env;

// connect to database
const sequelize  = new Sequelize(env.MYSQL_DATABASE, env.MYSQL_USER, env.MYSQL_PASSWORD, {
    host: 'database', // set service name in docker-compose.yml
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    timezone: env.TZ,
});
// define models
const models = {
    User: sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
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
            limit: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            timestamps: true,
            freezeTableName: true, // fixed table name
        }
    ),
};

module.exports = {
    sequelize: sequelize,
    models: models,
};
