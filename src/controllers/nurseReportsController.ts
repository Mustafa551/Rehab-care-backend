import { Request, Response } from 'express';
import * as nurseReportsModel from '../models/nurseReportsModel';
import { STATUS } from '../messages/statusCodes';

export const getAllNurseReports = async (req: Request, res: Response) => {
  try {
    const reports = await nurseReportsModel.getAllNurseReports();
    return res.status(STATUS.success).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('🚀 ~ getAllNurseReports ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch nurse reports',
    });
  }
};

export const getNurseReportsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    if (!patientId || isNaN(Number(patientId))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid patient ID is required',
      });
    }

    const reports = await nurseReportsModel.getNurseReportsByPatient(Number(patientId));

    return res.status(STATUS.success).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('🚀 ~ getNurseReportsByPatient ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch nurse reports for patient',
    });
  }
};

export const getUnreviewedReportsByPatient = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    if (!patientId || isNaN(Number(patientId))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid patient ID is required',
      });
    }

    const reports = await nurseReportsModel.getUnreviewedReportsByPatient(Number(patientId));

    return res.status(STATUS.success).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('🚀 ~ getUnreviewedReportsByPatient ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch unreviewed reports for patient',
    });
  }
};

export const getAllUnreviewedReports = async (req: Request, res: Response) => {
  try {
    const reports = await nurseReportsModel.getAllUnreviewedReports();
    return res.status(STATUS.success).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('🚀 ~ getAllUnreviewedReports ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch unreviewed reports',
    });
  }
};

export const createNurseReport = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      reportedBy,
      date,
      time,
      conditionUpdate,
      symptoms,
      painLevel,
      notes,
      urgency,
    } = req.body;

    // Default to current time if not provided
    const currentTime = new Date().toTimeString().slice(0, 8); // HH:MM:SS format
    const reportTime = time || currentTime;

    // Validate required fields (time is now optional)
    if (!patientId || !reportedBy || !date || !conditionUpdate || !urgency) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Patient ID, reported by, date, condition update, and urgency are required',
      });
    }

    // Validate urgency level
    if (!['low', 'medium', 'high'].includes(urgency)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Urgency must be low, medium, or high',
      });
    }

    // Validate pain level if provided
    if (painLevel !== undefined && (painLevel < 0 || painLevel > 10)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Pain level must be between 0 and 10',
      });
    }

    const report = await nurseReportsModel.createNurseReport({
      patientId: Number(patientId),
      reportedBy,
      date,
      time: reportTime,
      conditionUpdate,
      symptoms: symptoms || [],
      painLevel: painLevel ? Number(painLevel) : undefined,
      notes,
      urgency,
    });

    return res.status(STATUS.created).json({
      success: true,
      data: report,
      message: 'Nurse report submitted successfully',
    });
  } catch (error) {
    console.error('🚀 ~ createNurseReport ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to submit nurse report',
    });
  }
};

export const getNurseReportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid report ID is required',
      });
    }

    const report = await nurseReportsModel.getNurseReportById(Number(id));

    if (!report) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Nurse report not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('🚀 ~ getNurseReportById ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to fetch nurse report',
    });
  }
};

export const updateNurseReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid report ID is required',
      });
    }

    // Validate urgency level if provided
    if (updateData.urgency && !['low', 'medium', 'high'].includes(updateData.urgency)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Urgency must be low, medium, or high',
      });
    }

    // Validate pain level if provided
    if (updateData.painLevel !== undefined && (updateData.painLevel < 0 || updateData.painLevel > 10)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Pain level must be between 0 and 10',
      });
    }

    const report = await nurseReportsModel.updateNurseReport(Number(id), updateData);

    if (!report) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Nurse report not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: report,
      message: 'Nurse report updated successfully',
    });
  } catch (error) {
    console.error('🚀 ~ updateNurseReport ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to update nurse report',
    });
  }
};

export const reviewNurseReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { doctorResponse } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid report ID is required',
      });
    }

    if (!doctorResponse || typeof doctorResponse !== 'string') {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Doctor response is required',
      });
    }

    const report = await nurseReportsModel.updateNurseReport(Number(id), {
      reviewedByDoctor: true,
      doctorResponse,
    });

    if (!report) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Nurse report not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: report,
      message: 'Nurse report reviewed successfully',
    });
  } catch (error) {
    console.error('🚀 ~ reviewNurseReport ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to review nurse report',
    });
  }
};

export const deleteNurseReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Valid report ID is required',
      });
    }

    const deleted = await nurseReportsModel.deleteNurseReport(Number(id));

    if (!deleted) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Nurse report not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      message: 'Nurse report deleted successfully',
    });
  } catch (error) {
    console.error('🚀 ~ deleteNurseReport ~ error:', error);
    return res.status(STATUS.serverError).json({
      error: true,
      message: 'Failed to delete nurse report',
    });
  }
};