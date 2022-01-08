const { validationResult } = require('express-validator');
const User = require('../model/userModel');
const passport = require('passport');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { findOneAndRemove, findById, findOne } = require('../model/userModel');
require('../config/passport_local')(passport);
const loginFormunuGoster = (req, res, next) => {
     res.render('login', { layout: './layout/auth_layout', title: "Giriş Yap" });//login ekranına gitmeden önce layouta git layottan logini çağır.
}
//login post işlemi
const login = (req, res, next) => {
     //login için hata var mı? varsa yakaladık express-validator' ile
     const errorValidation = validationResult(req);
     req.flash('email', req.body.email);
     req.flash('password', req.body.password);
     if (!errorValidation.isEmpty()) {//hata var mı? varsa arayüze basacaz.
          req.flash('validation_error', errorValidation.array());
          res.redirect('/login');
     }
     else {
          // Sonunda, doğrulama için pasaport.authenticate() kullanan bir rota işleyici kurduk. Authenticate() işlevinin ilk argümanı kullanılan stratejidir ve ikinci argüman, kimlik doğrulamanın başarılı veya başarısız olması durumunda nereye yönlendirileceğini belirten bir nesnedir.
          passport.authenticate('local', {//local passport_local.js klasöründeki yapıyı kullanacak.
               successRedirect: '/admin',
               failureRedirect: '/login',
               badRequestMessage: 'Eksik kimlik bilgileri',//input alanları boş girilince bu hatayı versin.
               failureFlash: true
          })(req, res, next);

          // FailureFlash özelliği, kimlik doğrulamanın başarısız olması durumunda yeniden yönlendirilen rotada bir hata mesajının gösterilmesini sağlar.
          // Gösterilecek mesajın, geri aramayı doğrula, yani { msg } tarafından sağlandığını unutmayın.
     }

}

const registerFormunuGoster = (req, res, next) => {
     // console.log(req.flash());//burada da görüldüğü üzere, flash içine kaydettiğimiz hata mesajı ekrana basıldı.
     res.render('register', { layout: './layout/auth_layout', title: "Kayıt Ol" });
}
//register post işlemi
const register = async (req, res, next) => {
     const errorValidation = validationResult(req);//validation_middlewareden donen hataları yakaldık.bunu da validationResult ile yaptık.
     if (!errorValidation.isEmpty()) {//hata var mı? varsa arayüze basacaz.
          req.flash('validation_error', errorValidation.array());//diziye çevirdik çünkü arayüzde hataları göstermek istiyoruz. flash middleware hatamızı ekledik. redirect de sadece string alan döndüğü için bu hataları yollamamız flashı kullandık
          req.flash('email', req.body.email);//kayıt işleminde herhangi bir input alanı hatalı girilirse eğer hatalı olmayan alanı silmemek için req.flash içine bodyden gelen değerleri yazıyoruz. app.js kısmında middlewarede  res.localsa ekleyip arayüze yansıttık.
          req.flash('ad', req.body.ad);
          req.flash('soyad', req.body.soyad);
          req.flash('password', req.body.password);
          req.flash('repassword', req.body.repassword);
          res.redirect('/register');// burada registere get isteğinde bulunduk. her get isteğinde app.js tetiklenir.
     }
     else {
          try {
               const _user = await User.findOne({ email: req.body.email });
               if (_user && _user.emailActive == true) {
                    req.flash('validation_error', [{ msg: "Bu mail zaten kayıtlı!" }]);
                    req.flash('validation_error', errorValidation.array());//diziye çevirdik çünkü arayüzde hataları göstermek istiyoruz. flash middleware hatamızı ekledik. redirect de sadece string alan döndüğü için bu hataları yollamamız flashı kullandık
                    req.flash('email', req.body.email);//kayıt işleminde herhangi bir input alanı hatalı girilirse eğer hatalı olmayan alanı silmemek için req.flash içine bodyden gelen değerleri yazıyoruz. app.js kısmında middlewarede  res.localsa ekleyip arayüze yansıttık.
                    req.flash('ad', req.body.ad);
                    req.flash('soyad', req.body.soyad);
                    req.flash('password', req.body.password);
                    req.flash('repassword', req.body.repassword);
                    res.redirect('/register');
               } else if ((_user && _user.emailActive == false) || _user == null) {
                    if (_user) {
                         await User.findOneAndRemove({ _id: _user._id })
                    }
                    const newUser = new User({
                         email: req.body.email,
                         ad: req.body.ad,
                         soyad: req.body.soyad,
                         password: await bcrypt.hash(req.body.password, 10)
                    });
                    await newUser.save();
                    console.log("Kullanıcı kaydedildi");

                    //jwt işlemleri
                    const jwtInfo = {
                         id: newUser.id,
                         mail: newUser.email
                    };
                    const jwtToken = jwt.sign(jwtInfo, process.env.CONFIRM_MAIL_JWT_SCRET, {
                         expiresIn: '1d'
                    });
                    // console.log(jwtToken);

                    //Mail gönderme     
                    const url = process.env.WEB_SITE_URL + 'verify?id=' + jwtToken;
                    // console.log("Oluşan link: " + url);
                    let transporter = nodemailer.createTransport({
                         service: 'gmail',
                         auth: {
                              user: process.env.G_USER,
                              pass: process.env.G_PASS
                         }
                    });
                    await transporter.sendMail({
                         from: 'Nodejs uygulaması <info@nodejs.com>',
                         to: newUser.email,
                         subject: 'Email Onayı',
                         html: '<h1>Email adresinizi onaylamak için linke tıklayın:<h1/>' + url,
                    }, (error, info) => {
                         if (error) {
                              console.log("Email gönderilirken hata " + error);
                         }
                         // console.log("Mail gönderildi");
                         // console.log(info);
                         transporter.close();
                    });
                    req.flash('success_message', [{ msg: "Kayıt başarılı bir şekilde oluşturuldu. Giriş yapabilmek için mail kutunuza gelen mesajı onaylayın!" }]);
                    res.redirect('/login')
               }
          } catch (error) {
               console.log("Hata:" + error)
          }
     }


}


const forgotPasswordGoster = (req, res, next) => {
     res.render('forgot_password', { layout: './layout/auth_layout', title: "Şifremi Unuttum" });
}
const forgotPassword = async (req, res, next) => {
     const errorValidation = validationResult(req);
     if (!errorValidation.isEmpty()) {
          req.flash('validation_error', errorValidation.array());
          req.flash('email', req.body.email);
          res.redirect('/forgot-password');
     } else {
          try {
               const _user = await User.findOne({ email: req.body.email, emailActive: true });
               if (_user) {
                    //jwt işlemleri
                    const jwtInfo = {
                         id: _user._id,
                         mail: _user.email
                    };
                    const secret = process.env.RESET_PASSWORD_JWT_KEY + "-" + _user.password;
                    const jwtToken = jwt.sign(jwtInfo, secret, { expiresIn: '1d' });
                    //Mail işlemleri
                    const url = process.env.WEB_SITE_URL + 'reset-password/' + _user.id + "/" + jwtToken;
                    // console.log("Oluşan link: " + url);//şifre sıfırlamak için kullanıcının idsi gerekli çünkü biz secretkeye kullanıcının idsini ekledik ki, kimin şifreyi değiştirmek istediğini anlayabilelim.
                    let transporter = nodemailer.createTransport({
                         service: 'gmail',
                         auth: {
                              user: process.env.G_USER,
                              pass: process.env.G_PASS
                         }
                    });
                    await transporter.sendMail({
                         from: 'Nodejs uygulaması <info@nodejs.com>',
                         to: _user.email,
                         subject: 'Şifre Sıfırlama',
                         html: '<h1>Şifrenizi sıfırlamak için linke tıklayın:<h1/>' + url,
                    }, (error, info) => {
                         if (error) {
                              console.log("Email gönderilirken hata " + error);
                         }
                         // console.log("Mail gönderildi");
                         // console.log(info);
                         transporter.close();
                    });
                    req.flash('success_message', [{ msg: "Şifre sıfırlama talebi başarılı bir şekilde alındı. Şifreyi sıfırlamak için email adresinizi kontrol ediniz!" }]);
                    res.redirect('/login')
               }
               else {
                    req.flash('validation_error', [{ msg: 'Bu mail aktif değil yahut zaten hiç kaydolmamış' }]);
                    req.flash('email', req.body.email);
                    res.redirect('/forgot-password');
               }
          } catch (error) {
          }
     }
     // res.render('forgot_password', { layout: './layout/auth_layout' });
}
const logout = (req, res, next) => {
     req.logout();//veritabanında session içindeki passportun altına kaydedilen idyi siler
     req.session.destroy((error => {
          res.clearCookie('connect.sid');
          // req.flash('success_message',[{msg:'Başarılı bir şekilde çıkış yapıldı'}]);
          res.render('login', { layout: './layout/auth_layout', success_message: [{ msg: 'Başarlı bir şekilde çıkış yapıldı' }], title: "Çıkış Yap" })
          // res.redirect('/login');
     }));
};
const verifyMail = (req, res, next) => {
     const token = req.query.id;
     if (token) {
          try {
               jwt.verify(token, process.env.CONFIRM_MAIL_JWT_SCRET, async (e, decoded) => {
                    if (e) {
                         req.flash('error', 'Kod hatalı veya süresi geçmiş');
                         res.redirect('/register');
                    } else {
                         const decodedId = decoded.id;
                         const sonuc = await User.findByIdAndUpdate(decodedId, { emailActive: true });
                         if (sonuc) {
                              req.flash('success_message', [{ msg: 'Mail başarılı bir şekilde onaylandı. Giriş yapabilirsiniz.' }]);
                              res.redirect('/login');
                         } else {
                              req.flash('error', 'Lütfen tekrardan deneyin');
                         }
                    }
               });

          } catch (error) {

          }
     }
     else {
          console.log("token yok")
     }
};
const newPassword = async (req, res, next) => {
     const linkId = req.params.id;
     const linkToken = req.params.token;
     if (linkId && linkToken) {
          const _bulunanUser = await User.findOne({ id: linkId });
          const secret = process.env.RESET_PASSWORD_JWT_KEY + "-" + _bulunanUser.password;
          try {
               jwt.verify(linkToken, secret, async (e, decoded) => {
                    if (e) {
                         req.flash('error', 'Kod hatalı veya süresi geçmiş');
                         res.redirect('/forgot-password');
                    } else {
                         res.render('reset_password', { id: linkId, token: linkToken, layout: './layout/auth_layout.ejs', title: "Yeni Şifre" });
                    }
               });

          } catch (error) {
               console.log("şifre resetlemede hata: " + error);
          }

     } else {
          req.flash('validation_error', [{ msg: 'Token bulunamadı!' }]);
          res.redirect('/forgot-password');
     }

};
const newPasswordSave = async (req, res, next) => {
     const errorValidation = validationResult(req);
     // hata varsa tekrardan şifre sıfırlama linkine yönendirildi.
     if (!errorValidation.isEmpty()) {
          req.flash('validation_error', errorValidation.array());
          req.flash('password', req.body.password);
          req.flash('repassword', req.body.repassword);
          // console.log("formden gelen değerler", req.body);//artık req.body içinde token ve id değerleri var. burada bunları saklamamızın amacı şifre yenilerken herhangi bir hata ile karşılaşınca bu değerleri kaybetmeyip tekrardan bu değerler içeren link oluşturumak. newPassord fonksiyonunda bu değerleri res.render ile yolladık. render edilen ejs doyası içersinde input alınına gömdük. req.body içerisinden de çektik.
          res.redirect('/reset-password/' + req.body.id + "/" + req.body.token); //'/reset-password/:id/:token'
     } else {
          //burada şifre güncelleme için bodyden gelen token ve id nin yaratmış olduğu güvenlik açığını giderdik. başkasının idsini bilen biri, başkasının şifresini değişebilir. bundan dolayı. id ye göre arama yaptık ve decod ettik linki.
          const linkID = req.body.id;
          console.log(linkID);
          const sonKullanıcı = await User.findById({ _id: linkID, emailActive: true });
          const secret = process.env.RESET_PASSWORD_JWT_KEY + "-" + sonKullanıcı.password;
          console.log("Son kullanıcı ", sonKullanıcı);
          try {

               jwt.verify(req.body.token, secret, async (e, decoded) => {
                    if (e) {
                         req.flash('error', 'Kod hatalı veya süresi geçmiş');
                         res.redirect('/forgot-password');
                    } else {
                         const hashedPass = await bcrypt.hash(req.body.password, 10);

                         const sonuc = await User.findByIdAndUpdate(linkID, { password: hashedPass });
                         console.log("Şifre değiştirme" + sonuc, linkID);
                         if (sonuc) {
                              req.flash("success_message", [{ msg: "Şifre başarılı bir şekilde güncellendi." }]);
                              res.redirect('/login');
                         } else {
                              req.flash("error", 'Lütfen tekrardan şifre sıfırlama adımlarını gerçekleştirin');
                              res.redirect('/login');
                         }
                    }
               });

          } catch (error) {
               console.log("şifre resetlemede hata: " + error);
          }


     }
};

module.exports = {
     loginFormunuGoster,
     registerFormunuGoster,
     forgotPasswordGoster,
     register,
     login,
     forgotPassword,
     logout,
     verifyMail,
     newPassword,
     newPasswordSave
}