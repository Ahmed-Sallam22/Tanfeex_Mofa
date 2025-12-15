# Workflow API Implementation Summary

## Overview
Successfully integrated bulk create and bulk update endpoints for validation workflow steps in the AssumptionBuilder component.

## API Endpoints Implemented

### 1. Bulk Create Steps
**Endpoint:** `/api/validations/steps/bulk_create/`  
**Method:** `POST`

**Request Body:**
```json
{
  "workflow_id": 2,
  "steps": [
    {
      "name": "Route by Amount",
      "description": "Route to different paths based on amount",
      "order": 1,
      "left_expression": "datasource:amount",
      "operation": ">",
      "right_expression": "50000",
      "if_true_action": "proceed_to_step_by_id",
      "if_true_action_data": {
        "next_step_id": 10,
        "note": "High-value approval path"
      },
      "if_false_action": "proceed_to_step_by_id",
      "if_false_action_data": {
        "next_step_id": 15,
        "note": "Standard approval path"
      },
      "failure_message": "Amount routing failed",
      "is_active": true
    }
  ]
}
```

### 2. Bulk Update Steps
**Endpoint:** `/api/validations/steps/bulk_update/`  
**Method:** `PUT`

**Request Body:**
```json
{
  "updates": [
    {
      "step_id": 10,
      "name": "Updated Budget Check",
      "description": "Modified to check 150,000 threshold",
      "right_expression": "150000",
      "failure_message": "Budget must be at least 150,000 (updated requirement)"
    }
  ]
}
```

## Files Modified

### 1. `/src/api/validationWorkflow.api.ts`
- Added `ValidationStep` interface
- Added `BulkCreateStepsRequest` and `BulkCreateStepsResponse` types
- Added `BulkUpdateStepsRequest` and `BulkUpdateStepsResponse` types
- Added `bulkCreateSteps` mutation endpoint
- Added `bulkUpdateSteps` mutation endpoint
- Exported `useBulkCreateStepsMutation` and `useBulkUpdateStepsMutation` hooks

### 2. `/src/pages/dashboard/AssumptionBuilder/index.tsx`
- Added imports for `toast` and API mutation hooks
- Added `bulkCreateSteps` and `bulkUpdateSteps` mutation hooks
- Updated `workflowData` state to include optional `workflowId`
- Modified `buildWorkflowJSON` function to:
  - Map nodes to validation steps format
  - Handle edge connections for `if_true_action` and `if_false_action`
  - Detect whether to create new steps or update existing ones
  - Make API calls to bulk create or bulk update
  - Update nodes with returned step IDs after creation
  - Show toast notifications for success/error
- Pass `isSaving` state to PropertiesSidebar component

### 3. `/src/pages/dashboard/AssumptionBuilder/components/types.ts`
- Added `workflowId?: number` field to `WorkflowData` interface

### 4. `/src/pages/dashboard/AssumptionBuilder/components/PropertiesSidebar.tsx`
- Added `isSaving?: boolean` prop to interface
- Pass `isSaving` prop to `WorkflowSettingsForm`

### 5. `/src/pages/dashboard/AssumptionBuilder/components/WorkflowSettingsForm.tsx`
- Added `isSaving?: boolean` prop to interface
- Updated Save button to:
  - Show loading spinner when saving
  - Disable button during save operation
  - Display "Saving..." text when in progress

## How It Works

### Creating New Steps
1. User builds a workflow in the visual builder
2. When clicking "Save Workflow", the system checks if nodes have existing IDs
3. If no IDs exist, it calls `bulkCreateSteps` with all nodes mapped to steps
4. The API returns created steps with IDs
5. The component updates node data with the returned IDs for future updates

### Updating Existing Steps
1. User modifies a workflow that has existing steps (with IDs)
2. When clicking "Save Workflow", the system detects existing IDs
3. It calls `bulkUpdateSteps` with only the changed fields
4. The API updates the steps and returns the updated data
5. Success toast is shown to the user

### Action Routing Logic
- The system analyzes edge connections between nodes
- For "true" path connections: Sets `if_true_action: "proceed_to_step_by_id"` with target step ID
- For "false" path connections: Sets `if_false_action: "proceed_to_step_by_id"` with target step ID
- If no connection exists: Defaults to `complete_success` or `complete_failure`

## Features

✅ Bulk create multiple validation steps in one API call  
✅ Bulk update multiple validation steps in one API call  
✅ Automatic detection of create vs update operations  
✅ Visual feedback with loading states  
✅ Toast notifications for success/error  
✅ Proper error handling  
✅ TypeScript type safety  
✅ Maintains node IDs for future updates  

## Usage Example

```typescript
// Navigation to AssumptionBuilder with workflow ID
navigate('/app/assumption-builder', {
  state: {
    name: 'Budget Approval Workflow',
    executionPoint: 'TRANSFER_SUBMIT',
    description: 'Workflow for budget approval',
    isDefault: true,
    workflowId: 2 // Required for saving steps
  }
});
```

## Testing

To test the implementation:

1. Navigate to the AssumptionBuilder page with a valid `workflowId`
2. Add nodes to the canvas
3. Configure node properties (left side, operator, right side)
4. Connect nodes to define the workflow logic
5. Click "Save Workflow" in the settings tab
6. Verify success toast appears
7. Modify existing nodes
8. Click "Save Workflow" again
9. Verify update success toast appears

## Error Handling

The implementation handles several error scenarios:
- Missing workflow ID
- API request failures
- Network errors
- Invalid data formats

All errors are caught and displayed to the user via toast notifications.
