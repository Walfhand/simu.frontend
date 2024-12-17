import axios from "axios";
import { IRequest } from "./IRequest";
import qs from "qs";

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

const axiosInstance = axios.create({
  baseURL: process.env.FRONTEND_PUBLIC_API_URL,
});

export async function FILTER_BACKEND<TResult>(
  route: string,
  params: IRequest
): Promise<TResult | undefined> {
  const result = await axiosInstance.get<TResult>(`${route}`, {
    params: params,
    paramsSerializer: (params) => {
      const queryString = qs.stringify(params, { arrayFormat: "repeat" });
      return queryString;
    },
  });
  return result.data;
}
