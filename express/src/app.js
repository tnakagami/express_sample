const express = require('express');
const {logger} = require('./routes/utils.js');
const path = require('path');
const ECT = require('ect');
const ect = ECT({watch: true, root: path.resolve(__dirname, './views'), ext: '.ect'});

// =============
// configuration
// =============
const app = express();
app.use(express.json());
app.use(express.static(path.resolve(__dirname, './public')));
app.set('views', path.resolve(__dirname, './views'));
app.engine('ect', ect.render);
app.set('view engine', 'ect');
// setup index
const indexRouter = require('./routes/index.js');
app.use('/', indexRouter);
// setup Users
const usersRouter = require('./routes/users.js');
app.use('/users', usersRouter);
// setup ToDo List
const todoListsRouter = require('./routes/todo_lists.js');
app.use('/todo-lists', todoListsRouter);

// ====================
// start express server
// ====================
const port = process.env.SERVER_PORT || 11500;
const debug = process.env.DEBUG || 'true';
const option = (debug.toLowerCase() === 'true') ? {force: true} : {};
const sequelize = require('./routes/database.js').sequelize;
sequelize.sync(option).then(() => {
    app.listen(port, () => logger.info(`Web Server listening on port ${port}!`));
});
