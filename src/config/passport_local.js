const LocalStrategy = require('passport-local').Strategy;
const User = require("../model/userModel");
const bcrypt = require('bcrypt');

module.exports = function (passport) {
    const options = {
        usernameField: 'email'// username alanı yerine mail alanı kullanıyoruz.
    };
    passport.use(new LocalStrategy(options, async (email, password, done) => {
        try {
            const _bulunanUser = await User.findOne({ email: email });
            if (!_bulunanUser) {
                return done(null, false, { message: 'Kullanıcı adı veya şifre hatalı!' });
            }  
            const passwordControl = await bcrypt.compare(password, _bulunanUser.password);
            if (!passwordControl) {
                  return done(null, false, { message: 'Kullanıcı adı veya şifre hatalı!' });
            } else {
                if (_bulunanUser&&_bulunanUser.emailActive==false) {
                return done(null, false, { message: 'Email adresinizi size gönderilen linkten onaylamanız gerekiyor.' });
                } else {
                    //eğer herhangi bir hata yoksa kullanıcı geri döndürülür.
                return done(null, _bulunanUser); 
            }
                
            }

            
        } catch (error) {
            return done(error);
        }
    }));
    // serializeUser bulunan userın cookieye kaydedilmesi, deserializeUser ise cookieden okunan userın veritabanından bulunması ve geri döndürülmesi işlemleri.
    passport.serializeUser(function (user, done) {
        // console.log("Sessiona kaydedildi " + user.id);//user.id, veritabanında oluşan passportjs alanına kaydedildi. 
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        // console.log("Sessiona kaydedilen id veritabanında aranadı ve bulundu"); //passport js alanındaki user.id veritabanında aranıp bulundu.
        User.findById(id, function (err, user) {
            // const yeniUser = {//bu kısım kullanıcı bilgilerinin bazılarını mesela password _id alanı gibi kısımları göndermemek içindir.
            //     ad: user.ad,
            //     soyad: user.soyad,
            //     email:user.email
            // }
            done(err, user);//veritabanından aranıp bulunan user, artık req.user alanından çekilebilir.
        });
    });
};
