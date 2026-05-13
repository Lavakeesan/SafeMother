const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('Please define the MONGO_URI environment variable inside .env or Vercel settings');
    }

    if (cached.conn) {
        // If connection exists, check if it's still alive
        if (mongoose.connection.readyState === 1) {
            return cached.conn;
        }
        // If not alive, reset and reconnect
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        // In serverless, we sometimes want to keep bufferCommands true (default) 
        // to handle slight connection delays gracefully, or manage it strictly via middleware.
        // Removing bufferCommands: false allows Mongoose to wait a few milliseconds if needed.
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongoose) => {
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error(`Database connection error: ${e.message}`);
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;
