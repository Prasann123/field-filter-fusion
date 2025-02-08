
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { fieldMappings, generateSqlQuery } from '@/utils/fieldMappings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Operator definitions based on field type
const operators = {
  text: [
    { id: 'equals', label: 'Equals' },
    { id: 'contains', label: 'Contains' },
    { id: 'startsWith', label: 'Starts with' },
    { id: 'endsWith', label: 'Ends with' },
  ],
  number: [
    { id: 'equals', label: 'Equals' },
    { id: 'greaterThan', label: 'Greater than' },
    { id: 'lessThan', label: 'Less than' },
    { id: 'between', label: 'Between' },
  ],
  date: [
    { id: 'equals', label: 'Equals' },
    { id: 'before', label: 'Before' },
    { id: 'after', label: 'After' },
    { id: 'between', label: 'Between' },
  ],
};

interface FilterRow {
  id: string;
  field: string;
  operator: string;
  value: string;
  value2?: string;
}

// Mock data for demonstration
const mockData = [
  { full_name: 'John Doe', age: 30, created_at: '2024-01-01', status: 'active' },
  { full_name: 'Jane Smith', age: 25, created_at: '2024-01-15', status: 'pending' },
  // Add more mock data as needed
];

const FieldFilter = () => {
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  useEffect(() => {
    const query = generateSqlQuery(filters, selectedColumns);
    setSqlQuery(query);
  }, [filters, selectedColumns]);

  const addFilter = () => {
    const newFilter: FilterRow = {
      id: Math.random().toString(36).substr(2, 9),
      field: '',
      operator: '',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((filter) => filter.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterRow>) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const getFieldType = (fieldId: string) => {
    const field = fieldMappings.find((f) => f.id === fieldId);
    return field?.type || 'text';
  };

  const getOperatorsForField = (fieldId: string) => {
    const fieldType = getFieldType(fieldId);
    return operators[fieldType as keyof typeof operators] || [];
  };

  const toggleColumn = (columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const filteredData = mockData.filter(row => {
    if (filters.length === 0) return true;
    return filters.every(filter => {
      const field = fieldMappings.find(f => f.id === filter.field);
      if (!field) return true;

      const value = row[field.sqlColumn as keyof typeof row];
      
      switch (filter.operator) {
        case 'equals':
          return String(value) === filter.value;
        case 'contains':
          return String(value).includes(filter.value);
        case 'startsWith':
          return String(value).startsWith(filter.value);
        case 'endsWith':
          return String(value).endsWith(filter.value);
        case 'greaterThan':
          return Number(value) > Number(filter.value);
        case 'lessThan':
          return Number(value) < Number(filter.value);
        case 'between':
          return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.value2 || filter.value);
        case 'before':
          return new Date(value) < new Date(filter.value);
        case 'after':
          return new Date(value) > new Date(filter.value);
        default:
          return true;
      }
    });
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Filter Builder</h2>
        <Button
          onClick={addFilter}
          className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Filter
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filters.map((filter) => (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex-1">
                <Select onValueChange={(value) => updateFilter(filter.id, { field: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldMappings.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select onValueChange={(value) => updateFilter(filter.id, { operator: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorsForField(filter.field).map((op) => (
                      <SelectItem key={op.id} value={op.id}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Input
                  type={getFieldType(filter.field) === 'date' ? 'date' : 'text'}
                  placeholder="Enter value"
                  value={filter.value}
                  onChange={(e) =>
                    updateFilter(filter.id, { value: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              {filter.operator === 'between' && (
                <div className="flex-1">
                  <Input
                    type={getFieldType(filter.field) === 'date' ? 'date' : 'text'}
                    placeholder="End value"
                    value={filter.value2 || ''}
                    onChange={(e) =>
                      updateFilter(filter.id, { value2: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(filter.id)}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filters.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No filters added. Click "Add Filter" to start building your query.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select Columns to Display:</h3>
          <div className="flex flex-wrap gap-4">
            {fieldMappings.filter(field => field.selectable).map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${field.id}`}
                  checked={selectedColumns.includes(field.id)}
                  onCheckedChange={() => toggleColumn(field.id)}
                />
                <label
                  htmlFor={`column-${field.id}`}
                  className="text-sm text-gray-700"
                >
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {sqlQuery && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Generated SQL Query:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {sqlQuery}
            </pre>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Results:</h3>
          <Table>
            <TableHeader>
              <TableRow>
                {selectedColumns.length > 0 ? (
                  selectedColumns.map(colId => {
                    const field = fieldMappings.find(f => f.id === colId);
                    return (
                      <TableHead key={colId}>{field?.label || ''}</TableHead>
                    );
                  })
                ) : (
                  fieldMappings.map(field => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow key={index}>
                  {selectedColumns.length > 0 ? (
                    selectedColumns.map(colId => {
                      const field = fieldMappings.find(f => f.id === colId);
                      return (
                        <TableCell key={colId}>
                          {field ? row[field.sqlColumn as keyof typeof row] : ''}
                        </TableCell>
                      );
                    })
                  ) : (
                    fieldMappings.map(field => (
                      <TableCell key={field.id}>
                        {row[field.sqlColumn as keyof typeof row]}
                      </TableCell>
                    ))
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FieldFilter;
