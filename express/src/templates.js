const moment = require('moment');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

class Templates {
    constructor(router, prefix) {
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
        // index
        router.get('/', (req, res) => {
            res.render('index', {rows: rows});
        });
        router.get('/request.js', (req, res) => {
            fs.readFile(path.join(__dirname, 'request.js'), 'UTF-8', (err, data) => {
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
    }
}

module.exports = Templates;
