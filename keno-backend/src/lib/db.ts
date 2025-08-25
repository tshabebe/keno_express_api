import mongoose from 'mongoose';

let isConnected = false;

export async function connectDb(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/keno_express_api';
  await mongoose.connect(uri, {
    // keep options minimal; mongoose v8 uses MongoDB driver v5+ defaults
  });
  isConnected = true;
  return mongoose;
}

export function getMongoose(): typeof mongoose {
  return mongoose;
}
