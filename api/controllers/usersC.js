const User = require('../models/userM');
const signToken = require('../middlewares/signToken')
const requestify = require('requestify');
var allowedOrigins = ["cbaas", "adinterest", "subscribers"];


// registering user with the email and password
const signUp = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.value.body;

        // Check if there is a user with the same email
        const foundUser = await User.find({ "local.email": email }).lean();

        // if user array is great than 1 it means it's not empty
        if (foundUser.length >= 1) {

            return res.status(403).json({
                hasError: true,
                error: 'Email is already in use'
            });

        }
        // if user array is empty, then create a new user
        // Create a new user
        const newUser = new User({
            method: 'local',
            local: {
                fullName: fullName,
                email: email,
                password: password
            },
            allowedOrigins
        });

        // newlycreatedUser is created to generate jwt
        let newlycreatedUser = await newUser.save();

        // Generate the token
        const token = await signToken(newlycreatedUser);

        // Respond with token
        res.status(200).json({
            hasError: false,
            token: token
        });

    } catch (error) {

        res.status(500).json({
            hasError: true,
            error: error
        })

    }

}

// login with email and password and generate jwt
const signIn = async (req, res, next) => {
    try {

        const { email, password } = req.body;
        // Find the user given the email
        const user = await User.findOne({ "local.email": email }).lean();

        // If user email is not in the database
        if (!user) {
            return res.status(403).json({
                hasError: false,
                error: "Auth Failed"
            })
        }

        // Check if the password is correct
        // isValidPassword function is defined in model user
        // it send true if hashed password is matched with the user provided password
        const isMatch = await user.isValidPassword(password);
        // If password is correct
        if (isMatch) {
            // Generate token
            const token = await signToken(user);
            //send response with token
            return res.status(200).json({
                hasError: false,
                token: token
            });
        } else {
            return res.status(401).json({
                hasError: false,
                message: 'Auth Failed'
            })
        }
    } catch (error) {
        res.sendStatus(500).json({
            hasError: true,
            error: error
        })
    }
}

// authenticating with google oauth
const googleOAuth = async (req, res, next) => {
    try {
        const { googleId, name, email } = req.body;
        //if googleId is undefined 
        if (!googleId) {
            return res.status(401).json({
                hasError: true,
                message: 'google id is undefined'
            })
        }
        const existingUser = await User.find({ "google.googleId": googleId }).lean();
        // if google user is already in the database then just generate jwt token
        if (existingUser.length >= 1) {
            const token = await signToken(existingUser[0]);
            return res.status(200).json({
                hasError: false,
                token: token
            });
        } else {
            // if there is not user if google id then create a new user
            const newUser = new User({
                method: 'google',
                google: {
                    googleId,
                    email,
                    name
                },
                allowedOrigins: allowedOrigins
            });
            let newlySavedUser = await newUser.save();
            // Generate token
            const token = await signToken(newlySavedUser);

            res.status(200).json({
                hasError: false,
                token: token
            });
        }


    } catch (error) {
        res.sendStatus(500).json({
            hasError: true,
            error: error
        })
    }
}

// authenticating with facebook oauth
const facebookOAuth = async (req, res, next) => {
    try {
        const access_token = req.body.access_token;
        if (!access_token) {
            return res.status(401).json({
                hasError: true,
                message: 'access token is not valid'
            })
        }
        const url = 'https://graph.facebook.com/me?access_token=' + access_token;

        // send the request with the above url to fetch facebook profile
        let fbprofile = await requestify.get(url).then(function (response) {
            // Get the response body
            return response.getBody();
        });
        const facebookId = fbprofile.id;
        const name = fbprofile.name;

        // if user exists then generate token
        //if user does not exist save to db and generate token
        const existingUser = await User.find({ "facebook.facebookId": facebookId }).lean();
        if (existingUser.length >= 1) {
            const token = await signToken(existingUser[0]);
            return res.status(200).json({
                hasError: false,
                token: token
            });
        } else {
            // create a facebook user without emails
            const newUser = new User({
                method: 'facebook',
                facebook: {
                    facebookId,
                    name
                },
                allowedOrigins
            });
            let newlySavedUser = await newUser.save();

            // Generate token
            const token = await signToken(newlySavedUser);

            res.status(200).json({
                hasError: false,
                token: token
            });
        }
    } catch (error) {
        res.sendStatus(500).json({
            hasError: true,
            error: error
        })
    }
}

// validating jwt and send user to the client
const validateToken = async (req, res, next) => {
    try {
        // validate user and decode jwt token and send user to the client
        // Generate token
        if (req.userData) {
            return res.status(200).json({
                hasError: false,
                token: req.userData
            });
        }
    } catch (error) {
        res.sendStatus(500).json({
            hasError: true,
            error: error
        })
    }
}

// validate email on keyup from client side
const validateEmail = async (req, res, next) => {
    try {

        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,3}))$/;

        const email = req.body.email;
        const isUserExist = await User.find({ 'local.email': email })
        if (isUserExist.length >= 1) {
            return res.status(409).json({
                hasError: true,
                message: 'email is already in use'
            })
        }
        const isvalidEmail = emailRegex.test(email);

        if (!isvalidEmail) {
            return res.status(409).json({
                hasError: true,
                message: 'email is not valid'
            })
        }
        return res.status(200).json({
            hasError: false,
            message: "email is valid"
        });
    } catch (error) {
        res.sendStatus(500).json({
            hasError: true,
            error: error
        })
    }
}

module.exports = {
    signIn,
    signUp,
    googleOAuth,
    facebookOAuth,
    validateEmail,
    validateToken
}
