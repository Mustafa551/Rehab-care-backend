import { Router } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController';
import { checkSchemaError } from '../middlewares/authMiddleware';
import {
  createStaffValidation,
  getAllStaffValidation,
  getStaffByIdValidation,
  updateStaffValidation,
  deleteStaffValidation,
} from '../middlewares/requestValidations/staffApiValidations';

const router = Router();

// Staff routes
router
  .route('/')
  .get(getAllStaffValidation, checkSchemaError, getAllStaff)
  .post(createStaffValidation, checkSchemaError, createStaff);

router
  .route('/:staffId')
  .get(getStaffByIdValidation, checkSchemaError, getStaffById)
  .patch(updateStaffValidation, checkSchemaError, updateStaff)
  .delete(deleteStaffValidation, checkSchemaError, deleteStaff);

export default router;