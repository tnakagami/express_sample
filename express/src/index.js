const express = require('express');
const logger = require('./logger');
const database = require('./database');

class RestAPIServer {
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
        const ToDoList = require('./todo_list');
        const todo_list_router = express.Router();
        this.app.use('/todo-list', todo_list_router);
        new ToDoList(todo_list_router, database.models.ToDoList);
    }
    run_forever() {
        const port = process.env.SERVER_PORT || 11500;
        const option = (process.env.DEBUG.toLowerCase() === 'true') ? {force: true} : {};
        // start express server
        database.sequelize.sync(option).then(() => {
            this.app.listen(port, () => logger.info(`Web Server listening on port ${port}!`));
        });
    }
}

const server = new RestAPIServer();
server.run_forever();
