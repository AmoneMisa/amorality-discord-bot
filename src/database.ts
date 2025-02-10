import mongoose from 'mongoose';

export async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '', {
            dbName: 'discordbot',
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB', error);
        process.exit(1);
    }
}
