const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    password: String,
    profileImage: String,
    bio: String,  
});


module.exports = mongoose.model('User',userSchema);