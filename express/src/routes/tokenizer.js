const express = require('express');
const router = express.Router();
const axios = require('axios');
const {logger, CustomError, CustomResult} = require('./utils.js');

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
            const payload = {
                username: username,
                password: password,
            };
            const response = await this.api.post('/login/', payload);
            this.token = response.data.token;
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

router.post('/', (req, res, next) => {
    const body = req.body;
    const session = new CustomAxios('http://http_server:12001', req.cookies.token);

    (async () => {
        let response;
        const token = await session.login(body.username, body.password);
        response = await session.post('/judge/', {token: token});
        logger.info(`status code: ${response.status}, message: ${response.data.message}`);
        try {
            response = await session.post('/judge/', {token: `${token}1`});
        }
        catch (err) {
            throw new CustomError(err.response.data.message, err.response.status);
        }

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
        res.cookie('token', token, {
            expires: targetDate,
            httpOnly: false,
        });

        return token;
    })().then((result) => {
        res.locals.result = new CustomResult(result, 200);
        next();
    }).catch((err) => {
        session.logout().then(() => {
            res.clearCookie('token');
            next(new CustomError(err.message, err.statusCode || 500));
        });
    });
});

router.use((req, res) => {
    const result = res.locals.result;
    res.status(result.statusCode || 200).json({message: result.message});        
});
// error handler
router.use((err, req, res, next) => {
    logger.error(`status code: ${err.statusCode}, message: ${err.message}`);
    res.status(err.statusCode || 500).json({error: err.message});
});

module.exports = router;