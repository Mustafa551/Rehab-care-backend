import { checkSchema, ParamSchema } from 'express-validator';
import { notificationPlatforms } from '../../constant';
import { ERRORS } from '../../messages/errors';
import {
  emailAddressSchema,
  passwordSchemaFunct,
  simpleIdSchemaFunc,
  simpleTextSchemaFunc
} from '../../utils/requestValidations';

const loginValidation = checkSchema({
  myCustomField: {
    // custom validation for checking we are getting right only allowed parameter in req.body
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          email: 'email',
          password: 'password',
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

        return value + req.body + location + path;
      },
    },
  },
  email: emailAddressSchema({}) as ParamSchema,
  password: passwordSchemaFunct({}) as ParamSchema,
});

const createUserValidation = checkSchema({
  myCustomField: {
    // custom validation for checking we are getting right only allowed parameter in req.body
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email',
          password: 'password',
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

        return value + req.body + location + path;
      },
    },
  },
  firstName: simpleTextSchemaFunc({
    label: 'firstName',
    required: false,
  }) as unknown as ParamSchema,
  lastName: simpleTextSchemaFunc({
    label: 'lastName',
    required: false,
  }) as unknown as ParamSchema,
  email: emailAddressSchema({}) as ParamSchema,
  password: passwordSchemaFunct({}) as ParamSchema,
});

const getUserByIdValidation = checkSchema({
  myCustomField: {
    // custom validation for checking we are getting right only allowed parameter in req.body
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          userId: 'userId',
        };

        const querykeys = Object.keys(req.query || {});

        if (querykeys?.length === 0) {
          throw new Error(ERRORS.invalidReqQuery);
        }

        querykeys.forEach((value) => {
          if (!allowedFields[value]) {
            throw new Error(`${ERRORS.invalidParameter} ${value}`);
          }
        });
        return value + req.body + location + path;
      },
    },
  },
  userId: simpleIdSchemaFunc({
    label: 'userId',
    dataIn: 'query',
    required: true,
  }) as unknown as ParamSchema,
});

const updateUserValidation = checkSchema({
  myCustomField: {
    // custom validation for checking we are getting right only allowed parameter in req.body
    custom: {
      options: (value: any, { req, location, path }: any) => {
        const allowedFields: any = {
          firstName: 'firstName',
          lastName: 'lastName',
          email: 'email',
          password: 'password',
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

        return value + req.body + location + path;
      },
    },
  },
  firstName: simpleTextSchemaFunc({
    label: 'firstName',
    required: false,
  }) as unknown as ParamSchema,
  lastName: simpleTextSchemaFunc({
    label: 'lastName',
    required: false,
  }) as unknown as ParamSchema,
  email: emailAddressSchema({ required: false }) as ParamSchema,
  password: passwordSchemaFunct({ required: false }) as ParamSchema,
  userId: simpleIdSchemaFunc({ label: 'userId', dataIn: 'params' }) as unknown as ParamSchema,
});

const deleteUserValidation = checkSchema({
  myCustomField: {
    // custom validation for checking we are getting right only allowed parameter in req.body
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
  userId: simpleIdSchemaFunc({ label: 'userId', dataIn: 'params' }) as unknown as ParamSchema,
});

// VALIDATION SCHEMA FOR UPDATE USER FCM API
const updateUserFcmValidation = checkSchema({
  myCustomField: {
    // custom validation for checking we are getting right only allowed parameter in req.body
    custom: {
      options: (value, { req, location, path }) => {
        const allowedFields: any = {
          fcmToken: 'fcmToken',
          deviceId: 'deviceId',
          platform: 'platform',
          action: 'action',
        };
        const allowedActions = ['ADD', 'REMOVE'];

        const keys = Object.keys(req.body);

        if (keys?.length == 0) {
          throw new Error(ERRORS.invalidReqBody);
        }

        keys.forEach((value) => {
          if (!allowedFields[value]) {
            throw new Error(`${ERRORS.invalidParameter} ${value}`);
          }
        });

        if (!allowedActions.includes(req?.body?.action)) {
          throw new Error(
            `${
              ERRORS.invalidInputValue
            } action, Allowed values are ${allowedActions.join(', ')}`
          );
        }

        if (
          req?.body?.platform &&
          !notificationPlatforms.includes(req.body.platform)
        ) {
          throw new Error(
            `${
              ERRORS.invalidInputValue
            } platform. Allowed values are ${notificationPlatforms.join(', ')}`
          );
        }

        return value + req.body + location + path;
      },
    },
  },
  action: simpleTextSchemaFunc({ label: 'action' }) as unknown as ParamSchema,
  platform: simpleTextSchemaFunc({
    label: 'platform',
    required: false,
  }) as unknown as ParamSchema,
  deviceId: simpleTextSchemaFunc({
    label: 'deviceId',
  }) as unknown as ParamSchema,
  fcmToken: simpleTextSchemaFunc({
    label: 'fcmToken',
  }) as unknown as ParamSchema,
  userId: simpleIdSchemaFunc({ label: 'userId', dataIn: 'params' }) as unknown as ParamSchema,
});

export {
  loginValidation,
  createUserValidation, deleteUserValidation, getUserByIdValidation, updateUserFcmValidation, updateUserValidation
};

