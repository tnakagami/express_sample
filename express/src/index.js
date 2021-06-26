const express = require('express');
const logger = require('./logger');

// setup express server
const port = process.env.SERVER_PORT || 11500;
const app = express();
app.use(express.json());

// define User Profile
const user_profile = require('./user_profile');
app.use('/user-profile', user_profile);
// define ToDo List
const todo_list = require('./todo_list');
app.use('/todo-list', todo_list);

app.listen(port, () => logger.info(`Listening on port ${port}!`));
