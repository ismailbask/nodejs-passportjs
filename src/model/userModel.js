const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    ad: {
        type: String,
        required: [true, "İsim alanı boş bırakılmaz"],
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    soyad: {
        type: String,
        required: [true, "Soyisim alanı boş bırakılmaz"],
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, "Şifre alanı en az 6 karakter olmalıdır."]
    },
    avatar: {
        type: String,
        default: 'default.png'
    },
    emailActive: {
        type: Boolean,
        default: false
    }
}, { collection: 'kullanicilar', timestamps: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;