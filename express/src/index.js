const express = require('express');
const logger = require('./logger');
const database = require('./database');

class RestApiServer {
    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.configuration();
    }
    configuration() {
        // setup Users
        const Users = require('./users');
        const users_router = express.Router();
        this.app.use('/users', users_router);
        new Users(users_router, database.models.User);
        // setup ToDo List
        const ToDoLists = require('./todo_lists');
        const todo_lists_router = express.Router();
        this.app.use('/todo-lists', todo_lists_router);
        new ToDoLists(todo_lists_router, database.models.ToDoList);
    }
    run_forever() {
        const port = process.env.SERVER_PORT || 11500;
        const debug = process.env.DEBUG || 'true';
        const option = (debug.toLowerCase() === 'true') ? {force: true} : {};
        // start express server
        database.sequelize.sync(option).then(() => {
            this.app.listen(port, () => logger.info(`Web Server listening on port ${port}!`));
        });
    }
}

const server = new RestApiServer();
server.run_forever();
