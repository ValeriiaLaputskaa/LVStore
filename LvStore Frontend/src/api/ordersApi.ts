import type { CreateOrderPayload, Order, UpdateOrderPayload } from "../types";
import { axiosInstance } from "./axiosInstance";

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await axiosInstance.get<Order[]>("/orders");
  return data;
}

export async function fetchOrderById(id: number): Promise<Order> {
  const { data } = await axiosInstance.get<Order>(`/orders/${id}`);
  return data;
}

export async function fetchOrdersByStoreId(storeId: number): Promise<Order[]> {
  const { data } = await axiosInstance.get<Order[]>("/orders", { params: { storeId } });
  return data;
}

export async function fetchOrdersByStatus(status: string): Promise<Order[]> {
  const { data } = await axiosInstance.get<Order[]>("/orders", { params: { status } });
  return data;
}

export async function createOrder(body: CreateOrderPayload): Promise<Order> {
  const { data } = await axiosInstance.post<Order>("/orders", body);
  return data;
}

export async function updateOrder(body: UpdateOrderPayload): Promise<Order> {
  const { data } = await axiosInstance.put<Order>("/orders", body);
  return data;
}

export async function deleteOrder(id: number): Promise<void> {
  await axiosInstance.delete(`/orders/${id}`);
}

export async function confirmOrder(id: number): Promise<Order> {
  const { data } = await axiosInstance.put<Order>(`/orders/${id}/confirm`);
  return data;
}

export async function cancelOrder(id: number): Promise<Order> {
  const { data } = await axiosInstance.put<Order>(`/orders/${id}/cancel`);
  return data;
}

export async function shipOrder(id: number): Promise<Order> {
  const { data } = await axiosInstance.put<Order>(`/orders/${id}/ship`);
  return data;
}

export async function deliverOrder(id: number): Promise<Order> {
  const { data } = await axiosInstance.put<Order>(`/orders/${id}/deliver`);
  return data;
}
