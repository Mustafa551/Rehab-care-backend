import { Router } from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController';
import { checkSchemaError } from '../middlewares/authMiddleware';
import {
  createPatientValidation,
  getAllPatientsValidation,
  getPatientByIdValidation,
  updatePatientValidation,
  deletePatientValidation,
} from '../middlewares/requestValidations/patientApiValidations';

const router = Router();

// Patient routes
router
  .route('/')
  .get(getAllPatientsValidation, checkSchemaError, getAllPatients)
  .post(createPatientValidation, checkSchemaError, createPatient);

router
  .route('/:patientId')
  .get(getPatientByIdValidation, checkSchemaError, getPatientById)
  .patch(updatePatientValidation, checkSchemaError, updatePatient)
  .delete(deletePatientValidation, checkSchemaError, deletePatient);

export default router;