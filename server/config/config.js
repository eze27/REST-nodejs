//puerto

process.env.PORT = process.env.PORT || 3000;

// ===============
// Entorno de desarrollo (local o produccion)
// ===============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===============
// Entorno de desarrollo MongoDb
// ===============

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    //desarrollo local
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //produccion
    //pass = aVGBaxDVccSJw8y
    urlDB = process.env.MONGO_URI;
}
//mongodb://localhost:27017/cafe


process.env.URLDB = urlDB;