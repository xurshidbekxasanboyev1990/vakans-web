// SQL Security Utilities - SQL Injection Prevention
// Parametrized query helpers

import { logger } from './logger';

// ============================================
// SQL INJECTION PREVENTION
// ============================================

/**
 * Escape special characters for LIKE queries
 * Prevents SQL injection in LIKE clauses
 */
export function escapeLikePattern(pattern: string): string {
  return pattern
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/'/g, "''");
}

/**
 * Validate and sanitize sort column names
 * Prevents SQL injection in ORDER BY clauses
 */
const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  createdAt: 'created_at',
  created_at: 'created_at',
  updatedAt: 'updated_at',
  updated_at: 'updated_at',
  title: 'title',
  salary: 'salary_min',
  salaryMin: 'salary_min',
  salary_min: 'salary_min',
  salaryMax: 'salary_max',
  salary_max: 'salary_max',
  views: 'views_count',
  viewCount: 'views_count',
  views_count: 'views_count',
  name: 'name',
  firstName: 'first_name',
  first_name: 'first_name',
  lastName: 'last_name',
  last_name: 'last_name',
  status: 'status',
};

export function sanitizeSortColumn(column: string | undefined, defaultColumn = 'created_at'): string {
  if (!column) return defaultColumn;
  
  const sanitized = ALLOWED_SORT_COLUMNS[column];
  if (!sanitized) {
    logger.warn('Invalid sort column attempted', { column });
    return defaultColumn;
  }
  
  return sanitized;
}

/**
 * Validate sort order
 */
export function sanitizeSortOrder(order: string | undefined): 'ASC' | 'DESC' {
  const upper = order?.toUpperCase();
  return upper === 'ASC' ? 'ASC' : 'DESC';
}

/**
 * Build safe WHERE clause from conditions
 */
export interface WhereCondition {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'ILIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL';
  value?: unknown;
  paramIndex?: number;
}

const ALLOWED_OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'ILIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

export function buildWhereClause(
  conditions: WhereCondition[],
  startParamIndex = 1
): { clause: string; params: unknown[]; nextIndex: number } {
  if (conditions.length === 0) {
    return { clause: '', params: [], nextIndex: startParamIndex };
  }

  const clauses: string[] = [];
  const params: unknown[] = [];
  let paramIndex = startParamIndex;

  for (const condition of conditions) {
    // Validate operator
    if (!ALLOWED_OPERATORS.includes(condition.operator)) {
      logger.warn('Invalid SQL operator attempted', { operator: condition.operator });
      continue;
    }

    // Handle NULL operators
    if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
      clauses.push(`${condition.column} ${condition.operator}`);
      continue;
    }

    // Handle IN operator
    if (condition.operator === 'IN' && Array.isArray(condition.value)) {
      const placeholders = condition.value.map(() => `$${paramIndex++}`).join(', ');
      clauses.push(`${condition.column} IN (${placeholders})`);
      params.push(...condition.value);
      continue;
    }

    // Handle LIKE/ILIKE
    if (condition.operator === 'LIKE' || condition.operator === 'ILIKE') {
      clauses.push(`${condition.column} ${condition.operator} $${paramIndex++}`);
      params.push(`%${escapeLikePattern(String(condition.value))}%`);
      continue;
    }

    // Standard comparison
    clauses.push(`${condition.column} ${condition.operator} $${paramIndex++}`);
    params.push(condition.value);
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
    nextIndex: paramIndex,
  };
}

/**
 * Build safe UPDATE SET clause
 */
export interface UpdateField {
  column: string;
  value: unknown;
}

const ALLOWED_UPDATE_COLUMNS: Set<string> = new Set([
  'first_name',
  'last_name',
  'email',
  'phone',
  'region',
  'bio',
  'skills',
  'experience',
  'education',
  'avatar',
  'title',
  'description',
  'category_id',
  'address',
  'salary_min',
  'salary_max',
  'work_type',
  'requirements',
  'benefits',
  'deadline',
  'status',
  'approval_status',
  'is_featured',
  'is_blocked',
  'is_read',
  'password_hash',
]);

export function buildUpdateClause(
  fields: UpdateField[],
  startParamIndex = 1
): { clause: string; params: unknown[]; nextIndex: number } {
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIndex = startParamIndex;

  for (const field of fields) {
    // Validate column name
    if (!ALLOWED_UPDATE_COLUMNS.has(field.column)) {
      logger.warn('Invalid update column attempted', { column: field.column });
      continue;
    }

    setClauses.push(`${field.column} = $${paramIndex++}`);
    params.push(field.value);
  }

  // Always add updated_at
  setClauses.push('updated_at = NOW()');

  return {
    clause: setClauses.join(', '),
    params,
    nextIndex: paramIndex,
  };
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate and parse pagination parameters
 */
export function parsePagination(
  page: unknown,
  limit: unknown
): { offset: number; limit: number } {
  const parsedPage = Math.max(1, parseInt(String(page)) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
  
  return {
    offset: (parsedPage - 1) * parsedLimit,
    limit: parsedLimit,
  };
}

export default {
  escapeLikePattern,
  sanitizeSortColumn,
  sanitizeSortOrder,
  buildWhereClause,
  buildUpdateClause,
  isValidUUID,
  parsePagination,
};
