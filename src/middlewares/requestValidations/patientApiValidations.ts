import { checkSchema, ParamSchema } from 'express-validator';
import { ERRORS } from '../../messages/errors';
import {
  emailAddressSchema,
  simpleIdSchemaFunc,
  simpleTextSchemaFunc
} from '../../utils/requestValidations';

const patientStatuses = ['active', 'inactive', 'discharged'];

const createPatientValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          name: 'name',
          email: 'email',
          phone: 'phone',
          dateOfBirth: 'dateOfBirth',
          medicalCondition: 'medicalCondition',
          assignedDoctorId: 'assignedDoctorId',
          status: 'status',
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

        // Validate status
        if (req.body.status && !patientStatuses.includes(req.body.status)) {
          throw new Error(
            `${ERRORS.invalidInputValue} status. Allowed values are ${patientStatuses.join(', ')}`
          );
        }

        // Validate phone format (basic validation for XXX-XXXX format)
        if (req.body.phone && !/^\d{3}-\d{4}$/.test(req.body.phone)) {
          throw new Error('Phone number must be in format XXX-XXXX');
        }

        // Validate date of birth format (YYYY-MM-DD)
        if (req.body.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.dateOfBirth)) {
          throw new Error('Date of birth must be in format YYYY-MM-DD');
        }

        return value + req.body + location + path;
      },
    },
  },
  name: simpleTextSchemaFunc({
    label: 'name',
    required: true,
  }) as unknown as ParamSchema,
  email: emailAddressSchema({}) as ParamSchema,
  phone: simpleTextSchemaFunc({
    label: 'phone',
    required: true,
  }) as unknown as ParamSchema,
  dateOfBirth: {
    exists: { options: { checkNull: true, checkFalsy: true } },
    errorMessage: 'Date of birth is required',
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Date of birth must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  medicalCondition: simpleTextSchemaFunc({
    label: 'medicalCondition',
    required: true,
    maxLength: 500,
  }) as unknown as ParamSchema,
  assignedDoctorId: {
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Assigned doctor ID must be a positive integer',
    },
    toInt: true,
  } as ParamSchema,
  status: simpleTextSchemaFunc({
    label: 'status',
    required: false,
  }) as unknown as ParamSchema,
});

const getAllPatientsValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          status: 'status',
          doctorId: 'doctorId',
        };

        const keys = Object.keys(req.query || {});

        keys.forEach((value) => {
          if (!allowedFields[value]) {
            throw new Error(`${ERRORS.invalidParameter} ${value}`);
          }
        });

        // Validate status if provided
        if (req.query?.status && !patientStatuses.includes(req.query.status as string)) {
          throw new Error(
            `${ERRORS.invalidInputValue} status. Allowed values are ${patientStatuses.join(', ')}`
          );
        }

        return value + req.query + location + path;
      },
    },
  },
  status: {
    in: ['query'],
    optional: true,
    isString: {
      errorMessage: 'Status must be a string',
    },
  } as ParamSchema,
  doctorId: {
    in: ['query'],
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Doctor ID must be a positive integer',
    },
    toInt: true,
  } as ParamSchema,
});

const getPatientByIdValidation = checkSchema({
  patientId: simpleIdSchemaFunc({
    label: 'patientId',
  }) as unknown as ParamSchema,
});

const updatePatientValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          name: 'name',
          email: 'email',
          phone: 'phone',
          dateOfBirth: 'dateOfBirth',
          medicalCondition: 'medicalCondition',
          assignedDoctorId: 'assignedDoctorId',
          status: 'status',
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

        // Validate status
        if (req.body.status && !patientStatuses.includes(req.body.status)) {
          throw new Error(
            `${ERRORS.invalidInputValue} status. Allowed values are ${patientStatuses.join(', ')}`
          );
        }

        // Validate phone format if provided
        if (req.body.phone && !/^\d{3}-\d{4}$/.test(req.body.phone)) {
          throw new Error('Phone number must be in format XXX-XXXX');
        }

        // Validate date of birth format if provided
        if (req.body.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.dateOfBirth)) {
          throw new Error('Date of birth must be in format YYYY-MM-DD');
        }

        return value + req.body + location + path;
      },
    },
  },
  patientId: simpleIdSchemaFunc({
    label: 'patientId',
  }) as unknown as ParamSchema,
  name: simpleTextSchemaFunc({
    label: 'name',
    required: false,
  }) as unknown as ParamSchema,
  email: emailAddressSchema({ required: false }) as ParamSchema,
  phone: simpleTextSchemaFunc({
    label: 'phone',
    required: false,
  }) as unknown as ParamSchema,
  dateOfBirth: {
    optional: true,
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Date of birth must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  medicalCondition: simpleTextSchemaFunc({
    label: 'medicalCondition',
    required: false,
    maxLength: 500,
  }) as unknown as ParamSchema,
  assignedDoctorId: {
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Assigned doctor ID must be a positive integer',
    },
    toInt: true,
  } as ParamSchema,
  status: simpleTextSchemaFunc({
    label: 'status',
    required: false,
  }) as unknown as ParamSchema,
});

const deletePatientValidation = checkSchema({
  patientId: simpleIdSchemaFunc({
    label: 'patientId',
  }) as unknown as ParamSchema,
});

export {
  createPatientValidation,
  getAllPatientsValidation,
  getPatientByIdValidation,
  updatePatientValidation,
  deletePatientValidation,
};