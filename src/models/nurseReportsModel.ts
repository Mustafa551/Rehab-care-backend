import { getDb } from '../config/db';
import { NurseReport } from '../types/index.ds';
import sql from 'mssql';

// Helper function to parse JSON fields in nurse report data
const parseNurseReportData = (rawReport: any): NurseReport => {
  return {
    ...rawReport,
    symptoms: rawReport.symptoms ? JSON.parse(rawReport.symptoms) : [],
  };
};

// Nurse Reports operations
export const getAllNurseReports = async (): Promise<NurseReport[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM nurse_reports ORDER BY date DESC, time DESC');
  return result.recordset.map(parseNurseReportData);
};

export const getNurseReportsByPatient = async (patientId: number): Promise<NurseReport[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  const result = await request.query('SELECT * FROM nurse_reports WHERE patientId = @patientId ORDER BY date DESC, time DESC');
  return result.recordset.map(parseNurseReportData);
};

export const getUnreviewedReportsByPatient = async (patientId: number): Promise<NurseReport[]> => {
  const database = getDb();
  const request = database.request();
  request.input('patientId', sql.Int, patientId);
  const result = await request.query('SELECT * FROM nurse_reports WHERE patientId = @patientId AND reviewedByDoctor = 0 ORDER BY date DESC, time DESC');
  return result.recordset.map(parseNurseReportData);
};

export const getAllUnreviewedReports = async (): Promise<NurseReport[]> => {
  const database = getDb();
  const result = await database.request().query('SELECT * FROM nurse_reports WHERE reviewedByDoctor = 0 ORDER BY urgency DESC, date DESC, time DESC');
  return result.recordset.map(parseNurseReportData);
};

export const createNurseReport = async (reportData: {
  patientId: number;
  reportedBy: string;
  date: string;
  time: string;
  conditionUpdate: string;
  symptoms?: string[];
  painLevel?: number;
  notes?: string;
  urgency: 'low' | 'medium' | 'high';
}): Promise<NurseReport> => {
  const database = getDb();
  const request = database.request();
  
  request.input('patientId', sql.Int, reportData.patientId);
  request.input('reportedBy', sql.NVarChar, reportData.reportedBy);
  request.input('date', sql.Date, new Date(reportData.date));
  request.input('time', sql.Time, reportData.time);
  request.input('conditionUpdate', sql.NVarChar, reportData.conditionUpdate);
  request.input('symptoms', sql.NVarChar, reportData.symptoms ? JSON.stringify(reportData.symptoms) : null);
  request.input('painLevel', sql.Int, reportData.painLevel || null);
  request.input('notes', sql.NVarChar, reportData.notes || null);
  request.input('urgency', sql.NVarChar, reportData.urgency);
  
  const result = await request.query(`
    INSERT INTO nurse_reports (
      patientId, reportedBy, date, time, conditionUpdate, symptoms, 
      painLevel, notes, urgency, reviewedByDoctor
    )
    OUTPUT INSERTED.id
    VALUES (
      @patientId, @reportedBy, @date, @time, @conditionUpdate, @symptoms,
      @painLevel, @notes, @urgency, 0
    )
  `);

  const insertedId = result.recordset[0].id;
  const nurseReport = await getNurseReportById(insertedId);
  if (!nurseReport) {
    throw new Error('Failed to retrieve created nurse report');
  }
  return nurseReport;
};

export const getNurseReportById = async (id: number): Promise<NurseReport | null> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('SELECT * FROM nurse_reports WHERE id = @id');
  return result.recordset.length > 0 ? parseNurseReportData(result.recordset[0]) : null;
};

export const updateNurseReport = async (
  id: number,
  reportData: Partial<{
    conditionUpdate: string;
    symptoms: string[];
    painLevel: number;
    notes: string;
    urgency: 'low' | 'medium' | 'high';
    reviewedByDoctor: boolean;
    doctorResponse: string;
  }>
): Promise<NurseReport | null> => {
  const database = getDb();
  const request = database.request();
  
  const updateFields: string[] = [];
  const params: any = { id };
  
  if (reportData.conditionUpdate !== undefined) {
    updateFields.push('conditionUpdate = @conditionUpdate');
    params.conditionUpdate = reportData.conditionUpdate;
  }
  if (reportData.symptoms !== undefined) {
    updateFields.push('symptoms = @symptoms');
    params.symptoms = JSON.stringify(reportData.symptoms);
  }
  if (reportData.painLevel !== undefined) {
    updateFields.push('painLevel = @painLevel');
    params.painLevel = reportData.painLevel;
  }
  if (reportData.notes !== undefined) {
    updateFields.push('notes = @notes');
    params.notes = reportData.notes;
  }
  if (reportData.urgency !== undefined) {
    updateFields.push('urgency = @urgency');
    params.urgency = reportData.urgency;
  }
  if (reportData.reviewedByDoctor !== undefined) {
    updateFields.push('reviewedByDoctor = @reviewedByDoctor');
    params.reviewedByDoctor = reportData.reviewedByDoctor;
  }
  if (reportData.doctorResponse !== undefined) {
    updateFields.push('doctorResponse = @doctorResponse');
    params.doctorResponse = reportData.doctorResponse;
  }
  
  if (updateFields.length === 0) {
    return getNurseReportById(id);
  }
  
  request.input('id', sql.Int, id);
  Object.keys(params).forEach(key => {
    if (key !== 'id') {
      if (key === 'painLevel') {
        request.input(key, sql.Int, params[key]);
      } else if (key === 'reviewedByDoctor') {
        request.input(key, sql.Bit, params[key]);
      } else {
        request.input(key, sql.NVarChar, params[key]);
      }
    }
  });
  
  await request.query(`
    UPDATE nurse_reports 
    SET ${updateFields.join(', ')}
    WHERE id = @id
  `);
  
  return getNurseReportById(id);
};

export const deleteNurseReport = async (id: number): Promise<boolean> => {
  const database = getDb();
  const request = database.request();
  request.input('id', sql.Int, id);
  const result = await request.query('DELETE FROM nurse_reports WHERE id = @id');
  return result.rowsAffected[0] > 0;
};