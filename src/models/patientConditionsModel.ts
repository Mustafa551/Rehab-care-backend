import { getDb } from '../config/db';
import { PatientCondition } from '../types/index.ds';
import sql from 'mssql';

// Helper function to parse JSON fields in patient condition data
const parsePatientConditionData = (rawCondition: any): PatientCondition => {
  return {
    ...rawCondition,
    medications: rawCondition.medications ? JSON.parse(rawCondition.medications) : [],
    vitals: rawCondition.vitals ? JSON.parse(rawCondition.vitals) : null,
  };
};

// Patient Conditions operations
export const getAllPatientConditions = async (): Promise<PatientCondition[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM patient_conditions ORDER BY updatedAt DESC');
  return result.recordset.map(parsePatientConditionData);
};

export const getPatientConditionsByPatient = async (patientId: number): Promise<PatientCondition[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  const result = await request.query('SELECT * FROM patient_conditions WHERE patientId = @patientId ORDER BY updatedAt DESC');
  return result.recordset.map(parsePatientConditionData);
};

export const getLatestPatientCondition = async (patientId: number): Promise<PatientCondition | null> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  const result = await request.query('SELECT TOP 1 * FROM patient_conditions WHERE patientId = @patientId ORDER BY updatedAt DESC');
  return result.recordset.length > 0 ? parsePatientConditionData(result.recordset[0]) : null;
};

export const createPatientCondition = async (conditionData: {
  patientId: number;
  assessedBy: string;
  date: string;
  condition: string;
  notes?: string;
  medications?: any[];
  vitals?: any;
  dischargeRecommendation?: 'continue' | 'discharge';
  dischargeNotes?: string;
}): Promise<PatientCondition> => {
  const database = getDb();
  const request = database.request();
  
  request.input('patientId', sql.Int, conditionData.patientId);
  request.input('assessedBy', sql.NVarChar, conditionData.assessedBy);
  request.input('date', sql.Date, new Date(conditionData.date));
  request.input('condition', sql.NVarChar, conditionData.condition);
  request.input('notes', sql.NVarChar, conditionData.notes || null);
  request.input('medications', sql.NVarChar, conditionData.medications ? JSON.stringify(conditionData.medications) : null);
  request.input('vitals', sql.NVarChar, conditionData.vitals ? JSON.stringify(conditionData.vitals) : null);
  request.input('dischargeRecommendation', sql.NVarChar, conditionData.dischargeRecommendation || 'continue');
  request.input('dischargeNotes', sql.NVarChar, conditionData.dischargeNotes || null);
  
  const result = await request.query(`
    INSERT INTO patient_conditions (
      patientId, assessedBy, date, condition, notes, medications, 
      vitals, dischargeRecommendation, dischargeNotes
    )
    OUTPUT INSERTED.id
    VALUES (
      @patientId, @assessedBy, @date, @condition, @notes, @medications,
      @vitals, @dischargeRecommendation, @dischargeNotes
    )
  `);

  const insertedId = result.recordset[0].id;
  const patientCondition = await getPatientConditionById(insertedId);
  if (!patientCondition) {
    throw new Error('Failed to retrieve created patient condition');
  }
  return patientCondition;
};

export const getPatientConditionById = async (id: number): Promise<PatientCondition | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM patient_conditions WHERE id = @id');
  return result.recordset.length > 0 ? parsePatientConditionData(result.recordset[0]) : null;
};

export const updatePatientCondition = async (
  id: number,
  conditionData: Partial<{
    date: string;
    condition: string;
    notes: string;
    medications: any[];
    vitals: any;
    dischargeRecommendation: 'continue' | 'discharge';
    dischargeNotes: string;
  }>
): Promise<PatientCondition | null> => {
  const database = getDb();
  const request = database.request();
  
  const updateFields: string[] = ['updatedAt = GETDATE()'];
  const params: any = { id };
  
  if (conditionData.date !== undefined) {
    updateFields.push('date = @date');
    params.date = new Date(conditionData.date);
  }
  if (conditionData.condition !== undefined) {
    updateFields.push('condition = @condition');
    params.condition = conditionData.condition;
  }
  if (conditionData.notes !== undefined) {
    updateFields.push('notes = @notes');
    params.notes = conditionData.notes;
  }
  if (conditionData.medications !== undefined) {
    updateFields.push('medications = @medications');
    params.medications = JSON.stringify(conditionData.medications);
  }
  if (conditionData.vitals !== undefined) {
    updateFields.push('vitals = @vitals');
    params.vitals = JSON.stringify(conditionData.vitals);
  }
  if (conditionData.dischargeRecommendation !== undefined) {
    updateFields.push('dischargeRecommendation = @dischargeRecommendation');
    params.dischargeRecommendation = conditionData.dischargeRecommendation;
  }
  if (conditionData.dischargeNotes !== undefined) {
    updateFields.push('dischargeNotes = @dischargeNotes');
    params.dischargeNotes = conditionData.dischargeNotes;
  }
  
  request.input('id', sql.Int, id);
  Object.keys(params).forEach(key => {
    if (key !== 'id') {
      if (key === 'date') {
        request.input(key, sql.Date, params[key]);
      } else {
        request.input(key, sql.NVarChar, params[key]);
      }
    }
  });
  
  await request.query(`
    UPDATE patient_conditions 
    SET ${updateFields.join(', ')}
    WHERE id = @id
  `);
  
  return getPatientConditionById(id);
};

export const deletePatientCondition = async (id: number): Promise<boolean> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('DELETE FROM patient_conditions WHERE id = @id');
  return result.rowsAffected[0] > 0;
};