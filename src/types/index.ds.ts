export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface FcmToken {
  id: number;
  userId: number;
  deviceId: string;
  fcmToken: string;
  platform?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: number;
  name: string;
  role: 'nurse' | 'doctor'; // Updated to only allow nurse and doctor
  email: string;
  phone: string;
  isOnDuty: boolean;
  photoUrl?: string;
  // New fields for frontend compatibility
  specialization?: string; // For doctors
  nurseType?: 'fresh' | 'bscn'; // For nurses
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalCondition: string;
  assignedDoctorId?: number;
  status: 'active' | 'inactive' | 'discharged';
  createdAt: string;
  updatedAt: string;
  // New comprehensive registration fields
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: string;
  diseases?: string[]; // Array of disease IDs (parsed from JSON)
  assignedNurses?: string[]; // Array of nurse IDs (parsed from JSON)
  initialDeposit?: number;
  roomType?: 'general' | 'semi-private' | 'private';
  roomNumber?: number;
  admissionDate?: string;
  // Medical tracking fields
  currentMedications?: string[]; // Array of medications (parsed from JSON)
  lastAssessmentDate?: string;
  dischargeStatus?: 'continue' | 'ready' | 'pending';
  // Discharge-specific fields
  dischargeNotes?: string;
  finalBillAmount?: number;
  dischargeDate?: string;
  dischargedBy?: string;
}

export interface VitalSigns {
  id: number;
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
  createdAt: string;
}

export interface NurseReport {
  id: number;
  patientId: number;
  reportedBy: string;
  date: string;
  time: string;
  conditionUpdate: string;
  symptoms: string[]; // Array of symptoms (parsed from JSON)
  painLevel?: number;
  notes?: string;
  urgency: 'low' | 'medium' | 'high';
  reviewedByDoctor: boolean;
  doctorResponse?: string;
  createdAt: string;
}

export interface PatientCondition {
  id: number;
  patientId: number;
  assessedBy: string;
  date: string;
  condition: string;
  notes?: string;
  medications: any[]; // Array of medications (parsed from JSON)
  vitals?: any; // Vital signs object (parsed from JSON)
  dischargeRecommendation: 'continue' | 'discharge';
  dischargeNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: number;
  patientId: number;
  prescribedBy: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MedicationAdministration {
  id: number;
  medicationId: number;
  patientId: number;
  scheduledTime: string;
  administeredTime?: string;
  administered: boolean;
  administeredBy?: string;
  notes?: string;
  date: string;
  createdAt: string;
  // Joined fields from medication
  medicationName?: string;
  dosage?: string;
  frequency?: string;
}

export interface TextValidationSchema {
  in: string[];
  exists?: { options: { checkNull: boolean; checkFalsy: boolean } } | null;
  optional?: { options: { nullable: boolean } } | null;
  errorMessage: string;
  isString: {
    errorMessage: string;
    bail?: boolean;
  };
  notEmpty: {
    options: { ignore_whitespace: boolean };
    errorMessage: string;
    bail?: boolean;
  };
  trim?: boolean;
}