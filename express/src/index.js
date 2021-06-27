const express = require('express');
const logger = require('./logger');
const database = require('./database');

// setup express server
const port = process.env.SERVER_PORT || 11500;
const app = express();
app.use(express.json());

// define User Profile
const UserProfile = require('./user_profile');
const user_profile = new UserProfile(database.models.UserProfile);
app.use('/user-profile', user_profile.router);
// define ToDo List
const ToDoList = require('./todo_list');
const todo_list = new ToDoList(database.models.ToDoList);
app.use('/todo-list', todo_list.router);

// start express server
database.sequelize.sync().then(() => {
    app.listen(port, () => logger.info(`Web Server listening on port ${port}!`));
});
