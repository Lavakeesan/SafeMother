const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://192.168.1.93:8080',
    'http://localhost:5173',
];

app.use(cors({
    origin: function (origin, callback) {
        // Reflection for dev: always allow the origin if it exists
        if (!origin) return callback(null, true);
        console.log('Incoming request from origin:', origin);
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/guidelines', require('./routes/medicalGuidelineRoutes'));
app.use('/api/consultations', require('./routes/consultationRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/clinical-reports', require('./routes/clinicalReportRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/sms', require('./routes/messageRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
