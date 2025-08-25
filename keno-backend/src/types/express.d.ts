import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email?: string;
    };
  }
  interface Locals {
    io?: import('socket.io').Server;
  }
}

