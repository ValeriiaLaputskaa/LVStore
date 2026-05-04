import { isAxiosError } from "axios";
import type { CreateUserPayload, UpdateUserPayload, User } from "../types";
import { axiosInstance } from "./axiosInstance";

export async function fetchUsers(): Promise<User[]> {
  const { data } = await axiosInstance.get<User[]>("/users");
  return data;
}

export async function fetchUserById(id: number): Promise<User> {
  const { data } = await axiosInstance.get<User>(`/users/${id}`);
  return data;
}

export async function fetchUserByUsername(username: string): Promise<User | null> {
  try {
    const { data } = await axiosInstance.get<User>("/users", { params: { username } });
    return data;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function createUser(body: CreateUserPayload): Promise<User> {
  const { data } = await axiosInstance.post<User>("/users", body);
  return data;
}

export async function updateUser(body: UpdateUserPayload): Promise<User> {
  const { data } = await axiosInstance.put<User>("/users", body);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await axiosInstance.delete(`/users/${id}`);
}
