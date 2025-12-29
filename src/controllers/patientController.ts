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
    const { name, email, phone, dateOfBirth, medicalCondition, assignedDoctorId, status } = req.body;

    // Check if patient with email already exists
    const existingPatient = await getPatientByEmail(email);
    if (existingPatient) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Patient with this email already exists',
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
    };

    const newPatient = await createPatient(patientData);

    return res.status(STATUS.created).json({
      success: true,
      message: SUCCESS.patientCreated,
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

export {
  getAllPatientsHandler as getAllPatients,
  getPatientByIdHandler as getPatientById,
  createPatientHandler as createPatient,
  updatePatientHandler as updatePatient,
  deletePatientHandler as deletePatient,
};