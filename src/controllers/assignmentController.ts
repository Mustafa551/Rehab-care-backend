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

export {
  assignDoctorHandler as assignDoctor, generateAssignmentsHandler as generateAssignments, getAssignmentsByDateHandler as getAssignmentsByDate, getAssignmentsByPatientHandler as getAssignmentsByPatient, getAssignmentsByStaffHandler as getAssignmentsByStaff, getDoctorAssignmentsHandler as getDoctorAssignments
};

