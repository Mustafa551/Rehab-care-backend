import { checkSchema, ParamSchema } from 'express-validator';
import { ERRORS } from '../../messages/errors';
import {
  emailAddressSchema,
  simpleIdSchemaFunc,
  simpleTextSchemaFunc
} from '../../utils/requestValidations';

const staffRoles = ['nurse', 'caretaker', 'therapist', 'doctor'];

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

        // Validate phone format (basic validation for XXX-XXXX format)
        if (req.body.phone && !/^\d{3}-\d{4}$/.test(req.body.phone)) {
          throw new Error('Phone number must be in format XXX-XXXX');
        }

        return value + req.body + location + path;
      },
    },
  },
  name: simpleTextSchemaFunc({
    label: 'name',
    required: true,
  }) as unknown as ParamSchema,
  role: simpleTextSchemaFunc({
    label: 'role',
    required: true,
  }) as unknown as ParamSchema,
  email: emailAddressSchema({}) as ParamSchema,
  phone: simpleTextSchemaFunc({
    label: 'phone',
    required: true,
  }) as unknown as ParamSchema,
  isOnDuty: {
    optional: true,
    isBoolean: {
      errorMessage: 'isOnDuty must be a boolean value',
    },
  } as ParamSchema,
  photoUrl: simpleTextSchemaFunc({
    label: 'photoUrl',
    required: false,
  }) as unknown as ParamSchema,
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

        // Validate phone format if provided
        if (req.body.phone && !/^\d{3}-\d{4}$/.test(req.body.phone)) {
          throw new Error('Phone number must be in format XXX-XXXX');
        }

        return value + req.body + location + path;
      },
    },
  },
  name: simpleTextSchemaFunc({
    label: 'name',
    required: false,
  }) as unknown as ParamSchema,
  role: simpleTextSchemaFunc({
    label: 'role',
    required: false,
  }) as unknown as ParamSchema,
  email: emailAddressSchema({ required: false }) as ParamSchema,
  phone: simpleTextSchemaFunc({
    label: 'phone',
    required: false,
  }) as unknown as ParamSchema,
  isOnDuty: {
    optional: true,
    isBoolean: {
      errorMessage: 'isOnDuty must be a boolean value',
    },
  } as ParamSchema,
  photoUrl: simpleTextSchemaFunc({
    label: 'photoUrl',
    required: false,
  }) as unknown as ParamSchema,
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