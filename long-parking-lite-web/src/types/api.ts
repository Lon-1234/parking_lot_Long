export interface ApiResponse<T> { code: number; msg: string; data: T }
export interface PageResult<T> { list: T[]; total: number; page: number; pageSize: number; pages: number }
export interface PageQuery { page?: number; pageSize?: number }
export interface ActionResult { success: boolean; message: string; id?: number }
