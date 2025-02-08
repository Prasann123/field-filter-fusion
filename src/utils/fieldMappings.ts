
export interface FieldMapping {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date';
  sqlColumn: string;
  table: string;
}

export const fieldMappings: FieldMapping[] = [
  {
    id: 'name',
    label: 'Name',
    type: 'text',
    sqlColumn: 'full_name',
    table: 'users'
  },
  {
    id: 'age',
    label: 'Age',
    type: 'number',
    sqlColumn: 'age',
    table: 'users'
  },
  {
    id: 'date',
    label: 'Date',
    type: 'date',
    sqlColumn: 'created_at',
    table: 'users'
  },
  {
    id: 'status',
    label: 'Status',
    type: 'text',
    sqlColumn: 'status',
    table: 'users'
  }
];

interface SqlQueryParams {
  field: string;
  operator: string;
  value: string;
  value2?: string;
}

export const generateSqlQuery = (filters: SqlQueryParams[]): string => {
  if (filters.length === 0) return '';

  const conditions = filters.map(filter => {
    const fieldMapping = fieldMappings.find(f => f.id === filter.field);
    if (!fieldMapping) return '';

    const { sqlColumn, table } = fieldMapping;
    const fullColumnName = `${table}.${sqlColumn}`;

    switch (filter.operator) {
      case 'equals':
        return `${fullColumnName} = '${filter.value}'`;
      case 'contains':
        return `${fullColumnName} LIKE '%${filter.value}%'`;
      case 'startsWith':
        return `${fullColumnName} LIKE '${filter.value}%'`;
      case 'endsWith':
        return `${fullColumnName} LIKE '%${filter.value}'`;
      case 'greaterThan':
        return `${fullColumnName} > ${filter.value}`;
      case 'lessThan':
        return `${fullColumnName} < ${filter.value}`;
      case 'between':
        return `${fullColumnName} BETWEEN ${filter.value} AND ${filter.value2}`;
      case 'before':
        return `${fullColumnName} < '${filter.value}'`;
      case 'after':
        return `${fullColumnName} > '${filter.value}'`;
      default:
        return '';
    }
  }).filter(condition => condition !== '');

  return `SELECT * FROM users WHERE ${conditions.join(' AND ')}`;
};
