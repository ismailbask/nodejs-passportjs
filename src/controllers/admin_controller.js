const User = require('../model/userModel');
const anasayfaGoster = (req, res, next) => {
    res.render('index', { layout: './layout/admin_layout', user: req.user, title: "Yönetim Paneli | Anasayfa" });
};
const profilGoster = (req, res, next) => {
    res.render('profile', { layout: './layout/admin_layout', user: req.user, title: "Profil Sayfası" })
}
const profilGuncelle = async (req, res, next) => {
    const guncelBilgiler = {
        ad: req.body.ad,
        soyad: req.body.soyad
    };

    try {
        if (req.file) {
            guncelBilgiler.avatar = req.file.filename;
        }
        const sonuc = await User.findByIdAndUpdate(req.user.id, guncelBilgiler);//guncel bilgileri direkt verdik
        if (sonuc) {
            // console.log("update tamamlandı");
            req.flash("success_message", [{ msg: "Şifre başarılı bir şekilde güncellendi." }]);
            res.redirect('/admin/profil')
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    anasayfaGoster,
    profilGoster,
    profilGuncelle
}