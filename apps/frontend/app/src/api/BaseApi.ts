import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiError } from "./apiError";
import { ApiResponse, GetListApiResponse } from "./apiResponse";

export class BaseApi {
  private readonly axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://script.google.com/macros/s/AKfycbw4PVywU_fJY8gPKeiagho3zPgzgn4C1aHgyg3xlKwNHEXWFniK73Y4AQ6vr_5uCEi9/exec',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  private async executeRequest<D>(config: AxiosRequestConfig) {
    const response: AxiosResponse<D> = await this.axios.request<D>(config).catch(error => error.response);

    console.log("response: ", response);
    console.log("response.headers: ", response.headers);
    console.log("response.data: ", response.data);
    if (response.status === 302) {
      console.log("redirect to", response.headers.location);
    }

    this.validateResponse(response);

    return response;
  }

  private validateResponse<D>(response: AxiosResponse<D>) {
    if (response.status !== 200) {
      throw new ApiError('エラーが発生しました。');
    }
  }

  protected async request(config: AxiosRequestConfig) {
    const response = await this.executeRequest<ApiResponse>(config);

    return response.data;
  }

  protected async requestGetList<T>(config: AxiosRequestConfig) {
    const response = await this.executeRequest<GetListApiResponse<T>>(config);

    return response.data.list;
  }
}