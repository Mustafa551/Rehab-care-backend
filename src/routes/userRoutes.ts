import { Router } from 'express';
import {
  login,
  createUser,
  deleteUser,
  getUserById,
  updateUser,
  updateUserFcm,
} from '../controllers/userController';
import {
  checkSchemaError,
  isAuthenticated,
} from '../middlewares/authMiddleware';
import {
  loginValidation,
  createUserValidation,
  deleteUserValidation,
  getUserByIdValidation,
  updateUserFcmValidation,
  updateUserValidation,
} from '../middlewares/requestValidations/userApiValidations';

const router = Router();

// Login route
router
  .route('/login')
  .post(loginValidation, checkSchemaError, login);

router
  .route('/')
  .post(createUserValidation, checkSchemaError, createUser)
  .get(getUserByIdValidation, checkSchemaError, getUserById);

router
  .route('/:userId')
  .patch(isAuthenticated, updateUserValidation, checkSchemaError, updateUser)
  .delete(isAuthenticated, deleteUserValidation, checkSchemaError, deleteUser);

router
  .route('/:userId/update-fcm')
  .patch(
    isAuthenticated,
    updateUserFcmValidation,
    checkSchemaError,
    updateUserFcm
  );

export default router;

