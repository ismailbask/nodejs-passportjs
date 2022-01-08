const router = require('express').Router();
const authController = require('../controllers/auth_controller');
const validatorMiddleware = require('../middlewares/validation_middleware');
const authMiddleware=require('../middlewares/auth_middleware');
router.get("/login",authMiddleware.successSession, authController.loginFormunuGoster);
router.post("/login",validatorMiddleware.validateLogin(), authController.login);

router.get("/register",authMiddleware.successSession, authController.registerFormunuGoster);
router.post("/register",validatorMiddleware.validateNewUser(), authController.register);///register isteği gelince önce validateNewUser ara katmana gider ve orada input alanına yazılmış olan girdileri kontrol eder, bir hata varsa ekrana yazdırır yoksa kaydetme işleminin yapıldığı authController a gider.

router.get("/forgot-password",authMiddleware.successSession, authController.forgotPasswordGoster);
router.post("/forgot-password",authMiddleware.successSession,validatorMiddleware.validateEmail(), authController.forgotPassword);
router.get('/verify', authController.verifyMail);
router.get('/reset-password/:id/:token',authController.newPassword);
router.get('/reset-password', authController.newPassword);
router.post('/reset-password',validatorMiddleware.validateNewPassword(), authController.newPasswordSave);
router.get('/logout',authMiddleware.sessionControl,authController.logout);

module.exports = router;