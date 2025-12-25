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
  .patch(updateUserValidation, checkSchemaError, updateUser)
  .delete(deleteUserValidation, checkSchemaError, deleteUser);

router
  .route('/:userId/update-fcm')
  .patch(
    updateUserFcmValidation,
    checkSchemaError,
    updateUserFcm
  );

export default router;

