import type {
  CreateWarehousePayload,
  UpdateWarehousePayload,
  Warehouse,
} from "../types";
import { axiosInstance } from "./axiosInstance";

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const { data } = await axiosInstance.get<Warehouse[]>("/warehouses");
  return data;
}

export async function fetchWarehouseById(id: number): Promise<Warehouse> {
  const { data } = await axiosInstance.get<Warehouse>(`/warehouses/${id}`);
  return data;
}

export async function createWarehouse(body: CreateWarehousePayload): Promise<Warehouse> {
  const { data } = await axiosInstance.post<Warehouse>("/warehouses", body);
  return data;
}

export async function updateWarehouse(body: UpdateWarehousePayload): Promise<Warehouse> {
  const { data } = await axiosInstance.put<Warehouse>("/warehouses", body);
  return data;
}

export async function deleteWarehouse(id: number): Promise<void> {
  await axiosInstance.delete(`/warehouses/${id}`);
}
