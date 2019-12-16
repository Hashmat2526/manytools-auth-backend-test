const JWT = require('jsonwebtoken');
const { JWT_SECRET } = require('../commons/config');

// assign jwt upon signing in as local/facebook/google

module.exports = async user => {

    // In facebook case, there is not email address
    //therefore we have to put conditions on jwt payload
    const payload = ((user.method !== 'facebook') ?
        {
            _id: user._id,
            name: user.google.name || user.local.fullName,
            email: user.google.email || user.local.email,
            allowedOrigins: user.allowedOrigins
        } : {
            _id: user._id,
            name: user.facebook.name,
            allowedOrigins: user.allowedOrigins
        })
    return JWT.sign(payload, JWT_SECRET,
        {
            expiresIn: "24h"
        }
    );
}