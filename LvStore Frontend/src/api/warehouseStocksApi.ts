import type {
  CreateWarehouseStockPayload,
  UpdateWarehouseStockPayload,
  WarehouseStock,
} from "../types";
import { axiosInstance } from "./axiosInstance";

export async function fetchWarehouseStocks(): Promise<WarehouseStock[]> {
  const { data } = await axiosInstance.get<WarehouseStock[]>("/warehouse-stocks");
  return data;
}

export async function fetchWarehouseStockById(id: number): Promise<WarehouseStock> {
  const { data } = await axiosInstance.get<WarehouseStock>(`/warehouse-stocks/${id}`);
  return data;
}

export async function fetchWarehouseStocksByWarehouseId(
  warehouseId: number,
): Promise<WarehouseStock[]> {
  const { data } = await axiosInstance.get<WarehouseStock[]>("/warehouse-stocks", {
    params: { warehouseId },
  });
  return data;
}

export async function fetchWarehouseStocksByProductId(
  productId: number,
): Promise<WarehouseStock[]> {
  const { data } = await axiosInstance.get<WarehouseStock[]>("/warehouse-stocks", {
    params: { productId },
  });
  return data;
}

export async function createWarehouseStock(
  body: CreateWarehouseStockPayload,
): Promise<WarehouseStock> {
  const { data } = await axiosInstance.post<WarehouseStock>("/warehouse-stocks", body);
  return data;
}

export async function updateWarehouseStock(
  body: UpdateWarehouseStockPayload,
): Promise<WarehouseStock> {
  const { data } = await axiosInstance.put<WarehouseStock>("/warehouse-stocks", body);
  return data;
}

export async function deleteWarehouseStock(id: number): Promise<void> {
  await axiosInstance.delete(`/warehouse-stocks/${id}`);
}
