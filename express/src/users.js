const moment = require('moment');
const BaseRouter = require('./base_router');

// define Users
class Users extends BaseRouter {
    constructor(router, Model) {
        super(router, Model, 'User');
    }
    formatter(key, value) {
        // call parent class function
        let result = super.formatter(key, value);

        // update data
        if (key === 'birthday') {
            result = moment(new Date(result)).format('YYYY/MM/DD HH:mm:ss');
        }

        return result;
    }
}

module.exports = Users;
