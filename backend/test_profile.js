const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('./models/patientModel');
const User = require('./models/userModel');
const Midwife = require('./models/midwifeModel');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({role: 'patient'}).sort({createdAt: -1});
    if (!user) {
        console.log("NO PATIENT USER");
        process.exit(0);
    }
    console.log("Found User ID:", user._id);
    try {
        const patient = await Patient.findOne({ user_id: user._id }).populate('midwife_id');
        console.log("Profile Data:", patient);
    } catch(e) {
        console.log("ERROR:", e);
    }
    process.exit(0);
}
run();
