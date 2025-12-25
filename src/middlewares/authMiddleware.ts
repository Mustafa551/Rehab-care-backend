import { validationResult } from 'express-validator';
import { STATUS } from '../messages/statusCodes';
import { NextFunction, Request, Response } from 'express';

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

export { checkSchemaError };

