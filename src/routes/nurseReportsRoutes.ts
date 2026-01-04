import { Router } from 'express';
import * as nurseReportsController from '../controllers/nurseReportsController';

const router = Router();

// GET /api/nurse-reports - Get all nurse reports
router.get('/', nurseReportsController.getAllNurseReports);

// GET /api/nurse-reports/unreviewed - Get all unreviewed reports
router.get('/unreviewed', nurseReportsController.getAllUnreviewedReports);

// GET /api/nurse-reports/patient/:patientId - Get nurse reports by patient
router.get('/patient/:patientId', nurseReportsController.getNurseReportsByPatient);

// GET /api/nurse-reports/patient/:patientId/unreviewed - Get unreviewed reports by patient
router.get('/patient/:patientId/unreviewed', nurseReportsController.getUnreviewedReportsByPatient);

// POST /api/nurse-reports - Create new nurse report
router.post('/', nurseReportsController.createNurseReport);

// GET /api/nurse-reports/:id - Get nurse report by ID
router.get('/:id', nurseReportsController.getNurseReportById);

// PATCH /api/nurse-reports/:id - Update nurse report
router.patch('/:id', nurseReportsController.updateNurseReport);

// POST /api/nurse-reports/:id/review - Review nurse report (doctor response)
router.post('/:id/review', nurseReportsController.reviewNurseReport);

// DELETE /api/nurse-reports/:id - Delete nurse report
router.delete('/:id', nurseReportsController.deleteNurseReport);

export default router;