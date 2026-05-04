export enum OrderStatus {
  NEW = "NEW",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  SHIPPED = "SHIPPED",
  RECEIVED = "RECEIVED",
}

export enum Role {
  SELLER = "SELLER",
  STORE_ADMINISTRATOR = "STORE_ADMINISTRATOR",
  WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER",
}

/** Роль з `GET /auth/me` (рядок, як у backend). */
export type UserRole = "STORE_ADMINISTRATOR" | "SELLER" | "WAREHOUSE_MANAGER";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  barcode: string;
  price: number;
  description?: string;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  barcode: string;
  price: number;
  description?: string;
}

export interface UpdateProductPayload {
  id: number;
  name: string;
  category: string;
  barcode: string;
  price: number;
  description?: string;
}

/** Магазин з `GET /stores` (включає `admin` з бекенду). */
export interface Store {
  id: number;
  name: string;
  location: string;
  admin?: User | null;
}

export interface CreateStorePayload {
  name: string;
  location: string;
  adminId: number;
}

export interface UpdateStorePayload {
  id: number;
  name: string;
  location: string;
  adminId: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role | UserRole;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  role: string;
  password: string;
}

export interface UpdateUserPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  /** Не передавати поле або `undefined`, якщо пароль не змінюється. */
  password?: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  quantity: number;
  createdAt: string;
  product: Product;
  store: Store;
  createdBy: User;
}

export interface CreateOrderPayload {
  status: string;
  quantity: number;
  createdAt: string;
  productId: number;
  storeId: number;
  creatorId: number;
}

export interface UpdateOrderPayload {
  id: number;
  quantity: number;
  createdAt: string;
  productId: number;
  storeId: number;
  creatorId: number;
}

export interface Stock {
  id: number;
  product: Product;
  store: Store;
  quantity: number;
  minQuantity: number;
}

export interface CreateStockPayload {
  productId: number;
  storeId: number;
  quantity: number;
  minQuantity: number;
}

export interface UpdateStockPayload {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  minQuantity: number;
}

export interface Warehouse {
  id: number;
  name: string;
  location?: string;
  /** Менеджер складу з бекенду (nested). */
  manager?: Pick<User, "id" | "username" | "email"> | null;
}

export interface CreateWarehousePayload {
  name: string;
  location: string;
  managerId: number;
}

export interface UpdateWarehousePayload {
  id: number;
  name: string;
  location: string;
  managerId: number;
}

export interface WarehouseStock {
  id: number;
  warehouse: Warehouse;
  product: Product;
  quantity: number;
}

export interface CreateWarehouseStockPayload {
  warehouseId: number;
  productId: number;
  quantity: number;
}

export interface UpdateWarehouseStockPayload {
  id: number;
  warehouseId: number;
  productId: number;
  quantity: number;
}
