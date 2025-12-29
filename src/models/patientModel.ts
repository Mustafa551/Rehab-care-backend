import { getDb } from '../config/db';
import { Patient } from '../types/index.ds';
import sql from 'mssql';

// Patient operations
export const getAllPatients = async (): Promise<Patient[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM patients ORDER BY createdAt DESC');
  return result.recordset as Patient[];
};

export const getPatientById = async (id: number): Promise<Patient | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM patients WHERE id = @id');
  return result.recordset.length > 0 ? (result.recordset[0] as Patient) : null;
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
  
  const result = await request.query(`
    INSERT INTO patients (name, email, phone, dateOfBirth, medicalCondition, assignedDoctorId, status)
    OUTPUT INSERTED.id
    VALUES (@name, @email, @phone, @dateOfBirth, @medicalCondition, @assignedDoctorId, @status)
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