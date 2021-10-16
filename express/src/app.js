const express = require('express');
const {logger} = require('./routes/utils.js');
const path = require('path');
const ECT = require('ect');

class RestApiServer {
    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.configuration();
    }
    configuration() {
        // setup template
        const ect = ECT({ watch: true, root: __dirname + '/views', ext: '.ect' });
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.engine('ect', ect.render);
        this.app.set('view engine', 'ect');
        // setup view
        const indexWrapper = require('./routes/index.js');
        const indexRouter = indexWrapper('/');
        this.app.use('/', indexRouter);
        // setup Users
        const usersRouter = require('./routes/users.js');
        this.app.use('/users', usersRouter);
        // setup ToDo List
        const todoListsRouter = require('./routes/todo_lists.js');
        this.app.use('/todo-lists', todoListsRouter);
    }
    run() {
        const port = process.env.SERVER_PORT || 11500;
        const debug = process.env.DEBUG || 'true';
        const option = (debug.toLowerCase() === 'true') ? {force: true} : {};
        const sequelize = require('./routes/database.js').sequelize;
        // start express server
        sequelize.sync(option).then(() => {
            this.app.listen(port, () => logger.info(`Web Server listening on port ${port}!`));
        });
    }
}

const server = new RestApiServer();
server.run();
