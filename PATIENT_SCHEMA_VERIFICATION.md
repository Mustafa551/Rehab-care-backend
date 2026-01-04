# Patient Schema Verification

## ✅ Database Schema (Updated)

The patients table is now created with comprehensive structure matching the frontend registration system:

```sql
CREATE TABLE patients (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  email NVARCHAR(255) UNIQUE NOT NULL,
  phone NVARCHAR(20) NOT NULL,
  dateOfBirth DATE NOT NULL,
  medicalCondition NVARCHAR(MAX) NOT NULL,
  assignedDoctorId INT NULL,
  status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged')),
  -- New comprehensive registration fields
  age INT NULL,
  gender NVARCHAR(10) NULL CHECK (gender IN ('male', 'female', 'other')),
  address NVARCHAR(MAX) NULL,
  emergencyContact NVARCHAR(255) NULL,
  diseases NVARCHAR(MAX) NULL, -- JSON string of disease IDs
  assignedNurses NVARCHAR(MAX) NULL, -- JSON string of nurse IDs
  initialDeposit DECIMAL(10,2) NULL,
  roomType NVARCHAR(20) NULL CHECK (roomType IN ('general', 'semi-private', 'private')),
  roomNumber INT NULL,
  admissionDate DATE NULL,
  -- Medical tracking fields
  currentMedications NVARCHAR(MAX) NULL, -- JSON string
  lastAssessmentDate DATE NULL,
  dischargeStatus NVARCHAR(20) NULL CHECK (dischargeStatus IN ('continue', 'ready', 'pending')),
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (assignedDoctorId) REFERENCES staff(id) ON DELETE SET NULL
)
```

## ✅ Frontend-Backend Alignment

### Personal Information
- ✅ **Name**: Required, 2-100 characters
- ✅ **Age**: Required, 1-120 years
- ✅ **Gender**: Required, male/female/other
- ✅ **Phone**: Required, Pakistani format (+92-XXX-XXXXXXX or 0XXX-XXXXXXX)
- ✅ **Address**: Required, 10-500 characters
- ✅ **Emergency Contact**: Required, 5-100 characters

### Medical Information
- ✅ **Diseases**: Required array, at least 1 disease
- ✅ **Medical Condition**: Generated from diseases
- ✅ **Assigned Doctor**: Required, must exist in staff table
- ✅ **Assigned Nurses**: Required array, exactly 2 nurses

### Financial & Accommodation
- ✅ **Initial Deposit**: Required, must be > 0
- ✅ **Room Type**: Optional, general/semi-private/private
- ✅ **Room Number**: Optional, auto-generated
- ✅ **Admission Date**: Optional, defaults to today

### Medical Tracking
- ✅ **Current Medications**: Optional array, JSON stored
- ✅ **Last Assessment Date**: Optional date
- ✅ **Discharge Status**: Optional, continue/ready/pending

### Validation Rules
- ✅ **Pakistani Phone Format**: Regex validation
- ✅ **Email Uniqueness**: Database constraint
- ✅ **Age Range**: 1-120 years
- ✅ **Nurse Assignment**: Exactly 2 nurses required
- ✅ **Disease Selection**: At least 1 disease required
- ✅ **Deposit Amount**: Must be positive number

## 🧪 Testing

Run the test script to verify everything works:

```bash
# Start the backend server first
npm run dev

# In another terminal, run the test
node test-patient-registration.js
```

## 📋 What to Test

1. **Comprehensive Registration**: All 6 steps from frontend
2. **Phone Validation**: Pakistani formats only
3. **Nurse Assignment**: Exactly 2 nurses required
4. **Disease Selection**: At least 1 disease required
5. **Deposit Validation**: Must be positive amount
6. **Age Validation**: 1-120 years range
7. **Database Constraints**: Gender, room type, discharge status

## 🚀 Next Steps

1. Delete the old patients table if it exists
2. Restart the backend server to create the new schema
3. Test patient registration from the frontend
4. Verify all validations work correctly

## 🔧 Troubleshooting

If you get "Invalid column name" errors:
1. The old table still exists
2. Delete the patients table manually: `DROP TABLE patients;`
3. Restart the server to recreate with new schema

## ✅ Changes Made

1. **Database Schema**: Updated to match frontend exactly
2. **Patient Interface**: Added all comprehensive registration fields
3. **Patient Model**: Handles all new fields with JSON storage for arrays
4. **Patient Controller**: Validates comprehensive registration data
5. **API Validation**: Enforces all frontend requirements
6. **Test Script**: Comprehensive testing of registration system

## 📊 Data Storage Strategy

### JSON Fields
- **diseases**: Array of disease IDs stored as JSON string
- **assignedNurses**: Array of nurse IDs stored as JSON string
- **currentMedications**: Array of medication names stored as JSON string

### Database Constraints
- **Gender**: male, female, other
- **Room Type**: general, semi-private, private
- **Status**: active, inactive, discharged
- **Discharge Status**: continue, ready, pending

### Foreign Keys
- **assignedDoctorId**: References staff(id) with ON DELETE SET NULL

## 🎯 Frontend Integration

The backend now perfectly matches the frontend's 6-step registration process:

1. **Step 1**: Personal Information (name, age, gender, phone, address, emergency contact)
2. **Step 2**: Disease Selection (diseases array)
3. **Step 3**: Doctor Selection (assignedDoctorId)
4. **Step 4**: Nurse Selection (assignedNurses array - exactly 2)
5. **Step 5**: Initial Deposit (initialDeposit amount)
6. **Step 6**: Room Assignment (roomType selection)

All validation rules, data types, and constraints match the frontend requirements exactly.