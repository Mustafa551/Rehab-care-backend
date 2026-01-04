import { getDb } from '../config/db';
import { Medication, MedicationAdministration } from '../types/index.ds';
import sql from 'mssql';

// Medications operations
export const getAllMedications = async (): Promise<Medication[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM medications WHERE isActive = 1 ORDER BY createdAt DESC');
  return result.recordset as Medication[];
};

export const getMedicationsByPatient = async (patientId: number): Promise<Medication[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  const result = await request.query('SELECT * FROM medications WHERE patientId = @patientId AND isActive = 1 ORDER BY createdAt DESC');
  return result.recordset as Medication[];
};

export const createMedication = async (medicationData: {
  patientId: number;
  prescribedBy: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}): Promise<Medication> => {
  const database = getDb();
  const request = database.request();
  
  request.input('patientId', sql.Int, medicationData.patientId);
  request.input('prescribedBy', sql.NVarChar, medicationData.prescribedBy);
  request.input('medicationName', sql.NVarChar, medicationData.medicationName);
  request.input('dosage', sql.NVarChar, medicationData.dosage);
  request.input('frequency', sql.NVarChar, medicationData.frequency);
  request.input('startDate', sql.Date, new Date(medicationData.startDate));
  request.input('endDate', sql.Date, medicationData.endDate ? new Date(medicationData.endDate) : null);
  request.input('notes', sql.NVarChar, medicationData.notes || null);
  
  const result = await request.query(`
    INSERT INTO medications (
      patientId, prescribedBy, medicationName, dosage, frequency, 
      startDate, endDate, notes, isActive
    )
    OUTPUT INSERTED.id
    VALUES (
      @patientId, @prescribedBy, @medicationName, @dosage, @frequency,
      @startDate, @endDate, @notes, 1
    )
  `);

  const insertedId = result.recordset[0].id;
  const medication = await getMedicationById(insertedId);
  if (!medication) {
    throw new Error('Failed to retrieve created medication');
  }
  return medication;
};

export const getMedicationById = async (id: number): Promise<Medication | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM medications WHERE id = @id');
  return result.recordset.length > 0 ? (result.recordset[0] as Medication) : null;
};

export const updateMedication = async (
  id: number,
  medicationData: Partial<{
    medicationName: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string;
    notes: string;
    isActive: boolean;
  }>
): Promise<Medication | null> => {
  const database = getDb();
  const request = database.request();
  
  const updateFields: string[] = [];
  const params: any = { id };
  
  if (medicationData.medicationName !== undefined) {
    updateFields.push('medicationName = @medicationName');
    params.medicationName = medicationData.medicationName;
  }
  if (medicationData.dosage !== undefined) {
    updateFields.push('dosage = @dosage');
    params.dosage = medicationData.dosage;
  }
  if (medicationData.frequency !== undefined) {
    updateFields.push('frequency = @frequency');
    params.frequency = medicationData.frequency;
  }
  if (medicationData.startDate !== undefined) {
    updateFields.push('startDate = @startDate');
    params.startDate = new Date(medicationData.startDate);
  }
  if (medicationData.endDate !== undefined) {
    updateFields.push('endDate = @endDate');
    params.endDate = medicationData.endDate ? new Date(medicationData.endDate) : null;
  }
  if (medicationData.notes !== undefined) {
    updateFields.push('notes = @notes');
    params.notes = medicationData.notes;
  }
  if (medicationData.isActive !== undefined) {
    updateFields.push('isActive = @isActive');
    params.isActive = medicationData.isActive;
  }
  
  if (updateFields.length === 0) {
    return getMedicationById(id);
  }
  
  request.input('id', sql.Int, id);
  Object.keys(params).forEach(key => {
    if (key !== 'id') {
      if (key === 'startDate' || key === 'endDate') {
        request.input(key, sql.Date, params[key]);
      } else if (key === 'isActive') {
        request.input(key, sql.Bit, params[key]);
      } else {
        request.input(key, sql.NVarChar, params[key]);
      }
    }
  });
  
  await request.query(`
    UPDATE medications 
    SET ${updateFields.join(', ')}
    WHERE id = @id
  `);
  
  return getMedicationById(id);
};

export const deleteMedication = async (id: number): Promise<boolean> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  // Soft delete by setting isActive to false
  const result = await request.query('UPDATE medications SET isActive = 0 WHERE id = @id');
  return result.rowsAffected[0] > 0;
};

// Medication Administration operations
export const getMedicationAdministrationsByPatient = async (patientId: number, date?: string): Promise<MedicationAdministration[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  
  let query = `
    SELECT ma.*, m.medicationName, m.dosage, m.frequency
    FROM medication_administrations ma
    JOIN medications m ON ma.medicationId = m.id
    WHERE ma.patientId = @patientId
  `;
  
  if (date) {
    request.input('date', sql.Date, new Date(date));
    query += ' AND ma.date = @date';
  }
  
  query += ' ORDER BY ma.scheduledTime ASC';
  
  const result = await request.query(query);
  return result.recordset as MedicationAdministration[];
};

export const createMedicationAdministration = async (administrationData: {
  medicationId: number;
  patientId: number;
  scheduledTime: string;
  date: string;
  notes?: string;
}): Promise<MedicationAdministration> => {
  const database = getDb();
  const request = database.request();
  
  request.input('medicationId', sql.Int, administrationData.medicationId);
  request.input('patientId', sql.Int, administrationData.patientId);
  request.input('scheduledTime', sql.Time, administrationData.scheduledTime);
  request.input('date', sql.Date, new Date(administrationData.date));
  request.input('notes', sql.NVarChar, administrationData.notes || null);
  
  const result = await request.query(`
    INSERT INTO medication_administrations (
      medicationId, patientId, scheduledTime, date, administered, notes
    )
    OUTPUT INSERTED.id
    VALUES (
      @medicationId, @patientId, @scheduledTime, @date, 0, @notes
    )
  `);

  const insertedId = result.recordset[0].id;
  const administration = await getMedicationAdministrationById(insertedId);
  if (!administration) {
    throw new Error('Failed to retrieve created medication administration');
  }
  return administration;
};

export const getMedicationAdministrationById = async (id: number): Promise<MedicationAdministration | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query(`
    SELECT ma.*, m.medicationName, m.dosage, m.frequency
    FROM medication_administrations ma
    JOIN medications m ON ma.medicationId = m.id
    WHERE ma.id = @id
  `);
  return result.recordset.length > 0 ? (result.recordset[0] as MedicationAdministration) : null;
};

export const updateMedicationAdministration = async (
  id: number,
  administrationData: Partial<{
    administered: boolean;
    administeredTime: string;
    administeredBy: string;
    notes: string;
  }>
): Promise<MedicationAdministration | null> => {
  const database = getDb();
  const request = database.request();
  
  const updateFields: string[] = [];
  const params: any = { id };
  
  if (administrationData.administered !== undefined) {
    updateFields.push('administered = @administered');
    params.administered = administrationData.administered;
  }
  if (administrationData.administeredTime !== undefined) {
    updateFields.push('administeredTime = @administeredTime');
    params.administeredTime = administrationData.administeredTime;
  }
  if (administrationData.administeredBy !== undefined) {
    updateFields.push('administeredBy = @administeredBy');
    params.administeredBy = administrationData.administeredBy;
  }
  if (administrationData.notes !== undefined) {
    updateFields.push('notes = @notes');
    params.notes = administrationData.notes;
  }
  
  if (updateFields.length === 0) {
    return getMedicationAdministrationById(id);
  }
  
  request.input('id', sql.Int, id);
  Object.keys(params).forEach(key => {
    if (key !== 'id') {
      if (key === 'administered') {
        request.input(key, sql.Bit, params[key]);
      } else if (key === 'administeredTime') {
        request.input(key, sql.Time, params[key]);
      } else {
        request.input(key, sql.NVarChar, params[key]);
      }
    }
  });
  
  await request.query(`
    UPDATE medication_administrations 
    SET ${updateFields.join(', ')}
    WHERE id = @id
  `);
  
  return getMedicationAdministrationById(id);
};

export const deleteMedicationAdministration = async (id: number): Promise<boolean> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('DELETE FROM medication_administrations WHERE id = @id');
  return result.rowsAffected[0] > 0;
};