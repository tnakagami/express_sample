const BaseRouter = require('./base_router');

class UserProfile extends BaseRouter {
    constructor(Model) {
        super(Model, 'UserProfile');
    }
}

module.exports = UserProfile;
