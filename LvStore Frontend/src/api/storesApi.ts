import type { CreateStorePayload, Store, UpdateStorePayload } from "../types";
import { axiosInstance } from "./axiosInstance";

export async function fetchStores(): Promise<Store[]> {
  const { data } = await axiosInstance.get<Store[]>("/stores");
  return data;
}

export async function fetchStoreById(id: number): Promise<Store> {
  const { data } = await axiosInstance.get<Store>(`/stores/${id}`);
  return data;
}

export async function createStore(body: CreateStorePayload): Promise<Store> {
  const { data } = await axiosInstance.post<Store>("/stores", body);
  return data;
}

export async function updateStore(body: UpdateStorePayload): Promise<Store> {
  const { data } = await axiosInstance.put<Store>("/stores", body);
  return data;
}

export async function deleteStore(id: number): Promise<void> {
  await axiosInstance.delete(`/stores/${id}`);
}
