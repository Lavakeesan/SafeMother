const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@gmail.com';
        const adminPassword = 'Admin123$';

        // Check if user already exists
        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log('User already exists. Updating role and password...');
            user.password = adminPassword;
            user.role = 'admin';
            user.name = 'System Administrator';
            await user.save();
        } else {
            console.log('Creating new admin user...');
            await User.create({
                name: 'System Administrator',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
        }

        console.log('--------------------------------------------------');
        console.log('ADMIN SEEDED SUCCESSFULLY');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('--------------------------------------------------');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
