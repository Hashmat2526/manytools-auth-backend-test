const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Create a schema
const userSchema = new Schema({
    method: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        required: true
    },
    local: {
        fullName: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        },
        password: {
            type: String
        }
    },
    google: {
        googleId: {
            type: String
        },
        name: {
            type: String
        },
        email: {
            type: String,
            lowercase: true
        }
    },
    facebook: {
        facebookId: {
            type: String
        },
        name: {
            type: String,
        }
    },
    allowedOrigins: [
        {
            type: String
        }
    ]
});

// generate hashed password for local method before saving a user
userSchema.pre('save', async (next) => {
    try {
        if (this.method !== 'local') {
            next();
        }

        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Generate a password hash (salt + hash)
        const passwordHash = await bcrypt.hash(this.local.password, salt);
        // Re-assign hashed version over original, plain text password
        this.local.password = passwordHash;
        next();
    } catch (error) {
        next(error);
    }
});

// comparing hashed password in case of local method
userSchema.methods.isValidPassword = async (newPassword) => {
    try {
        return await bcrypt.compare(newPassword, this.local.password);
    } catch (error) {

        throw new Error(error);
    }
}

// Create a model
const User = mongoose.model('user', userSchema);

// Export the model
module.exports = User;