# Diseases Parameter Fix

## ❌ Problem
The API was rejecting the `diseases` query parameter with error:
```
Invalid parameter diseases
```

This happened because the staff API validation middleware only allowed `role` and `onDuty` query parameters, but not `diseases`.

## ✅ Solution

### 1. Updated Staff API Validation
**File**: `src/middlewares/requestValidations/staffApiValidations.ts`

**Changes Made**:
- Added `diseases` to allowed query parameters
- Added validation for disease values
- Specified correct parameter location (`in: ['query']`)
- Fixed return statement to use `req.query` instead of `req.body`

### 2. Validation Rules Added
```typescript
const allowedFields: any = {
  role: 'role',
  onDuty: 'onDuty',
  diseases: 'diseases', // ✅ Added this
};
```

### 3. Disease Validation
```typescript
// Validate diseases if provided
if (req.query?.diseases) {
  const diseases = (req.query.diseases as string).split(',').map(d => d.trim());
  const validDiseases = [
    'fever', 'diabetes', 'blood-pressure', 'heart-disease', 'asthma', 
    'arthritis', 'depression', 'anxiety', 'stroke', 'cancer', 
    'kidney-disease', 'liver-disease'
  ];
  
  const invalidDiseases = diseases.filter(d => !validDiseases.includes(d));
  if (invalidDiseases.length > 0) {
    throw new Error(`Invalid diseases: ${invalidDiseases.join(', ')}`);
  }
}
```

### 4. Parameter Schema
```typescript
diseases: {
  in: ['query'],           // ✅ Specify location
  optional: true,
  isString: {
    errorMessage: 'Diseases must be a comma-separated string',
  },
} as ParamSchema,
```

## 🧪 Testing

### Valid API Calls
```bash
# Single disease
GET /api/staff?diseases=diabetes

# Multiple diseases
GET /api/staff?diseases=diabetes,blood-pressure

# Combined with role
GET /api/staff?role=doctor&diseases=heart-disease
```

### Invalid API Calls (Will be rejected)
```bash
# Invalid disease
GET /api/staff?diseases=invalid-disease

# Mixed valid/invalid
GET /api/staff?diseases=diabetes,invalid-disease
```

## 🚀 How to Test

1. **Restart the backend server** (important!)
2. **Run the test script**:
   ```bash
   node test-diseases-parameter.js
   ```

## ✅ Expected Results

After the fix:
- ✅ `GET /api/staff?diseases=diabetes,blood-pressure` works
- ✅ `GET /api/staff?role=nurse` still works  
- ✅ `GET /api/staff?role=doctor&diseases=heart-disease` works
- ❌ `GET /api/staff?diseases=invalid-disease` is rejected with helpful error

## 🔧 Root Cause

The issue was in the validation middleware configuration:
1. **Missing parameter**: `diseases` wasn't in the allowed fields list
2. **Wrong location**: Parameters weren't explicitly marked as query parameters
3. **Incorrect return**: Used `req.body` instead of `req.query` in validation

## 📋 Files Modified

1. `src/middlewares/requestValidations/staffApiValidations.ts`
   - Added `diseases` to allowed query parameters
   - Added disease validation logic
   - Fixed parameter location specifications
   - Fixed return statement

## 🎯 Impact

This fix enables the patient registration modal to:
- ✅ Load doctors based on selected diseases
- ✅ Show only relevant doctors for each disease combination
- ✅ Provide better user experience with filtered doctor selection