const {defaultFormatter, ORMapper} = require('./utils.js');
const CustomRouter = require('./custom_router.js');
const models = require('./database.js').models;
const orm = new ORMapper(models.User);
const customRouter = new CustomRouter('User', orm, defaultFormatter(['birthday']));
// create router based on common.js
customRouter.preprocess();
customRouter.restApi();
customRouter.postprocess();

module.exports = customRouter.router;
