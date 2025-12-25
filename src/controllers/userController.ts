import { Request, Response } from 'express';
import { ERRORS } from '../messages/errors';
import { STATUS } from '../messages/statusCodes';
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getFcmTokensByUserId,
  getFcmToken,
  addFcmToken,
  removeFcmToken,
  authenticateUser,
} from '../models/userModel';
import { errorLogs } from '../utils/helper';
// JWT token generation removed
import { SUCCESS } from '../messages/success';
import { notificationPlatforms } from '../constant';

// LOGIN USER
const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const user = await authenticateUser(email, password);

    if (!user) {
      return res.status(STATUS.unauthorized).json({
        error: true,
        message: ERRORS.notAuthorizedException,
      });
    }

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(STATUS.success).json({
      success: true,
      message: SUCCESS.login,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error: any) {
    errorLogs('login', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// CREATE USER
const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    // FIND IF USER ALREADY EXISTS
    const existingUser = await getUserByEmail(email);

    // IF USER IS FOUND, THROW ERROR
    if (existingUser) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: ERRORS.emailAlreadyRegistered,
      });
    }

    // CREATE USER IN DB
    const user = await createUser({
      email,
      firstName,
      lastName,
      password,
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(STATUS.created).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    // PRINT ERROR LOGS
    errorLogs('createUser', error.message);

    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// GET USER BY ID
const getUserByIdHandler = async (req: Request, res: Response) => {
  const { userId = '' } = req.query;
  try {
    let user = null;

    if (userId) {
      const id = parseInt(userId as string, 10);
      if (isNaN(id)) {
        return res.status(STATUS.badRequest).json({
          error: true,
          message: 'Invalid user ID',
        });
      }
      // GET SINGLE USER FROM DB BY USERID
      user = await getUserById(id);
    }

    // IF USER NOT FOUND, THROW ERROR
    if (!user) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: ERRORS.userNotFoundException,
      });
    }

    // Get FCM tokens for the user
    const fcmTokens = await getFcmTokensByUserId(user.id);

    // Exclude password from response
    const { password, ...userWithoutPassword } = user;

    return res.status(STATUS.success).json({
      success: true,
      data: {
        ...userWithoutPassword,
        fcm: fcmTokens.map((token) => ({
          deviceId: token.deviceId,
          fcmToken: token.fcmToken,
          platform: token.platform,
        })),
      },
    });
  } catch (error: any) {
    // PRINT ERROR LOGS
    errorLogs('getUserById', error.message);

    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// UPDATE USER
const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid user ID',
      });
    }

    const { firstName, lastName, email, password } = req.body;

    const updateData: any = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;

    const user = await updateUser(userId, updateData);

    if (!user) {
      return res.status(STATUS.notFound).json({
        errors: true,
        message: ERRORS.userNotFound,
      });
    }

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(STATUS.success).json({
      success: true,
      message: SUCCESS.updated,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    errorLogs('updateUser', error);
    return res.status(STATUS.serverError).json({
      errors: true,
      message: error.message,
    });
  }
};

// DELETE USER
const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid user ID',
      });
    }

    // Delete the user (cascade will handle FCM tokens)
    await deleteUser(userId);

    return res.status(STATUS.success).json({
      success: true,
      message: SUCCESS.accDeleted,
    });
  } catch (error: any) {
    // PRINT ERROR LOGS
    errorLogs('deleteUser', error.message);

    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// UPDATE USER FCM
const updateUserFcmHandler = async (req: Request, res: Response) => {
  const { fcmToken, deviceId, platform, action = 'ADD' } = req.body;
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(STATUS.badRequest).json({
      error: true,
      message: 'Invalid user ID',
    });
  }

  try {
    // FETCH USER DATA
    const userData = await getUserById(userId);

    // IF USER NOT EXIST, THROW ERROR
    if (!userData) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: ERRORS.userNotFoundException,
      });
    }

    // CHECK IF FCM ALREADY EXIST
    const fcmAlreadyExists = await getFcmToken(userId, deviceId, fcmToken);

    // IF ACTION IS ADD, ADD TO TOKENS
    if (action === 'ADD') {
      // IF FCM ALREADY EXIST, THROW ERROR
      if (fcmAlreadyExists) {
        return res.status(STATUS.badRequest).json({
          error: true,
          message: ERRORS.fcmAlreadyExists,
        });
      }

      // Validate platform
      if (platform && !notificationPlatforms.includes(platform)) {
        return res.status(STATUS.badRequest).json({
          error: true,
          message: `Invalid platform. Allowed values are ${notificationPlatforms.join(', ')}`,
        });
      }

      const newToken = await addFcmToken({
        userId,
        deviceId,
        fcmToken,
        platform,
      });

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = userData;

      return res.status(STATUS.success).json({
        success: true,
        data: {
          ...userWithoutPassword,
          fcm: [
            {
              deviceId: newToken.deviceId,
              fcmToken: newToken.fcmToken,
              platform: newToken.platform,
            },
          ],
        },
      });
    } else {
      // IF FCM DOES NOT EXIST, THROW ERROR
      if (!fcmAlreadyExists) {
        return res.status(STATUS.badRequest).json({
          error: true,
          message: ERRORS.fcmDoesNotExists,
        });
      }

      // ELSE REMOVE TOKEN
      await removeFcmToken(userId, deviceId, fcmToken);

      // Exclude password from response
      const { password: _, ...userWithoutPassword } = userData;

      return res.status(STATUS.success).json({
        success: true,
        message: SUCCESS.tokenRemoved,
        data: userWithoutPassword,
      });
    }
  } catch (error: any) {
    errorLogs('updateUserFcm', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error?.message,
    });
  }
};

export {
  loginHandler as login,
  createUserHandler as createUser,
  getUserByIdHandler as getUserById,
  updateUserHandler as updateUser,
  deleteUserHandler as deleteUser,
  updateUserFcmHandler as updateUserFcm,
};

