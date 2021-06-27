const BaseRouter = require('./base_router');

class ToDoList extends BaseRouter {
    constructor(Model) {
        super(Model, 'ToDoList');
    }
}

module.exports = ToDoList;
