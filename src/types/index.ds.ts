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