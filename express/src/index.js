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
        const usersRouter = express.Router();
        this.app.use('/users', usersRouter);
        new Users(usersRouter, database.models.User);
        // setup ToDo List
        const ToDoLists = require('./todo_lists');
        const todoListsRouter = express.Router();
        this.app.use('/todo-lists', todoListsRouter);
        new ToDoLists(todoListsRouter, database.models.ToDoList);
    }
    run() {
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
server.run();
