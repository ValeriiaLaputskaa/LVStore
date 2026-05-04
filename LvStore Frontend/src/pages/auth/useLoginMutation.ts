import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, login } from "../../api/authApi";
import type { LoginRequest } from "../../types";

export function getPostLoginPath(role: string): string {
  switch (role) {
    case "STORE_ADMINISTRATOR":
      return "/admin/dashboard";
    case "SELLER":
      return "/seller/products";
    case "WAREHOUSE_MANAGER":
      return "/warehouse/dashboard";
    default:
      return "/";
  }
}

export function useLoginMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      await login(payload);
      return getCurrentUser();
    },
    onSuccess: (user) => {
      navigate(getPostLoginPath(user.role), { replace: true });
    },
  });
}
