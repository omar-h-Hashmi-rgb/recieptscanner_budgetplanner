const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Adjust path if needed
const connectDB = require('./config/db'); // Adjust path if needed

dotenv.config();

const resetPassword = async () => {
    try {
        await connectDB();

        const email = 'omarhashmi494@gmail.com';
        const newPassword = 'password123'; // Default temporary password

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.password = newPassword;
        await user.save(); // Triggers the pre-save hook to hash the password

        console.log(`Password for ${email} has been reset to: ${newPassword}`);
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
