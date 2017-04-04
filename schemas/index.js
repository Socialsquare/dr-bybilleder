/* Schemas used when validating input from users of the API */

const Ajv = require('ajv');
const ajv = new Ajv();

ajv.addSchema(require('./collage.json'), 'Collage');

module.exports = ajv;
