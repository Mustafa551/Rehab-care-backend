import { Router } from 'express';
import * as vitalSignsController from '../controllers/vitalSignsController';

const router = Router();

// GET /api/vital-signs - Get all vital signs
router.get('/', vitalSignsController.getAllVitalSigns);

// GET /api/vital-signs/patient/:patientId - Get vital signs by patient (with optional date filter)
router.get('/patient/:patientId', vitalSignsController.getVitalSignsByPatient);

// POST /api/vital-signs - Create new vital signs record
router.post('/', vitalSignsController.createVitalSigns);

// GET /api/vital-signs/:id - Get vital signs by ID
router.get('/:id', vitalSignsController.getVitalSignsById);

// PATCH /api/vital-signs/:id - Update vital signs
router.patch('/:id', vitalSignsController.updateVitalSigns);

// DELETE /api/vital-signs/:id - Delete vital signs
router.delete('/:id', vitalSignsController.deleteVitalSigns);

export default router;