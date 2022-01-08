const { body } = require('express-validator');

const validateNewUser = () => {
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Geçerli bir mail adresi giriniz.'),
        body('password')
            // .trim()
            .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
            .isLength({ max: 30 }).withMessage('Şifre en fazla 30 karakter olmalıdır'),
        body('ad')
            .trim()
            .isLength({ min: 3 }).withMessage('İsim alanı en az 3 karakter olmalıdır')
            .isLength({ max: 30 }).withMessage('İsim en fazla 30 karakter olmalıdır'),
        body('soyad')
            .trim()
            .isLength({ min: 3 }).withMessage('Soyad alanı en az 3 karakter olmalıdır')
            .isLength({ max: 30 }).withMessage('Soyad en fazla 30 karakter olmalıdır'),
        body('repassword').trim().custom((value, { req }) => {//Bu kısım şifrenizi tekrar giriniz kontrolüdür. dökümantasyonda bu yapı var.
            if (value != req.body.password) {
                throw new Error('Şifreler aynı değil');
            }
            return true;
        })
        
    ];
};

const validateNewPassword = () => {
    return [
        body('password')
            // .trim()
            .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
            .isLength({ max: 30 }).withMessage('Şifre en fazla 30 karakter olmalıdır'),
        body('repassword').trim().custom((value, { req }) => {//Bu kısım şifrenizi tekrar giriniz kontrolüdür. dökümantasyonda bu yapı var.
            if (value != req.body.password) {
                throw new Error('Şifreler aynı değil');
            }
            return true;
        })
        
    ];
};

const validateLogin = () => {
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Geçerli bir mail adresi giriniz.'),
        body('password')
            .trim()
            .isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
            .isLength({ max: 30 }).withMessage('Şifre en fazla 30 karakter olmalıdır')
    ];
};
const validateEmail = ()=>{
    return [
        body('email')
            .trim()
            .isEmail().withMessage('Geçerli bir mail adresi giriniz.')
    ];
}
module.exports = {
    validateNewUser,
    validateLogin,
    validateEmail,
    validateNewPassword
}