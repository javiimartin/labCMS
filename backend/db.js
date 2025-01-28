const {Pool} = require('pg');
const {db} = require('./config');

let pool; // Definir pool a nivel global para reutilizarlo

if (!pool) {
    try {
        if (process.env.NODE_ENV === 'production') {
            console.log("🌍 Ejecutando en producción: Conectando a Cloud SQL...");
            pool = new Pool({
                user: process.env.DB_USER || db.user,
                password: process.env.DB_PASS || db.password,
                host: process.env.DB_HOST || db.host,
                port: process.env.DB_PORT || db.port || 5432,
                database: process.env.DB_NAME || db.database,
                ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
            });
        } else {
            console.log("🖥️ Ejecutando en desarrollo: Conectando a base de datos local...");
            pool = new Pool({
                user: db.user,
                password: db.password,
                host: db.host,
                port: db.port || 5432,
                database: db.database,
                ssl: false,
            });
        }

        console.log("✅ Conexión a la base de datos establecida correctamente.");
    } catch (error) {
        console.error("❌ Error al conectar a la base de datos:", error.message);
        process.exit(1); // Terminar el proceso si la conexión falla
    }
}

module.exports = pool;