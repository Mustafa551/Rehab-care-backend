import { Request, Response } from 'express';
import { STATUS } from '../messages/statusCodes';
import { SUCCESS } from '../messages/success';
import { errorLogs } from '../utils/helper';
import {
  getAllStaff,
  getStaffById,
  getStaffByEmail,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByRole,
  getOnDutyStaff,
} from '../models/staffModel';

// GET ALL STAFF
const getAllStaffHandler = async (req: Request, res: Response) => {
  try {
    const { role, onDuty } = req.query;
    let staff;

    if (role) {
      staff = await getStaffByRole(role as 'nurse' | 'doctor');
    } else if (onDuty === 'true') {
      staff = await getOnDutyStaff();
    } else {
      staff = await getAllStaff();
    }

    return res.status(STATUS.success).json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    errorLogs('getAllStaff', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// GET STAFF BY ID
const getStaffByIdHandler = async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    if (isNaN(staffId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid staff ID',
      });
    }

    const staff = await getStaffById(staffId);

    if (!staff) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Staff member not found',
      });
    }

    return res.status(STATUS.success).json({
      success: true,
      data: staff,
    });
  } catch (error: any) {
    errorLogs('getStaffById', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// CREATE STAFF
const createStaffHandler = async (req: Request, res: Response) => {
  try {
    const { name, role, email, phone, isOnDuty, photoUrl, specialization, nurseType } = req.body;

    // Validate role-specific requirements
    if (role === 'doctor' && !specialization) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Specialization is required for doctors',
      });
    }

    // Check if staff with email already exists
    const existingStaff = await getStaffByEmail(email);
    if (existingStaff) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Staff member with this email already exists',
      });
    }

    // Prepare staff data
    const staffData: any = {
      name: role === 'doctor' ? `Dr. ${name}` : name, // Add Dr. prefix for doctors
      role,
      email,
      phone,
      isOnDuty,
      photoUrl,
    };

    // Add role-specific fields
    if (role === 'doctor') {
      staffData.specialization = specialization;
    } else if (role === 'nurse') {
      staffData.nurseType = nurseType || 'fresh';
    }

    // Create staff member
    const staff = await createStaff(staffData);

    return res.status(STATUS.created).json({
      success: true,
      message: SUCCESS.staffCreated || 'Staff member created successfully',
      data: staff,
    });
  } catch (error: any) {
    errorLogs('createStaff', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// UPDATE STAFF
const updateStaffHandler = async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    if (isNaN(staffId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid staff ID',
      });
    }

    const { name, role, email, phone, isOnDuty, photoUrl, specialization, nurseType } = req.body;

    // Check if staff exists
    const existingStaff = await getStaffById(staffId);
    if (!existingStaff) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Staff member not found',
      });
    }

    // If email is being updated, check if it's already taken by another staff member
    if (email && email !== existingStaff.email) {
      const staffWithEmail = await getStaffByEmail(email);
      if (staffWithEmail && staffWithEmail.id !== staffId) {
        return res.status(STATUS.badRequest).json({
          error: true,
          message: 'Email is already taken by another staff member',
        });
      }
    }

    // Validate role-specific requirements
    if (role === 'doctor' && !specialization && !existingStaff.specialization) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Specialization is required for doctors',
      });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = role === 'doctor' || existingStaff.role === 'doctor' ? `Dr. ${name}` : name;
    }
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isOnDuty !== undefined) updateData.isOnDuty = isOnDuty;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (nurseType !== undefined) updateData.nurseType = nurseType;

    const updatedStaff = await updateStaff(staffId, updateData);

    return res.status(STATUS.success).json({
      success: true,
      message: SUCCESS.updated,
      data: updatedStaff,
    });
  } catch (error: any) {
    errorLogs('updateStaff', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

// DELETE STAFF
const deleteStaffHandler = async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.staffId, 10);
    if (isNaN(staffId)) {
      return res.status(STATUS.badRequest).json({
        error: true,
        message: 'Invalid staff ID',
      });
    }

    // Check if staff exists
    const existingStaff = await getStaffById(staffId);
    if (!existingStaff) {
      return res.status(STATUS.notFound).json({
        error: true,
        message: 'Staff member not found',
      });
    }

    await deleteStaff(staffId);

    return res.status(STATUS.success).json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error: any) {
    errorLogs('deleteStaff', error.message);
    return res.status(STATUS.serverError).json({
      error: true,
      message: error.message,
    });
  }
};

export {
  getAllStaffHandler as getAllStaff,
  getStaffByIdHandler as getStaffById,
  createStaffHandler as createStaff,
  updateStaffHandler as updateStaff,
  deleteStaffHandler as deleteStaff,
};