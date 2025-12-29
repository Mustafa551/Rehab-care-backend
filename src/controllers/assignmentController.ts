import { Request, Response } from 'express';
import { STATUS } from '../messages/statusCodes';
import {
  assignDoctorToPatient,
  generateAssignmentsForDate,
  getAssignmentsByDate,
  getAssignmentsByPatientId,
  getAssignmentsByStaffId,
  getDoctorPatientAssignments,
} from '../models/assignmentModel';
import { getDb } from '../config/db';
import { errorLogs } from '../utils/helper';

// GET ASSIGNMENTS BY DATE
const getAssignmentsByDateHandler = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Date parameter is required',
      });
    }

    const assignments = await getAssignmentsByDate(date as string);

    return res.status(STATUS.success).json({
      success: true,
      data: assignments,
    });
  } catch (error: any) {
    errorLogs('getAssignmentsByDate', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// GENERATE ASSIGNMENTS FOR DATE (SIMULATE NEXT DAY)
const generateAssignmentsHandler = async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Date is required',
      });
    }

    const assignments = await generateAssignmentsForDate(date);

    return res.status(STATUS.success).json({
      success: true,
      message: 'Staff assignments generated successfully',
      data: assignments,
    });
  } catch (error: any) {
    errorLogs('generateAssignments', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// GET ASSIGNMENTS BY STAFF ID
const getAssignmentsByStaffHandler = async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    const { date } = req.query;
    
    if (isNaN(staffId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid staff ID',
      });
    }

    const assignments = await getAssignmentsByStaffId(staffId, date as string);

    return res.status(STATUS.success).json({
      success: true,
      data: assignments,
    });
  } catch (error: any) {
    errorLogs('getAssignmentsByStaff', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// GET ASSIGNMENTS BY PATIENT ID
const getAssignmentsByPatientHandler = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { date } = req.query;

    const assignments = await getAssignmentsByPatientId(patientId, date as string);

    return res.status(STATUS.success).json({
      success: true,
      data: assignments,
    });
  } catch (error: any) {
    errorLogs('getAssignmentsByPatient', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// GET DOCTOR-PATIENT ASSIGNMENTS
const getDoctorAssignmentsHandler = async (req: Request, res: Response) => {
  try {
    const assignments = await getDoctorPatientAssignments();

    return res.status(STATUS.success).json({
      success: true,
      data: assignments,
    });
  } catch (error: any) {
    errorLogs('getDoctorAssignments', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// ASSIGN DOCTOR TO PATIENT
const assignDoctorHandler = async (req: Request, res: Response) => {
  try {
    const { doctorId, patientId } = req.body;
    
    if (!doctorId || !patientId) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Doctor ID and Patient ID are required',
      });
    }

    const assignment = await assignDoctorToPatient(doctorId, patientId);

    return res.status(STATUS.success).json({
      success: true,
      message: 'Doctor assigned to patient successfully',
      data: assignment,
    });
  } catch (error: any) {
    errorLogs('assignDoctor', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// INITIALIZE SYSTEM WITH BASIC ASSIGNMENTS
const initializeAssignmentsHandler = async (req: Request, res: Response) => {
  try {
    const database = getDb();
    
    // Check if doctor assignments already exist
    const existingAssignments = await database.request().query('SELECT COUNT(*) as count FROM doctor_patient_assignments');
    
    if (existingAssignments.recordset[0].count > 0) {
      return res.status(STATUS.success).json({
        success: true,
        message: 'Doctor assignments already exist',
      });
    }
    
    // Get all doctors
    const doctorsResult = await database.request().query("SELECT * FROM staff WHERE role = 'doctor' AND isOnDuty = 1");
    const doctors = doctorsResult.recordset;
    
    if (doctors.length === 0) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'No doctors available for assignment',
      });
    }
    
    // Mock patients (same as in generateAssignmentsForDate)
    const patients = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
    
    // Assign doctors to patients (distribute evenly)
    const assignments = [];
    for (let i = 0; i < patients.length; i++) {
      const doctorIndex = i % doctors.length;
      const doctor = doctors[doctorIndex];
      const patientId = patients[i];
      
      try {
        const assignment = await assignDoctorToPatient(doctor.id, patientId);
        assignments.push(assignment);
      } catch (error: any) {
        // Skip if assignment already exists
        if (!error.message.includes('UNIQUE KEY constraint')) {
          throw error;
        }
      }
    }
    
    return res.status(STATUS.success).json({
      success: true,
      message: 'Initial doctor assignments created successfully',
      data: assignments,
    });
  } catch (error: any) {
    errorLogs('initializeAssignments', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

export {
  assignDoctorHandler as assignDoctor, 
  generateAssignmentsHandler as generateAssignments, 
  getAssignmentsByDateHandler as getAssignmentsByDate, 
  getAssignmentsByPatientHandler as getAssignmentsByPatient, 
  getAssignmentsByStaffHandler as getAssignmentsByStaff, 
  getDoctorAssignmentsHandler as getDoctorAssignments,
  initializeAssignmentsHandler as initializeAssignments
};

