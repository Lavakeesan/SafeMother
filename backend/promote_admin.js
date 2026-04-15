const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');

dotenv.config();

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: email });

        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Success: User ${email} has been promoted to 'admin' role.`);
        console.log('Please LOGOUT and LOGIN AGAIN on the dashboard to refresh your session.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.error('Usage: node promote_admin.js <email>');
    process.exit(1);
}

promoteToAdmin(email);
