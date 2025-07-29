import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { 
  QueryOptions, 
  PaginatedResponse, 
  BaseEntity,
  CreateEntity,
  UpdateEntity 
} from '@/lib/types/database'
import { handleSupabaseError } from '@/lib/supabase/client'

export abstract class BaseRepository<T extends BaseEntity> {
  protected client: SupabaseClient<Database>
  protected tableName: string

  constructor(client: SupabaseClient<Database>, tableName: string) {
    this.client = client
    this.tableName = tableName
  }

  // CRUD Operations
  async findById(id: string, options?: { include?: string[] }): Promise<T | null> {
    try {
      let query = this.client
        .from(this.tableName)
        .select(this.buildSelectQuery(options?.include))
        .eq('id', id)
        .eq('is_active', true)
        .single()

      const { data, error } = await query

      if (error) {
        if (error.code === 'PGRST116') return null
        handleSupabaseError(error)
      }

      return data as T
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async findMany(options: QueryOptions = {}): Promise<PaginatedResponse<T>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc',
        search,
        filters = {},
        include = []
      } = options

      let query = this.client
        .from(this.tableName)
        .select(this.buildSelectQuery(include), { count: 'exact' })
        .eq('is_active', true)

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      // Aplicar búsqueda
      if (search && this.getSearchFields().length > 0) {
        const searchConditions = this.getSearchFields()
          .map(field => `${field}.ilike.%${search}%`)
          .join(',')
        query = query.or(searchConditions)
      }

      // Aplicar ordenamiento
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Aplicar paginación
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) handleSupabaseError(error)

      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        data: data as T[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async create(data: CreateEntity<T>): Promise<T> {
    try {
      const now = new Date().toISOString()
      const createData = {
        ...data,
        is_active: true,
        created_at: now,
        updated_at: now
      }

      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(createData)
        .select()
        .single()

      if (error) handleSupabaseError(error)

      return result as T
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async update(id: string, data: UpdateEntity<T>): Promise<T> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single()

      if (error) handleSupabaseError(error)

      return result as T
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async delete(id: string, hard = false): Promise<boolean> {
    try {
      if (hard) {
        const { error } = await this.client
          .from(this.tableName)
          .delete()
          .eq('id', id)

        if (error) handleSupabaseError(error)
      } else {
        // Soft delete
        await this.update(id, { is_active: false } as UpdateEntity<T>)
      }

      return true
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  // Operaciones en lote
  async createMany(data: CreateEntity<T>[]): Promise<T[]> {
    try {
      const now = new Date().toISOString()
      const createData = data.map(item => ({
        ...item,
        is_active: true,
        created_at: now,
        updated_at: now
      }))

      const { data: result, error } = await this.client
        .from(this.tableName)
        .insert(createData)
        .select()

      if (error) handleSupabaseError(error)

      return result as T[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async updateMany(ids: string[], data: UpdateEntity<T>): Promise<T[]> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { data: result, error } = await this.client
        .from(this.tableName)
        .update(updateData)
        .in('id', ids)
        .eq('is_active', true)
        .select()

      if (error) handleSupabaseError(error)

      return result as T[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async deleteMany(ids: string[], hard = false): Promise<boolean> {
    try {
      if (hard) {
        const { error } = await this.client
          .from(this.tableName)
          .delete()
          .in('id', ids)

        if (error) handleSupabaseError(error)
      } else {
        await this.updateMany(ids, { is_active: false } as UpdateEntity<T>)
      }

      return true
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  // Transacciones
  async transaction<R>(callback: (client: SupabaseClient<Database>) => Promise<R>): Promise<R> {
    try {
      // Supabase no tiene transacciones explícitas, pero podemos usar RPC para operaciones complejas
      return await callback(this.client)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  // Utilidades para real-time
  subscribeToChanges(
    callback: (payload: any) => void,
    options?: { filter?: string }
  ) {
    let subscription = this.client
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: options?.filter
        },
        callback
      )
      .subscribe()

    return subscription
  }

  // Métodos abstractos que deben ser implementados por los repositorios específicos
  protected abstract getSearchFields(): string[]
  
  protected buildSelectQuery(include: string[] = []): string {
    let select = '*'
    
    if (include.length > 0) {
      const relations = this.getRelations()
      const includeSelects = include
        .filter(rel => relations[rel])
        .map(rel => `${rel}(${relations[rel]})`)
      
      if (includeSelects.length > 0) {
        select = `*, ${includeSelects.join(', ')}`
      }
    }
    
    return select
  }

  protected getRelations(): Record<string, string> {
    return {}
  }

  // Helpers para queries complejas
  protected buildFilter(filters: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
    )
  }

  // Método para obtener estadísticas
  async getStats(): Promise<{ total: number; active: number; inactive: number }> {
    try {
      const { count: total } = await this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      const { count: active } = await this.client
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      return {
        total: total || 0,
        active: active || 0,
        inactive: (total || 0) - (active || 0)
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}