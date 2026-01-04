import { getDb } from '../config/db';
import { Patient } from '../types/index.ds';
import sql from 'mssql';

// Helper function to parse JSON fields in patient data
const parsePatientData = (rawPatient: any): Patient => {
  return {
    ...rawPatient,
    diseases: rawPatient.diseases ? JSON.parse(rawPatient.diseases) : [],
    assignedNurses: rawPatient.assignedNurses ? JSON.parse(rawPatient.assignedNurses) : [],
    currentMedications: rawPatient.currentMedications ? JSON.parse(rawPatient.currentMedications) : [],
  };
};

// Patient operations
export const getAllPatients = async (): Promise<Patient[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM patients ORDER BY createdAt DESC');
  return result.recordset.map(parsePatientData);
};

export const getPatientById = async (id: number): Promise<Patient | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM patients WHERE id = @id');
  return result.recordset.length > 0 ? parsePatientData(result.recordset[0]) : null;
};

export const getPatientByEmail = async (email: string): Promise<Patient | null> => {
  const database = getDb();
  const request = database.request();
  request.input('email', sql.NVarChar, email.toLowerCase());
  const result = await request.query('SELECT * FROM patients WHERE LOWER(email) = @email');
  return result.recordset.length > 0 ? (result.recordset[0] as Patient) : null;
};

export const createPatient = async (patientData: {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalCondition: string;
  assignedDoctorId?: number;
  status?: 'active' | 'inactive' | 'discharged';
  // New comprehensive registration fields
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
  diseases?: string[]; // Array of disease IDs
  assignedNurses?: string[]; // Array of nurse IDs
  initialDeposit?: number;
  roomType?: 'general' | 'semi-private' | 'private';
  roomNumber?: number;
  admissionDate?: string;
  // Medical tracking fields
  currentMedications?: string[];
  lastAssessmentDate?: string;
  dischargeStatus?: 'continue' | 'ready' | 'pending';
}): Promise<Patient> => {
  const database = getDb();
  const request = database.request();
  
  request.input('name', sql.NVarChar, patientData.name);
  request.input('email', sql.NVarChar, patientData.email.toLowerCase());
  request.input('phone', sql.NVarChar, patientData.phone);
  request.input('dateOfBirth', sql.Date, new Date(patientData.dateOfBirth));
  request.input('medicalCondition', sql.NVarChar, patientData.medicalCondition);
  request.input('assignedDoctorId', sql.Int, patientData.assignedDoctorId || null);
  request.input('status', sql.NVarChar, patientData.status || 'active');
  
  // New comprehensive fields
  request.input('age', sql.Int, patientData.age || null);
  request.input('gender', sql.NVarChar, patientData.gender || null);
  request.input('address', sql.NVarChar, patientData.address || null);
  request.input('emergencyContact', sql.NVarChar, patientData.emergencyContact || null);
  request.input('diseases', sql.NVarChar, patientData.diseases ? JSON.stringify(patientData.diseases) : null);
  request.input('assignedNurses', sql.NVarChar, patientData.assignedNurses ? JSON.stringify(patientData.assignedNurses) : null);
  request.input('initialDeposit', sql.Decimal(10, 2), patientData.initialDeposit || null);
  request.input('roomType', sql.NVarChar, patientData.roomType || null);
  request.input('roomNumber', sql.Int, patientData.roomNumber || null);
  request.input('admissionDate', sql.Date, patientData.admissionDate ? new Date(patientData.admissionDate) : null);
  request.input('currentMedications', sql.NVarChar, patientData.currentMedications ? JSON.stringify(patientData.currentMedications) : null);
  request.input('lastAssessmentDate', sql.Date, patientData.lastAssessmentDate ? new Date(patientData.lastAssessmentDate) : null);
  request.input('dischargeStatus', sql.NVarChar, patientData.dischargeStatus || null);
  
  const result = await request.query(`
    INSERT INTO patients (
      name, email, phone, dateOfBirth, medicalCondition, assignedDoctorId, status,
      age, gender, address, emergencyContact, diseases, assignedNurses, 
      initialDeposit, roomType, roomNumber, admissionDate, 
      currentMedications, lastAssessmentDate, dischargeStatus
    )
    OUTPUT INSERTED.id
    VALUES (
      @name, @email, @phone, @dateOfBirth, @medicalCondition, @assignedDoctorId, @status,
      @age, @gender, @address, @emergencyContact, @diseases, @assignedNurses,
      @initialDeposit, @roomType, @roomNumber, @admissionDate,
      @currentMedications, @lastAssessmentDate, @dischargeStatus
    )
  `);

  const insertedId = result.recordset[0].id;
  const patient = await getPatientById(insertedId);
  if (!patient) {
    throw new Error('Failed to retrieve created patient');
  }
  return patient;
};

export const updatePatient = async (
  id: number,
  updateData: {
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    medicalCondition?: string;
    assignedDoctorId?: number;
    status?: 'active' | 'inactive' | 'discharged';
    // New comprehensive registration fields
    age?: number;
    gender?: 'male' | 'female' | 'other';
    address?: string;
    emergencyContact?: string;
    diseases?: string[]; // Array of disease IDs
    assignedNurses?: string[]; // Array of nurse IDs
    initialDeposit?: number;
    roomType?: 'general' | 'semi-private' | 'private';
    roomNumber?: number;
    admissionDate?: string;
    // Medical tracking fields
    currentMedications?: string[];
    lastAssessmentDate?: string;
    dischargeStatus?: 'continue' | 'ready' | 'pending';
    // Discharge-specific fields
    dischargeNotes?: string;
    finalBillAmount?: number;
    dischargeDate?: string;
    dischargedBy?: string;
  }
): Promise<Patient | null> => {
  const database = getDb();
  const fields: string[] = [];
  const request = database.request();

  if (updateData.name !== undefined) {
    fields.push('name = @name');
    request.input('name', sql.NVarChar, updateData.name);
  }
  if (updateData.email !== undefined) {
    fields.push('email = @email');
    request.input('email', sql.NVarChar, updateData.email.toLowerCase());
  }
  if (updateData.phone !== undefined) {
    fields.push('phone = @phone');
    request.input('phone', sql.NVarChar, updateData.phone);
  }
  if (updateData.dateOfBirth !== undefined) {
    fields.push('dateOfBirth = @dateOfBirth');
    request.input('dateOfBirth', sql.Date, new Date(updateData.dateOfBirth));
  }
  if (updateData.medicalCondition !== undefined) {
    fields.push('medicalCondition = @medicalCondition');
    request.input('medicalCondition', sql.NVarChar, updateData.medicalCondition);
  }
  if (updateData.assignedDoctorId !== undefined) {
    fields.push('assignedDoctorId = @assignedDoctorId');
    request.input('assignedDoctorId', sql.Int, updateData.assignedDoctorId);
  }
  if (updateData.status !== undefined) {
    fields.push('status = @status');
    request.input('status', sql.NVarChar, updateData.status);
  }
  
  // New comprehensive fields
  if (updateData.age !== undefined) {
    fields.push('age = @age');
    request.input('age', sql.Int, updateData.age);
  }
  if (updateData.gender !== undefined) {
    fields.push('gender = @gender');
    request.input('gender', sql.NVarChar, updateData.gender);
  }
  if (updateData.address !== undefined) {
    fields.push('address = @address');
    request.input('address', sql.NVarChar, updateData.address);
  }
  if (updateData.emergencyContact !== undefined) {
    fields.push('emergencyContact = @emergencyContact');
    request.input('emergencyContact', sql.NVarChar, updateData.emergencyContact);
  }
  if (updateData.diseases !== undefined) {
    fields.push('diseases = @diseases');
    request.input('diseases', sql.NVarChar, JSON.stringify(updateData.diseases));
  }
  if (updateData.assignedNurses !== undefined) {
    fields.push('assignedNurses = @assignedNurses');
    request.input('assignedNurses', sql.NVarChar, JSON.stringify(updateData.assignedNurses));
  }
  if (updateData.initialDeposit !== undefined) {
    fields.push('initialDeposit = @initialDeposit');
    request.input('initialDeposit', sql.Decimal(10, 2), updateData.initialDeposit);
  }
  if (updateData.roomType !== undefined) {
    fields.push('roomType = @roomType');
    request.input('roomType', sql.NVarChar, updateData.roomType);
  }
  if (updateData.roomNumber !== undefined) {
    fields.push('roomNumber = @roomNumber');
    request.input('roomNumber', sql.Int, updateData.roomNumber);
  }
  if (updateData.admissionDate !== undefined) {
    fields.push('admissionDate = @admissionDate');
    request.input('admissionDate', sql.Date, new Date(updateData.admissionDate));
  }
  if (updateData.currentMedications !== undefined) {
    fields.push('currentMedications = @currentMedications');
    request.input('currentMedications', sql.NVarChar, JSON.stringify(updateData.currentMedications));
  }
  if (updateData.lastAssessmentDate !== undefined) {
    fields.push('lastAssessmentDate = @lastAssessmentDate');
    request.input('lastAssessmentDate', sql.Date, new Date(updateData.lastAssessmentDate));
  }
  if (updateData.dischargeStatus !== undefined) {
    fields.push('dischargeStatus = @dischargeStatus');
    request.input('dischargeStatus', sql.NVarChar, updateData.dischargeStatus);
  }
  
  // Discharge-specific fields
  if (updateData.dischargeNotes !== undefined) {
    fields.push('dischargeNotes = @dischargeNotes');
    request.input('dischargeNotes', sql.NVarChar, updateData.dischargeNotes);
  }
  if (updateData.finalBillAmount !== undefined) {
    fields.push('finalBillAmount = @finalBillAmount');
    request.input('finalBillAmount', sql.Decimal(10, 2), updateData.finalBillAmount);
  }
  if (updateData.dischargeDate !== undefined) {
    fields.push('dischargeDate = @dischargeDate');
    request.input('dischargeDate', sql.Date, new Date(updateData.dischargeDate));
  }
  if (updateData.dischargedBy !== undefined) {
    fields.push('dischargedBy = @dischargedBy');
    request.input('dischargedBy', sql.NVarChar, updateData.dischargedBy);
  }

  if (fields.length === 0) {
    return await getPatientById(id);
  }

  fields.push('updatedAt = GETDATE()');
  request.input('id', sql.Int, id);

  await request.query(`
    UPDATE patients 
    SET ${fields.join(', ')} 
    WHERE id = @id
  `);

  return await getPatientById(id);
};

export const deletePatient = async (id: number): Promise<boolean> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  
  const result = await request.query('DELETE FROM patients WHERE id = @id');
  return result.rowsAffected[0] > 0;
};

export const getPatientsByStatus = async (status: 'active' | 'inactive' | 'discharged'): Promise<Patient[]> => {
  const database = getDb();
  const request = database.request();
  request.input('status', sql.NVarChar, status);
  const result = await request.query('SELECT * FROM patients WHERE status = @status ORDER BY createdAt DESC');
  return result.recordset as Patient[];
};

export const getPatientsByDoctor = async (doctorId: number): Promise<Patient[]> => {
  const database = getDb();
  const request = database.request();
  request.input('doctorId', sql.Int, doctorId);
  const result = await request.query('SELECT * FROM patients WHERE assignedDoctorId = @doctorId ORDER BY createdAt DESC');
  return result.recordset as Patient[];
};