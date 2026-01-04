import { checkSchema } from 'express-validator';
import {
  emailAddressSchema,
  simpleTextSchemaFunc,
  pakistaniPhoneSchema,
  staffRoleSchema,
  doctorSpecializationSchema,
  nurseTypeSchema,
} from '../utils/requestValidations';

// Validation schema for creating staff
export const createStaffValidation = checkSchema({
  name: simpleTextSchemaFunc({
    label: 'Name',
    minLength: 2,
    maxLength: 100,
  }),
  role: staffRoleSchema({}),
  email: emailAddressSchema({}),
  phone: pakistaniPhoneSchema({}),
  isOnDuty: {
    in: ['body'],
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'isOnDuty must be a boolean value',
    },
    toBoolean: true,
  },
  photoUrl: {
    in: ['body'],
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: 'Photo URL must be a string',
    },
    isURL: {
      options: { require_protocol: true },
      errorMessage: 'Photo URL must be a valid URL',
    },
  },
  specialization: doctorSpecializationSchema({}),
  nurseType: nurseTypeSchema({}),
});

// Validation schema for updating staff
export const updateStaffValidation = checkSchema({
  name: simpleTextSchemaFunc({
    label: 'Name',
    required: false,
    minLength: 2,
    maxLength: 100,
  }),
  role: {
    in: ['body'],
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: 'Role must be a string',
      bail: true,
    },
    isIn: {
      options: [['nurse', 'doctor']],
      errorMessage: 'Role must be either nurse or doctor',
    },
  },
  email: emailAddressSchema({ required: false }),
  phone: pakistaniPhoneSchema({ required: false }),
  isOnDuty: {
    in: ['body'],
    optional: { options: { nullable: true } },
    isBoolean: {
      errorMessage: 'isOnDuty must be a boolean value',
    },
    toBoolean: true,
  },
  photoUrl: {
    in: ['body'],
    optional: { options: { nullable: true } },
    isString: {
      errorMessage: 'Photo URL must be a string',
    },
    isURL: {
      options: { require_protocol: true },
      errorMessage: 'Photo URL must be a valid URL',
    },
  },
  specialization: doctorSpecializationSchema({}),
  nurseType: nurseTypeSchema({}),
});