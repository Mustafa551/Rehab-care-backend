import { Request, Response } from 'express';
import * as vitalSignsModel from '../models/vitalSignsModel';
import { STATUS } from '../messages/statusCodes';

export const getAllVitalSigns = async (req: Request, res: Response) => {
  try {
    const vitalSigns = await vitalSignsModel.getAllVitalSigns();
    return res.status(STATUS.success).json({
      success: true,
      data: vitalSigns,
    });
  } catch (error) {
    console.error('🚀 ~ getAllVitalSigns ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch vital signs',
    });
  }
};

export const getVitalSignsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { date } = req.query;

    if (!patientId || isNaN(Number(patientId))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid patient ID is required',
      });
    }

    let vitalSigns;
    if (date && typeof date === 'string') {
      vitalSigns = await vitalSignsModel.getVitalSignsByPatientAndDate(Number(patientId), date);
    } else {
      vitalSigns = await vitalSignsModel.getVitalSignsByPatient(Number(patientId));
    }

    return res.status(STATUS.success).json({
      success: true,
      data: vitalSigns,
    });
  } catch (error) {
    console.error('🚀 ~ getVitalSignsByPatient ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch vital signs for patient',
    });
  }
};

export const createVitalSigns = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      date,
      time,
      bloodPressure,
      heartRate,
      temperature,
      oxygenSaturation,
      respiratoryRate,
      notes,
      recordedBy,
    } = req.body;

    // Validate required fields
    if (!patientId || !date || !time || !bloodPressure || !heartRate || !temperature || !recordedBy) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Patient ID, date, time, blood pressure, heart rate, temperature, and recorded by are required',
      });
    }

    // Validate time format (should be HH:MM or HH:MM:SS)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    console.log('Received time value:', time, 'Type:', typeof time);
    if (!timeRegex.test(time)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Time must be in HH:MM or HH:MM:SS format',
      });
    }

    const vitalSigns = await vitalSignsModel.createVitalSigns({
      patientId: Number(patientId),
      date,
      time,
      bloodPressure,
      heartRate,
      temperature,
      oxygenSaturation,
      respiratoryRate,
      notes,
      recordedBy,
    });

    return res.status(STATUS.created).json({
      success: true,
      data: vitalSigns,
      message: 'Vital signs recorded successfully',
    });
  } catch (error) {
    console.error('🚀 ~ createVitalSigns ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to record vital signs',
    });
  }
};

export const getVitalSignsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid vital signs ID is required',
      });
    }

    const vitalSigns = await vitalSignsModel.getVitalSignsById(Number(id));

    if (!vitalSigns) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Vital signs not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: vitalSigns,
    });
  } catch (error) {
    console.error('🚀 ~ getVitalSignsById ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch vital signs',
    });
  }
};

export const updateVitalSigns = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid vital signs ID is required',
      });
    }

    const vitalSigns = await vitalSignsModel.updateVitalSigns(Number(id), updateData);

    if (!vitalSigns) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Vital signs not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: vitalSigns,
      message: 'Vital signs updated successfully',
    });
  } catch (error) {
    console.error('🚀 ~ updateVitalSigns ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to update vital signs',
    });
  }
};

export const deleteVitalSigns = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid vital signs ID is required',
      });
    }

    const deleted = await vitalSignsModel.deleteVitalSigns(Number(id));

    if (!deleted) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Vital signs not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      message: 'Vital signs deleted successfully',
    });
  } catch (error) {
    console.error('🚀 ~ deleteVitalSigns ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to delete vital signs',
    });
  }
};