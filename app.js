const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
//tamplate engine ayarları
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
app.use(expressLayouts);
//css dosyalarını okumak
app.use(express.static('public'));
//Veritabanındaki resimleri arayüzde göstermek için uploads yolunu gösterdik.
app.use("/uploads", express.static(path.join(__dirname, '/src/uploads')));
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, './src/views/'));
//Veritabanı bağlantısı
require('./src/config/database');

//Sessionları veritabanına kaydettik.
const MongoDBStore = require('connect-mongodb-session')(session);
const sessionStore = new MongoDBStore({
    uri: process.env.MONGODB_CONNECTION_STRING,//sessionları kaydedeceği veri tabanı bağlantısını verdik.
    collection: 'session'
});

//session ve flash message. ilk session çalışacak sonra flash.

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    },
    store: sessionStore //oluşturulan sessionlar veritabanına kaydedilecek.
}
));
//flash, session yapısını kullanır.
app.use(flash());
app.use((req, res, next) => {//redirect get isteğini burada karşıladık.
    res.locals.validation_error = req.flash('validation_error');//req.falshtaki hata mesajlarını res'in içine attık. registerFormunuGoster metodunda res.render işlemiyle register sayfasına hatayı yollamış olduk.
    res.locals.email = req.flash('email');
    res.locals.ad = req.flash('ad');
    res.locals.soyad = req.flash('soyad');
    res.locals.password = req.flash('password');
    res.locals.repassword = req.flash('repassword');
    res.locals.success_message = req.flash('success_message');
    //login kısmında hata mesajlarını yansıtmak.
    res.locals.login_error = req.flash('error');
    next();
});
//Pasaport katmanı kullanımdan önce başlatılmalıdır. Bu nedenle, pasaport.initialize() ara katman yazılımı kullanılır.
app.use(passport.initialize());
//Başarılı bir kimlik doğrulamasından sonra aktif bir oturum sürdürmeyi seçtiğimiz için, pasaport.session() ara yazılımına da ihtiyaç vardır. Oturumların doğru sırada olmasını sağlamak için pasaport oturumunun express.session()'dan sonra kullanılması gerektiğini unutmamak önemlidir!
app.use(passport.session());

//Router
const authRoter = require('./src/routers/auth_router');
const adminRouter = require('./src/routers/admin_router');



//formdan gelen değerleri okumak için
app.use(express.urlencoded({ extended: true }));
let sayac;
app.get('/', (req, res) => {
    if (req.session.sayac) {
        req.session.sayac++;
    }
    else {
        req.session.sayac = 1;
    }
    res.json({
        message: "hoşgeldiniz",
        sayac: req.session.sayac,
        user: req.user,
        // kullanıcı:req.yeniUser.ad+" "+req.user.soyad +" Hoşgeldiniz"
    })
});
app.use('/', authRoter);
app.use('/admin', adminRouter);



app.listen(process.env.PORT, () => {
    console.log(`Server ${process.env.PORT} portunda çalışıyor...`);
});
