import { getDb } from '../config/db';
import sql from 'mssql';

export interface StaffAssignment {
  id: number;
  staffId: number;
  patientId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorPatientAssignment {
  id: number;
  doctorId: number;
  patientId: string;
  assignedDate: string;
  createdAt: string;
  updatedAt: string;
}

// Get assignments for a specific date (includes both rotating staff and permanent doctors)
export const getAssignmentsByDate = async (date: string): Promise<StaffAssignment[]> => {
  const database = getDb();
  const request = database.request();
  request.input('date', sql.Date, date);
  
  // Get regular staff assignments for the date
  const staffAssignments = await request.query('SELECT * FROM staff_assignments WHERE date = @date ORDER BY patientId');
  
  // Get doctor assignments (permanent) and add them for this date if they don't exist
  const doctorRequest = database.request();
  doctorRequest.input('date', sql.Date, date);
  
  const doctorAssignments = await doctorRequest.query(`
    SELECT 
      COALESCE(sa.id, 0) as id,
      dpa.doctorId as staffId, 
      dpa.patientId, 
      @date as date,
      COALESCE(sa.createdAt, dpa.createdAt) as createdAt,
      COALESCE(sa.updatedAt, dpa.updatedAt) as updatedAt
    FROM doctor_patient_assignments dpa
    LEFT JOIN staff_assignments sa ON sa.staffId = dpa.doctorId AND sa.patientId = dpa.patientId AND sa.date = @date
  `);
  
  // Combine both types of assignments
  const allAssignments = [
    ...staffAssignments.recordset,
    ...doctorAssignments.recordset.filter((da: any) => da.id === 0) // Only add doctor assignments that don't already exist in staff_assignments
  ];
  
  return allAssignments as StaffAssignment[];
};

// Get doctor-patient permanent assignments
export const getDoctorPatientAssignments = async (): Promise<DoctorPatientAssignment[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM doctor_patient_assignments ORDER BY patientId');
  return result.recordset as DoctorPatientAssignment[];
};

// Assign doctor to patient permanently
export const assignDoctorToPatient = async (doctorId: number, patientId: string): Promise<DoctorPatientAssignment> => {
  const database = getDb();
  const request = database.request();
  request.input('doctorId', sql.Int, doctorId);
  request.input('patientId', sql.NVarChar, patientId);
  
  const result = await request.query(`
    INSERT INTO doctor_patient_assignments (doctorId, patientId)
    OUTPUT INSERTED.*
    VALUES (@doctorId, @patientId)
  `);
  
  return result.recordset[0] as DoctorPatientAssignment;
};

// Generate assignments for a specific date
export const generateAssignmentsForDate = async (date: string): Promise<StaffAssignment[]> => {
  const database = getDb();
  
  // Get all active staff members (both doctors and non-doctors)
  const allStaffResult = await database.request().query(`
    SELECT * FROM staff 
    WHERE isOnDuty = 1 
    ORDER BY 
      CASE 
        WHEN role = 'doctor' THEN 1 
        ELSE 2 
      END, id
  `);
  const allStaff = allStaffResult.recordset;
  
  if (allStaff.length === 0) {
    throw new Error('No active staff members available for assignment');
  }
  
  // Separate other staff for rotation
  const otherStaff = allStaff.filter(s => s.role !== 'doctor');
  
  // Mock patients (in real app, this would come from patients table)
  const patients = [
    'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'
  ];
  
  // Calculate day of year for rotation
  const dateObj = new Date(date);
  const dayOfYear = Math.floor((dateObj.getTime() - new Date(dateObj.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Clear only NON-DOCTOR assignments for this date (keep existing doctor assignments)
  const deleteRequest = database.request();
  deleteRequest.input('date', sql.Date, date);
  await deleteRequest.query(`
    DELETE FROM staff_assignments 
    WHERE date = @date 
    AND staffId IN (SELECT id FROM staff WHERE role != 'doctor')
  `);
  
  // Generate new assignments
  const assignments: StaffAssignment[] = [];
  
  // Get existing doctor-patient permanent assignments
  const doctorAssignments = await database.request().query(`
    SELECT doctorId, patientId FROM doctor_patient_assignments
  `);
  const doctorPatientMap = new Map();
  doctorAssignments.recordset.forEach((assignment: any) => {
    doctorPatientMap.set(assignment.patientId, assignment.doctorId);
  });
  
  // Assign rotating staff to patients who DON'T have permanent doctors
  const patientsWithoutDoctors = patients.filter(patientId => !doctorPatientMap.has(patientId));
  
  for (let i = 0; i < patientsWithoutDoctors.length; i++) {
    const patientId = patientsWithoutDoctors[i];
    
    if (otherStaff.length > 0) {
      // Rotate non-doctor staff
      const staffIndex = (i + dayOfYear) % otherStaff.length;
      const assignedStaff = otherStaff[staffIndex];
      
      const insertRequest = database.request();
      insertRequest.input('staffId', sql.Int, assignedStaff.id);
      insertRequest.input('patientId', sql.NVarChar, patientId);
      insertRequest.input('date', sql.Date, date);
      
      try {
        const result = await insertRequest.query(`
          INSERT INTO staff_assignments (staffId, patientId, date)
          OUTPUT INSERTED.*
          VALUES (@staffId, @patientId, @date)
        `);
        
        assignments.push(result.recordset[0] as StaffAssignment);
      } catch (error: any) {
        if (error.message.includes('UNIQUE KEY constraint')) {
          console.warn(`Skipping duplicate assignment for patient ${patientId} on ${date}`);
          continue;
        }
        throw error;
      }
    }
  }
  
  // Add doctor assignments to staff_assignments table for this date (if they don't already exist)
  for (const [patientId, doctorId] of doctorPatientMap.entries()) {
    const insertRequest = database.request();
    insertRequest.input('staffId', sql.Int, doctorId);
    insertRequest.input('patientId', sql.NVarChar, patientId);
    insertRequest.input('date', sql.Date, date);
    
    try {
      const result = await insertRequest.query(`
        INSERT INTO staff_assignments (staffId, patientId, date)
        OUTPUT INSERTED.*
        VALUES (@staffId, @patientId, @date)
      `);
      
      assignments.push(result.recordset[0] as StaffAssignment);
    } catch (error: any) {
      if (error.message.includes('UNIQUE KEY constraint')) {
        // Doctor assignment already exists for this date, fetch it
        const existingRequest = database.request();
        existingRequest.input('staffId', sql.Int, doctorId);
        existingRequest.input('patientId', sql.NVarChar, patientId);
        existingRequest.input('date', sql.Date, date);
        
        const existing = await existingRequest.query(`
          SELECT * FROM staff_assignments 
          WHERE staffId = @staffId AND patientId = @patientId AND date = @date
        `);
        
        if (existing.recordset.length > 0) {
          assignments.push(existing.recordset[0] as StaffAssignment);
        }
        continue;
      }
      throw error;
    }
  }
  
  return assignments;
};

// Get assignments for a specific staff member
export const getAssignmentsByStaffId = async (staffId: number, date?: string): Promise<StaffAssignment[]> => {
  const database = getDb();
  const request = database.request();
  request.input('staffId', sql.Int, staffId);
  
  let query = 'SELECT * FROM staff_assignments WHERE staffId = @staffId';
  if (date) {
    request.input('date', sql.Date, date);
    query += ' AND date = @date';
  }
  query += ' ORDER BY date DESC';
  
  const result = await request.query(query);
  return result.recordset as StaffAssignment[];
};

// Get assignments for a specific patient
export const getAssignmentsByPatientId = async (patientId: string, date?: string): Promise<StaffAssignment[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.NVarChar, patientId);
  
  let query = 'SELECT * FROM staff_assignments WHERE patientId = @patientId';
  if (date) {
    request.input('date', sql.Date, date);
    query += ' AND date = @date';
  }
  query += ' ORDER BY date DESC';
  
  const result = await request.query(query);
  return result.recordset as StaffAssignment[];
};