import mongoose from 'mongoose';

let isConnected = false;

export async function connectDb(): Promise<typeof mongoose> {
  if (isConnected) {
    console.log('✅ Database already connected');
    return mongoose;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  isConnected = true;
  console.log('✅ Successfully connected to MongoDB database');
  return mongoose;
}

export function getMongoose(): typeof mongoose {
  return mongoose;
}
