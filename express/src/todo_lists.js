const moment = require('moment');
const BaseRouter = require('./base_router');

// define ToDoLists
class ToDoLists extends BaseRouter {
    constructor(router, Model) {
        super(router, Model, 'ToDoList');
    }
    formatter(key, value) {
        // call parent class function
        let result = super.formatter(key, value);

        // update data
        if (key === 'limit') {
            result = moment(new Date(result)).format('YYYY/MM/DD HH:mm:ss');
        }

        return result;
    }
}

module.exports = ToDoLists;
