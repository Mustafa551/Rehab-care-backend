import { Request } from 'express';

export interface TextValidationSchema {
  in: string;
  exists: { options: { checkNull: boolean; checkFalsy: boolean } } | null;
  errorMessage: string;
  isString: { errorMessage: string; bail: boolean };
  notEmpty: {
    options: { ignore_whitespace: boolean };
    errorMessage: string;
    bail: boolean;
  };
  trim: boolean;
  optional: { options: { nullable: boolean } } | null;
}

interface UserType {
  id: number;
  email: string;
}

export interface IGetUserAuthInfoRequest extends Request {
  user?: UserType;
  userRole?: string;
}

export interface CustomRequest extends Request {
  userRole?: string;
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface FcmToken {
  id: number;
  userId: number;
  deviceId: string;
  fcmToken: string;
  platform?: string;
  createdAt: string;
  updatedAt: string;
}

