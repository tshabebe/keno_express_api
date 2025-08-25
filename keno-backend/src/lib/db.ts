import mongoose from 'mongoose';

let isConnected = false;

export async function connectDb(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  await mongoose.connect(uri);
  isConnected = true;
  return mongoose;
}

export function getMongoose(): typeof mongoose {
  return mongoose;
}
