import { Router } from 'express';
import * as medicationsController from '../controllers/medicationsController';

const router = Router();

// Medications routes
// GET /api/medications - Get all medications
router.get('/', medicationsController.getAllMedications);

// GET /api/medications/patient/:patientId - Get medications by patient
router.get('/patient/:patientId', medicationsController.getMedicationsByPatient);

// POST /api/medications - Create new medication
router.post('/', medicationsController.createMedication);

// GET /api/medications/:id - Get medication by ID
router.get('/:id', medicationsController.getMedicationById);

// PATCH /api/medications/:id - Update medication
router.patch('/:id', medicationsController.updateMedication);

// DELETE /api/medications/:id - Delete/discontinue medication
router.delete('/:id', medicationsController.deleteMedication);

// Medication Administration routes
// GET /api/medications/administrations/patient/:patientId - Get medication administrations by patient
router.get('/administrations/patient/:patientId', medicationsController.getMedicationAdministrationsByPatient);

// POST /api/medications/administrations - Create new medication administration schedule
router.post('/administrations', medicationsController.createMedicationAdministration);

// PATCH /api/medications/administrations/:id - Update medication administration
router.patch('/administrations/:id', medicationsController.updateMedicationAdministration);

// POST /api/medications/administrations/:id/administer - Mark medication as administered
router.post('/administrations/:id/administer', medicationsController.administerMedication);

export default router;