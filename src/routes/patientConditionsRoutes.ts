import { Router } from 'express';
import * as patientConditionsController from '../controllers/patientConditionsController';

const router = Router();

// GET /api/patient-conditions - Get all patient conditions
router.get('/', patientConditionsController.getAllPatientConditions);

// GET /api/patient-conditions/patient/:patientId - Get patient conditions by patient
router.get('/patient/:patientId', patientConditionsController.getPatientConditionsByPatient);

// GET /api/patient-conditions/patient/:patientId/latest - Get latest patient condition
router.get('/patient/:patientId/latest', patientConditionsController.getLatestPatientCondition);

// POST /api/patient-conditions - Create new patient condition assessment
router.post('/', patientConditionsController.createPatientCondition);

// GET /api/patient-conditions/:id - Get patient condition by ID
router.get('/:id', patientConditionsController.getPatientConditionById);

// PATCH /api/patient-conditions/:id - Update patient condition
router.patch('/:id', patientConditionsController.updatePatientCondition);

// DELETE /api/patient-conditions/:id - Delete patient condition
router.delete('/:id', patientConditionsController.deletePatientCondition);

export default router;