const express = require('express');
const router = express.Router();

const rows = [
    {
        link: '/user',
        description: 'user information',
    },
    {
        link: '/todo-list',
        description: 'todo list',
    }
];

// index
router.get('/', (req, res) => {
    res.render('index', {rows: rows});
});
// users
router.get('/user', (req, res) => {
    res.render('users');
});
// todo list
router.get('/todo-list', (req, res) => {
    res.render('todo-list');
});

module.exports = router;
