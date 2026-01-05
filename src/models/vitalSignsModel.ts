import { getDb } from '../config/db';
import { VitalSigns } from '../types/index.ds';
import sql from 'mssql';

// Vital Signs operations
export const getAllVitalSigns = async (): Promise<VitalSigns[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM vital_signs ORDER BY date DESC, time DESC');
  return result.recordset as VitalSigns[];
};

export const getVitalSignsByPatient = async (patientId: number): Promise<VitalSigns[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  const result = await request.query('SELECT * FROM vital_signs WHERE patientId = @patientId ORDER BY date DESC, time DESC');
  return result.recordset as VitalSigns[];
};

export const getVitalSignsByPatientAndDate = async (patientId: number, date: string): Promise<VitalSigns[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  request.input('date', sql.Date, new Date(date));
  const result = await request.query('SELECT * FROM vital_signs WHERE patientId = @patientId AND date = @date ORDER BY time DESC');
  return result.recordset as VitalSigns[];
};

export const createVitalSigns = async (vitalData: {
  patientId: number;
  date: string;
  time: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenSaturation?: string;
  respiratoryRate?: string;
  notes?: string;
  recordedBy: string;
}): Promise<VitalSigns> => {
  const database = getDb();
  const request = database.request();
  
  // Ensure time format is consistent (HH:MM)
  let timeValue = vitalData.time;
  if (timeValue && timeValue.length === 5) {
    // Time is already in HH:MM format, keep as is
  } else if (timeValue && timeValue.length === 8) {
    // Time is in HH:MM:SS format, truncate to HH:MM
    timeValue = timeValue.substring(0, 5);
  }
  
  request.input('patientId', sql.Int, vitalData.patientId);
  request.input('date', sql.Date, new Date(vitalData.date));
  request.input('time', sql.NVarChar(8), timeValue);
  request.input('bloodPressure', sql.NVarChar, vitalData.bloodPressure);
  request.input('heartRate', sql.NVarChar, vitalData.heartRate);
  request.input('temperature', sql.NVarChar, vitalData.temperature);
  request.input('oxygenSaturation', sql.NVarChar, vitalData.oxygenSaturation || null);
  request.input('respiratoryRate', sql.NVarChar, vitalData.respiratoryRate || null);
  request.input('notes', sql.NVarChar, vitalData.notes || null);
  request.input('recordedBy', sql.NVarChar, vitalData.recordedBy);
  
  const result = await request.query(`
    INSERT INTO vital_signs (
      patientId, date, time, bloodPressure, heartRate, temperature, 
      oxygenSaturation, respiratoryRate, notes, recordedBy
    )
    OUTPUT INSERTED.id
    VALUES (
      @patientId, @date, @time, @bloodPressure, @heartRate, @temperature,
      @oxygenSaturation, @respiratoryRate, @notes, @recordedBy
    )
  `);

  const insertedId = result.recordset[0].id;
  const vitalSigns = await getVitalSignsById(insertedId);
  if (!vitalSigns) {
    throw new Error('Failed to retrieve created vital signs');
  }
  return vitalSigns;
};

export const getVitalSignsById = async (id: number): Promise<VitalSigns | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM vital_signs WHERE id = @id');
  return result.recordset.length > 0 ? (result.recordset[0] as VitalSigns) : null;
};

export const updateVitalSigns = async (
  id: number,
  vitalData: Partial<{
    date: string;
    time: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    respiratoryRate: string;
    notes: string;
  }>
): Promise<VitalSigns | null> => {
  const database = getDb();
  const request = database.request();
  
  const updateFields: string[] = [];
  const params: any = { id };
  
  if (vitalData.date !== undefined) {
    updateFields.push('date = @date');
    params.date = new Date(vitalData.date);
  }
  if (vitalData.time !== undefined) {
    updateFields.push('time = @time');
    // Ensure time format is consistent (HH:MM)
    let timeValue = vitalData.time;
    if (timeValue && timeValue.length === 5) {
      // Time is already in HH:MM format, keep as is
    } else if (timeValue && timeValue.length === 8) {
      // Time is in HH:MM:SS format, truncate to HH:MM
      timeValue = timeValue.substring(0, 5);
    }
    params.time = timeValue;
  }
  if (vitalData.bloodPressure !== undefined) {
    updateFields.push('bloodPressure = @bloodPressure');
    params.bloodPressure = vitalData.bloodPressure;
  }
  if (vitalData.heartRate !== undefined) {
    updateFields.push('heartRate = @heartRate');
    params.heartRate = vitalData.heartRate;
  }
  if (vitalData.temperature !== undefined) {
    updateFields.push('temperature = @temperature');
    params.temperature = vitalData.temperature;
  }
  if (vitalData.oxygenSaturation !== undefined) {
    updateFields.push('oxygenSaturation = @oxygenSaturation');
    params.oxygenSaturation = vitalData.oxygenSaturation;
  }
  if (vitalData.respiratoryRate !== undefined) {
    updateFields.push('respiratoryRate = @respiratoryRate');
    params.respiratoryRate = vitalData.respiratoryRate;
  }
  if (vitalData.notes !== undefined) {
    updateFields.push('notes = @notes');
    params.notes = vitalData.notes;
  }
  
  if (updateFields.length === 0) {
    return getVitalSignsById(id);
  }
  
  request.input('id', sql.Int, id);
  Object.keys(params).forEach(key => {
    if (key !== 'id') {
      if (key === 'date') {
        request.input(key, sql.Date, params[key]);
      } else if (key === 'time') {
        request.input(key, sql.NVarChar(8), params[key]);
      } else {
        request.input(key, sql.NVarChar, params[key]);
      }
    }
  });
  
  await request.query(`
    UPDATE vital_signs 
    SET ${updateFields.join(', ')}
    WHERE id = @id
  `);
  
  return getVitalSignsById(id);
};

export const deleteVitalSigns = async (id: number): Promise<boolean> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('DELETE FROM vital_signs WHERE id = @id');
  return result.rowsAffected[0] > 0;
};