const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
const Admin = require('./models/adminModel');
const Midwife = require('./models/midwifeModel');
const Patient = require('./models/patientModel');
const MedicalGuideline = require('./models/medicalGuidelineModel');
const Consultation = require('./models/consultationModel');
const Appointment = require('./models/appointmentModel');
const Alert = require('./models/alertModel');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        // Clear existing data
        await User.deleteMany();
        await Admin.deleteMany();
        await Midwife.deleteMany();
        await Patient.deleteMany();
        await MedicalGuideline.deleteMany();
        await Consultation.deleteMany();
        await Appointment.deleteMany();
        await Alert.deleteMany();

        console.log('Data Cleared...');

        // Create Users
        const salt = await bcrypt.genSalt(10);
        const demoPassword = await bcrypt.hash('password123', salt);

        const users = await User.create([
            { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' },
            { name: 'Midwife Sarah', email: 'sarah@example.com', password: 'password123', role: 'midwife' },
            { name: 'Midwife Jane', email: 'jane@example.com', password: 'password123', role: 'midwife' },
            { name: 'Patient Mary', email: 'mary@example.com', password: 'password123', role: 'patient' },
            { name: 'Patient Alice', email: 'alice@example.com', password: 'password123', role: 'patient' },
            { name: 'Patient Rose', email: 'rose@example.com', password: 'password123', role: 'patient' },
        ]);

        const [adminUser, midwife1, midwife2, patient1, patient2, patient3] = users;

        // Profiles
        const adminProfile = await Admin.create({
            user_id: adminUser._id,
            permissions: ['ALL_ACCESS', 'MANAGE_GUIDELINES'],
        });

        const mwProfile1 = await Midwife.create({
            user_id: midwife1._id,
            contact_number: '0711234567',
            assigned_area: 'Colombo North',
        });

        const mwProfile2 = await Midwife.create({
            user_id: midwife2._id,
            contact_number: '0717654321',
            assigned_area: 'Colombo South',
        });

        const ptProfile1 = await Patient.create({
            user_id: patient1._id,
            name: 'Mary Perera',
            age: 28,
            address: '123 Main St, Colombo',
            contact_number: '0771234567',
            medical_history: 'First pregnancy, no complications.',
            risk_level: 'Low',
            midwife_id: mwProfile1._id,
            mrn: 'MRN001',
        });

        const ptProfile2 = await Patient.create({
            user_id: patient2._id,
            name: 'Alice Silva',
            age: 32,
            address: '456 Park Rd, Kandy',
            contact_number: '0779876543',
            medical_history: 'History of gestational diabetes.',
            risk_level: 'Medium',
            midwife_id: mwProfile1._id,
            mrn: 'MRN002',
        });

        const ptProfile3 = await Patient.create({
            user_id: patient3._id,
            name: 'Rose Fernando',
            age: 24,
            address: '789 Lake View, Galle',
            contact_number: '0771112222',
            medical_history: 'Pre-eclampsia in previous pregnancy.',
            risk_level: 'High',
            midwife_id: mwProfile2._id,
            mrn: 'MRN003',
        });

        // Guidelines
        await MedicalGuideline.create([
            { title: 'Normal Pregnancy Nutrition', description: 'Guidelines for balanced diet during the first trimester.' },
            { title: 'Warning Signs of Pre-eclampsia', description: 'Checklist of symptoms including high blood pressure and swelling.' },
            { title: 'Post-natal Care Basics', description: 'Essential care for mother and baby in the first 6 weeks.' },
        ]);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Admin.deleteMany();
        await Midwife.deleteMany();
        await Patient.deleteMany();
        await MedicalGuideline.deleteMany();
        await Consultation.deleteMany();
        await Appointment.deleteMany();
        await Alert.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
