import { ERRORS } from '../messages/errors';
import { TextValidationSchema } from '../types/index.ds';

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

// simple textSchemaFunction for plain text schema checking
export const simpleTextSchemaFunc = ({
  dataIn = 'body',
  label = '',
  required = true,
}): TextValidationSchema => ({
  in: dataIn as any,
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: `${label} ${ERRORS.required}`,
  isString: {
    errorMessage: `${label} ${ERRORS.mustBeString}`,
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: `${label} ${ERRORS.required}`,
    bail: true,
  },
  trim: true,
});

// SIMPLE INTEGER ID SCHEMA FUNCTION (replaces ObjectId validation)
export const simpleIdSchemaFunc = ({
  dataIn = 'body',
  label = '',
  required = true,
}) => ({
  custom: {
    options: (value: any, { req, location, path }: any) => {
      const extractedParamValue = req?.[dataIn]?.[label];

      // IF FIELD IS REQUIRED AND NO VALUE IS FOUND THROW AN ERROR
      if (required && !extractedParamValue) {
        throw new Error(`${label} ${ERRORS.required}`);
      }

      // IF FIELD IS NOT A VALID INTEGER ID THROW AN ERROR
      if (extractedParamValue) {
        const id = parseInt(extractedParamValue, 10);
        if (isNaN(id) || id <= 0) {
          throw new Error(`${label} ${ERRORS.mustBeValidObjectId}`);
        }
      }

      return value + req.body + location + path;
    },
  },
});

// simple simpleIntSchemaFunc for checking if input is integer
export const simpleIntSchemaFunc = ({
  dataIn = 'body',
  label = '',
  required = true,
}) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: `${label} ${ERRORS.required}`,
  isInt: {
    errorMessage: `${label} ${ERRORS.mustBeAnInt}`,
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: `${label} ${ERRORS.required}`,
    bail: true,
  },
  trim: true,
});

export const simpleFloatSchemaFunc = ({
  dataIn = 'body',
  label = '',
  required = true,
}) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: `${label} ${ERRORS.required}`,
  isFloat: {
    errorMessage: `${label} ${ERRORS.mustBeFloat}`,
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: `${label} ${ERRORS.required}`,
    bail: true,
  },
  trim: true,
});

export const simpleBooleanSchemaFunc = ({
  dataIn = 'body',
  label = '',
  required = true,
}) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: `${label} ${ERRORS.required}`,
  isBoolean: {
    errorMessage: `${label} ${ERRORS.mustBeBoolean}`,
    bail: true,
  },
});

export const dateSchemaFunc = ({ dataIn = 'body', label = '', required = true }) => ({
  in: [dataIn],
  exists: required ? { options: { checkNull: true, checkFalsy: true } } : null,
  optional: required ? null : { options: { nullable: true } },
  errorMessage: `${label} ${ERRORS.required}`,
  isString: {
    errorMessage: `${label} ${ERRORS.mustBeString}`,
    bail: true,
  },
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: `${label} must be a valid ISO 8601 date string`,
    bail: true,
  },
  notEmpty: {
    options: { ignore_whitespace: true },
    errorMessage: `${label} ${ERRORS.required}`,
    bail: true,
  },
  trim: true,
});

export const simpleObjectSchemaFunc = ({
  dataIn = 'body',
  label = '',
  required = true,
  fields = {},
}: any) => ({
  custom: {
    options: (value: any, { req, location, path }: any) => {
      const extractedParamValue = req?.[dataIn]?.[label];

      if (!extractedParamValue && !required) {
        return value + req.body + location + path;
      }

      // IF FIELD IS REQUIRED AND NO VALUE IS FOUND THROW AN ERROR
      if (required && !extractedParamValue) {
        throw new Error(`${label} ${ERRORS.required}`);
      }

      // IF FIELD IS NOT OBJECT THROW AN ERROR
      if (extractedParamValue && typeof extractedParamValue !== 'object') {
        throw new Error(`${label} ${ERRORS.mustBeAnObj}`);
      }

      const allowedFields: any = {};

      // MAP ALL ALLOWED FIELDS TO A VARIABLE
      for (const key in fields) {
        allowedFields[key] = key;
      }

      const keys = extractedParamValue ? Object.keys(extractedParamValue) : [];

      if (required && keys?.length == 0) {
        throw new Error(`${label} ${ERRORS.shouldntBeEmpty} object`);
      }

      // THROW AN ERROR IF ANY OTHER VALUE IS PROVIDED EXCEPT FOR THE MENTIONED VALUES
      keys.forEach((value) => {
        if (!allowedFields[value]) {
          throw new Error(`${ERRORS.invalidKey} "${value}" in ${label}`);
        }
      });

      for (const key in fields) {
        const { type = '', required = true } = fields[key];
        const actualValue = extractedParamValue ? extractedParamValue[key] : '';

        // IF TYPE IS ARRAY AND ACTUAL VALUE IS NOT OF TYPE ARRAY THROW ERROR
        if (type === 'array' && !Array.isArray(actualValue) && required) {
          throw new Error(`${key} ${ERRORS.mustBeAnArray}`);
        } else if (
          required &&
          actualValue &&
          typeof actualValue !== type &&
          type !== 'array'
        ) {
          // THROW AN ERROR IF VALUE TYPES OF KEYS OF GIVEN FIELDS ARE NOT EQUAL TO EXPECTED VALUE TYPES
          throw new Error(`${key} should be of type ${type}`);
        }

        // IF EMPTY OR NOT FOUND THROW ERROR
        if (required && !actualValue) {
          throw new Error(`${key} ${ERRORS.required} in ${label}`);
        }
      }

      return value + req.body + location + path;
    },
  },
});

export const simpleArraySchemaFunc = ({
  dataIn = 'body',
  label = '',
  required = true,
  type = 'string',
}) => ({
  custom: {
    options: (value: any, { req, location, path }: any) => {
      let extractedParamValue = req?.[dataIn]?.[label];

      if (!extractedParamValue && !required) {
        return value + req.body + location + path;
      }

      // IF FIELDS ARE COMING FROM REQ.QUERY THAN ARRAY WILL BE STRINGIFIED, SO IT SHOULD BE PARSED
      if (dataIn === 'query' && extractedParamValue) {
        extractedParamValue = JSON.parse(extractedParamValue) ?? null;
      }

      // IF FIELD IS REQUIRED AND NO VALUE IS FOUND THROW AN ERROR
      if (required && !extractedParamValue) {
        throw new Error(`${label} ${ERRORS.required}`);
      }

      // IF FIELD IS NOT ARRAY THROW AN ERROR
      if (!Array.isArray(extractedParamValue)) {
        throw new Error(`${label} ${ERRORS.mustBeAnArray}`);
      }

      // THROW AN ERROR IF ARRAY IS EMPTY
      if (extractedParamValue?.length == 0) {
        throw new Error(`${label} ${ERRORS.invalidArrayLength}`);
      }

      // ITERATE THROUGH ALL VALUES OF ARRAY
      for (let i = 0; i < extractedParamValue.length; i++) {
        // Check if the type is 'integer' and validate
        if (type === 'integer') {
          const id = parseInt(extractedParamValue[i], 10);
          if (isNaN(id) || id <= 0) {
            throw new Error(`${label} contains an invalid integer id`);
          }
        }

        // Throw an error if values are not of the given type
        if (type !== 'integer' && typeof extractedParamValue[i] !== type) {
          throw new Error(
            `${label} contains a value that is not of type ${type}`
          );
        }
      }

      return value + req.body + location + path;
    },
  },
});

