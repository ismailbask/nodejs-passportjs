const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => console.log("Veritabanına bağlanıldı"))
    .catch(err => console.log("Veritabanına bağlanırken hata oluştu!"+err));