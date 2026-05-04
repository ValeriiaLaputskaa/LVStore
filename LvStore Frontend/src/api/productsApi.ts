import { isAxiosError } from "axios";
import type { CreateProductPayload, Product, UpdateProductPayload } from "../types";
import { axiosInstance } from "./axiosInstance";

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await axiosInstance.get<Product[]>("/products");
  return data;
}

export async function fetchProductById(id: number): Promise<Product> {
  const { data } = await axiosInstance.get<Product>(`/products/${id}`);
  return data;
}

export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const { data } = await axiosInstance.get<Product>("/products", {
      params: { barcode },
    });
    return data;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function createProduct(body: CreateProductPayload): Promise<Product> {
  const { data } = await axiosInstance.post<Product>("/products", body);
  return data;
}

export async function updateProduct(body: UpdateProductPayload): Promise<Product> {
  const { data } = await axiosInstance.put<Product>("/products", body);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await axiosInstance.delete(`/products/${id}`);
}
