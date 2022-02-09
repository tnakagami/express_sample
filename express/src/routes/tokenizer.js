const express = require('express');
const router = express.Router();
const axios = require('axios');
const {logger} = require('./utils.js');

class CustomAxios {
    constructor(baseURL, token) {
        this.token = token;
        this.api = axios.create({
            baseURL: baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // add a request interceptor
        this.api.interceptors.request.use((config) => {
            config.headers.Authorization = this.token ? `Bearer ${this.token}` : '';

            return config;
        });

        // bind
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
    }

    async login(username, password) {
        if (!this.token) {
            const data = {
                username: username,
                password: password,
            };
            const response = await this.api.post('/login/', data);
            this.token = response.token;
        }

        return this.token;
    }

    async logout() {
        await this.api.get('/logout/');
    }

    async get(linkName, params) {
        const data = params || {};
        const response = await this.api.get(linkName, {params: data});

        return response;
    }

    async post(linkName, data) {
        const response = await this.api.post(linkName, data);

        return response;
    }
}

router.get('/', (req, res) => {
    const session = new CustomAxios('http://www.example.com', req.cookies.token);
    logger.info(`${session.token}, ${req.cookies.token}`);
    res.status(200).json({message: session.token});
});

module.exports = router;