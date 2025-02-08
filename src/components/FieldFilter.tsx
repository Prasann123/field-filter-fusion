
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
import { motion, AnimatePresence } from 'framer-motion';
import { fieldMappings, generateSqlQuery } from '@/utils/fieldMappings';

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

const FieldFilter = () => {
  const [filters, setFilters] = useState<FilterRow[]>([]);
  const [sqlQuery, setSqlQuery] = useState<string>('');

  useEffect(() => {
    const query = generateSqlQuery(filters);
    setSqlQuery(query);
  }, [filters]);

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

      {sqlQuery && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Generated SQL Query:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {sqlQuery}
          </pre>
        </div>
      )}
    </div>
  );
};

export default FieldFilter;
