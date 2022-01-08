const multer = require('multer');
const path = require('path');
//yüklenecek image dosyalarının nereye kaydedileceğini söyler.
const myStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads/avatars"));//path.join dosya yollarını birleştirdi.
    },
    filename: (req, file, cb) => {
        cb(null, req.user.id + "" + path.extname(file.originalname));
    }
});
//image dosyalarının uzantılarını belirler
const myFileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);

    }

};
const uploadImage = multer({ storage: myStorage, fileFilter: myFileFilter });
module.exports = uploadImage;