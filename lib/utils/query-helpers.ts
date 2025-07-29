import type { QueryOptions } from '@/lib/types/database'

// Helper para construir filtros dinámicos
export function buildFilters(filters: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    )
  )
}

// Helper para construir queries de búsqueda
export function buildSearchQuery(searchTerm: string, fields: string[]) {
  if (!searchTerm || fields.length === 0) return undefined
  
  return fields
    .map(field => `${field}.ilike.%${searchTerm}%`)
    .join(',')
}

// Helper para paginación
export function buildPagination(page: number, limit: number) {
  const from = (page - 1) * limit
  const to = from + limit - 1
  return { from, to }
}

// Helper para ordenamiento
export function buildOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc') {
  if (!sortBy) return { column: 'created_at', ascending: false }
  
  return {
    column: sortBy,
    ascending: sortOrder === 'asc'
  }
}

// Helper para incluir relaciones
export function buildSelectQuery(baseFields = '*', includes: string[] = [], relations: Record<string, string> = {}) {
  if (includes.length === 0) return baseFields
  
  const includeSelects = includes
    .filter(rel => relations[rel])
    .map(rel => `${rel}(${relations[rel]})`)
  
  if (includeSelects.length === 0) return baseFields
  
  return `${baseFields}, ${includeSelects.join(', ')}`
}

// Helper para transformar opciones de query
export function transformQueryOptions(options: QueryOptions) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
    search,
    filters = {},
    include = []
  } = options

  return {
    pagination: buildPagination(page, limit),
    ordering: buildOrderBy(sortBy, sortOrder),
    filters: buildFilters(filters),
    search,
    includes: include
  }
}

// Helper para construir queries complejas
export class QueryBuilder {
  private query: any
  private tableName: string

  constructor(supabaseClient: any, tableName: string) {
    this.query = supabaseClient.from(tableName)
    this.tableName = tableName
  }

  select(columns = '*') {
    this.query = this.query.select(columns)
    return this
  }

  where(column: string, operator: string, value: any) {
    this.query = this.query.filter(column, operator, value)
    return this
  }

  eq(column: string, value: any) {
    this.query = this.query.eq(column, value)
    return this
  }

  neq(column: string, value: any) {
    this.query = this.query.neq(column, value)
    return this
  }

  in(column: string, values: any[]) {
    this.query = this.query.in(column, values)
    return this
  }

  contains(column: string, value: any) {
    this.query = this.query.contains(column, value)
    return this
  }

  like(column: string, pattern: string) {
    this.query = this.query.like(column, pattern)
    return this
  }

  ilike(column: string, pattern: string) {
    this.query = this.query.ilike(column, pattern)
    return this
  }

  gte(column: string, value: any) {
    this.query = this.query.gte(column, value)
    return this
  }

  lte(column: string, value: any) {
    this.query = this.query.lte(column, value)
    return this
  }

  gt(column: string, value: any) {
    this.query = this.query.gt(column, value)
    return this
  }

  lt(column: string, value: any) {
    this.query = this.query.lt(column, value)
    return this
  }

  isNull(column: string) {
    this.query = this.query.is(column, null)
    return this
  }

  isNotNull(column: string) {
    this.query = this.query.not(column, 'is', null)
    return this
  }

  orderBy(column: string, ascending = true) {
    this.query = this.query.order(column, { ascending })
    return this
  }

  limit(count: number) {
    this.query = this.query.limit(count)
    return this
  }

  range(from: number, to: number) {
    this.query = this.query.range(from, to)
    return this
  }

  single() {
    this.query = this.query.single()
    return this
  }

  or(conditions: string) {
    this.query = this.query.or(conditions)
    return this
  }

  and(conditions: string) {
    this.query = this.query.filter(conditions)
    return this
  }

  // Método para ejecutar la query
  async execute() {
    return await this.query
  }

  // Método para obtener la query (útil para debugging)
  getQuery() {
    return this.query
  }
}

// Helper para date ranges
export function buildDateRange(startDate?: string, endDate?: string) {
  const filters: any = {}
  
  if (startDate) {
    filters.gte = startDate
  }
  
  if (endDate) {
    filters.lte = endDate
  }
  
  return filters
}

// Helper para full-text search
export function buildFullTextSearch(searchTerm: string, columns: string[]) {
  if (!searchTerm) return undefined
  
  // Escapar caracteres especiales para búsqueda de texto completo
  const escapedTerm = searchTerm.replace(/['"\\]/g, '\\$&')
  
  return columns
    .map(col => `${col}.fts.${escapedTerm}`)
    .join('|')
}

// Helper para agregaciones
export function buildAggregation(
  column: string, 
  operation: 'count' | 'sum' | 'avg' | 'min' | 'max'
) {
  return `${column}.${operation}()`
}

// Helper para joins complejos
export function buildJoin(
  foreignTable: string,
  foreignKey: string,
  localKey: string,
  selectFields = '*'
) {
  return `${foreignTable}!${foreignTable}_${foreignKey}_fkey(${selectFields})`
}

// Utility para construir queries con múltiples condiciones OR
export function buildOrConditions(conditions: Array<{ column: string; value: any }>) {
  return conditions
    .map(({ column, value }) => `${column}.eq.${value}`)
    .join(',')
}

// Utility para construir queries con múltiples condiciones AND
export function buildAndConditions(conditions: Array<{ column: string; operator: string; value: any }>) {
  // Supabase maneja AND implícitamente cuando se encadenan filtros
  return conditions
}