const express = require('express');
const router = express();
const checkAuth = require('../middlewares/checkAuth')

const { validateBody, schemas } = require('../commons/schemaValidation');
const UsersController = require('../controllers/usersC');

router.post('/signup', validateBody(schemas.authSchema), UsersController.signUp);

router.post('/login', UsersController.signIn);

router.post('/oauth/google', UsersController.googleOAuth);

router.get('/validate/token', checkAuth, UsersController.validateToken)

router.post('/oauth/facebook', UsersController.facebookOAuth);

router.post('/validate/email', UsersController.validateEmail)


module.exports = router;