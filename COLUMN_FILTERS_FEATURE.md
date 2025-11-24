# Column Filters Feature

## Overview
The SharedTable component now includes built-in column-level filtering. Each column displays a search input directly under the header, allowing users to filter data independently per column.

## Features

### 1. **Column-Level Search Inputs**
- Search input appears under each column header
- Real-time filtering as you type
- Case-insensitive text matching
- Smart numeric filtering (handles formatted numbers like "1,234.56")

### 2. **Default Behavior**
- Column filters are **enabled by default** (`showColumnFilters={true}`)
- To disable, pass `showColumnFilters={false}` to SharedTable

### 3. **How It Works**
1. **Text Columns**: Filters by partial string match (case-insensitive)
2. **Numeric Columns**: Filters both raw numbers and formatted numbers
   - Example: Searching "1,234" will find "1,234.56"
   - Also searches raw values: "1234" will find "1234.56"
3. **Combined Filtering**: When multiple columns have filters, only rows matching ALL filters are shown
4. **Integration**: Works seamlessly with sorting, pagination, and other table features

## Usage Examples

### Example 1: Enable Column Filters (Default)
```tsx
<SharedTable
  columns={columns}
  data={data}
  showColumnFilters={true} // This is the default, can be omitted
/>
```

### Example 2: Disable Column Filters
```tsx
<SharedTable
  columns={columns}
  data={data}
  showColumnFilters={false} // Explicitly disable
/>
```

### Example 3: Full Configuration (Reports.tsx)
```tsx
<SharedTable
  title="Segment Funds Report"
  columns={reportColumns}
  data={filteredData}
  maxHeight="600px"
  showPagination={true}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  itemsPerPage={itemsPerPage}
  totalCount={reportResponse?.total_records_in_db}
  showColumnFilters={true} // Column filters enabled
  showFooter={true}
  showColumnSelector={true}
/>
```

## Implementation Details

### Props Added to SharedTableProps
```typescript
interface SharedTableProps {
  // ... existing props
  showColumnFilters?: boolean; // Default: true
}
```

### State Management
```typescript
const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
```

### Filter Logic
1. Data is filtered first based on column filters
2. Filtered data is then sorted (if sorting is enabled)
3. Finally, pagination is applied to the sorted, filtered data
4. Column sums in footer are calculated from filtered data

## UI Behavior

### Filter Input Styling
- Small, compact inputs that don't take up much space
- Placeholder text: "Filter [Column Name]..."
- Focus highlight with brand color (#4E8476)
- Responsive design

### Performance
- Debounced filtering (updates as you type)
- Efficient memoized filtering using React.useMemo
- Pagination resets to page 1 when filters change

## Benefits

1. **Granular Filtering**: Filter each column independently
2. **User-Friendly**: Intuitive interface - search where you see the data
3. **Powerful**: Combine multiple column filters for precise results
4. **Flexible**: Easy to enable/disable per table instance
5. **Smart Numeric Handling**: Works with both raw and formatted numbers

## Notes

- Column filters work with both client-side and server-side pagination
- When using server-side pagination, consider implementing backend filtering for better performance
- The SearchBar component in Reports.tsx can be used alongside column filters or removed in favor of column-level filtering
- Column filters automatically respect column visibility settings (hidden columns won't show filter inputs)

## Migration Guide

### For Existing Tables
No changes required! Column filters are enabled by default but don't interfere with existing functionality.

### To Disable for Specific Tables
Simply add `showColumnFilters={false}` to the SharedTable component.

### Recommended Usage
- **Use column filters** for tables where users need to filter specific columns (most cases)
- **Disable column filters** if you have a custom global search implementation or prefer a cleaner header
