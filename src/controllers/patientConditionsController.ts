import { Request, Response } from 'express';
import * as patientConditionsModel from '../models/patientConditionsModel';
import { STATUS } from '../messages/statusCodes';

export const getAllPatientConditions = async (req: Request, res: Response) => {
  try {
    const conditions = await patientConditionsModel.getAllPatientConditions();
    return res.status(STATUS.success).json({
      success: true,
      data: conditions,
    });
  } catch (error) {
    console.error('🚀 ~ getAllPatientConditions ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch patient conditions',
    });
  }
};

export const getPatientConditionsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    if (!patientId || isNaN(Number(patientId))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid patient ID is required',
      });
    }

    const conditions = await patientConditionsModel.getPatientConditionsByPatient(Number(patientId));

    return res.status(STATUS.success).json({
      success: true,
      data: conditions,
    });
  } catch (error) {
    console.error('🚀 ~ getPatientConditionsByPatient ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch patient conditions',
    });
  }
};

export const getLatestPatientCondition = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    if (!patientId || isNaN(Number(patientId))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid patient ID is required',
      });
    }

    const condition = await patientConditionsModel.getLatestPatientCondition(Number(patientId));

    return res.status(STATUS.success).json({
      success: true,
      data: condition,
    });
  } catch (error) {
    console.error('🚀 ~ getLatestPatientCondition ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch latest patient condition',
    });
  }
};

export const createPatientCondition = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      assessedBy,
      date,
      condition,
      notes,
      medications,
      vitals,
      dischargeRecommendation,
      dischargeNotes,
    } = req.body;

    // Validate required fields
    if (!patientId || !assessedBy || !date || !condition) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Patient ID, assessed by, date, and condition are required',
      });
    }

    // Validate discharge recommendation if provided
    if (dischargeRecommendation && !['continue', 'discharge'].includes(dischargeRecommendation)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Discharge recommendation must be continue or discharge',
      });
    }

    const patientCondition = await patientConditionsModel.createPatientCondition({
      patientId: Number(patientId),
      assessedBy,
      date,
      condition,
      notes,
      medications: medications || [],
      vitals,
      dischargeRecommendation: dischargeRecommendation || 'continue',
      dischargeNotes,
    });

    return res.status(STATUS.created).json({
      success: true,
      data: patientCondition,
      message: 'Patient condition assessment created successfully',
    });
  } catch (error) {
    console.error('🚀 ~ createPatientCondition ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to create patient condition assessment',
    });
  }
};

export const getPatientConditionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid condition ID is required',
      });
    }

    const condition = await patientConditionsModel.getPatientConditionById(Number(id));

    if (!condition) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Patient condition not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: condition,
    });
  } catch (error) {
    console.error('🚀 ~ getPatientConditionById ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch patient condition',
    });
  }
};

export const updatePatientCondition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid condition ID is required',
      });
    }

    // Validate discharge recommendation if provided
    if (updateData.dischargeRecommendation && !['continue', 'discharge'].includes(updateData.dischargeRecommendation)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Discharge recommendation must be continue or discharge',
      });
    }

    const condition = await patientConditionsModel.updatePatientCondition(Number(id), updateData);

    if (!condition) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Patient condition not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: condition,
      message: 'Patient condition updated successfully',
    });
  } catch (error) {
    console.error('🚀 ~ updatePatientCondition ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to update patient condition',
    });
  }
};

export const deletePatientCondition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid condition ID is required',
      });
    }

    const deleted = await patientConditionsModel.deletePatientCondition(Number(id));

    if (!deleted) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Patient condition not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      message: 'Patient condition deleted successfully',
    });
  } catch (error) {
    console.error('🚀 ~ deletePatientCondition ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to delete patient condition',
    });
  }
};