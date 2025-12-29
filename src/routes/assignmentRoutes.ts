import { Router } from 'express';
import {
  getAssignmentsByDate,
  generateAssignments,
  getAssignmentsByStaff,
  getAssignmentsByPatient,
  getDoctorAssignments,
  assignDoctor,
} from '../controllers/assignmentController';

const router = Router();

// Assignment routes
router.get('/', getAssignmentsByDate); // GET /assignments?date=2024-01-01
router.post('/generate', generateAssignments); // POST /assignments/generate
router.get('/staff/:staffId', getAssignmentsByStaff); // GET /assignments/staff/1?date=2024-01-01
router.get('/patient/:patientId', getAssignmentsByPatient); // GET /assignments/patient/p1?date=2024-01-01

// Doctor assignment routes
router.get('/doctors', getDoctorAssignments); // GET /assignments/doctors
router.post('/doctors/assign', assignDoctor); // POST /assignments/doctors/assign

export default router;