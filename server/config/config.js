//puerto

process.env.PORT = process.env.PORT || 3000;

// ===============
// Entorno de desarrollo (local o produccion)
// ===============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
// ===============
// vencimiento de Token
// ===============
//60 segundos
//60 minutos
//24 horas
//30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
// ===============
// seed o semilla de autenticacion
// ===============
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';


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

// ===============
// google client ID
// ===============

process.env.CLIENT_ID = process.env.CLIENT_ID || '957655100929-flcc4n5lhgbn03t146df7sjmnqifgd5r.apps.googleusercontent.com';