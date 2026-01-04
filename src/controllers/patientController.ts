import { Request, Response } from 'express';
import { STATUS } from '../messages/statusCodes';
import { SUCCESS } from '../messages/success';
import { errorLogs } from '../utils/helper';
import {
  getAllPatients,
  getPatientById,
  getPatientByEmail,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientsByStatus,
  getPatientsByDoctor,
} from '../models/patientModel';

// GET ALL PATIENTS
const getAllPatientsHandler = async (req: Request, res: Response) => {
  try {
    const { status, doctorId } = req.query;
    let patients;

    if (status) {
      patients = await getPatientsByStatus(status as 'active' | 'inactive' | 'discharged');
    } else if (doctorId) {
      patients = await getPatientsByDoctor(parseInt(doctorId as string, 10));
    } else {
      patients = await getAllPatients();
    }

    return res.status(STATUS.success).json({
      success: true,
      data: patients,
    });
  } catch (error: any) {
    errorLogs('getAllPatients', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// GET PATIENT BY ID
const getPatientByIdHandler = async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    if (isNaN(patientId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid patient ID',
      });
    }

    const patient = await getPatientById(patientId);

    if (!patient) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Patient not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: patient,
    });
  } catch (error: any) {
    errorLogs('getPatientById', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// CREATE PATIENT
const createPatientHandler = async (req: Request, res: Response) => {
  try {
    const { 
      name, email, phone, dateOfBirth, medicalCondition, assignedDoctorId, status,
      // New comprehensive registration fields
      age, gender, address, emergencyContact, diseases, assignedNurses, 
      initialDeposit, roomType, roomNumber, admissionDate,
      // Medical tracking fields
      currentMedications, lastAssessmentDate, dischargeStatus
    } = req.body;

    // Check if patient with email already exists
    const existingPatient = await getPatientByEmail(email);
    if (existingPatient) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Patient with this email already exists',
      });
    }

    // Validate Pakistani phone format
    if (phone) {
      const phoneRegex = /^(\+92|0)?[0-9]{3}-?[0-9]{7}$|^(\+92|0)?[0-9]{10}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return res.status(STATUS.badRequest).json({
          error: true,
          message: 'Please enter a valid Pakistani phone number (e.g., +92-300-1234567 or 0300-1234567)',
        });
      }
    }

    // Validate required fields for comprehensive registration
    if (!name || !phone || !age || !gender || !address || !emergencyContact) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Missing required fields: name, phone, age, gender, address, emergencyContact',
      });
    }

    // Validate diseases array
    if (diseases && (!Array.isArray(diseases) || diseases.length === 0)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'At least one disease must be selected',
      });
    }

    // Validate nurse assignment (exactly 2 nurses required)
    if (assignedNurses && (!Array.isArray(assignedNurses) || assignedNurses.length !== 2)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Exactly 2 nurses must be assigned to each patient',
      });
    }

    // Validate initial deposit
    if (initialDeposit && initialDeposit <= 0) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Initial deposit must be greater than 0',
      });
    }

    const patientData = {
      name,
      email,
      phone,
      dateOfBirth,
      medicalCondition,
      assignedDoctorId,
      status: status || 'active',
      // New comprehensive fields
      age,
      gender,
      address,
      emergencyContact,
      diseases,
      assignedNurses,
      initialDeposit,
      roomType,
      roomNumber,
      admissionDate,
      // Medical tracking fields
      currentMedications,
      lastAssessmentDate,
      dischargeStatus,
    };

    const newPatient = await createPatient(patientData);

    return res.status(STATUS.created).json({
      success: true,
      message: SUCCESS.patientCreated || 'Patient registered successfully with comprehensive details',
      data: newPatient,
    });
  } catch (error: any) {
    errorLogs('createPatient', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// UPDATE PATIENT
const updatePatientHandler = async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    if (isNaN(patientId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid patient ID',
      });
    }

    // Check if patient exists
    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Patient not found',
      });
    }

    // Check if email is being updated and if it already exists
    if (req.body.email && req.body.email !== existingPatient.email) {
      const patientWithEmail = await getPatientByEmail(req.body.email);
      if (patientWithEmail) {
        return res.status(STATUS.badRequest).json({
          error: true,
          message: 'Patient with this email already exists',
        });
      }
    }

    const updatedPatient = await updatePatient(patientId, req.body);

    if (!updatedPatient) {
      return res.status(STATUS.serverError).json({
        error: true,
        message: 'Failed to update patient',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      message: SUCCESS.patientUpdated,
      data: updatedPatient,
    });
  } catch (error: any) {
    errorLogs('updatePatient', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// DELETE PATIENT
const deletePatientHandler = async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    if (isNaN(patientId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid patient ID',
      });
    }

    // Check if patient exists
    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Patient not found',
      });
    }

    const deleted = await deletePatient(patientId);

    if (!deleted) {
      return res.status(STATUS.serverError).json({
        error: true,
        message: 'Failed to delete patient',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      message: SUCCESS.patientDeleted,
    });
  } catch (error: any) {
    errorLogs('deletePatient', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// DISCHARGE PATIENT
const dischargePatientHandler = async (req: Request, res: Response) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    if (isNaN(patientId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid patient ID',
      });
    }

    // Check if patient exists
    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Patient not found',
      });
    }

    // Check if patient is already discharged
    if (existingPatient.status === 'discharged') {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Patient is already discharged',
      });
    }

    // Get discharge data from request body (optional)
    const {
      dischargeNotes,
      finalBillAmount,
      dischargeDate,
      dischargedBy
    } = req.body;

    // Prepare discharge data
    const dischargeData = {
      status: 'discharged' as const,
      dischargeStatus: 'ready' as const,
      // Add discharge-specific fields if provided
      ...(dischargeNotes && { dischargeNotes }),
      ...(finalBillAmount && { finalBillAmount }),
      ...(dischargeDate && { dischargeDate }),
      ...(dischargedBy && { dischargedBy }),
    };

    // Update patient with discharge information
    const dischargedPatient = await updatePatient(patientId, dischargeData);

    if (!dischargedPatient) {
      return res.status(STATUS.serverError).json({
        error: true,
        message: 'Failed to discharge patient',
      });
    }

    // Log discharge activity (optional - for audit trail)
    console.log(`Patient ${dischargedPatient.name} (ID: ${patientId}) discharged at ${new Date().toISOString()}`);

    return res.status(STATUS.success).json({
      success: true,
      message: `Patient ${dischargedPatient.name} has been successfully discharged`,
      data: {
        patient: dischargedPatient,
        dischargeDate: dischargeDate || new Date().toISOString(),
        message: 'Patient discharged successfully'
      },
    });
  } catch (error: any) {
    errorLogs('dischargePatient', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

export {
  getAllPatientsHandler as getAllPatients,
  getPatientByIdHandler as getPatientById,
  createPatientHandler as createPatient,
  updatePatientHandler as updatePatient,
  deletePatientHandler as deletePatient,
  dischargePatientHandler as dischargePatient,
};