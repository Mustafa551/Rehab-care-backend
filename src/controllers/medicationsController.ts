import { Request, Response } from 'express';
import * as medicationsModel from '../models/medicationsModel';
import { STATUS } from '../messages/statusCodes';

// Medications endpoints
export const getAllMedications = async (req: Request, res: Response) => {
  try {
    const medications = await medicationsModel.getAllMedications();
    return res.status(STATUS.success).json({
      success: true,
      data: medications,
    });
  } catch (error) {
    console.error('🚀 ~ getAllMedications ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch medications',
    });
  }
};

export const getMedicationsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    if (!patientId || isNaN(Number(patientId))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid patient ID is required',
      });
    }

    const medications = await medicationsModel.getMedicationsByPatient(Number(patientId));

    return res.status(STATUS.success).json({
      success: true,
      data: medications,
    });
  } catch (error) {
    console.error('🚀 ~ getMedicationsByPatient ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch medications for patient',
    });
  }
};

export const createMedication = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      prescribedBy,
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
    } = req.body;

    // Validate required fields
    if (!patientId || !prescribedBy || !medicationName || !dosage || !frequency || !startDate) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Patient ID, prescribed by, medication name, dosage, frequency, and start date are required',
      });
    }

    const medication = await medicationsModel.createMedication({
      patientId: Number(patientId),
      prescribedBy,
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      notes,
    });

    return res.status(STATUS.created).json({
      success: true,
      data: medication,
      message: 'Medication prescribed successfully',
    });
  } catch (error) {
    console.error('🚀 ~ createMedication ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to prescribe medication',
    });
  }
};

export const getMedicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid medication ID is required',
      });
    }

    const medication = await medicationsModel.getMedicationById(Number(id));

    if (!medication) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Medication not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: medication,
    });
  } catch (error) {
    console.error('🚀 ~ getMedicationById ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch medication',
    });
  }
};

export const updateMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid medication ID is required',
      });
    }

    const medication = await medicationsModel.updateMedication(Number(id), updateData);

    if (!medication) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Medication not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: medication,
      message: 'Medication updated successfully',
    });
  } catch (error) {
    console.error('🚀 ~ updateMedication ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to update medication',
    });
  }
};

export const deleteMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid medication ID is required',
      });
    }

    const deleted = await medicationsModel.deleteMedication(Number(id));

    if (!deleted) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Medication not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      message: 'Medication discontinued successfully',
    });
  } catch (error) {
    console.error('🚀 ~ deleteMedication ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to discontinue medication',
    });
  }
};

// Medication Administration endpoints
export const getMedicationAdministrationsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { date } = req.query;

    if (!patientId || isNaN(Number(patientId))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid patient ID is required',
      });
    }

    const administrations = await medicationsModel.getMedicationAdministrationsByPatient(
      Number(patientId),
      date as string
    );

    return res.status(STATUS.success).json({
      success: true,
      data: administrations,
    });
  } catch (error) {
    console.error('🚀 ~ getMedicationAdministrationsByPatient ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch medication administrations',
    });
  }
};

export const createMedicationAdministration = async (req: Request, res: Response) => {
  try {
    const {
      medicationId,
      patientId,
      scheduledTime,
      date,
      notes,
    } = req.body;

    // Validate required fields
    if (!medicationId || !patientId || !scheduledTime || !date) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Medication ID, patient ID, scheduled time, and date are required',
      });
    }

    const administration = await medicationsModel.createMedicationAdministration({
      medicationId: Number(medicationId),
      patientId: Number(patientId),
      scheduledTime,
      date,
      notes,
    });

    return res.status(STATUS.created).json({
      success: true,
      data: administration,
      message: 'Medication administration scheduled successfully',
    });
  } catch (error) {
    console.error('🚀 ~ createMedicationAdministration ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to schedule medication administration',
    });
  }
};

export const updateMedicationAdministration = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid administration ID is required',
      });
    }

    const administration = await medicationsModel.updateMedicationAdministration(Number(id), updateData);

    if (!administration) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Medication administration not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: administration,
      message: 'Medication administration updated successfully',
    });
  } catch (error) {
    console.error('🚀 ~ updateMedicationAdministration ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to update medication administration',
    });
  }
};

export const administerMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { administeredBy, notes } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid administration ID is required',
      });
    }

    if (!administeredBy) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Administered by is required',
      });
    }

    const currentTime = new Date().toTimeString().slice(0, 5);

    const administration = await medicationsModel.updateMedicationAdministration(Number(id), {
      administered: true,
      administeredTime: currentTime,
      administeredBy,
      notes,
    });

    if (!administration) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Medication administration not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: administration,
      message: 'Medication administered successfully',
    });
  } catch (error) {
    console.error('🚀 ~ administerMedication ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to administer medication',
    });
  }
};