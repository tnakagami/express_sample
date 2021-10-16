const {defaultFormatter, ORMapper} = require('./utils.js');
const {preprocess, restApi, postprocess} = require('./common.js');
const models = require('./database.js').models;
const orm = new ORMapper(models.User);
const formatter = defaultFormatter(['birthday']);
// create router based on common.js
let router;
router = preprocess(formatter);
router = restApi(router, orm);
router = postprocess(router, 'User', formatter);

module.exports = router;
