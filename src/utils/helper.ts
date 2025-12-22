import jwt from 'jsonwebtoken';

export const errorLogs = (endpoint: string, error: Error | string) => {
  console.log(`ERR [${endpoint}] ====> ${error}`);
};

export const debugLogs = (endpoint: string, message: unknown) => {
  console.debug(`DEBUG_LOG [${endpoint}] ====> ${message}`);
};

export const verifyToken = async (
  token: string
): Promise<{ id: number; email: string } | undefined> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      email: string;
      role?: string; // Keep for backward compatibility with existing tokens
    };

    return {
      id: decoded.id,
      email: decoded.email,
    };
  } catch (error) {
    console.log('Token verification failed', error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token Expired');
    } else {
      throw new Error(`Token validation failed ${JSON.stringify(error)}`);
    }
  }
};

export const generateToken = (payload: {
  id: number;
  email: string;
}): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
};

