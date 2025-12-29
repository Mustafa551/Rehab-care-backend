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
  role: 'nurse' | 'caretaker' | 'therapist' | 'doctor';
  email: string;
  phone: string;
  isOnDuty: boolean;
  photoUrl?: string;
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