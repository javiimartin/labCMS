const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const http = require('http');

const attendanceRouter = require('./routes/attendance.routes');
const labsRouter = require('./routes/labs.routes');
const userRouter = require('./routes/user.routes');
const adminRouter = require('./routes/admin.routes');

const app = express();

app.use(helmet());

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,POST,PUT,DELETE,OPTIONS', 
    allowedHeaders: 'Content-Type,Authorization', 
    credentials: true 
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limita a 100 solicitudes por IP
});
app.use(limiter);

app.set('trust proxy', 1); 

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Attendance Records API');
});

// Rutas
app.use('/attendance', attendanceRouter);
app.use('/labs', labsRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    return res.status(500).json({
        message: err.message
    });
});

const httpServer = http.createServer(app);

httpServer.listen(5000, () => {
    console.log('HTTP Server running on port 5000');
});