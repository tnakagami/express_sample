const express = require('express');
const moment = require('moment');
const {logger} = require('./utils.js');
const fs = require('fs');
const path = require('path');

const indexWrapper = (prefix) => {
    const rows = [
        {
            link: (prefix === '/') ? '/user' : `${prefix}/user`,
            description: 'user information',
        },
        {
            link: (prefix === '/') ? '/todo-list' : `${prefix}/todo-list`,
            description: 'todo list',
        }
    ];
    const router = express.Router();

    // index
    router.get('/', (req, res) => {
        res.render('index', {rows: rows});
    });
    // request.js
    router.get('/request.js', (req, res) => {
        const targetPath = path.resolve(__dirname, '../public/js/request.js');
        fs.readFile(targetPath, 'UTF-8', (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write(data);
            res.end();
        });
    });
    // users
    router.get('/user', (req, res) => {
        res.render('users', {link: prefix});
    });
    // todo list
    router.get('/todo-list', (req, res) => {
        res.render('todo-list', {link: prefix});
    });

    return router;
};

module.exports = indexWrapper;
