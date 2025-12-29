import { ERRORS } from '../messages/errors';

// Define your email address schema using the custom type
export const emailAddressSchema = ({ dataIn = 'body', required = true }) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: 'Email is required',
  isString: {
    errorMessage: 'Email must be a string',
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: 'Email must not be empty',
    bail: true,
  },
  isEmail: {
    errorMessage: 'Enter a valid email address',
    bail: true,
  },
  normalizeEmail: false,
  trim: true,
});

// passwordSchema function in authSchema
export const passwordSchemaFunct = ({
  dataIn = 'body',
  label = 'password',
  required = true,
}) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  errorMessage: `${label} ${ERRORS.required}`,
  isString: {
    errorMessage: `${label} ${ERRORS.mustBeString}`,
  },
  isStrongPassword: {
    options: {
      minSymbols: 0,
      minNumbers: 1,
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
    },
    errorMessage: ERRORS.invalidPassType,
  },
});

// Simple text schema function
export const simpleTextSchemaFunc = ({
  dataIn = 'body',
  label = 'field',
  required = true,
  minLength = 1,
  maxLength = 255,
}) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: `${label} is required`,
  isString: {
    errorMessage: `${label} must be a string`,
    bail: true,
  },
  notEmpty: required ? {
    options: { ignore_whitespace: true },
    errorMessage: `${label} must not be empty`,
    bail: true,
  } : null,
  isLength: {
    options: { min: minLength, max: maxLength },
    errorMessage: `${label} must be between ${minLength} and ${maxLength} characters`,
  },
  trim: true,
});

// Simple ID schema function
export const simpleIdSchemaFunc = ({
  dataIn = 'params',
  label = 'id',
  required = true,
}) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: `${label} is required`,
  isInt: {
    options: { min: 1 },
    errorMessage: `${label} must be a positive integer`,
  },
  toInt: true,
});