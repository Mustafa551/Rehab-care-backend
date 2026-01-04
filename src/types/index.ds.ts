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
  diseases?: string; // JSON string of disease IDs
  assignedNurses?: string; // JSON string of nurse IDs
  initialDeposit?: number;
  roomType?: 'general' | 'semi-private' | 'private';
  roomNumber?: number;
  admissionDate?: string;
  // Medical tracking fields
  currentMedications?: string; // JSON string
  lastAssessmentDate?: string;
  dischargeStatus?: 'continue' | 'ready' | 'pending';
}

export interface Assignment {
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