const router = require('express').Router();
const adminController = require('../controllers/admin_controller');
const authMiddleware = require('../middlewares/auth_middleware');
const multerConfig = require('../config/multer');
router.get("/", authMiddleware.sessionControl, adminController.anasayfaGoster);
router.get("/profil", authMiddleware.sessionControl, adminController.profilGoster);
router.post("/profil-guncelle", authMiddleware.sessionControl, multerConfig.single('avatar'), adminController.profilGuncelle);



module.exports = router;