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
  
  // Get all active patients from the database
  const patientsResult = await database.request().query(`
    SELECT id FROM patients WHERE status = 'active'
  `);
  const patients = patientsResult.recordset.map(p => p.id.toString());
  
  if (patients.length === 0) {
    console.warn('No active patients found for assignment');
    return [];
  }
  
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
  
  // Assign ALL patients to non-doctor staff (for daily care)
  // This is separate from doctor assignments - patients can have both a doctor AND daily staff
  if (otherStaff.length > 0) {
    for (let i = 0; i < patients.length; i++) {
      const patientId = patients[i];
      
      // Rotate non-doctor staff for ALL patients
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
  
  // Also add doctor assignments to staff_assignments table for this date (for completeness)
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

// Auto-assign a non-doctor staff member to a new patient
export const autoAssignStaffToNewPatient = async (patientId: string): Promise<StaffAssignment | null> => {
  const database = getDb();
  
  // Get all active non-doctor staff members
  const staffResult = await database.request().query(`
    SELECT * FROM staff 
    WHERE isOnDuty = 1 AND role != 'doctor'
    ORDER BY id
  `);
  const nonDoctorStaff = staffResult.recordset;
  
  if (nonDoctorStaff.length === 0) {
    console.warn('No active non-doctor staff available for auto-assignment');
    return null;
  }
  
  // Get current date
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Find the staff member with the least assignments for today
  let selectedStaff = nonDoctorStaff[0];
  let minAssignments = Infinity;
  
  for (const staff of nonDoctorStaff) {
    const assignmentCountResult = await database.request()
      .input('staffId', sql.Int, staff.id)
      .input('date', sql.Date, currentDate)
      .query(`
        SELECT COUNT(*) as count 
        FROM staff_assignments 
        WHERE staffId = @staffId AND date = @date
      `);
    
    const assignmentCount = assignmentCountResult.recordset[0].count;
    if (assignmentCount < minAssignments) {
      minAssignments = assignmentCount;
      selectedStaff = staff;
    }
  }
  
  // Create assignment for today
  const insertRequest = database.request();
  insertRequest.input('staffId', sql.Int, selectedStaff.id);
  insertRequest.input('patientId', sql.NVarChar, patientId);
  insertRequest.input('date', sql.Date, currentDate);
  
  try {
    const result = await insertRequest.query(`
      INSERT INTO staff_assignments (staffId, patientId, date)
      OUTPUT INSERTED.*
      VALUES (@staffId, @patientId, @date)
    `);
    
    console.log(`Auto-assigned staff ${selectedStaff.name} (ID: ${selectedStaff.id}) to patient ${patientId}`);
    return result.recordset[0] as StaffAssignment;
  } catch (error: any) {
    if (error.message.includes('UNIQUE KEY constraint')) {
      console.warn(`Patient ${patientId} already has staff assignment for ${currentDate}`);
      return null;
    }
    throw error;
  }
};