export interface ApiResponse {
  status: number,
  resultCode: string
}

export interface GetListApiResponse<T> extends ApiResponse {
  list: T[]
}