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

// Pakistani phone number validation
export const pakistaniPhoneSchema = ({ dataIn = 'body', required = true }) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: 'Phone number is required',
  isString: {
    errorMessage: 'Phone number must be a string',
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: 'Phone number must not be empty',
    bail: true,
  },
  matches: {
    options: /^(\+92|0)?[0-9]{3}-?[0-9]{7}$|^(\+92|0)?[0-9]{10}$/,
    errorMessage: 'Please enter a valid Pakistani phone number (e.g., +92-300-1234567 or 0300-1234567)',
  },
  trim: true,
});

// Staff role validation
export const staffRoleSchema = ({ dataIn = 'body', required = true }) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: 'Role is required',
  isString: {
    errorMessage: 'Role must be a string',
    bail: true,
  },
  isIn: {
    options: [['nurse', 'doctor']],
    errorMessage: 'Role must be either nurse or doctor',
  },
});

// Doctor specialization validation
export const doctorSpecializationSchema = ({ dataIn = 'body', required = false }) => ({
  in: [dataIn],
  optional: { options: { nullable: true } },
  errorMessage: 'Specialization must be a valid option',
  isString: {
    errorMessage: 'Specialization must be a string',
    bail: true,
  },
  isIn: {
    options: [['cardiologist', 'endocrinologist', 'pulmonologist', 'psychiatrist', 'general', 'oncologist', 'neurologist']],
    errorMessage: 'Invalid specialization selected',
  },
});

// Nurse type validation
export const nurseTypeSchema = ({ dataIn = 'body', required = false }) => ({
  in: [dataIn],
  optional: { options: { nullable: true } },
  errorMessage: 'Nurse type must be a valid option',
  isString: {
    errorMessage: 'Nurse type must be a string',
    bail: true,
  },
  isIn: {
    options: [['fresh', 'bscn']],
    errorMessage: 'Nurse type must be either fresh or bscn',
  },
});