import axios, { AxiosError } from "axios";
import { IRequest } from "./IRequest";
import { PaginatedResult } from "./httpClientBackend";
import qs from "qs";
import { toast } from "sonner";
import { ApiError } from "@/app/api/middleware";

const clientAxios = axios.create();

clientAxios.interceptors.response.use(
  async (config) => {
    return config;
  },
  (error) => {
    const axiosError = error as AxiosError;
    const apiError = axiosError.response?.data as ApiError;
    toast(apiError.detail);
  }
);

export async function FILTER<TResult>(
  route: string,
  params: IRequest
): Promise<TResult | undefined> {
  const result = await clientAxios.get<TResult>(`${route}`, {
    params: params,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });
  return result?.data;
}
