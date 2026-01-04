# Staff Schema Verification

## ✅ Database Schema (Updated)

The staff table is now created with the exact structure matching the frontend:

```sql
CREATE TABLE staff (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  role NVARCHAR(50) NOT NULL CHECK (role IN ('nurse', 'doctor')),
  email NVARCHAR(255) UNIQUE NOT NULL,
  phone NVARCHAR(20) NOT NULL,
  isOnDuty BIT DEFAULT 1,
  photoUrl NVARCHAR(MAX),
  specialization NVARCHAR(50) NULL CHECK (specialization IS NULL OR specialization IN ('cardiologist', 'endocrinologist', 'pulmonologist', 'psychiatrist', 'general', 'oncologist', 'neurologist')),
  nurseType NVARCHAR(20) NULL CHECK (nurseType IS NULL OR nurseType IN ('fresh', 'bscn')),
  createdAt DATETIME2 DEFAULT GETDATE(),
  updatedAt DATETIME2 DEFAULT GETDATE()
)
```

## ✅ Frontend-Backend Alignment

### Roles
- ✅ Only `nurse` and `doctor` allowed (removed caretaker, therapist)
- ✅ Database constraint enforces valid roles

### Doctor Fields
- ✅ `specialization` field with 7 valid options:
  - cardiologist, endocrinologist, pulmonologist, psychiatrist, general, oncologist, neurologist
- ✅ Required for doctors in validation
- ✅ Database constraint enforces valid specializations

### Nurse Fields
- ✅ `nurseType` field with 2 valid options:
  - fresh (Fresh Nurse)
  - bscn (BScN Specialized Nurse)
- ✅ Optional for nurses (defaults to 'fresh' in frontend)
- ✅ Database constraint enforces valid nurse types

### Phone Validation
- ✅ Pakistani format: `+92-300-1234567` or `0300-1234567`
- ✅ Regex validation in both frontend and backend

### API Validation
- ✅ Request validation middleware updated
- ✅ Controller logic handles role-specific fields
- ✅ Proper error messages for validation failures

## 🧪 Testing

Run the test script to verify everything works:

```bash
# Start the backend server first
npm run dev

# In another terminal, run the test
node test-staff-creation.js
```

## 📋 What to Test

1. **Doctor Creation**: Should require specialization
2. **Nurse Creation**: Should work with or without nurseType
3. **Phone Validation**: Should accept Pakistani formats only
4. **Role Validation**: Should reject invalid roles like 'caretaker'
5. **Database Constraints**: Should enforce valid specializations and nurse types

## 🚀 Next Steps

1. Delete the old staff table if it exists
2. Restart the backend server to create the new schema
3. Test staff creation from the frontend
4. Verify all validations work correctly

## 🔧 Troubleshooting

If you get "Invalid column name" errors:
1. The old table still exists
2. Delete the staff table manually: `DROP TABLE staff;`
3. Restart the server to recreate with new schema

## ✅ Changes Made

1. **Database Schema**: Updated to match frontend exactly
2. **Removed FCM Table**: As requested, no longer created
3. **Staff Model**: Removed temporary fallback code
4. **Validation**: Aligned with frontend requirements
5. **Controller**: Handles role-specific fields properly
6. **Test Script**: Created to verify functionality