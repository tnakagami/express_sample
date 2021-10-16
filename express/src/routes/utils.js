const log4js = require('log4js');
const moment = require('moment');

// setup logger
log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
        system: {
            type: 'file',
            filename: '/var/log/express/express.log',
            maxLogSize: 5120000, // 5MB
            backup: 3
        }
    },
    categories: {
        default: {
            appenders: ['console', 'system'],
            level: 'debug'
        }
    }
});
const logger = log4js.getLogger('default');

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

// default formatter
const defaultFormatter = (args) => {
    const targets = ['updatedAt', 'createdAt'].concat(args);

    return (key, value) => {
        let result = value;

        if (targets.includes(key)) {
            result = moment(new Date(value)).format('YYYY/MM/DD HH:mm:ss');
        }

        return result;
    };
};

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

module.exports = {
    logger: logger,
    CustomError: CustomError,
    CustomResult: CustomResult,
    defaultFormatter: defaultFormatter,
    ORMapper: ORMapper,
};
