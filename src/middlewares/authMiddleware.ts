import { validationResult } from 'express-validator';
import { STATUS } from '../messages/statusCodes';
import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/helper';
import { getUserById } from '../models/userModel';
import { ERRORS } from '../messages/errors';
import { IGetUserAuthInfoRequest } from '../types/index.ds';

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('🚀 ~ apiAuthorizer ~ req:', req.headers);

  // Retrieve the authorization header (case-insensitive)
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string) || null;

  if (!authHeader) {
    return res.status(STATUS.unauthorized).json({
      error: true,
      message: 'Token missing',
    });
  }

  // Bypass authentication if the API key matches
  if (authHeader === process.env.API_BYPASS_KEY) {
    console.log('bypass due to api key');
    return next();
  }

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(STATUS.unauthorized).json({
      error: true,
      message: 'Invalid token format',
    });
  }

  try {
    // Verify the token
    const tokenData = await verifyToken(authHeader.split(' ')[1]);

    console.log('Token Data: ', tokenData);

    if (tokenData) {
      // Fetch the user associated with the token
      const isUser = await getUserById(tokenData.id);

      if (!isUser) {
        return res.status(STATUS.unauthorized).json({
          message: ERRORS.userNotFound,
          error: true,
          code: 'userNotFound',
        });
      }

      console.log('checking');
      // Check if the user is accessing their own resource when required
      if (
        req.params?.userId &&
        parseInt(req.params.userId, 10) !== isUser.id
      ) {
        return res.status(STATUS.unauthorized).json({
          message: ERRORS.accessDenied,
          error: true,
          code: 'accessDenied',
        });
      }
      
      // Add user info to request
      const customReq = req as unknown as IGetUserAuthInfoRequest;
      customReq.user = {
        id: isUser.id,
        email: isUser.email,
      };
    }
    // Proceed to the next middleware or route handler
    return next();
  } catch (error: unknown) {
    console.error('Authorization Error: ', error);

    return res.status(STATUS.unauthorized).json({
      error: true,
      message: ERRORS.unableToAuthenticate,
      code: 'unableToAuthenticate',
    });
  }
};

const isAdminRole = (req: Request, res: Response, next: NextFunction) => {
  const authHeader =
    req.headers.authorization || (req.headers.Authorization as string) || null;

  if (authHeader === process.env.API_BYPASS_KEY) {
    console.log('bypass due to api key');
    return next();
  }

  // Role-based authorization removed - all authenticated users have access
  return next();
};

const checkSchemaError = (req: Request, res: Response, next: NextFunction) => {
  // validating error
  console.debug('🚀 ~ checkSchemaError ~ req:', req);
  const errors = validationResult(req);
  console.debug('🚀 ~ checkSchemaError ~ errors:', errors);
  console.log('CHECK_SCHEMA_ERROR', errors.array());
  const arrayss = errors.array();
  if (!errors.isEmpty()) {
    return res
      .status(STATUS.badRequest)
      .json({ errors: true, message: arrayss[0].msg });
  }
  return next(); // moving to the next function
};

export { checkSchemaError, isAuthenticated, isAdminRole };

