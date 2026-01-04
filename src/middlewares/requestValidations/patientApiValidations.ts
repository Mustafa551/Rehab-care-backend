import { checkSchema, ParamSchema } from 'express-validator';
import { ERRORS } from '../../messages/errors';
import {
  emailAddressSchema,
  simpleIdSchemaFunc,
  simpleTextSchemaFunc,
  pakistaniPhoneSchema
} from '../../utils/requestValidations';

const patientStatuses = ['active', 'inactive', 'discharged'];
const genderOptions = ['male', 'female', 'other'];
const roomTypes = ['general', 'semi-private', 'private'];
const dischargeStatuses = ['continue', 'ready', 'pending'];

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
          // New comprehensive registration fields
          age: 'age',
          gender: 'gender',
          address: 'address',
          emergencyContact: 'emergencyContact',
          diseases: 'diseases',
          assignedNurses: 'assignedNurses',
          initialDeposit: 'initialDeposit',
          roomType: 'roomType',
          roomNumber: 'roomNumber',
          admissionDate: 'admissionDate',
          // Medical tracking fields
          currentMedications: 'currentMedications',
          lastAssessmentDate: 'lastAssessmentDate',
          dischargeStatus: 'dischargeStatus',
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

        // Validate Pakistani phone format
        if (req.body.phone) {
          const phoneRegex = /^(\+92|0)?[0-9]{3}-?[0-9]{7}$|^(\+92|0)?[0-9]{10}$/;
          if (!phoneRegex.test(req.body.phone.replace(/\s/g, ''))) {
            throw new Error('Please enter a valid Pakistani phone number (e.g., +92-300-1234567 or 0300-1234567)');
          }
        }

        // Validate gender
        if (req.body.gender && !genderOptions.includes(req.body.gender)) {
          throw new Error(`Invalid gender. Allowed values are ${genderOptions.join(', ')}`);
        }

        // Validate room type
        if (req.body.roomType && !roomTypes.includes(req.body.roomType)) {
          throw new Error(`Invalid room type. Allowed values are ${roomTypes.join(', ')}`);
        }

        // Validate discharge status
        if (req.body.dischargeStatus && !dischargeStatuses.includes(req.body.dischargeStatus)) {
          throw new Error(`Invalid discharge status. Allowed values are ${dischargeStatuses.join(', ')}`);
        }

        // Validate diseases array
        if (req.body.diseases && (!Array.isArray(req.body.diseases) || req.body.diseases.length === 0)) {
          throw new Error('At least one disease must be selected');
        }

        // Validate assigned nurses array (exactly 2 required)
        if (req.body.assignedNurses && (!Array.isArray(req.body.assignedNurses) || req.body.assignedNurses.length !== 2)) {
          throw new Error('Exactly 2 nurses must be assigned to each patient');
        }

        // Validate initial deposit
        if (req.body.initialDeposit && req.body.initialDeposit <= 0) {
          throw new Error('Initial deposit must be greater than 0');
        }

        // Validate age
        if (req.body.age && (req.body.age < 1 || req.body.age > 120)) {
          throw new Error('Age must be between 1 and 120');
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
  email: emailAddressSchema({}) as ParamSchema,
  phone: pakistaniPhoneSchema({}) as ParamSchema,
  dateOfBirth: {
    optional: true,
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Date of birth must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  medicalCondition: simpleTextSchemaFunc({
    label: 'medicalCondition',
    required: true,
    maxLength: 1000,
  }) as unknown as ParamSchema,
  assignedDoctorId: {
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Assigned doctor ID must be a positive integer',
    },
    toInt: true,
  } as ParamSchema,
  status: {
    optional: true,
    isString: {
      errorMessage: 'Status must be a string',
    },
    isIn: {
      options: [patientStatuses],
      errorMessage: `Status must be one of: ${patientStatuses.join(', ')}`,
    },
  } as ParamSchema,
  // New comprehensive fields
  age: {
    exists: { options: { checkNull: true, checkFalsy: true } },
    errorMessage: 'Age is required',
    isInt: {
      options: { min: 1, max: 120 },
      errorMessage: 'Age must be between 1 and 120',
    },
    toInt: true,
  } as ParamSchema,
  gender: {
    exists: { options: { checkNull: true, checkFalsy: true } },
    errorMessage: 'Gender is required',
    isString: {
      errorMessage: 'Gender must be a string',
    },
    isIn: {
      options: [genderOptions],
      errorMessage: `Gender must be one of: ${genderOptions.join(', ')}`,
    },
  } as ParamSchema,
  address: simpleTextSchemaFunc({
    label: 'address',
    required: true,
    minLength: 10,
    maxLength: 500,
  }) as unknown as ParamSchema,
  emergencyContact: simpleTextSchemaFunc({
    label: 'emergencyContact',
    required: true,
    minLength: 5,
    maxLength: 100,
  }) as unknown as ParamSchema,
  diseases: {
    exists: { options: { checkNull: true, checkFalsy: true } },
    errorMessage: 'Diseases are required',
    isArray: {
      options: { min: 1 },
      errorMessage: 'At least one disease must be selected',
    },
  } as ParamSchema,
  assignedNurses: {
    exists: { options: { checkNull: true, checkFalsy: true } },
    errorMessage: 'Assigned nurses are required',
    isArray: {
      options: { min: 2, max: 2 },
      errorMessage: 'Exactly 2 nurses must be assigned',
    },
  } as ParamSchema,
  initialDeposit: {
    exists: { options: { checkNull: true, checkFalsy: true } },
    errorMessage: 'Initial deposit is required',
    isFloat: {
      options: { min: 1 },
      errorMessage: 'Initial deposit must be greater than 0',
    },
    toFloat: true,
  } as ParamSchema,
  roomType: {
    optional: true,
    isString: {
      errorMessage: 'Room type must be a string',
    },
    isIn: {
      options: [roomTypes],
      errorMessage: `Room type must be one of: ${roomTypes.join(', ')}`,
    },
  } as ParamSchema,
  roomNumber: {
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Room number must be a positive integer',
    },
    toInt: true,
  } as ParamSchema,
  admissionDate: {
    optional: true,
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Admission date must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  currentMedications: {
    optional: true,
    isArray: {
      errorMessage: 'Current medications must be an array',
    },
  } as ParamSchema,
  lastAssessmentDate: {
    optional: true,
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Last assessment date must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  dischargeStatus: {
    optional: true,
    isString: {
      errorMessage: 'Discharge status must be a string',
    },
    isIn: {
      options: [dischargeStatuses],
      errorMessage: `Discharge status must be one of: ${dischargeStatuses.join(', ')}`,
    },
  } as ParamSchema,
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
          // New comprehensive registration fields
          age: 'age',
          gender: 'gender',
          address: 'address',
          emergencyContact: 'emergencyContact',
          diseases: 'diseases',
          assignedNurses: 'assignedNurses',
          initialDeposit: 'initialDeposit',
          roomType: 'roomType',
          roomNumber: 'roomNumber',
          admissionDate: 'admissionDate',
          // Medical tracking fields
          currentMedications: 'currentMedications',
          lastAssessmentDate: 'lastAssessmentDate',
          dischargeStatus: 'dischargeStatus',
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

        // Validate status
        if (req.body.status && !patientStatuses.includes(req.body.status)) {
          throw new Error(
            `${ERRORS.invalidInputValue} status. Allowed values are ${patientStatuses.join(', ')}`
          );
        }

        // Validate Pakistani phone format if provided
        if (req.body.phone) {
          const phoneRegex = /^(\+92|0)?[0-9]{3}-?[0-9]{7}$|^(\+92|0)?[0-9]{10}$/;
          if (!phoneRegex.test(req.body.phone.replace(/\s/g, ''))) {
            throw new Error('Please enter a valid Pakistani phone number (e.g., +92-300-1234567 or 0300-1234567)');
          }
        }

        // Validate gender if provided
        if (req.body.gender && !genderOptions.includes(req.body.gender)) {
          throw new Error(`Invalid gender. Allowed values are ${genderOptions.join(', ')}`);
        }

        // Validate room type if provided
        if (req.body.roomType && !roomTypes.includes(req.body.roomType)) {
          throw new Error(`Invalid room type. Allowed values are ${roomTypes.join(', ')}`);
        }

        // Validate discharge status if provided
        if (req.body.dischargeStatus && !dischargeStatuses.includes(req.body.dischargeStatus)) {
          throw new Error(`Invalid discharge status. Allowed values are ${dischargeStatuses.join(', ')}`);
        }

        // Validate diseases array if provided
        if (req.body.diseases && (!Array.isArray(req.body.diseases) || req.body.diseases.length === 0)) {
          throw new Error('At least one disease must be selected');
        }

        // Validate assigned nurses array if provided
        if (req.body.assignedNurses && (!Array.isArray(req.body.assignedNurses) || req.body.assignedNurses.length !== 2)) {
          throw new Error('Exactly 2 nurses must be assigned to each patient');
        }

        // Validate initial deposit if provided
        if (req.body.initialDeposit && req.body.initialDeposit <= 0) {
          throw new Error('Initial deposit must be greater than 0');
        }

        // Validate age if provided
        if (req.body.age && (req.body.age < 1 || req.body.age > 120)) {
          throw new Error('Age must be between 1 and 120');
        }

        return value + req.body + location + path;
      },
    },
  },
  patientId: simpleIdSchemaFunc({
    label: 'patientId',
    dataIn: 'params',
  }) as unknown as ParamSchema,
  name: simpleTextSchemaFunc({
    label: 'name',
    required: false,
    minLength: 2,
    maxLength: 100,
  }) as unknown as ParamSchema,
  email: emailAddressSchema({ required: false }) as ParamSchema,
  phone: pakistaniPhoneSchema({ required: false }) as ParamSchema,
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
    maxLength: 1000,
  }) as unknown as ParamSchema,
  assignedDoctorId: {
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Assigned doctor ID must be a positive integer',
    },
    toInt: true,
  } as ParamSchema,
  status: {
    optional: true,
    isString: {
      errorMessage: 'Status must be a string',
    },
    isIn: {
      options: [patientStatuses],
      errorMessage: `Status must be one of: ${patientStatuses.join(', ')}`,
    },
  } as ParamSchema,
  // New comprehensive fields (all optional for updates)
  age: {
    optional: true,
    isInt: {
      options: { min: 1, max: 120 },
      errorMessage: 'Age must be between 1 and 120',
    },
    toInt: true,
  } as ParamSchema,
  gender: {
    optional: true,
    isString: {
      errorMessage: 'Gender must be a string',
    },
    isIn: {
      options: [genderOptions],
      errorMessage: `Gender must be one of: ${genderOptions.join(', ')}`,
    },
  } as ParamSchema,
  address: simpleTextSchemaFunc({
    label: 'address',
    required: false,
    minLength: 10,
    maxLength: 500,
  }) as unknown as ParamSchema,
  emergencyContact: simpleTextSchemaFunc({
    label: 'emergencyContact',
    required: false,
    minLength: 5,
    maxLength: 100,
  }) as unknown as ParamSchema,
  diseases: {
    optional: true,
    isArray: {
      options: { min: 1 },
      errorMessage: 'At least one disease must be selected',
    },
  } as ParamSchema,
  assignedNurses: {
    optional: true,
    isArray: {
      options: { min: 2, max: 2 },
      errorMessage: 'Exactly 2 nurses must be assigned',
    },
  } as ParamSchema,
  initialDeposit: {
    optional: true,
    isFloat: {
      options: { min: 1 },
      errorMessage: 'Initial deposit must be greater than 0',
    },
    toFloat: true,
  } as ParamSchema,
  roomType: {
    optional: true,
    isString: {
      errorMessage: 'Room type must be a string',
    },
    isIn: {
      options: [roomTypes],
      errorMessage: `Room type must be one of: ${roomTypes.join(', ')}`,
    },
  } as ParamSchema,
  roomNumber: {
    optional: true,
    isInt: {
      options: { min: 1 },
      errorMessage: 'Room number must be a positive integer',
    },
    toInt: true,
  } as ParamSchema,
  admissionDate: {
    optional: true,
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Admission date must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  currentMedications: {
    optional: true,
    isArray: {
      errorMessage: 'Current medications must be an array',
    },
  } as ParamSchema,
  lastAssessmentDate: {
    optional: true,
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Last assessment date must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  dischargeStatus: {
    optional: true,
    isString: {
      errorMessage: 'Discharge status must be a string',
    },
    isIn: {
      options: [dischargeStatuses],
      errorMessage: `Discharge status must be one of: ${dischargeStatuses.join(', ')}`,
    },
  } as ParamSchema,
});

const deletePatientValidation = checkSchema({
  patientId: simpleIdSchemaFunc({
    label: 'patientId',
  }) as unknown as ParamSchema,
});

const dischargePatientValidation = checkSchema({
  myCustomField: {
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          dischargeNotes: 'dischargeNotes',
          finalBillAmount: 'finalBillAmount',
          dischargeDate: 'dischargeDate',
          dischargedBy: 'dischargedBy',
        };

        const keys = Object.keys(req.body || {});

        // Allow empty body for discharge
        if (keys.length === 0) {
          return value + req.params + location + path;
        }

        keys.forEach((value) => {
          if (!allowedFields[value]) {
            throw new Error(`${ERRORS.invalidParameter} ${value}`);
          }
        });

        // Validate discharge date if provided
        if (req.body.dischargeDate && !/^\d{4}-\d{2}-\d{2}$/.test(req.body.dischargeDate)) {
          throw new Error('Discharge date must be in format YYYY-MM-DD');
        }

        // Validate final bill amount if provided
        if (req.body.finalBillAmount && (isNaN(req.body.finalBillAmount) || req.body.finalBillAmount < 0)) {
          throw new Error('Final bill amount must be a positive number');
        }

        return value + req.params + location + path;
      },
    },
  },
  patientId: simpleIdSchemaFunc({
    label: 'patientId',
    dataIn: 'params',
  }) as unknown as ParamSchema,
  dischargeNotes: {
    optional: true,
    isString: {
      errorMessage: 'Discharge notes must be a string',
    },
    isLength: {
      options: { max: 1000 },
      errorMessage: 'Discharge notes must be less than 1000 characters',
    },
  } as ParamSchema,
  finalBillAmount: {
    optional: true,
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Final bill amount must be a positive number',
    },
    toFloat: true,
  } as ParamSchema,
  dischargeDate: {
    optional: true,
    isISO8601: {
      options: { strict: true },
      errorMessage: 'Discharge date must be a valid date in YYYY-MM-DD format',
    },
  } as ParamSchema,
  dischargedBy: {
    optional: true,
    isString: {
      errorMessage: 'Discharged by must be a string',
    },
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'Discharged by must be between 2 and 100 characters',
    },
  } as ParamSchema,
});

export {
  createPatientValidation,
  getAllPatientsValidation,
  getPatientByIdValidation,
  updatePatientValidation,
  deletePatientValidation,
  dischargePatientValidation,
};