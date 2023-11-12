const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    name: String,
    email: String
});

userSchema.statics.findOrCreate = function findOrCreate(condition, doc) {
    const self = this;
    return self.findOne(condition).then((result) => {
        if (result) {
            return result;
        }
        return self.create(doc);
    });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
