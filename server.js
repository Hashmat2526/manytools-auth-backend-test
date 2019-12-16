const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectdb = require('./api/commons/connectdb')
const app = express();
const cors = require('./api/middlewares/cors')

//db connection
connectdb();

// Middlewaress
app.use(morgan('dev')); //console logs of the requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors)

// users routes
app.use('/users', require('./api/routes/usersR'));

//error handling middlewares 
// route not found error handling
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});
// server error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port); 