import { checkSchema, ParamSchema } from 'express-validator';
import { ERRORS } from '../../messages/errors';
import {
  emailAddressSchema,
  simpleIdSchemaFunc,
  simpleTextSchemaFunc,
  pakistaniPhoneSchema,
  staffRoleSchema,
  doctorSpecializationSchema,
  nurseTypeSchema
} from '../../utils/requestValidations';

const staffRoles = ['nurse', 'doctor']; // Updated to only allow nurse and doctor
const doctorSpecializations = ['cardiologist', 'endocrinologist', 'pulmonologist', 'psychiatrist', 'general', 'oncologist', 'neurologist'];
const nurseTypes = ['fresh', 'bscn'];

const createStaffValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          name: 'name',
          role: 'role',
          email: 'email',
          phone: 'phone',
          isOnDuty: 'isOnDuty',
          photoUrl: 'photoUrl',
          specialization: 'specialization',
          nurseType: 'nurseType',
        };

        const keys = Object.keys(req.body);

        if (keys?.length == 0) {
          throw new Error(ERRORS.invalidReqBody);
        }

        keys.forEach((value) => {
          if (!allowedFields[value]) {
            throw new Error(`${ERRORS.invalidParameter} ${value}`);
          }
        });

        // Validate role
        if (req.body.role && !staffRoles.includes(req.body.role)) {
          throw new Error(
            `${ERRORS.invalidInputValue} role. Allowed values are ${staffRoles.join(', ')}`
          );
        }

        // Validate Pakistani phone format
        if (req.body.phone) {
          const phoneRegex = /^(\+92|0)?[0-9]{3}-?[0-9]{7}$|^(\+92|0)?[0-9]{10}$/;
          if (!phoneRegex.test(req.body.phone.replace(/\s/g, ''))) {
            throw new Error('Please enter a valid Pakistani phone number (e.g., +92-300-1234567 or 0300-1234567)');
          }
        }

        // Validate doctor specialization
        if (req.body.role === 'doctor') {
          if (!req.body.specialization) {
            throw new Error('Specialization is required for doctors');
          }
          if (!doctorSpecializations.includes(req.body.specialization)) {
            throw new Error(`Invalid specialization. Allowed values are ${doctorSpecializations.join(', ')}`);
          }
        }

        // Validate nurse type
        if (req.body.role === 'nurse' && req.body.nurseType) {
          if (!nurseTypes.includes(req.body.nurseType)) {
            throw new Error(`Invalid nurse type. Allowed values are ${nurseTypes.join(', ')}`);
          }
        }

        return value + req.body + location + path;
      },
    },
  },
  name: simpleTextSchemaFunc({
    label: 'name',
    required: true,
    minLength: 2,
    maxLength: 100,
  }) as unknown as ParamSchema,
  role: staffRoleSchema({}) as ParamSchema,
  email: emailAddressSchema({}) as ParamSchema,
  phone: pakistaniPhoneSchema({}) as ParamSchema,
  isOnDuty: {
    optional: true,
    isBoolean: {
      errorMessage: 'isOnDuty must be a boolean value',
    },
    toBoolean: true,
  } as ParamSchema,
  photoUrl: {
    optional: true,
    isString: {
      errorMessage: 'Photo URL must be a string',
    },
    isURL: {
      options: { require_protocol: true },
      errorMessage: 'Photo URL must be a valid URL',
    },
  } as ParamSchema,
  specialization: doctorSpecializationSchema({}) as ParamSchema,
  nurseType: nurseTypeSchema({}) as ParamSchema,
});

const getAllStaffValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          role: 'role',
          onDuty: 'onDuty',
        };

        const querykeys = Object.keys(req.query || {});

        querykeys.forEach((value) => {
          if (!allowedFields[value]) {
            throw new Error(`${ERRORS.invalidParameter} ${value}`);
          }
        });

        // Validate role if provided
        if (req.query?.role && !staffRoles.includes(req.query.role as string)) {
          throw new Error(
            `${ERRORS.invalidInputValue} role. Allowed values are ${staffRoles.join(', ')}`
          );
        }

        // Validate onDuty if provided
        if (req.query?.onDuty && !['true', 'false'].includes(req.query.onDuty as string)) {
          throw new Error('onDuty must be true or false');
        }

        return value + req.body + location + path;
      },
    },
  },
  role: {
    optional: true,
    isString: {
      errorMessage: 'Role must be a string',
    },
  } as ParamSchema,
  onDuty: {
    optional: true,
    isString: {
      errorMessage: 'onDuty must be a string',
    },
  } as ParamSchema,
});

const getStaffByIdValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const querykeys = Object.keys(req.query || {});

        if (querykeys?.length > 0) {
          throw new Error(ERRORS.invalidQueryReq);
        }

        return value + req.params + location + path;
      },
    },
  },
  staffId: simpleIdSchemaFunc({ label: 'staffId', dataIn: 'params' }) as unknown as ParamSchema,
});

const updateStaffValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value: any, { req, location, path }: any) => {
        const allowedFields: any = {
          name: 'name',
          role: 'role',
          email: 'email',
          phone: 'phone',
          isOnDuty: 'isOnDuty',
          photoUrl: 'photoUrl',
          specialization: 'specialization',
          nurseType: 'nurseType',
        };

        const keys = Object.keys(req.body);

        if (keys?.length == 0) {
          throw new Error(ERRORS.atleastProvideOneField);
        }

        keys.forEach((value) => {
          if (!allowedFields[value]) {
            throw new Error(`${ERRORS.invalidParameter} ${value}`);
          }
        });

        // Validate role if provided
        if (req.body.role && !staffRoles.includes(req.body.role)) {
          throw new Error(
            `${ERRORS.invalidInputValue} role. Allowed values are ${staffRoles.join(', ')}`
          );
        }

        // Validate Pakistani phone format if provided
        if (req.body.phone) {
          const phoneRegex = /^(\+92|0)?[0-9]{3}-?[0-9]{7}$|^(\+92|0)?[0-9]{10}$/;
          if (!phoneRegex.test(req.body.phone.replace(/\s/g, ''))) {
            throw new Error('Please enter a valid Pakistani phone number (e.g., +92-300-1234567 or 0300-1234567)');
          }
        }

        // Validate doctor specialization if provided
        if (req.body.specialization && !doctorSpecializations.includes(req.body.specialization)) {
          throw new Error(`Invalid specialization. Allowed values are ${doctorSpecializations.join(', ')}`);
        }

        // Validate nurse type if provided
        if (req.body.nurseType && !nurseTypes.includes(req.body.nurseType)) {
          throw new Error(`Invalid nurse type. Allowed values are ${nurseTypes.join(', ')}`);
        }

        return value + req.body + location + path;
      },
    },
  },
  name: simpleTextSchemaFunc({
    label: 'name',
    required: false,
    minLength: 2,
    maxLength: 100,
  }) as unknown as ParamSchema,
  role: {
    optional: true,
    isString: {
      errorMessage: 'Role must be a string',
      bail: true,
    },
    isIn: {
      options: [staffRoles],
      errorMessage: `Role must be one of: ${staffRoles.join(', ')}`,
    },
  } as ParamSchema,
  email: emailAddressSchema({ required: false }) as ParamSchema,
  phone: pakistaniPhoneSchema({ required: false }) as ParamSchema,
  isOnDuty: {
    optional: true,
    isBoolean: {
      errorMessage: 'isOnDuty must be a boolean value',
    },
    toBoolean: true,
  } as ParamSchema,
  photoUrl: {
    optional: true,
    isString: {
      errorMessage: 'Photo URL must be a string',
    },
    isURL: {
      options: { require_protocol: true },
      errorMessage: 'Photo URL must be a valid URL',
    },
  } as ParamSchema,
  specialization: doctorSpecializationSchema({}) as ParamSchema,
  nurseType: nurseTypeSchema({}) as ParamSchema,
  staffId: simpleIdSchemaFunc({ label: 'staffId', dataIn: 'params' }) as unknown as ParamSchema,
});

const deleteStaffValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const querykeys = Object.keys(req.query || {});

        if (querykeys?.length > 0) {
          throw new Error(ERRORS.invalidQueryReq);
        }

        return value + req.params + location + path;
      },
    },
  },
  staffId: simpleIdSchemaFunc({ label: 'staffId', dataIn: 'params' }) as unknown as ParamSchema,
});

export {
  createStaffValidation,
  getAllStaffValidation,
  getStaffByIdValidation,
  updateStaffValidation,
  deleteStaffValidation,
};