# Internal Transfer Segment Filtering Implementation

## Overview
This feature implements dynamic segment filtering for internal transfers (داخلية). When the transfer type is "داخلية", the system filters segment options for rows 2+ based on the Mofa Budget (segment 11) value selected in the first row.

## Key Features

### 1. **Transfer Type Detection**
- Automatically detects when `transfer_type === "داخلية"`
- Uses `isInternalTransfer` computed value from `apiData.summary.transfer_type`

### 2. **First Row Tracking**
- Tracks the segment 11 (Mofa Budget) value from the first row
- Stored in `firstRowMofaBudget` state
- Updates automatically when:
  - First row data changes
  - User selects/changes Mofa Budget in first row
  - Transfer type changes

### 3. **Conditional Segment Filtering**

#### API Endpoint
- **New endpoint**: `getSegmentsByTypeAndParent`
- **URL**: `/accounts-entities/segments/?segment_type={segmentType}&parent_code={parentCode}`
- **Purpose**: Fetch segments filtered by parent code

#### Filtering Logic
For each segment (1-5):
- **First Row**: Always uses unfiltered data (all active segments)
- **Segment 11 (Mofa Budget)**: Always uses unfiltered data (it's the filter criteria)
- **Non-Internal Transfers**: Always uses unfiltered data
- **Other Rows in Internal Transfers**: Uses filtered data when `firstRowMofaBudget` exists

### 4. **Dynamic Behavior**

#### When First Row Has Data
```
Transfer Type: داخلية
First Row Segment 11: "12345"
→ Rows 2+ get segments where parent_code = "12345"
```

#### When User Changes First Row
```
User changes segment 11 from "12345" to "67890"
→ Automatic re-fetch of filtered segments
→ Rows 2+ get new options where parent_code = "67890"
```

#### When User Clears First Row
```
User clears segment 11 value
→ firstRowMofaBudget becomes ""
→ Rows 2+ revert to unfiltered data
```

## Implementation Details

### State Management
```typescript
// Track first row's Mofa Budget value
const [firstRowMofaBudget, setFirstRowMofaBudget] = useState<string>("");

// Detect internal transfer
const isInternalTransfer = useMemo(() => {
  return apiData?.summary?.transfer_type === "داخلية";
}, [apiData?.summary?.transfer_type]);

// Determine if filtered data should be used
const shouldUseFilteredData = isInternalTransfer && firstRowMofaBudget.length > 0;
```

### API Hooks
```typescript
// Unfiltered data (always fetched)
const { data: segmentData1 } = useGetSegmentsByTypeQuery(
  segment1?.segment_id || 0,
  { skip: !segment1 }
);

// Filtered data (conditional)
const { data: filteredSegmentData1 } = useGetSegmentsByTypeAndParentQuery(
  { segmentType: segment1?.segment_id || 0, parentCode: firstRowMofaBudget },
  { 
    skip: !segment1 || 
          !shouldUseFilteredData || 
          segment1.segment_type_oracle_number === 11 
  }
);
```

### Segment Data Selection
```typescript
const selectSegmentData = (segment, normalData, filteredData) => {
  // Always use normal data for segment 11
  if (segment?.segment_type_oracle_number === 11) {
    return normalData?.data;
  }
  // Use filtered data when applicable
  if (shouldUseFilteredData && filteredData?.data) {
    return filteredData.data;
  }
  // Default to normal data
  return normalData?.data;
};
```

### Row-Based Option Selection
```typescript
const getSegmentOptionsForRow = (rowId, segmentOracleNumber, segmentId) => {
  const allRows = [...editedRows, ...localRows];
  const rowIndex = allRows.findIndex((r) => r.id === rowId);
  const isFirstRow = rowIndex === 0;

  // First row or segment 11 or non-internal: use full options
  if (isFirstRow || segmentOracleNumber === 11 || !isInternalTransfer) {
    return createSegmentOptions(segmentId);
  }

  // Other rows: use filtered options (already in segmentDataMap)
  return createSegmentOptions(segmentId);
};
```

## Files Modified

### 1. `/src/api/segmentConfiguration.api.ts`
**Changes:**
- Added `getSegmentsByTypeAndParent` query endpoint
- Added `useGetSegmentsByTypeAndParentQuery` hook export
- Supports filtering by parent code

### 2. `/src/pages/dashboard/TransferDetails.tsx`
**Changes:**
- Imported `useGetSegmentsByTypeAndParentQuery`
- Added `firstRowMofaBudget` state tracking
- Added `isInternalTransfer` computed value
- Added effect to track first row's segment 11 value
- Added conditional API calls for filtered segment data
- Updated `segmentDataMap` to use filtered data when applicable
- Added `getSegmentOptionsForRow` helper function
- Updated `generateDynamicSegmentColumns` to use row-aware options

## Usage Examples

### Example 1: Internal Transfer with First Row Data
```
Transfer Type: داخلية
Row 1: Segment 11 = "BUDGET_A"
→ Row 1: All segments available (unfiltered)
→ Row 2-N: Segments filtered by parent_code="BUDGET_A"
```

### Example 2: User Changes First Row
```
Initial State:
  Row 1: Segment 11 = "BUDGET_A"
  Row 2: Segment 5 options filtered by "BUDGET_A"

User Action:
  Row 1: Changes Segment 11 to "BUDGET_B"

Result:
  → API automatically re-fetches with parent_code="BUDGET_B"
  → Row 2: Segment 5 options now filtered by "BUDGET_B"
```

### Example 3: Non-Internal Transfer
```
Transfer Type: خارجية (or any non-داخلية)
→ All rows: Unfiltered data
→ No parent code filtering applied
```

### Example 4: User Clears First Row
```
Initial State:
  Row 1: Segment 11 = "BUDGET_A"
  Row 2: Filtered options

User Action:
  Row 1: Clears Segment 11

Result:
  → firstRowMofaBudget = ""
  → Row 2: Reverts to unfiltered options
```

## Performance Considerations

1. **Hook Calls**: All hooks are called unconditionally (React rule compliance)
2. **Skip Logic**: Filtered queries skip when:
   - Segment doesn't exist
   - Not an internal transfer
   - No first row data
   - Segment is 11 (Mofa Budget)
3. **Memoization**: `segmentDataMap` is memoized to prevent unnecessary recalculations
4. **Automatic Re-fetching**: RTK Query handles cache invalidation and re-fetching

## Error Handling

- Invalid segment types: Skipped via `skip` parameter
- Missing parent code: Falls back to unfiltered data
- API errors: Handled by RTK Query error states
- Empty results: Falls back to unfiltered data

## Testing Scenarios

1. ✅ Internal transfer with first row data → Filtered options
2. ✅ Internal transfer without first row data → Unfiltered options
3. ✅ Non-internal transfer → Unfiltered options
4. ✅ Change first row value → Re-fetch and update
5. ✅ Clear first row value → Revert to unfiltered
6. ✅ First row always unfiltered
7. ✅ Segment 11 always unfiltered
8. ✅ Multiple segments handled correctly

## Future Enhancements

- [ ] Add loading indicators during filter changes
- [ ] Add error messages for failed filter requests
- [ ] Support multiple levels of filtering (hierarchical)
- [ ] Add cache persistence for filtered results
- [ ] Add unit tests for filtering logic
