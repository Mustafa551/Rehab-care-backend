# Staff API Integration Guide

## Overview
This guide documents the backend updates made to integrate with the frontend staff management system. The backend now supports the new staff creation flow with doctors and nurses only, including specializations and nurse types.

## Changes Made

### 1. Updated Types (`src/types/index.ds.ts`)
- **Staff interface updated**:
  - Restricted `role` to only `'nurse' | 'doctor'` (removed caretaker, therapist)
  - Added `specialization?: string` for doctors
  - Added `nurseType?: 'fresh' | 'bscn'` for nurses

### 2. Enhanced Validation (`src/utils/requestValidations.ts`)
- **New validation schemas added**:
  - `pakistaniPhoneSchema`: Validates Pakistani phone format (+92-300-1234567 or 0300-1234567)
  - `staffRoleSchema`: Validates role is either 'nurse' or 'doctor'
  - `doctorSpecializationSchema`: Validates doctor specializations
  - `nurseTypeSchema`: Validates nurse types ('fresh' or 'bscn')

### 3. Updated Staff Model (`src/models/staffModel.ts`)
- **createStaff function**:
  - Added `specialization` and `nurseType` parameters
  - Updated SQL INSERT to include new fields
  - Restricted role type to `'nurse' | 'doctor'`

- **updateStaff function**:
  - Added support for updating `specialization` and `nurseType`
  - Updated SQL UPDATE to handle new fields

- **getStaffByRole function**:
  - Updated type signature to only accept `'nurse' | 'doctor'`

### 4. Enhanced Staff Controller (`src/controllers/staffController.ts`)
- **createStaffHandler**:
  - Added validation for doctor specialization requirement
  - Automatically adds "Dr." prefix to doctor names
  - Handles role-specific field assignment
  - Sets default nurseType to 'fresh' for nurses

- **updateStaffHandler**:
  - Added validation for role-specific requirements
  - Handles specialization updates for doctors
  - Maintains "Dr." prefix for doctors

- **getAllStaffHandler**:
  - Updated role filtering to only support nurse/doctor

### 5. Updated API Validations (`src/middlewares/requestValidations/staffApiValidations.ts`)
- **createStaffValidation**:
  - Added validation for new fields (specialization, nurseType)
  - Implemented Pakistani phone number validation
  - Added role-specific validation logic
  - Enhanced field validation with proper constraints

- **updateStaffValidation**:
  - Added support for updating new fields
  - Maintained backward compatibility
  - Enhanced validation for role changes

### 6. Database Migration (`src/migrations/add_staff_specialization_fields.sql`)
- **New columns added**:
  - `specialization NVARCHAR(50) NULL`
  - `nurseType NVARCHAR(20) NULL`
- **Constraints added**:
  - Check constraint for valid specializations
  - Check constraint for valid nurse types
  - Updated role constraint to only allow nurse/doctor
- **Documentation added**:
  - Column descriptions for new fields

## Frontend Integration Points

### API Endpoints
All existing endpoints remain the same:
- `GET /api/staff` - Get all staff (supports role filtering)
- `POST /api/staff` - Create new staff member
- `GET /api/staff/:staffId` - Get staff by ID
- `PATCH /api/staff/:staffId` - Update staff member
- `DELETE /api/staff/:staffId` - Delete staff member

### Request/Response Format

#### Create Staff Request
```json
{
  "name": "John Smith",
  "role": "doctor",
  "email": "john.smith@rehabcare.com",
  "phone": "+92-300-1234567",
  "isOnDuty": true,
  "specialization": "cardiologist", // Required for doctors
  "nurseType": "fresh" // Optional for nurses, defaults to 'fresh'
}
```

#### Staff Response
```json
{
  "id": 1,
  "name": "Dr. John Smith",
  "role": "doctor",
  "email": "john.smith@rehabcare.com",
  "phone": "+92-300-1234567",
  "isOnDuty": true,
  "specialization": "cardiologist",
  "nurseType": null,
  "photoUrl": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Validation Rules

### Phone Number
- **Format**: Pakistani format required
- **Valid examples**: 
  - `+92-300-1234567`
  - `0300-1234567`
  - `+923001234567`
  - `03001234567`

### Doctor Specializations
- `cardiologist` - Treats: Heart Disease, Blood Pressure
- `endocrinologist` - Treats: Diabetes, Kidney Disease
- `pulmonologist` - Treats: Asthma, Fever
- `psychiatrist` - Treats: Depression, Anxiety
- `general` - Treats: Fever, Arthritis
- `oncologist` - Treats: Cancer
- `neurologist` - Treats: Stroke

### Nurse Types
- `fresh` - Fresh Nurse (General care and patient support)
- `bscn` - BScN Specialized Nurse (Advanced care and specialized procedures)

## Database Setup

### Required Migration
Run the migration script to update your database:
```sql
-- Execute the migration file
-- src/migrations/add_staff_specialization_fields.sql
```

### Verification Queries
```sql
-- Check if columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'staff' 
AND COLUMN_NAME IN ('specialization', 'nurseType');

-- Check constraints
SELECT CONSTRAINT_NAME, CHECK_CLAUSE 
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE CONSTRAINT_NAME LIKE '%staff%';
```

## Testing

### Test Cases
1. **Create Doctor**:
   - With valid specialization ✓
   - Without specialization (should fail) ✓
   - With invalid specialization (should fail) ✓

2. **Create Nurse**:
   - With nurseType 'fresh' ✓
   - With nurseType 'bscn' ✓
   - Without nurseType (defaults to 'fresh') ✓
   - With invalid nurseType (should fail) ✓

3. **Phone Validation**:
   - Valid Pakistani formats ✓
   - Invalid formats (should fail) ✓

4. **Role Validation**:
   - Only 'nurse' and 'doctor' allowed ✓
   - Old roles (caretaker, therapist) should fail ✓

### Sample API Calls

#### Create Doctor
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Khan",
    "role": "doctor",
    "email": "ahmed.khan@rehabcare.com",
    "phone": "+92-300-1234567",
    "specialization": "cardiologist",
    "isOnDuty": true
  }'
```

#### Create Nurse
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fatima Ali",
    "role": "nurse",
    "email": "fatima.ali@rehabcare.com",
    "phone": "0300-7654321",
    "nurseType": "bscn",
    "isOnDuty": true
  }'
```

## Error Handling

### Common Error Responses
- **400 Bad Request**: Validation errors, missing required fields
- **409 Conflict**: Email already exists
- **404 Not Found**: Staff member not found (for updates/deletes)
- **500 Internal Server Error**: Database or server errors

### Example Error Response
```json
{
  "error": true,
  "message": "Specialization is required for doctors",
  "details": [
    {
      "field": "specialization",
      "message": "This field is required for doctor role"
    }
  ]
}
```

## Next Steps

1. **Run Database Migration**: Execute the SQL migration script
2. **Test API Endpoints**: Verify all CRUD operations work correctly
3. **Update Frontend API Calls**: Ensure frontend sends correct data format
4. **Test Integration**: Verify frontend-backend communication
5. **Deploy Changes**: Deploy both frontend and backend updates

## Notes

- The backend is now fully compatible with the frontend AddStaffDialog
- All existing staff records will need to be updated if they have old roles
- Phone number validation is strict - ensure frontend matches the format
- Doctor names automatically get "Dr." prefix in the backend
- Nurse type defaults to 'fresh' if not specified