import { Router } from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  dischargePatient,
} from '../controllers/patientController';
import { checkSchemaError } from '../middlewares/authMiddleware';
import {
  createPatientValidation,
  getAllPatientsValidation,
  getPatientByIdValidation,
  updatePatientValidation,
  deletePatientValidation,
  dischargePatientValidation,
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

// Discharge patient route
router
  .route('/:patientId/discharge')
  .post(dischargePatientValidation, checkSchemaError, dischargePatient);

export default router;