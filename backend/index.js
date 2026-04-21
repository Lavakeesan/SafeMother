const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Ensure DB is connected before processing any requests
app.use(async (req, res, next) => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        await connectDB();
        next();
    } catch (err) {
        console.error('Database connection error:', err.message);
        res.status(500).json({ message: 'Database connection failed: ' + err.message });
    }
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://192.168.1.93:8080',
    'http://localhost:5173',
    'https://safe-mother-two.vercel.app',
    'https://safe-mother-74td.vercel.app',
    process.env.FRONTEND_URL,
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps)
        if (!origin) return callback(null, true);
        
        // Dynamically allow any vercel domain or allowedOrigins
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            console.error('CORS blocked incoming request from origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
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
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/sms', require('./routes/messageRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
