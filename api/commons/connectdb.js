//db connection
const mongoose = require('mongoose')
const config = require('./config')

const connection = () => {
    mongoose.connect('mongodb+srv://hashmat2526:' + config.MONGO_ATLAS_PW + '@mflix-kkh9f.mongodb.net/sso-manytools?retryWrites=true&w=majority',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    ).catch(err => {
        res.status(500).json({
            err: err
        })
    })

    // using mongoose promise 
    mongoose.Promise = global.Promise;
}
module.exports = connection;