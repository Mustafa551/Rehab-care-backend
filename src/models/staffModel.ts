import { getDb } from '../config/db';
import { Staff } from '../types/index.ds';
import sql from 'mssql';

// Staff operations
export const getAllStaff = async (): Promise<Staff[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM staff ORDER BY createdAt DESC');
  return result.recordset as Staff[];
};

export const getStaffById = async (id: number): Promise<Staff | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM staff WHERE id = @id');
  return result.recordset.length > 0 ? (result.recordset[0] as Staff) : null;
};

export const getStaffByEmail = async (email: string): Promise<Staff | null> => {
  const database = getDb();
  const request = database.request();
  request.input('email', sql.NVarChar, email.toLowerCase());
  const result = await request.query('SELECT * FROM staff WHERE LOWER(email) = @email');
  return result.recordset.length > 0 ? (result.recordset[0] as Staff) : null;
};

export const createStaff = async (staffData: {
  name: string;
  role: 'nurse' | 'doctor';
  email: string;
  phone: string;
  isOnDuty?: boolean;
  photoUrl?: string;
  specialization?: string;
  nurseType?: 'fresh' | 'bscn';
}): Promise<Staff> => {
  const database = getDb();
  const request = database.request();
  
  request.input('name', sql.NVarChar, staffData.name);
  request.input('role', sql.NVarChar, staffData.role);
  request.input('email', sql.NVarChar, staffData.email.toLowerCase());
  request.input('phone', sql.NVarChar, staffData.phone);
  request.input('isOnDuty', sql.Bit, staffData.isOnDuty ?? true);
  request.input('photoUrl', sql.NVarChar, staffData.photoUrl || null);
  request.input('specialization', sql.NVarChar, staffData.specialization || null);
  request.input('nurseType', sql.NVarChar, staffData.nurseType || null);
  
  const result = await request.query(`
    INSERT INTO staff (name, role, email, phone, isOnDuty, photoUrl, specialization, nurseType)
    OUTPUT INSERTED.id
    VALUES (@name, @role, @email, @phone, @isOnDuty, @photoUrl, @specialization, @nurseType)
  `);

  const insertedId = result.recordset[0].id;
  const staff = await getStaffById(insertedId);
  if (!staff) {
    throw new Error('Failed to retrieve created staff member');
  }
  return staff;
};

export const updateStaff = async (
  id: number,
  updateData: {
    name?: string;
    role?: 'nurse' | 'doctor';
    email?: string;
    phone?: string;
    isOnDuty?: boolean;
    photoUrl?: string;
    specialization?: string;
    nurseType?: 'fresh' | 'bscn';
  }
): Promise<Staff | null> => {
  const database = getDb();
  const fields: string[] = [];
  const request = database.request();

  if (updateData.name !== undefined) {
    fields.push('name = @name');
    request.input('name', sql.NVarChar, updateData.name);
  }
  if (updateData.role !== undefined) {
    fields.push('role = @role');
    request.input('role', sql.NVarChar, updateData.role);
  }
  if (updateData.email !== undefined) {
    fields.push('email = @email');
    request.input('email', sql.NVarChar, updateData.email.toLowerCase());
  }
  if (updateData.phone !== undefined) {
    fields.push('phone = @phone');
    request.input('phone', sql.NVarChar, updateData.phone);
  }
  if (updateData.isOnDuty !== undefined) {
    fields.push('isOnDuty = @isOnDuty');
    request.input('isOnDuty', sql.Bit, updateData.isOnDuty);
  }
  if (updateData.photoUrl !== undefined) {
    fields.push('photoUrl = @photoUrl');
    request.input('photoUrl', sql.NVarChar, updateData.photoUrl);
  }
  if (updateData.specialization !== undefined) {
    fields.push('specialization = @specialization');
    request.input('specialization', sql.NVarChar, updateData.specialization);
  }
  if (updateData.nurseType !== undefined) {
    fields.push('nurseType = @nurseType');
    request.input('nurseType', sql.NVarChar, updateData.nurseType);
  }

  if (fields.length === 0) {
    return getStaffById(id);
  }

  request.input('id', sql.Int, id);
  const query = `UPDATE staff SET ${fields.join(', ')}, updatedAt = GETDATE() WHERE id = @id`;
  await request.query(query);

  return getStaffById(id);
};

export const deleteStaff = async (id: number): Promise<void> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  await request.query('DELETE FROM staff WHERE id = @id');
};

export const getStaffByRole = async (role: 'nurse' | 'doctor'): Promise<Staff[]> => {
  const database = getDb();
  const request = database.request();
  request.input('role', sql.NVarChar, role);
  const result = await request.query('SELECT * FROM staff WHERE role = @role ORDER BY name');
  return result.recordset as Staff[];
};

export const getDoctorsBySpecialization = async (specializations: string[]): Promise<Staff[]> => {
  const database = getDb();
  const request = database.request();
  
  // Create placeholders for specializations
  const placeholders = specializations.map((_, index) => `@spec${index}`).join(', ');
  
  // Add parameters for each specialization
  specializations.forEach((spec, index) => {
    request.input(`spec${index}`, sql.NVarChar, spec);
  });
  
  const result = await request.query(`
    SELECT * FROM staff 
    WHERE role = 'doctor' 
    AND specialization IN (${placeholders})
    ORDER BY name
  `);
  
  return result.recordset as Staff[];
};

export const getDoctorsByDiseases = async (diseases: string[]): Promise<Staff[]> => {
  
  // Map diseases to doctor specializations
  const diseaseToSpecialization: Record<string, string[]> = {
    'heart-disease': ['cardiologist'],
    'blood-pressure': ['cardiologist'],
    'diabetes': ['endocrinologist'],
    'kidney-disease': ['endocrinologist'],
    'asthma': ['pulmonologist'],
    'fever': ['pulmonologist', 'general'],
    'depression': ['psychiatrist'],
    'anxiety': ['psychiatrist'],
    'stroke': ['neurologist'],
    'cancer': ['oncologist'],
    'arthritis': ['general'],
    'liver-disease': ['general']
  };
  
  // Get all relevant specializations for the diseases
  const relevantSpecializations = new Set<string>();
  diseases.forEach(disease => {
    const specs = diseaseToSpecialization[disease] || ['general'];
    specs.forEach(spec => relevantSpecializations.add(spec));
  });
  
  const specializationsArray = Array.from(relevantSpecializations);
  
  if (specializationsArray.length === 0) {
    return [];
  }
  
  return await getDoctorsBySpecialization(specializationsArray);
};

export const getOnDutyStaff = async (): Promise<Staff[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM staff WHERE isOnDuty = 1 ORDER BY name');
  return result.recordset as Staff[];
};