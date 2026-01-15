declare module 'express-serve-static-core' {
  interface Request {
    correlationId?: string;
  }
}

export {};
