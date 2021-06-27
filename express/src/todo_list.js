const BaseRouter = require('./base_router');

// define ToDoList
class ToDoList extends BaseRouter {
    constructor(router, Model) {
        super(router, Model, 'ToDoList');
    }
}

module.exports = ToDoList;
