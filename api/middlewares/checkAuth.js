const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../commons/config');

//extracting jwt and fetch user information
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; //fetch 1st prt of token n send through headers
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Auth Failed"
        })
    }
}