import type { CreateStockPayload, Stock, UpdateStockPayload } from "../types";
import { axiosInstance } from "./axiosInstance";

export async function fetchStocks(): Promise<Stock[]> {
  const { data } = await axiosInstance.get<Stock[]>("/stocks");
  return data;
}

export async function fetchStockById(id: number): Promise<Stock> {
  const { data } = await axiosInstance.get<Stock>(`/stocks/${id}`);
  return data;
}

export async function fetchStocksByStoreId(storeId: number): Promise<Stock[]> {
  const { data } = await axiosInstance.get<Stock[]>("/stocks", { params: { storeId } });
  return data;
}

export async function fetchStocksByProductId(productId: number): Promise<Stock[]> {
  const { data } = await axiosInstance.get<Stock[]>("/stocks", { params: { productId } });
  return data;
}

export async function fetchCriticalStocksByStore(storeId: number): Promise<Stock[]> {
  const { data } = await axiosInstance.get<Stock[]>("/stocks/critical", {
    params: { storeId },
  });
  return data;
}

export async function createStock(body: CreateStockPayload): Promise<Stock> {
  const { data } = await axiosInstance.post<Stock>("/stocks", body);
  return data;
}

export async function updateStock(body: UpdateStockPayload): Promise<Stock> {
  const { data } = await axiosInstance.put<Stock>("/stocks", body);
  return data;
}

export async function deleteStock(id: number): Promise<void> {
  await axiosInstance.delete(`/stocks/${id}`);
}
