const Joi = require('joi');

const validateBody = (schema) => {
    return (req, res, next) => {
        const result = Joi.validate(req.body, schema);
        if (result.error) {
            return res.status(400).json(result.error);
        }
        if (!req.value) { req.value = {}; }
        req.value['body'] = result.value;
        next();
    }
}
const schemas = {
    authSchema: Joi.object().keys({
        fullName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
}

module.exports = { schemas, validateBody }